import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Array "mo:base/Array";
import Nat64 "mo:base/Nat64";
import Debug "mo:base/Debug";
import Prim "mo:prim";
import Cycles "mo:base/ExperimentalCycles";
import HashMap "mo:base/HashMap";
import List "mo:base/List";
import Trie "mo:base/Trie";
import Text "mo:base/Text";
import Error "mo:base/Error";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Timer "mo:base/Timer";
import Result "mo:base/Result";
import Constants "../../../common/constants";
import CommonTypes "../../../common/types";
import Helpers "../../../common/helpers";
import ModClubParam "../parameters/params";
import Canistergeek "../../../common/canistergeek/canistergeek";
import LoggerTypesModule "../../../common/canistergeek/logger/typesModule";
import ModSecurity "../../../common/security/guard";
import Utils "../../../common/utils";
import Types "./types";

shared ({ caller = deployer }) actor class Bucket(env : CommonTypes.ENV) = this {
  let authGuard = ModSecurity.Guard(env, "BUCKET_CANISTER");
  authGuard.subscribe("admins");
  authGuard.subscribe("secrets");
  stable var _canistergeekMonitorUD : ?Canistergeek.UpgradeData = null;
  private let canistergeekMonitor = Canistergeek.Monitor();

  stable var _canistergeekLoggerUD : ?Canistergeek.LoggerUpgradeData = null;
  private let canistergeekLogger = Canistergeek.Logger();
  // ids only accessible by admins
  stable var restrictedContentId : Trie.Trie<Text, Int> = Trie.empty();

  type TimerId = Nat;
  var canistergeekTimer : ?TimerId = null;
  var deleteContentTimer : ?TimerId = null;

  type DataCanisterState = {
    contentInfo : HashMap.HashMap<Text, Types.ContentInfo>;
    chunks : HashMap.HashMap<Types.ChunkId, Types.ChunkData>;
    moderators : HashMap.HashMap<Principal, Principal>;
  };

  type DataCanisterSharedState = {
    contentInfo : [(Text, Types.ContentInfo)];
    chunks : [(Types.ChunkId, Types.ChunkData)];
    moderators : [(Principal, Principal)];
  };

  public shared ({ caller }) func handleSubscription(payload : CommonTypes.ConsumerPayload) : async () {
    authGuard.handleSubscription(payload);
  };

  private func emptyStateForDataCanister() : DataCanisterState {
    var st : DataCanisterState = {
      contentInfo = HashMap.HashMap<Text, Types.ContentInfo>(
        10,
        Text.equal,
        Text.hash
      );
      chunks = HashMap.HashMap<Types.ChunkId, Types.ChunkData>(
        10,
        Text.equal,
        Text.hash
      );
      moderators = HashMap.HashMap<Principal, Principal>(
        10,
        Principal.equal,
        Principal.hash
      );
    };
    st;
  };

  stable var signingKey = "";
  var state : DataCanisterState = emptyStateForDataCanister();

  let limit = 20_000_000_000_000;
  let PER_CONTENT_LIMIT = 10 * 1024 * 1024;
  // 10 DAYS in milliseconds
  let DAYS_TO_DELETE_DATA = 10 * 86400000000;

  func onlyOwners(caller : Principal) : async () {
    let found = await isOwner(caller);
    if (not found) {
      throw Error.reject("Unauthorized Attempt made");
    };
  };

  func isOwner(caller : Principal) : async Bool {
    let ic : CommonTypes.IcRootActorType = actor ("aaaaa-aa");
    let canisterDetails = await ic.canister_status({
      canister_id = Principal.fromActor(this);
    });
    var found = false;
    label l for (controller in canisterDetails.settings.controllers.vals()) {
      if (Principal.equal(caller, controller)) {
        found := true;
        break l;
      };
    };
    found;
  };

  public shared ({ caller }) func setParams(
    moderatorsId : [Principal],
    signingKey1 : Text
  ) {
    await onlyOwners(caller);

    signingKey := signingKey1;
    for (modId in moderatorsId.vals()) {
      state.moderators.put(modId, modId);
    };
  };

  public shared ({ caller }) func getSize() : async Nat {
    await onlyOwners(caller);
    Prim.rts_memory_size();
  };

  func chunkId(contentId : Text, chunkNum : Nat) : Types.ChunkId {
    contentId # "-" # (Nat.toText(chunkNum));
  };

  func getContentDataSize(contentId : Text) : Nat {
    var chunkNum = 1;
    var totalSize = 0;
    label l while (true) {
      switch (state.chunks.get(chunkId(contentId, chunkNum))) {
        case (null) {
          break l;
        };
        case (?chunkData) {
          totalSize := totalSize + chunkData.size();
        };
      };
      chunkNum := chunkNum + 1;
    };
    totalSize;
  };

  func deleteContent(contentId : Text) {
    var chunkNum = 1;
    label l while (true) {
      switch (state.chunks.get(chunkId(contentId, chunkNum))) {
        case (null) {
          break l;
        };
        case (?chunkData) {
          if (chunkNum == 1) {
            state.contentInfo.delete(contentId);
          };
          state.chunks.delete(chunkId(contentId, chunkNum));
        };
      };
      chunkNum := chunkNum + 1;
    };
    // Removing contentId from restricted list after deletion
    restrictedContentId := Trie.remove(
      restrictedContentId,
      key(contentId),
      Text.equal
    ).0;
  };

  func isContentNotAccessible(contentId : Text) : Bool {
    return Trie.get(restrictedContentId, key(contentId), Text.equal) != null;
  };

  public shared ({ caller }) func markContentNotAccessible(contentId : Text) : async () {
    await onlyOwners(caller);
    restrictedContentId := Trie.put(
      restrictedContentId,
      key(contentId),
      Text.equal,
      Helpers.timeNow()
    ).0;
  };

  public shared ({ caller }) func markContentAccessible(contentId : Text) : async () {
    await onlyOwners(caller);
    if (isContentNotAccessible(contentId)) {
      restrictedContentId := Trie.remove(
        restrictedContentId,
        key(contentId),
        Text.equal
      ).0;
    };
  };

  public shared ({ caller }) func markAllContentNotAccessible() : async () {
    await onlyOwners(caller);
    for (contentId in state.contentInfo.keys()) {
      restrictedContentId := Trie.put(
        restrictedContentId,
        key(contentId),
        Text.equal,
        Helpers.timeNow()
      ).0;
    };
  };

  func key(t : Text) : Trie.Key<Text> { { key = t; hash = Text.hash(t) } };

  // add chunks
  // the structure for storing blob chunks is to unse name + chunk num eg: 123a1, 123a2 etc
  public shared ({ caller }) func putChunks(
    contentId : Text,
    chunkNum : Nat,
    chunkData : Blob,
    numOfChunks : Nat,
    contentType : Text
  ) : async ?() {
    await onlyOwners(caller);

    if (getContentDataSize(contentId) + chunkData.size() > PER_CONTENT_LIMIT) {
      Helpers.logMessage(
        canistergeekLogger,
        "Size Exceeded. Deleting contentId: " # contentId,
        #info
      );
      deleteContent(contentId);
      Helpers.logMessage(
        canistergeekLogger,
        "Deletion completed for contentId: " # contentId,
        #info
      );
      throw Error.reject(ModClubParam.PER_CONTENT_SIZE_EXCEEDED_ERROR);
    };
    do ? {
      if (chunkNum == 1) {
        state.contentInfo.put(
          contentId,
          {
            contentId = contentId;
            numOfChunks = numOfChunks;
            contentType = contentType;
          }
        );
      } else {
        //previous chunk should be stored.
        switch (state.chunks.get(chunkId(contentId, chunkNum - 1))) {
          case (null) {
            throw Error.reject("Previous data chunk not found.");
          };
          case (_)();
        };
      };
      state.chunks.put(chunkId(contentId, chunkNum), chunkData);
    };
  };

  public query func getFileInfoData(contentId : Text) : async ?Types.ContentInfo {
    do ? {
      let v = state.contentInfo.get(contentId)!;
      {
        contentId = v.contentId;
        numOfChunks = v.numOfChunks;
        contentType = v.contentType;
      };
    };
  };

  public query ({ caller }) func getChunk(fileId : Text, chunkNum : Nat) : async ?Blob {
    Utils.mod_assert(authGuard.isModclubCanister(caller) or authGuard.isAdmin(caller), ModSecurity.AccessMode.NotPermitted);
    state.chunks.get(chunkId(fileId, chunkNum));
  };

  public shared query ({ caller }) func streamingCallback(
    token : Types.StreamingCallbackToken
  ) : async Types.StreamingCallbackHttpResponse {
    let body : Blob = switch (state.chunks.get(chunkId(token.key, token.index))) {
      case (?b) b;
      case (null) {
        Helpers.logMessage(
          canistergeekLogger,
          "Chunk not found for token key" # token.key # " token index " # Nat.toText(
            token.index
          ),
          #error
        );
        Blob.fromArray([]);
      };
    };
    let next_token : ?Types.StreamingCallbackToken = switch (
      state.chunks.get(chunkId(token.key, token.index +1))
    ) {
      case (?nextbody) ?{
        content_encoding = token.content_encoding;
        key = token.key;
        index = token.index +1;
        sha256 = null;
      };
      case (null) null;
    };

    {
      body = body;
      token = next_token;
    };
  };

  public shared ({ caller }) func registerModerators(moderatorIds : [Principal]) : () {
    await onlyOwners(caller);
    for (moderatorId in moderatorIds.vals()) {
      state.moderators.put(moderatorId, moderatorId);
    };
  };

  public shared ({ caller }) func deRegisterModerators(
    moderatorIds : [Principal]
  ) : () {
    await onlyOwners(caller);
    for (moderatorId in moderatorIds.vals()) {
      state.moderators.delete(moderatorId);
    };
  };

  public shared ({ caller }) func setSigningKey(signingKey1 : Text) : async () {
    await onlyOwners(caller);
    signingKey := signingKey1;
  };

  public query ({ caller }) func http_request(req : Types.HttpRequest) : async Types.HttpResponse {
    var _headers = [
      ("Content-Type", "text/html"),
      ("Content-Disposition", "inline")
    ];
    let self : Principal = Principal.fromActor(this);
    let canisterId : Text = Principal.toText(self);
    let canister = actor (canisterId) : actor {
      streamingCallback : shared () -> async ();
    };

    let _lambdaKey = authGuard.getSecretVals("POH_CONTENT_ACCESS_KEY");
    if (_lambdaKey.size() == 0) {
      throw Error.reject("POH Lambda key is not provided. Please ask admin to set the POH_CONTENT_ACCESS_KEY for calls from POH lambda.");
    };

    var _status_code : Nat16 = 404;
    var _body : Blob = "404 Not Found";
    var _streaming_strategy : ?Types.StreamingStrategy = null;

    try {
      let _ = do ? {
        let storageParams : Text = Text.stripStart(req.url, #text("/storage?"))!;
        let fields : Iter.Iter<Text> = Text.split(storageParams, #text("&"));
        var contentId : ?Text = null;
        var jwt : Text = "";
        var chunkNum : Nat = 1;
        for (field : Text in fields) {
          let kv : [Text] = Iter.toArray<Text>(Text.split(field, #text("=")));
          if (kv[0] == "contentId") {
            contentId := ?kv[1];
          } else if (kv[0] == "token") {
            jwt := kv[1];
          };
        };

        // Extract x-api-key from request headers in case of lambda invocation
        var apiKey : ?Text = null;
        label l for (header : (Text, Text) in req.headers.vals()) {
          if (header.0 == "x-api-key") {
            apiKey := ?header.1;
            break l;
          };
        };

        if (apiKey != _lambdaKey[0] and not (isUserAllowed(jwt, contentId!))) {
          let msg : Text = if (apiKey == null) {
            "401 Unauthorized - Invalid JWT";
          } else {
            "401 Unauthorized - Invalid API Key";
          };
          Helpers.logMessage(
            canistergeekLogger,
            "Bucket - http_request - User " # Principal.toText(caller) # " tried to access data: " # msg,
            #error
          );
          return {
            status_code = 401;
            headers = _headers;
            body = Text.encodeUtf8(msg);
            streaming_strategy = null;
          };
        };

        _body := state.chunks.get(chunkId(contentId!, chunkNum))!;
        let info : ?Types.ContentInfo = state.contentInfo.get(contentId!);
        _headers := [
          ("Content-Type", info!.contentType),
          ("Content-Disposition", "inline")
        ];
        _status_code := 200;
        _streaming_strategy := ?#Callback(
          {
            token = {
              content_encoding = "gzip";
              key = contentId!;
              index = chunkNum + 1;
              //starts at 1
              sha256 = null;
            };
            callback = canister.streamingCallback;
          }
        );
      };
    } catch e {
      return {
        status_code = 500;
        headers = _headers;
        body = Text.encodeUtf8("ERROR::" # Error.message(e));
        streaming_strategy = null;
      };
    };

    return {
      status_code = _status_code;
      headers = _headers;
      body = _body;
      streaming_strategy = _streaming_strategy;
    };

  };

  public query ({ caller }) func getCanisterMetrics(
    parameters : Canistergeek.GetMetricsParameters
  ) : async ?Canistergeek.CanisterMetrics {
    if (not authGuard.allowedCanistergeekCaller(caller)) {
      throw Error.reject("Unauthorized");
    };
    canistergeekMonitor.getMetrics(parameters);
  };

  public shared ({ caller }) func collectCanisterMetrics() : async () {
    if (not authGuard.allowedCanistergeekCaller(caller)) {
      throw Error.reject("Unauthorized");
    };
    canistergeekMonitor.collectMetrics();
  };

  public query ({ caller }) func getCanisterLog(
    request : ?LoggerTypesModule.CanisterLogRequest
  ) : async ?LoggerTypesModule.CanisterLogResponse {
    if (not authGuard.allowedCanistergeekCaller(caller)) {
      throw Error.reject("Unauthorized");
    };
    canistergeekLogger.getLog(request);
  };

  public query ({ caller }) func getContentInfo() : async [(Text, Types.ContentInfo)] {
    fromDataCanisterState(state).contentInfo;
  };

  public shared ({ caller }) func getChunkData() : async [Text] {
    await onlyOwners(caller);
    Iter.toArray(state.chunks.keys());
  };

  public shared ({ caller }) func runDeleteContentJob() : async () {
    await onlyOwners(caller);
    deleteContentAfterExpiry();
  };

  // For testing purposes
  public query ({ caller }) func showAdmins() : async [Principal] {
    Utils.mod_assert(authGuard.isAdmin(caller), ModSecurity.AccessMode.NotPermitted);
    authGuard.getAdmins();
  };

  public shared ({ caller }) func subscribeOnAdmins() : async () {
    authGuard.subscribe<system>("admins");
  };

  public shared ({ caller }) func subscribeOnSecrets() : async () {
    authGuard.subscribe("secrets");
  };

  private func isUserAllowed(jwt : Text, contentId : Text) : Bool {
    if (jwt == "") {
      return false;
    };
    var c = 0;
    var modId = "";
    var issueTime = 0;
    var signature = "";
    var message = "";
    for (part in Text.split(jwt, #char('.'))) {
      if (c == 0) {
        var k = 0;
        switch (Helpers.decodeBase32(part)) {
          case (null) { return false };
          case (?msg) {
            message := msg;
            for (ele in Text.split(msg, #char('.'))) {
              if (k == 0) {
                modId := ele;
              } else if (k == 1) {
                issueTime := Helpers.textToNat(ele);
              };
              k += 1;
            };
          };
        };
      } else {
        signature := part;
      };
      c += 1;
    };
    if (
      not verifiedSignature(signature, message) or not jwtNotExpired(issueTime) or not (
        isUserModerator(modId)
      )
    ) {
      return false;
    };

    if (isContentNotAccessible(contentId)) {
      return false;
    };

    return true;
  };

  private func verifiedSignature(signature : Text, message : Text) : Bool {
    if (signature == "") {
      return false;
    };
    let actualSignature = Helpers.generateHash(message # signingKey);

    if (actualSignature != signature) {
      Helpers.logMessage(
        canistergeekLogger,
        "JWT Signatures did not match",
        #error
      );
      return false;
    };
    return true;
  };

  private func jwtNotExpired(issueTime : Nat) : Bool {
    if (
      issueTime == 0 or (Helpers.timeNow() - issueTime) > ModClubParam.JWT_VALIDITY_MILLI
    ) {
      Helpers.logMessage(canistergeekLogger, "JWT expired", #error);
      return false;
    };
    return true;
  };

  private func isUserModerator(modId : Text) : Bool {
    switch (state.moderators.get(Principal.fromText(modId))) {
      case (null) {
        Helpers.logMessage(
          canistergeekLogger,
          "User " # modId # " is not a moderator",
          #error
        );
        return false;
      };
      case (?exists) {
        return true;
      };
    };
  };

  func deleteContentAfterExpiry() {
    let currentTime = Helpers.timeNow();
    for ((contentId, reviewedTime) in Trie.iter(restrictedContentId)) {
      if (currentTime > reviewedTime + DAYS_TO_DELETE_DATA) {
        Helpers.logMessage(
          canistergeekLogger,
          "Deleting contentId after expiry: " # contentId,
          #info
        );
        deleteContent(contentId);
      };
    };
  };

  private func emptyDataCanisterSharedState() : DataCanisterSharedState {
    var st : DataCanisterSharedState = {
      contentInfo = [];
      chunks = [];
      moderators = [];
    };
    st;
  };

  private func fromDataCanisterState(state : DataCanisterState) : DataCanisterSharedState {
    let st : DataCanisterSharedState = {
      contentInfo = Iter.toArray(state.contentInfo.entries());
      chunks = Iter.toArray(state.chunks.entries());
      moderators = Iter.toArray(state.moderators.entries());
    };
    st;
  };

  private func toDataCanisterState(stateShared : DataCanisterSharedState) : DataCanisterState {
    var state : DataCanisterState = emptyStateForDataCanister();

    for ((category, val) in stateShared.chunks.vals()) {
      state.chunks.put(category, val);
    };

    for ((category, val) in stateShared.contentInfo.vals()) {
      state.contentInfo.put(category, val);
    };

    for ((category, val) in stateShared.moderators.vals()) {
      state.moderators.put(category, val);
    };
    state;
  };

  stable var stateShared : DataCanisterSharedState = emptyDataCanisterSharedState();

  ignore Timer.setTimer<system>(
    #seconds 0,
    func() : async () {
      canistergeekMonitor.collectMetrics();
      switch (canistergeekTimer) {
        case (?tid) { Timer.cancelTimer(tid) };
        case (null) {};
      };
      canistergeekTimer := ?Timer.recurringTimer<system>(
        #nanoseconds(Constants.ONE_HOUR_NANO_SECS),
        func() : async () {
          Helpers.logMessage(canistergeekLogger, "Running Collecting Metrics job.", #info);
          canistergeekMonitor.collectMetrics();
        }
      );
      deleteContentTimer := ?Timer.recurringTimer<system>(
        #nanoseconds(Constants.TWENTY_FOUR_HOUR_NANO_SECS),
        func() : async () {
          Helpers.logMessage(canistergeekLogger, "Running Delete ContentId job.", #info);
          deleteContentAfterExpiry();
        }
      );
    }
  );

  public query ({ caller }) func availableCycles() : async Nat {
    return Cycles.balance();
  };

  system func preupgrade() {
    stateShared := fromDataCanisterState(state);
    _canistergeekMonitorUD := ?canistergeekMonitor.preupgrade();
    _canistergeekLoggerUD := ?canistergeekLogger.preupgrade();
  };

  system func postupgrade() {
    authGuard.subscribe<system>("admins");
    ignore authGuard.setUpDefaultAdmins(
      List.nil<Principal>(),
      deployer,
      Principal.fromActor(this)
    );
    authGuard.subscribe<system>("secrets");
    state := toDataCanisterState(stateShared);
    stateShared := emptyDataCanisterSharedState();
    canistergeekMonitor.postupgrade(_canistergeekMonitorUD);
    _canistergeekMonitorUD := null;
    canistergeekLogger.postupgrade(_canistergeekLoggerUD);
    _canistergeekLoggerUD := null;
    canistergeekLogger.setMaxMessagesCount(3000);

  };

  system func inspect({
    arg : Blob;
    caller : Principal;
    msg : Types.BucketCanisterMessageInspection;
  }) : Bool {
    switch (msg) {
      case (#subscribeOnAdmins _) { authGuard.isAdmin(caller) };
      case (#subscribeOnSecrets _) { authGuard.isAdmin(caller) };
      case _ { not Principal.isAnonymous(caller) };
    };
  };

};
