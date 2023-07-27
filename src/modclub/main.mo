import Array "mo:base/Array";
import Base32 "mo:encoding/Base32";
import Blob "mo:base/Blob";
import Bool "mo:base/Bool";
import Buffer "mo:base/Buffer";
import Canistergeek "./canistergeek/canistergeek";
import ContentVotingManager "./service/content/vote";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import Trie "mo:base/Trie";
import Helpers "./helpers";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import List "mo:base/List";
import LoggerTypesModule "./canistergeek/logger/typesModule";
import ModClubParam "service/parameters/params";
import ModeratorManager "./service/moderator/moderator";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Order "mo:base/Order";
import POH "./service/poh/poh";
import PohStateV2 "./service/poh/statev2";
import PohTypes "./service/poh/types";
import VoteTypes "./service/vote/types";
import Prim "mo:prim";
import Principal "mo:base/Principal";
import Cycles "mo:base/ExperimentalCycles";
import JSON "mo:json/JSON";
import ProviderManager "./service/provider/provider";
import PermissionsModule "./service/provider/permissions";
import QueueManager "./service/queue/queue";
import QueueState "./service/queue/state";
import Random "mo:base/Random";
import Rel "./data_structures/Rel";
import RelObj "./data_structures/RelObj";
import Result "mo:base/Result";
import StateV2 "./statev2";
import StorageSolution "./service/storage/storage";
import StorageState "./service/storage/storageState";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Types "./types";
import MsgInspectTypes "msgInspectTypes";
import EmailManager "./service/email/email";
import EmailState "./service/email/state";
import VoteManager "./service/vote/vote";
import VoteState "./service/vote/statev2";
import VoteStateV2 "./service/vote/statev2";
import RSTypes "../rs/types";
import ICRCTypes "../common/ICRCTypes";
import Utils "../common/utils";
import ContentManager "./service/content/content";
import ContentStateManager "./service/content/reserved";
import ContentState "./service/content/state";
import CommonTypes "../common/types";
import Reserved "service/content/reserved";
import Constants "../common/constants";
import ModSecurity "../common/security/guard";
import Timer "mo:base/Timer";
import Nat64 "mo:base/Nat64";
import Constant "service/content/constant";
import CommonTimer "../common/timer/timer";

shared ({ caller = deployer }) actor class ModClub(env : CommonTypes.ENV) = this {

  let MAX_WAIT_LIST_SIZE = 20000;

  private stable var startTimeForPOHEmail = Helpers.timeNow();
  private stable var keyToCallLambda : Text = "";
  private var ranPOHUserEmailsOnce : Bool = false;
  stable var signingKey = "";
  stable var allowSubmissionFlag : Bool = true;

  // Global Objects
  var stateV2 = StateV2.empty();

  stable var storageStateStable = StorageState.emptyStableState();
  stable var retiredDataCanisterId : [Text] = [];

  stable var pohStableStateV2 = PohStateV2.emptyStableState();
  stable var pohCallbackDataByProvider : [(Principal, [(Text, [(Text, Int)])])] = [];
  stable var provider2ProviderUserId2Ip : [(Principal, [(Text, Text)])] = [];
  stable var provider2Ip2Wallet : [(Principal, Rel.RelShared<Text, Principal>)] = [];
  var pohEngine = POH.PohEngine(
    pohStableStateV2,
    pohCallbackDataByProvider,
    provider2ProviderUserId2Ip,
    provider2Ip2Wallet
  );

  stable var pohVoteStableState = VoteState.emptyStableState();
  stable var pohVoteStableStateV2 = VoteStateV2.emptyStableState();
  var voteManager = VoteManager.VoteManager(pohVoteStableState);

  stable var contentStableState = ContentState.emptyStableState();
  var contentState = ContentStateManager.ContentStateManager(contentStableState);
  stable var emailStableState = EmailState.emptyStableState();
  var emailManager = EmailManager.EmailManager(emailStableState);

  stable var _canistergeekMonitorUD : ?Canistergeek.UpgradeData = null;
  private let canistergeekMonitor = Canistergeek.Monitor();

  stable var _canistergeekLoggerUD : ?Canistergeek.LoggerUpgradeData = null;
  private let canistergeekLogger = Canistergeek.Logger();

  stable var contentQueueStateStable : ?QueueState.QueueStateStable = null;
  private let contentQueueManager = QueueManager.QueueManager();
  stable var randomizationEnabled = true;

  stable var pohContentQueueStateStable : ?QueueState.QueueStateStable = null;
  private let pohContentQueueManager = QueueManager.QueueManager();

  stable var admins : List.List<Principal> = List.nil<Principal>();

  stable var claimRewardsWhitelist : List.List<Principal> = List.nil<Principal>();
  private var claimRewardsWhitelistBuf = Buffer.Buffer<Principal>(100);

  private var commonTimer = CommonTimer.CommonTimer(env, "CommonTimer");
  commonTimer.initTimer(canistergeekMonitor);

  private var authGuard = ModSecurity.Guard(env, "MODCLUB_CANISTER");
  authGuard.subscribe("admins");

  var storageSolution = StorageSolution.StorageSolution(
    storageStateStable,
    retiredDataCanisterId,
    admins,
    signingKey,
    authGuard
  );

  ModeratorManager.subscribeOnEvents(env, "moderator_became_senior");

  let vestingActor = authGuard.getVestingActor();
  let ledger = authGuard.getWalletActor();

  public shared ({ caller }) func handleSubscription(payload : CommonTypes.ConsumerPayload) : async () {
    switch (payload) {
      case (#admins(list)) {
        ignore authGuard.setUpDefaultAdmins(null, deployer, Principal.fromActor(this));
        authGuard.handleSubscription(payload);
        storageSolution.updateAdmins(authGuard.getAdmins());
      };
      case (#events(events)) {
        // TODO: Refactor this and put logic to new refactored ModeratorManager.
        // TODO: Notify Moderator by email.
        for (event in Array.vals<CommonTypes.Event>(events)) {
          switch (event.topic) {
            case ("moderator_became_senior") {
              if (not ModeratorManager.canClaimReward(event.payload, claimRewardsWhitelistBuf)) {
                claimRewardsWhitelistBuf.add(event.payload);
              };
            };
            case (_) {};
          };
        };
      };
    };
  };

  public shared ({ caller }) func toggleAllowSubmission(allow : Bool) : async () {
    allowSubmissionFlag := allow;
  };

  public shared ({ caller }) func generateSigningKey() : async () {
    switch (Helpers.encodeNat8ArraytoBase32(Blob.toArray(await Random.blob()))) {
      case (null) { throw Error.reject("Couldn't generate key") };
      case (?key) {
        signingKey := key;
        await storageSolution.setSigningKey(signingKey);
      };
    };
  };

  // ---------------------- Email Methods------------------------------
  public shared ({ caller }) func registerUserToReceiveAlerts(
    id : Principal,
    wantsToGetAlerts : Bool
  ) : async Bool {
    return await emailManager.registerUserToReceiveAlerts(id, wantsToGetAlerts);
  };

  public shared query ({ caller }) func getAllUsersWantToReceiveAlerts() : async [Text] {
    return emailManager.getAllUsersWantToReceiveAlerts();
  };

  public shared query ({ caller }) func checkIfUserOptToReciveAlerts() : async Bool {
    return emailManager.checkIfUserOptToReciveAlerts(caller);
  };

  public shared ({ caller }) func sendVerificationEmail(
    envForBaseURL : Text
  ) : async Bool {
    var userEmail = await emailManager.sendVerificationEmail(
      caller,
      envForBaseURL,
      stateV2
    );
    var callResult : Bool = false;
    var pid = Principal.toText(caller);
    if (userEmail == "") {
      throw Error.reject("User has not provided email id");
    };
    // send Verification email to receive alerts
    callResult := await callLambdaToSendEmail(
      userEmail,
      envForBaseURL,
      pid,
      "v",
      0
    );
    return callResult;
  };
  // ---------------------- END Email Methods------------------------------

  // ----------------------Provider Methods------------------------------
  public shared ({ caller }) func registerProvider(
    name : Text,
    description : Text,
    image : ?Types.Image
  ) : async Text {
    switch (stateV2.providersWhitelist.get(caller)) {
      case (null) {
        Helpers.logMessage(
          canistergeekLogger,
          "registerProvider - Provider not in allow list with provider ID: " # Principal.toText(
            caller
          ),
          #info
        );
        return "Caller " # Principal.toText(caller) # " not in allow list";
      };
      case (?_)();
    };

    let subAccs = HashMap.fromIter<Text, Blob>(
      (await Helpers.generateSubAccounts(Helpers.providerSubaccountTypes)).vals(),
      Array.size(Helpers.providerSubaccountTypes),
      Text.equal,
      Text.hash
    );

    ProviderManager.registerProvider({
      providerId = caller;
      name;
      description;
      image;
      subaccounts = subAccs;
      state = stateV2;
      logger = canistergeekLogger;
    });
  };

  public shared ({ caller }) func updateProvider(
    providerId : Principal,
    updatedProviderVal : Types.ProviderMeta
  ) : async Types.ProviderMetaResult {
    await ProviderManager.updateProviderMetaData({
      providerId;
      updatedProviderVal;
      callerPrincipalId = caller;
      state = stateV2;
      logger = canistergeekLogger;
    });
  };

  public shared ({ caller }) func updateProviderLogo(
    providerId : Principal,
    logoToUpload : [Nat8],
    logoType : Text
  ) : async Text {

    return await ProviderManager.updateProviderLogo({
      providerId;
      logoToUpload;
      logoType;
      callerPrincipalId = caller;
      state = stateV2;
      logger = canistergeekLogger;
    });
  };

  public shared ({ caller }) func deregisterProvider() : async Text {
    ProviderManager.deregisterProvider(caller, stateV2, canistergeekLogger);
  };

  public shared ({ caller }) func updateSettings(
    providerId : Principal,
    updatedSettings : Types.ProviderSettings
  ) : async Types.ProviderSettingResult {
    await ProviderManager.updateProviderSettings(
      providerId,
      updatedSettings,
      caller,
      stateV2,
      canistergeekLogger
    );
  };

  public shared ({ caller }) func getProvider(providerId : Principal) : async Types.ProviderPlus {
    await ProviderManager.getProvider(providerId, stateV2);
  };

  public shared ({ caller }) func providerSaBalance(saType : Text, providerId : ?Principal) : async ICRCTypes.Tokens {
    let pid = switch (providerId) {
      case (?pid) {
        switch (PermissionsModule.checkProviderPermission(caller, ?pid, stateV2)) {
          case (#err(error)) return throw Error.reject("Unauthorized");
          case (#ok(p)) {};
        };
        pid;
      };
      case (_) caller;
    };
    let provider = switch (stateV2.providers.get(pid)) {
      case (?p) p;
      case (_) return throw Error.reject("Provider doesn't exist.");
    };
    let psa = switch (provider.subaccounts.get(saType)) {
      case (?psa) psa;
      case (_) return throw Error.reject("Providers Subaccount doesn't exist.");
    };
    let tokens = await ProviderManager.getSaBalance(env, authGuard.getCanisterId(#modclub), psa);
    return tokens;
  };

  public shared ({ caller }) func getProviderSa(saType : Text, providerId : ?Principal) : async Blob {
    let pid = switch (providerId) {
      case (?pid) {
        switch (PermissionsModule.checkProviderPermission(caller, ?pid, stateV2)) {
          case (#err(error)) return throw Error.reject("Unauthorized");
          case (#ok(p)) {};
        };
        pid;
      };
      case (_) caller;
    };
    let provider = switch (stateV2.providers.get(pid)) {
      case (?p) p;
      case (_) return throw Error.reject("Provider doesn't exist.");
    };
    let psa = switch (provider.subaccounts.get(saType)) {
      case (?psa) psa;
      case (_) return throw Error.reject("Providers Subaccount doesn't exist.");
    };
    return psa;
  };

  private func getVoteParamIdByLevel(
    level : Types.Level
  ) : Text {
    return contentState.getVoteParamIdByLevel(level, stateV2);
  };

  private func getVoteParamsIdByContentId(contentId : Types.ContentId) : ?Types.VoteParamsId {
    return contentState.getVoteParamsIdByContentId(contentId);
  };

  private func getVoteParamsByVoteParamId(voteParamId : Types.VoteParamsId) : async Types.VoteParameters {
    switch (contentState.getVoteParamsByVoteParamId(voteParamId)) {
      case (null) {
        let now = Helpers.timeNow();
        let vp : Types.VoteParameters = {
          id = "simplevoteParameter-0";
          requiredVotes = 3;
          createdAt = now;
          updatedAt = now;
          complexity = {
            level = #simple;
            expiryTime = now + Constants.EXPIRE_VOTE_TIME;
          };
        };
        await contentState.setVoteParams(vp);
        return vp;
      };
      case (?vote) {
        return vote;
      };
    };
  };

  public shared ({ caller }) func setVoteParamsForLevel(requireVote : Int, level : Types.Level) : async () {
    let now = Helpers.timeNow();
    let id : Types.VoteParamsId = Helpers.generateVoteParamId(Helpers.level2Text(level) # "voteParameter", stateV2);
    let vp : Types.VoteParameters = {
      id = id;
      requiredVotes = requireVote;
      createdAt = now;
      updatedAt = now;
      complexity = {
        level = level;
        expiryTime = now + Constants.EXPIRE_VOTE_TIME;
      };

    };
    let res = await contentState.setVoteParams(vp);
  };

  public shared ({ caller }) func addRules(
    rules : [Text],
    providerId : ?Principal
  ) : async () {
    // checkProviderPermission will return either the caller or the passed in providerId depending if the caller is the provider or not
    switch (PermissionsModule.checkProviderPermission(caller, providerId, stateV2)) {
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p)) {
        ProviderManager.addRules(p, rules, stateV2, canistergeekLogger);
      };
    };
  };

  public shared ({ caller }) func removeRules(
    ruleIds : [Types.RuleId],
    providerId : ?Principal
  ) : async () {
    switch (PermissionsModule.checkProviderPermission(caller, providerId, stateV2)) {
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p)) {
        ProviderManager.removeRules(p, ruleIds, stateV2, canistergeekLogger);
      };
    };
  };

  public shared ({ caller }) func updateRules(
    rulesList : [Types.Rule],
    providerId : ?Principal
  ) : async () {
    switch (PermissionsModule.checkProviderPermission(caller, providerId, stateV2)) {
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p)) {
        ProviderManager.updateRules(p, rulesList, stateV2);
      };
    };
  };

  public query ({ caller }) func getProviderRules() : async [Types.Rule] {
    ProviderManager.getProviderRules(caller, stateV2);
  };

  public query func getRules(providerId : Principal) : async [Types.Rule] {
    ProviderManager.getProviderRules(providerId, stateV2);
  };

  // Subscribe function for providers to register their callback after a vote decision has been made
  public shared ({ caller }) func subscribe(sub : Types.SubscribeMessage) : async () {
    switch (PermissionsModule.checkProviderPermission(caller, null, stateV2)) {
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p))();
    };
    ProviderManager.subscribe(caller, sub, stateV2, canistergeekLogger);
  };

  public shared ({ caller }) func subscribePohCallback(
    sub : PohTypes.SubscribePohMessage
  ) : async () {
    switch (PermissionsModule.checkProviderPermission(caller, null, stateV2)) {
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p))();
    };
    pohEngine.subscribe(caller, sub);
  };

  public shared ({ caller }) func addToAllowList(providerId : Principal) : async () {
    await ProviderManager.addToAllowList(providerId, stateV2, canistergeekLogger);
  };

  // ----------------------Content Related Methods------------------------------
  public shared ({ caller }) func getContent(id : Text) : async ?Types.ContentPlus {
    let voteCount = getVoteCount(id, ?caller);
    return await ContentManager.getContent(caller, id, voteCount, stateV2, storageSolution);
  };

  public shared ({ caller }) func getContentResult(
    id : Text
  ) : async Types.ContentResult {
    let voteCount = getVoteCount(id, ?caller);
    let cp = await ContentManager.getContent(caller, id, voteCount, stateV2, storageSolution);
    switch (cp) {
      case (?result) {
        switch (PermissionsModule.checkProviderPermission(caller, ?result.providerId, stateV2)) {
          case (#err(error)) return throw Error.reject("Unauthorized");
          case (#ok(p)) {
            let cr = ContentVotingManager.getContentResult(
              result.id,
              result.sourceId,
              result.status,
              voteCount
            );
            return cr;
          };
        };
      };
      case (_) {
        throw Error.reject("Content not found");
      };
    };

    return throw Error.reject("Unknown error when fetching content results");
  };

  public shared ({ caller }) func submitText(
    sourceId : Text,
    text : Text,
    title : ?Text
  ) : async Text {
    if (allowSubmissionFlag == false) {
      throw Error.reject("Submissions are disabled");
    };
    if (ContentManager.checkIfAlreadySubmitted(sourceId, caller, stateV2)) {
      throw Error.reject("Content already submitted");
    };
    switch (PermissionsModule.checkProviderPermission(caller, null, stateV2)) {
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p))();
    };

    let provider = switch (stateV2.providers.get(caller)) {
      case (?p) p;
      case (_) throw Error.reject("Unauthorized");
    };
    let taskFee = ProviderManager.getTaskFee(provider);
    await ProviderManager.checkAndTopUpProviderBalance(provider, env, Principal.fromActor(this), taskFee);

    let voteParamId = getVoteParamIdByLevel(#simple);
    let voteParam = await getVoteParamsByVoteParamId(voteParamId);

    return await ContentManager.submitTextOrHtmlContent(
      {
        sourceId;
        text;
        title;
        voteParam;
        contentType = #text;
        contentQueueManager;
      },
      {
        caller;
        globalState = stateV2;
        contentState = contentStableState;
        storageSolution = storageSolution;
      }
    );
  };

  public shared ({ caller }) func submitHtmlContent(
    sourceId : Text,
    htmlContent : Text,
    title : ?Text
  ) : async Text {
    if (allowSubmissionFlag == false) {
      throw Error.reject("Submissions are disabled");
    };
    switch (PermissionsModule.checkProviderPermission(caller, null, stateV2)) {
      case (#err(error)) return throw Error.reject("No Permissions");
      case (#ok(p))();
    };
    if (ContentManager.checkIfAlreadySubmitted(sourceId, caller, stateV2)) {
      throw Error.reject("Content already submitted");
    };
    let provider = switch (stateV2.providers.get(caller)) {
      case (?p) p;
      case (_) throw Error.reject("Unauthorized. No Provider found.");
    };
    let taskFee = ProviderManager.getTaskFee(provider);
    await ProviderManager.checkAndTopUpProviderBalance(provider, env, Principal.fromActor(this), taskFee);

    let voteParamId = getVoteParamIdByLevel(#simple);
    let voteParam = await getVoteParamsByVoteParamId(voteParamId);

    var contentID = await ContentManager.submitTextOrHtmlContent(
      {
        sourceId;
        text = htmlContent;
        title;
        voteParam;
        contentType = #htmlContent;
        contentQueueManager;
      },
      {
        caller;
        globalState = stateV2;
        contentState = contentStableState;
        storageSolution;
      }
    );
    return contentID;
  };

  public shared ({ caller }) func submitImage(
    sourceId : Text,
    image : [Nat8],
    imageType : Text,
    title : ?Text
  ) : async Text {
    if (allowSubmissionFlag == false) {
      throw Error.reject("Submissions are disabled");
    };
    if (ContentManager.checkIfAlreadySubmitted(sourceId, caller, stateV2)) {
      throw Error.reject("Content already submitted");
    };
    switch (PermissionsModule.checkProviderPermission(caller, null, stateV2)) {
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p))();
    };

    let provider = switch (stateV2.providers.get(caller)) {
      case (?p) p;
      case (_) throw Error.reject("Unauthorized");
    };
    let taskFee = ProviderManager.getTaskFee(provider);
    await ProviderManager.checkAndTopUpProviderBalance(provider, env, Principal.fromActor(this), taskFee);

    let voteParamId = getVoteParamIdByLevel(#simple);
    let voteParam = await getVoteParamsByVoteParamId(voteParamId);

    return await ContentManager.submitImage(
      {
        sourceId;
        image;
        imageType;
        title;
        voteParam;
        contentQueueManager;
      },
      {
        caller;
        globalState = stateV2;
        contentState = contentStableState;
        storageSolution;
      }
    );
  };

  // Retrieve all content for the calling Provider
  public shared ({ caller }) func getProviderContent(
    providerId : Principal,
    status : Types.ContentStatus,
    start : Nat,
    end : Nat
  ) : async [Types.ContentPlus] {
    switch (PermissionsModule.checkProviderPermission(caller, ?providerId, stateV2)) {
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p))();
    };
    if (start < 0 or end < 0 or start > end) {
      throw Error.reject("Invalid range");
    };
    return await ContentManager.getProviderContent({
      providerId;
      getVoteCount;
      globalState = stateV2;
      status;
      start;
      end;
      contentQueueManager;
      storageSolution;
    });
  };

  public shared ({ caller }) func getAllContent(status : Types.ContentStatus) : async [
    Types.ContentPlus
  ] {
    switch (PermissionsModule.checkProfilePermission(caller, #getContent, stateV2)) {
      case (#err(e)) {
        throw Error.reject("Unauthorized");
      };
      case (_)();
    };
    switch (
      pohVerificationRequestHelper(
        Principal.toText(caller),
        Principal.fromActor(this)
      )
    ) {
      case (#ok(verificationResponse)) {
        if (verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user");
        };
      };
      case (#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case (_)();
    };
    return await ContentManager.getAllContent(
      caller,
      status,
      getVoteCount,
      contentQueueManager,
      canistergeekLogger,
      stateV2,
      randomizationEnabled,
      storageSolution
    );
  };

  public shared ({ caller }) func getTasks(
    start : Nat,
    end : Nat,
    filterVoted : Bool
  ) : async [Types.ContentPlus] {
    Helpers.logMessage(
      canistergeekLogger,
      "getTasks - provider called with provider ID: " # Principal.toText(caller),
      #info
    );
    switch (PermissionsModule.checkProfilePermission(caller, #getContent, stateV2)) {
      case (#err(e)) {
        throw Error.reject("Unauthorized");
      };
      case (_)();
    };
    switch (
      pohVerificationRequestHelper(
        Principal.toText(caller),
        Principal.fromActor(this)
      )
    ) {
      case (#ok(verificationResponse)) {
        if (verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user");
        };
      };
      case (#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case (_)();
    };
    switch (
      await ContentManager.getTasks({
        caller;
        getVoteCount;
        globalState = stateV2;
        start;
        end;
        filterVoted;
        logger = canistergeekLogger;
        contentQueueManager;
        randomizationEnabled;
        storageSolution;
      })
    ) {
      case (#err(e)) {
        throw Error.reject(e);
      };
      case (#ok(tasks)) {
        Helpers.logMessage(
          canistergeekLogger,
          "getTasks - FINISHED - provider called with provider ID: " # Principal.toText(
            caller
          ),
          #info
        );
        return tasks;
      };
    };
  };

  // ----------------------Moderator Methods------------------------------
  public shared ({ caller }) func registerModerator(
    userName : Text,
    email : ?Text,
    pic : ?Types.Image
  ) : async Types.ProfileStable {
    let subAccs = HashMap.fromIter<Text, Blob>(
      (await Helpers.generateSubAccounts(Helpers.moderatorSubaccountTypes)).vals(),
      Array.size(Helpers.moderatorSubaccountTypes),
      Text.equal,
      Text.hash
    );

    let profile = await ModeratorManager.registerModerator(
      caller,
      userName,
      email,
      pic,
      stateV2,
      subAccs
    );

    await storageSolution.registerModerators([caller]);
    contentQueueManager.assignUserIds2QueueId([caller]);
    pohContentQueueManager.assignUserIds2QueueId([caller]);
    return profile;
  };

  public query ({ caller }) func getProfile() : async Types.ProfileStable {
    switch (ModeratorManager.getProfile(caller, stateV2)) {
      case (#ok(p)) {
        return {
          id = p.id;
          userName = p.userName;
          email = p.email;
          pic = p.pic;
          role = p.role;
          subaccounts = Iter.toArray(p.subaccounts.entries());
          createdAt = p.createdAt;
          updatedAt = p.updatedAt;
        };
      };
      case (_) {
        throw Error.reject("profile not found");
      };
    };
  };

  public query ({ caller }) func getProfileById(pid : Principal) : async Types.ProfileStable {
    switch (PermissionsModule.checkProfilePermission(caller, #vote, stateV2)) {
      case (#err(e)) { throw Error.reject("Unauthorized") };
      case (_)();
    };
    switch (ModeratorManager.getProfile(pid, stateV2)) {
      case (#ok(p)) {
        return {
          id = p.id;
          userName = p.userName;
          email = "";
          pic = p.pic;
          role = p.role;
          subaccounts = Iter.toArray(p.subaccounts.entries());
          createdAt = p.createdAt;
          updatedAt = p.updatedAt;
        };
      };
      case (_) {
        throw Error.reject("profile not found");
      };
    };
  };

  public query ({ caller }) func getAllProfiles() : async [Types.ProfileStable] {
    Utils.mod_assert(authGuard.isAdmin(caller), ModSecurity.AccessMode.NotPermitted);
    return ModeratorManager.getAllProfiles(stateV2);
  };

  public shared ({ caller }) func adminUpdateEmail(pid : Principal, email : Text) : async Types.ProfileStable {
    switch (ModeratorManager.adminUpdateEmail(pid, email, stateV2)) {
      case (#ok(p)) {
        return {
          id = p.id;
          userName = p.userName;
          email = "";
          pic = p.pic;
          role = p.role;
          subaccounts = Iter.toArray(p.subaccounts.entries());
          createdAt = p.createdAt;
          updatedAt = p.updatedAt;
        };
      };
      case (_) {
        throw Error.reject("profile not found");
      };
    };
  };

  public shared func getModeratorLeaderboard(start : Nat, end : Nat) : async [
    Types.ModeratorLeaderboard
  ] {

    let topUsers = await authGuard.getRSActor().topUsers(start, end);

    switch (
      ModeratorManager.formModeratorLeaderboard(
        topUsers,
        stateV2
      )
    ) {
      case (#ok(leaderboard)) {
        return leaderboard;
      };
      case (#err(#contentNotFound)) {
        throw Error.reject("Content does not exist");
      };
      case (#err(#voteNotFound)) {
        throw Error.reject("Vote does not exist");
      };
      case (_) {
        throw Error.reject("Something went wrong");
      };
    };
  };

  public query ({ caller }) func getActivity(isComplete : Bool) : async [
    Types.Activity
  ] {
    switch (PermissionsModule.checkProfilePermission(caller, #getActivity, stateV2)) {
      case (#err(e)) { throw Error.reject("Unauthorized") };
      case (_)();
    };
    switch (
      pohVerificationRequestHelper(
        Principal.toText(caller),
        Principal.fromActor(this)
      )
    ) {
      case (#ok(verificationResponse)) {
        if (verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user");
        };
      };
      case (#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case (_)();
    };
    switch (
      ModeratorManager.getActivity(caller, isComplete, getVoteCount, stateV2)
    ) {
      case (#ok(activity)) return activity;
      case (#err(#providerNotFound)) throw Error.reject(
        "Provider does not exist"
      );
      case (#err(#contentNotFound)) throw Error.reject("Content does not exist");
      case (#err(#voteNotFound)) throw Error.reject("Vote does not exist");
      case (_) throw Error.reject("Something went wrong");
    };
  };

  public shared ({ caller }) func canClaimLockedReward(amount : ?ICRCTypes.Tokens) : async Result.Result<Types.CanClaimLockedResponse, Text> {
    var canClaim = true;
    let stats = await ModeratorManager.getStats(caller, env);
    if (not ModeratorManager.isSenior(stats.score)) {
      canClaim := false;
    };
    let moderatorAcc = { owner = caller; subaccount = null };
    let lockedAmount = await vestingActor.locked_for(moderatorAcc);
    let claimAmount = Option.get(amount, lockedAmount);
    if (lockedAmount < claimAmount) {
      canClaim := false;
    };
    let minStake = Utils.getStakingAmountForRewardWithdraw(Option.get(Nat.fromText(Int.toText(stats.score)), 0));
    switch (ModeratorManager.canClaimReward(caller, claimRewardsWhitelistBuf)) {
      case (true) {
        let stakedAmount = await vestingActor.staked_for(moderatorAcc);
        if (stakedAmount < minStake) {
          canClaim := false;
        };
      };
      case (false) {
        canClaim := false;
      };
    };
    #ok({
      canClaim;
      claimAmount;
      claimPrice = minStake;
    });
  };

  public shared ({ caller }) func claimLockedReward(amount : ICRCTypes.Tokens, customReceiver : ?Principal) : async Result.Result<Bool, Text> {
    if (not ModeratorManager.canClaimReward(caller, claimRewardsWhitelistBuf)) {
      return throw Error.reject("Moderator not permitted to claim locked Tokens.");
    };

    let moderatorAcc = { owner = caller; subaccount = null };
    let stats = await ModeratorManager.getStats(caller, env);
    let lockedAmount = await vestingActor.locked_for(moderatorAcc);
    let stakedAmount = await vestingActor.staked_for(moderatorAcc);
    let minStake = Utils.getStakingAmountForRewardWithdraw(Option.get(Nat.fromText(Int.toText(stats.score)), 0));
    if (stakedAmount < minStake) {
      return throw Error.reject("You MUST stake amount of tokens to claim locked Tokens.");
    };

    let reduceReputation = (lockedAmount - amount) < minStake;
    let claimRes = await vestingActor.claim_vesting(moderatorAcc, amount);
    switch (claimRes) {
      case (#ok(_)) {
        let _ = await ledger.icrc1_transfer({
          from_subaccount = ?Constants.ICRC_VESTING_SA;
          to = switch (customReceiver) {
            case (?p) { { owner = p; subaccount = null } };
            case (null) { moderatorAcc };
          };
          amount;
          fee = null;
          memo = null;
          created_at_time = null;
        });

        if (reduceReputation) {
          // REDUCE REPUTATION
          ignore await ModeratorManager.reduceToJunior(caller, env);
          claimRewardsWhitelistBuf.filterEntries(func(i, p) : Bool { not Principal.equal(caller, p) });
        };

        #ok(true);
      };
      case (#err(e)) { return throw Error.reject(e) };
    };
  };

  public shared ({ caller }) func withdrawModeratorReward(amount : ICRCTypes.Tokens, customReceiver : ?Principal) : async Result.Result<ICRCTypes.TxIndex, Text> {
    let moderator = switch (ModeratorManager.getProfile(caller, stateV2)) {
      case (#ok(p)) p;
      case (_)(throw Error.reject("Moderator does not exist"));
    };
    let moderatorAcc = { owner = caller; subaccount = null };
    switch (await ledger.icrc1_balance_of(moderatorAcc)) {
      case (tokensAvailable) {
        let fee = await ledger.icrc1_fee();
        if ((amount + fee) < tokensAvailable) {
          throw Error.reject("Insufficient ballance");
        };
        switch (await ledger.icrc1_transfer({ from_subaccount = moderator.subaccounts.get("ACCOUNT_PAYABLE"); to = switch (customReceiver) { case (?p) { { owner = p; subaccount = null } }; case (null) { moderatorAcc } }; amount; fee = null; memo = null; created_at_time = null })) {
          case (#Ok(tsidx)) { #ok(tsidx) };
          case (_) {
            #err("Error occurs on icrc1_transfer for withdrawModeratorReward.");
          };
        };
      };
      case (_) { throw Error.reject("Unable to get Moderators ballance") };
    };
  };

  // ----------------------Content Voting Methods------------------------------
  public query ({ caller }) func getVotePerformance() : async Float {
    switch (ContentVotingManager.getVotePerformance(caller, stateV2)) {
      case (#ok(vp)) {
        return vp;
      };
      case (#err(#contentNotFound)) {
        throw Error.reject("Content does not exist");
      };
      case (#err(#voteNotFound)) {
        throw Error.reject("Vote does not exist");
      };
    };
  };

  // Hard coded array of blocked principal IDs
  let blocklist : [Principal] = [
    Principal.fromText("vwg5x-m3nk4-7yemy-scctx-bsh4a-xnkaf-pmomf-2v7ip-worm6-iqlau-oae"),
    Principal.fromText("urbvy-cpagg-qe5fh-fakx4-4kyk5-qajvp-zttg5-bfem2-hcga4-smscd-dqe"),
    Principal.fromText("o6nlf-g3xwf-yocnk-rmssc-vp7pa-j632v-4vbpu-kthme-3ks6w-yb3xz-lqe")
  ];

  public shared ({ caller }) func vote(
    contentId : Types.ContentId,
    decision : Types.Decision,
    violatedRules : ?[Types.RuleId]
  ) : async Text {

    // Temporary solution to block voting
    let blockedCaller = Array.find<Principal>(
      blocklist,
      func(val : Principal) : Bool {
        Principal.equal(val, caller);
      }
    );

    if (blockedCaller != null) {
      throw Error.reject("You are blocked from voting, due to multiple violations of the rules.");
    };

    switch (PermissionsModule.checkProfilePermission(caller, #vote, stateV2)) {
      case (#err(e)) { throw Error.reject("Unauthorized") };
      case (_)();
    };
    switch (
      pohVerificationRequestHelper(
        Principal.toText(caller),
        Principal.fromActor(this)
      )
    ) {
      case (#ok(verificationResponse)) {
        if (verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user");
        };
      };
      case (#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case (_)();
    };

    var voteCount = getVoteCount(contentId, ?caller);
    Helpers.logMessage(
      canistergeekLogger,
      "vote - User ID: " # Principal.toText(caller) # " approved: " # Bool.toText(
        decision == #approved
      ) # " voting on content ID : " # contentId # " approve count : " # Nat.toText(
        voteCount.approvedCount
      ) # " rejected count : " # Nat.toText(voteCount.rejectedCount),
      #info
    );
    await ContentVotingManager.vote({
      userId = caller;
      env;
      contentId;
      decision;
      violatedRules;
      voteCount;
      state = stateV2;
      logger = canistergeekLogger;
      contentQueueManager;
      randomizationEnabled;
      modclubCanisterId = Principal.fromActor(this);
    });
  };

  // ----------------------Token Methods------------------------------
  public shared ({ caller }) func unStakeTokens(amount : Nat) : async Text {
    await authGuard.getWalletActor().transfer(?(Principal.toText(caller) # ModClubParam.STAKE_SA), caller, null, Float.fromInt(amount));
    "Unstaked " # Nat.toText(amount) # " tokens";
  };
  //----------------------POH Methods For Providers------------------------------
  public shared ({ caller }) func verifyHumanity(providerUserId : Text) : async PohTypes.PohVerificationResponsePlus {
    switch (pohVerificationRequestHelper(providerUserId, caller)) {
      case (#ok(verificationResponse)) {
        return verificationResponse;
      };
      case (_) {
        throw Error.reject(
          "Either Poh is not configured or POH Callback is not registered for provider."
        );
      };
    };
  };

  private func pohVerificationRequestHelper(
    providerUserId : Text,
    providerId : Principal
  ) : Result.Result<PohTypes.PohVerificationResponsePlus, PohTypes.PohError> {
    if (
      Principal.equal(providerId, Principal.fromActor(this)) and voteManager.isAutoApprovedPOHUser(
        Principal.fromText(providerUserId)
      )
    ) {
      return #ok({
        providerUserId = providerUserId;
        providerId = providerId;
        status = #verified;
        challenges = [];
        requestedAt = null;
        submittedAt = null;
        completedAt = null;
        token = null;
        rejectionReasons = [];
        isFirstAssociation = true;
      });
    };
    let pohVerificationRequest : PohTypes.PohVerificationRequestV1 = {
      requestId = Helpers.generateId(providerId, "pohRequest", stateV2);
      providerUserId = providerUserId;
      providerId = providerId;
    };
    switch (pohEngine.getPohCallback(providerId)) {
      case (#err(er)) {
        return #err(er);
      };
      case (_)();
    };
    // validity and rules needs to come from admin dashboard here
    switch (pohEngine.getProviderPohConfiguration(providerId, stateV2)) {
      case (#ok(providerPohConfig)) {
        let verificationResponse = pohEngine.pohVerificationRequest(
          pohVerificationRequest,
          providerPohConfig.expiry,
          providerPohConfig.challengeIds,
          voteManager.getAllUniqueViolatedRules,
          pohContentQueueManager.getContentStatus
        );
        #ok(verificationResponse);
      };
      case (#err(er)) {
        return #err(er);
      };
    };
  };

  private func findRejectionReasons(userId : Principal, challengeIds : [Text]) : [
    Text
  ] {
    let rejectedPackageId = pohEngine.retrieveRejectedPackageId(
      userId,
      challengeIds,
      pohContentQueueManager.getContentStatus
    );
    switch (rejectedPackageId) {
      case (null) {
        return [];
      };
      case (?id) {
        let violatedRules = voteManager.getAllUniqueViolatedRules(id);
        return pohEngine.resolveViolatedRulesById(violatedRules);
      };
    };
  };

  //----------------------POH Methods For ModClub------------------------------
  // for modclub only

  public shared ({ caller }) func AdminCheckPohVerificationResp(
    providerUserId : Text,
    providerId : Principal
  ) : async PohTypes.PohVerificationResponsePlus {
    switch (pohVerificationRequestHelper(providerUserId, providerId)) {
      case (#ok(verificationResponse)) {
        return verificationResponse;
      };
      case (_) {
        throw Error.reject(
          "Either Poh is not configured or POH Callback is not registered for provider."
        );
      };
    };
  };

  public shared ({ caller }) func verifyUserHumanityForModclub() : async PohTypes.VerifyHumanityResponse {
    // if Modclub hasn't subscribed for POHcallback, subscribe it
    switch (pohEngine.getPohCallback(Principal.fromActor(this))) {
      case (#err(er)) {
        pohEngine.subscribe(
          Principal.fromActor(this),
          { callback = pohCallbackForModclub }
        );
      };
      case (_)();
    };
    let _ = pohEngine.associateProviderUserId2ModclubUserId(
      Principal.fromActor(this),
      Principal.toText(caller),
      caller
    );
    let response = await verifyHumanity(Principal.toText(caller));
    return {
      status = response.status;
      token = response.token;
      rejectionReasons = response.rejectionReasons;
    };
  };

  public shared ({ caller }) func pohCallbackForModclub(
    message : PohTypes.PohVerificationResponsePlus
  ) : () {
    if (caller != Principal.fromActor(this)) {
      throw Error.reject("Unauthorized");
    };
    Helpers.logMessage(
      canistergeekLogger,
      "pohCallbackForModclub - status:  " # pohEngine.statusToString(
        message.status
      ) # " submittedAt: " # Int.toText(Option.get(message.submittedAt, -1)) # " requestedAt: " # Int.toText(
        Option.get(message.requestedAt, -1)
      ) # " completedAt: " # Int.toText(Option.get(message.completedAt, -1)) # "isFirstAssociation: " # Bool.toText(
        message.isFirstAssociation
      ) # "providerUserId: " # message.providerUserId,
      #info
    );
  };

  public shared ({ caller }) func retrieveChallengesForUser(token : Text) : async Result.Result<[PohTypes.PohChallengesAttempt], PohTypes.PohError> {
    switch (pohEngine.decodeToken(token)) {
      case (#err(err)) {
        return #err(err);
      };
      case (#ok(tokenResponse)) {
        let ipRestrictionConfigured = Option.get(
          Trie.get(
            provider2IpRestriction,
            key(tokenResponse.providerId),
            Principal.equal
          ),
          false
        );
        if (ipRestrictionConfigured) {
          let registered = pohEngine.registerIPWithWallet(
            tokenResponse.providerUserId,
            tokenResponse.providerId,
            caller
          );
          if (not registered) {
            return #err(#attemptToCreateMultipleWalletsWithSameIp);
          };
        };
        switch (pohEngine.getProviderPohConfiguration(tokenResponse.providerId, stateV2)) {
          case (#ok(pohConfigForProvider)) {

            switch (
              pohEngine.associateProviderUserId2ModclubUserId(
                tokenResponse.providerId,
                tokenResponse.providerUserId,
                caller
              )
            ) {
              case (#err(err)) {
                return #err(err);
              };
              case (_)();
            };

            let attempts = await pohEngine.retrieveChallengesForUser(
              caller,
              pohConfigForProvider.challengeIds,
              pohConfigForProvider.expiry,
              false
            );
            switch (attempts) {
              case (#ok(atts)) {
                var atleastOneInNotSubmittedStatus = false;
                label l for (att in atts.vals()) {
                  if (att.status == #notSubmitted) {
                    atleastOneInNotSubmittedStatus := true;
                    break l;
                  };
                };
                if (not atleastOneInNotSubmittedStatus) {

                  await pohEngine.issueCallbackToProviders(
                    caller,
                    stateV2,
                    voteManager.getAllUniqueViolatedRules,
                    pohContentQueueManager.getContentStatus,
                    canistergeekLogger
                  );
                };
              };
              case (_)();
            };
            return attempts;
          };
          case (#err(er)) {
            return #err(er);
          };
        };
      };
    };
  };

  public shared ({ caller }) func submitChallengeData(
    pohDataRequest : PohTypes.PohChallengeSubmissionRequest
  ) : async PohTypes.PohChallengeSubmissionResponse {
    // let caller = Principal.fromText("2vxsx-fae");
    let isValid = pohEngine.validateChallengeSubmission(pohDataRequest, caller);
    if (isValid == #ok) {
      let _ = do ? {
        let attemptId = pohEngine.getAttemptId(
          pohDataRequest.challengeId,
          caller
        );
        try {
          let dataCanisterId = await storageSolution.putBlobsInDataCanister(
            attemptId,
            pohDataRequest.challengeDataBlob!,
            pohDataRequest.offset,
            pohDataRequest.numOfChunks,
            pohDataRequest.mimeType,
            pohDataRequest.dataSize
          );
          if (pohDataRequest.offset == pohDataRequest.numOfChunks) {
            //last Chunk coming in
            let _ = pohEngine.changeChallengeTaskStatus(
              pohDataRequest.challengeId,
              caller,
              #pending
            );
            pohEngine.updateDataCanisterId(
              pohDataRequest.challengeId,
              caller,
              dataCanisterId
            );

            let challengePackages = pohEngine.createChallengePackageForVoting(
              caller,
              pohContentQueueManager.getContentStatus,
              stateV2,
              canistergeekLogger
            );
            for (package in challengePackages.vals()) {
              pohContentQueueManager.changeContentStatus(package.id, #new);
              switch (pohEngine.getPohChallengePackage(package.id)) {
                case (null)();
                case (?package) {
                  await pohEngine.issueCallbackToProviders(
                    package.userId,
                    stateV2,
                    voteManager.getAllUniqueViolatedRules,
                    pohContentQueueManager.getContentStatus,
                    canistergeekLogger
                  );
                };
              };
            };
          };
        } catch e {
          if (
            Text.equal(
              Error.message(e),
              ModClubParam.PER_CONTENT_SIZE_EXCEEDED_ERROR
            )
          ) {
            return {
              challengeId = pohDataRequest.challengeId;
              submissionStatus = #submissionDataLimitExceeded;
            };
          } else {
            throw e;
          };
        };
      };
    };
    return {
      challengeId = pohDataRequest.challengeId;
      submissionStatus = isValid;
    };
  };

  // Admin method to create new attempts
  public shared ({ caller }) func resetUserChallengeAttempt(packageId : Text) : async Result.Result<[PohTypes.PohChallengesAttempt], PohTypes.PohError> {
    switch (pohEngine.getPohChallengePackage(packageId)) {
      case (null) {
        throw Error.reject("Package doesn't exist");
      };
      case (?package) {
        let _ = pohEngine.changeChallengePackageStatus(packageId, #rejected);
        pohContentQueueManager.changeContentStatus(packageId, #rejected);
        // when true is passed, validity is not used in the function. so passing 0
        await pohEngine.retrieveChallengesForUser(
          package.userId,
          package.challengeIds,
          0,
          true
        );
      };
    };
  };

  public shared ({ caller }) func populateChallenges() : async () {
    pohEngine.populateChallenges();
  };

  public shared ({ caller }) func configurePohForProvider(
    providerId : Principal,
    challengeId : [Text],
    expiry : Nat,
    ipRestriction : Bool
  ) : async () {
    let challengeBuffer = Buffer.Buffer<Text>(challengeId.size());
    for (id in challengeId.vals()) {
      challengeBuffer.add(id);
    };
    stateV2.provider2PohChallengeIds.put(providerId, challengeBuffer);
    stateV2.provider2PohExpiry.put(providerId, expiry);
    provider2IpRestriction := Trie.put(
      provider2IpRestriction,
      key(providerId),
      Principal.equal,
      ipRestriction
    ).0;
  };

  func key(t : Principal) : Trie.Key<Principal> {
    { key = t; hash = Principal.hash(t) };
  };

  public query ({ caller }) func getPohTasks(
    status : Types.ContentStatus,
    start : Nat,
    end : Nat
  ) : async [PohTypes.PohTaskPlus] {
    switch (PermissionsModule.checkProfilePermission(caller, #getContent, stateV2)) {
      case (#err(e)) {
        throw Error.reject("Unauthorized");
      };
      case (_)();
    };
    switch (
      pohVerificationRequestHelper(
        Principal.toText(caller),
        Principal.fromActor(this)
      )
    ) {
      case (#ok(verificationResponse)) {
        if (verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user");
        };
      };
      case (#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case (_)();
    };

    let pohTaskIds = pohContentQueueManager.getContentIds(
      caller,
      #new,
      randomizationEnabled
    );
    var count : Nat = 0;
    let maxReturn : Nat = end - start + 1;

    // Filter items already voted on
    let items = Buffer.Buffer<Text>(0);
    for (id in pohTaskIds.vals()) {
      var isVoted = voteManager.getVoteCountForPoh(caller, id).hasVoted;
      if (not isVoted) {
        items.add(id);
      };
    };

    let itemsArr = pohEngine.sortPackagesByCreatedDate(items);

    let tasks = Buffer.Buffer<PohTypes.PohTaskPlus>(0);
    var index : Nat = 0;
    for (id in itemsArr.vals()) {
      if (index >= start and index <= end and count < maxReturn) {
        let voteCount = voteManager.getVoteCountForPoh(caller, id);
        let taskDataWrapper = pohEngine.getPohTasks([id]);
        var profileImageUrlSuffix : ?Text = null;
        for (wrapper in taskDataWrapper.vals()) {
          for (data in wrapper.pohTaskData.vals()) {
            if (
              data.challengeType == #selfPic and data.dataCanisterId != null and data.contentId != null
            ) {
              profileImageUrlSuffix := do ? {
                (
                  "canisterId=" # Principal.toText(data.dataCanisterId!) # "&contentId=" # data.contentId!
                );
              };
            };
          };
        };
        let pohPackage = pohEngine.getPohChallengePackage(id);
        switch (pohPackage) {
          case (null)();
          case (?package) {
            let taskPlus = {
              packageId = id;
              status = pohContentQueueManager.getContentStatus(id);
              profileImageUrlSuffix = profileImageUrlSuffix;
              voteCount = Nat.max(
                voteCount.approvedCount,
                voteCount.rejectedCount
              );
              requiredVotes = ModClubParam.MIN_VOTE_POH;
              minStake = 0;
              title = null;
              hasVoted = ?voteCount.hasVoted;
              reward = 0.0;
              createdAt = package.createdAt;
              updatedAt = package.updatedAt;
            };
            tasks.add(taskPlus);
            count := count + 1;
          };
        };
      };
      index := index + 1;
    };
    return Buffer.toArray<PohTypes.PohTaskPlus>(tasks);
  };

  public query ({ caller }) func getPohTaskData(packageId : Text) : async Result.Result<PohTypes.PohTaskDataWrapperPlus, PohTypes.PohError> {
    switch (PermissionsModule.checkProfilePermission(caller, #getContent, stateV2)) {
      case (#err(e)) {
        throw Error.reject("Unauthorized");
      };
      case (_)();
    };
    switch (
      pohVerificationRequestHelper(
        Principal.toText(caller),
        Principal.fromActor(this)
      )
    ) {
      case (#ok(verificationResponse)) {
        if (verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user");
        };
      };
      case (#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case (_)();
    };
    let pohTasks = pohEngine.getPohTasks([packageId]);
    if (pohTasks.size() == 0) {
      return #err(#invalidPackageId);
    };
    let voteCount = voteManager.getVoteCountForPoh(caller, packageId);
    #ok({
      packageId = pohTasks[0].packageId;
      pohTaskData = pohTasks[0].pohTaskData;
      votes = Nat.max(voteCount.approvedCount, voteCount.rejectedCount);
      requiredVotes = ModClubParam.MIN_VOTE_POH;
      minStake = 0;
      reward = 0.0;
      createdAt = pohTasks[0].createdAt;
      updatedAt = pohTasks[0].updatedAt;
    });
  };

  public query ({ caller }) func getAllPohTasksForAdminUsers(
    status : Types.ContentStatus,
    start : Nat,
    end : Nat,
    userToFetchPOHFor : [Text],
    startDate : Int,
    endDate : Int
  ) : async [PohTypes.PohTaskPlusForAdmin] {
    Utils.mod_assert(authGuard.isAdmin(caller), ModSecurity.AccessMode.NotPermitted);

    // Add item id to buffer
    let items = Buffer.Buffer<Text>(0);
    var useIndexes = true;
    if (userToFetchPOHFor.size() == 0) {
      if (startDate == 0 and endDate == 0) {
        let pohTaskIds = pohContentQueueManager.getContentIds(
          caller,
          status,
          randomizationEnabled
        );
        for (id in pohTaskIds.vals()) {
          items.add(id);
        };
      } else {
        let pohTaskIdsForDateRange = pohEngine.getAllPohIDsForDateRange(
          startDate,
          endDate
        );
        for (id in pohTaskIdsForDateRange.vals()) {
          items.add(id);
        };
      };
    } else {
      let userPrincipalBuff = Buffer.Buffer<Principal>(0);
      for (user in userToFetchPOHFor.vals()) {
        userPrincipalBuff.add(Principal.fromText(user));
      };
      let pohTaskIds = pohEngine.getPohPackageIDForUserList(
        Buffer.toArray<Principal>(userPrincipalBuff)
      );
      for (id in pohTaskIds.vals()) {
        items.add(id);
      };
      useIndexes := false;
    };
    var count : Nat = 0;
    let maxReturn : Nat = end - start + 1;
    let itemsArr = pohEngine.sortPackagesByCreatedDate(items);

    let tasks = Buffer.Buffer<PohTypes.PohTaskPlusForAdmin>(0);
    var index : Nat = 0;
    for (id in itemsArr.vals()) {
      if (
        (useIndexes == false) or (
          index >= start and index <= end and count < maxReturn
        )
      ) {
        let voteCount = voteManager.getVoteCountForPoh(caller, id);
        let taskDataWrapper = pohEngine.getPohTasks([id]);
        var profileImageUrlSuffix : ?Text = null;
        var userModClubId : Text = "";
        var userUserName : Text = "";
        var userEmailId : Text = "";
        var submittedAt : Int = 0;
        var completedOn : Int = 0;
        var pohTaskData = taskDataWrapper[0].pohTaskData;
        for (wrapper in taskDataWrapper.vals()) {
          for (data in wrapper.pohTaskData.vals()) {
            submittedAt := data.submittedAt;
            completedOn := data.completedOn;
            switch (stateV2.profiles.get(data.userId)) {
              case (null)();
              case (?result) {
                userModClubId := Principal.toText(result.id);
                userUserName := result.userName;
                userEmailId := result.email;
              };
            };
            if (
              data.challengeType == #dl and data.dataCanisterId != null and data.contentId != null
            ) {
              profileImageUrlSuffix := do ? {
                (
                  "canisterId=" # Principal.toText(data.dataCanisterId!) # "&contentId=" # data.contentId!
                );
              };
            };
          };
        };
        let pohPackage = pohEngine.getPohChallengePackage(id);
        switch (pohPackage) {
          case (null)();
          case (?package) {
            let taskPlus = {
              packageId = id;
              status = pohContentQueueManager.getContentStatus(id);
              voteCount = Nat.max(
                voteCount.approvedCount,
                voteCount.rejectedCount
              );
              profileImageUrlSuffix = profileImageUrlSuffix;
              userModClubId = userModClubId;
              userUserName = userUserName;
              userEmailId = userEmailId;
              submittedAt = submittedAt;
              completedOn = completedOn;
              pohTaskData = pohTaskData;
            };
            tasks.add(taskPlus);
            count := count + 1;
          };
        };
      };
      index := index + 1;
    };
    return Buffer.toArray<PohTypes.PohTaskPlusForAdmin>(tasks);
  };

  public query ({ caller }) func getPohTaskDataForAdminUsers(packageId : Text) : async Result.Result<PohTypes.PohTaskDataAndVotesWrapperPlus, PohTypes.PohError> {
    Utils.mod_assert(authGuard.isAdmin(caller), ModSecurity.AccessMode.NotPermitted);

    let pohTasks = pohEngine.getPohTasks([packageId]);
    if (pohTasks.size() == 0) {
      return #err(#invalidPackageId);
    };
    let voteDetails = voteManager.getVotesForPOHBasedOnPackageId(
      packageId,
      stateV2
    );
    #ok({
      packageId = pohTasks[0].packageId;
      pohTaskData = pohTasks[0].pohTaskData;
      voteUserDetails = voteDetails;
      requiredVotes = ModClubParam.MIN_VOTE_POH;
      minStake = 0;
      reward = 0.0;
      createdAt = pohTasks[0].createdAt;
      updatedAt = pohTasks[0].updatedAt;
    });
  };

  public shared ({ caller }) func getModeratorEmailsForPOHAndSendEmail(emailType : Text) : async () {
    // As email is going to send to all the users who opted in to receive at the time of content submission
    var emailIDsHash = HashMap.HashMap<Text, Nat>(1, Text.equal, Text.hash);
    let voteStateToSend = voteManager.getVoteState();
    if (emailType == "shc") {
      // Sends content email
      let queueStateToSend = contentQueueManager.getQueueState();
      emailIDsHash := emailManager.getModeratorEmailsForContent(
        voteStateToSend,
        queueStateToSend,
        stateV2
      );
    } else {
      // Sends POH email
      let pohContentState = pohContentQueueManager.getQueueState();
      let pohStateToSend = pohEngine.getPOHState();
      emailIDsHash := emailManager.getModeratorEmailsForPOH(
        voteStateToSend,
        pohContentState,
        stateV2,
        pohStateToSend
      );
    };
    for ((email, totalCount) in emailIDsHash.entries()) {
      // "prod" and principal are just place holders to prevent idempotency
      let callResult = await callLambdaToSendEmail(
        email,
        "prod",
        Principal.toText(caller),
        emailType,
        totalCount
      );
    };
  };

  public query ({ caller }) func getCanisterMetrics(
    parameters : Canistergeek.GetMetricsParameters
  ) : async ?Canistergeek.CanisterMetrics {
    if (not Helpers.allowedCanistergeekCaller(caller)) {
      throw Error.reject("Unauthorized");
    };
    canistergeekMonitor.getMetrics(parameters);
  };

  public shared ({ caller }) func collectCanisterMetrics() : async () {
    if (not Helpers.allowedCanistergeekCaller(caller)) {
      throw Error.reject("Unauthorized");
    };
    canistergeekMonitor.collectMetrics();
  };

  public query ({ caller }) func getCanisterLog(
    request : ?LoggerTypesModule.CanisterLogRequest
  ) : async ?LoggerTypesModule.CanisterLogResponse {
    if (not Helpers.allowedCanistergeekCaller(caller)) {
      throw Error.reject("Unauthorized");
    };
    Helpers.logMessage(
      canistergeekLogger,
      "Log from canister Log method.",
      #info
    );
    canistergeekLogger.getLog(request);
  };

  public shared ({ caller }) func votePohContent(
    packageId : Text,
    decision : Types.Decision,
    violatedRules : [Types.PohRulesViolated]
  ) : async () {
    switch (PermissionsModule.checkProfilePermission(caller, #vote, stateV2)) {
      case (#err(e)) {
        throw Error.reject("Unauthorized");
      };
      case (_)();
    };
    let stats = await ModeratorManager.getStats(caller, env);
    if (ModeratorManager.isNovice(stats.score)) {
      return throw Error.reject("Novice Moderators are not permitted to vote on POH content.");
    };
    switch (
      pohVerificationRequestHelper(
        Principal.toText(caller),
        Principal.fromActor(this)
      )
    ) {
      case (#ok(verificationResponse)) {
        if (verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user.");
        };
      };
      case (#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case (_)();
    };

    if (voteManager.checkPohUserHasVoted(caller, packageId)) {
      throw Error.reject("You have already voted");
    };
    if (pohContentQueueManager.getContentStatus(packageId) != #new) {
      throw Error.reject("Vote has been finalized.");
    };

    if (pohEngine.validateRules(violatedRules) == false) {
      throw Error.reject("Valid rules not provided.");
    };

    let finishedVoting = await voteManager.votePohContent(
      caller,
      env,
      packageId,
      decision,
      violatedRules,
      pohContentQueueManager
    );
    if (finishedVoting == #ok(true)) {
      Helpers.logMessage(
        canistergeekLogger,
        "Voting completed for packageId: " # packageId,
        #info
      );
      let finalDecision = pohContentQueueManager.getContentStatus(packageId);
      let votesId = voteManager.getPOHVotesId(packageId);
      var contentIds : [Text] = [];
      if (finalDecision == #approved) {
        contentIds := pohEngine.changeChallengePackageStatus(
          packageId,
          #verified
        );
        Helpers.logMessage(
          canistergeekLogger,
          "Voting completed for packageId: " # packageId # " Final decision: approved",
          #info
        );
      } else {
        contentIds := pohEngine.changeChallengePackageStatus(
          packageId,
          #rejected
        );
        Helpers.logMessage(
          canistergeekLogger,
          "Voting completed for packageId: " # packageId # " Final decision: rejected",
          #info
        );
      };
      // mark content not accessible
      for (cId in contentIds.vals()) {
        await storageSolution.markContentNotAccessible(cId);
      };

      let rewardingVotes = Buffer.Buffer<VoteTypes.VoteV2>(1);
      let usersToRewardRS = Buffer.Buffer<RSTypes.UserAndVote>(1);
      for (id in votesId.vals()) {
        switch (voteManager.getPOHVote(id)) {
          case (null)();
          case (?v) {
            var votedCorrect = false;
            if (
              (v.decision == #approved and finalDecision == #approved) or (
                v.decision == #rejected and finalDecision == #rejected
              )
            ) {
              if (v.level != #novice) {
                rewardingVotes.add(v);
              };
              votedCorrect := true;
            } else {
              votedCorrect := false;
            };
            usersToRewardRS.add({
              userId = v.userId;
              votedCorrect = votedCorrect;
              decision = v.decision;
            });
          };
        };
      };

      var sumRS = 0.0;
      for (userVote in rewardingVotes.vals()) {
        sumRS := sumRS + userVote.rsBeforeVoting;
      };

      let CT : Float = ModClubParam.CS * Float.fromInt(ModClubParam.MIN_VOTE_POH);
      // moderator dist
      for (userVote in rewardingVotes.vals()) {
        let modReward = Utils.floatToTokens(
          (userVote.rsBeforeVoting * ModClubParam.GAMMA_M * CT) / sumRS
        );
        let _ = await ledger.icrc1_transfer({
          from_subaccount = ?Constants.ICRC_ACCOUNT_PAYABLE_SA;
          to = { owner = userVote.userId; subaccount = null };
          amount = modReward;
          fee = null;
          memo = null;
          created_at_time = null;
        });
      };
      let _ = await authGuard.getRSActor().updateRSBulk(Buffer.toArray<RSTypes.UserAndVote>(usersToRewardRS));
      // treasury dist
      let tokensAmount = Utils.floatToTokens(ModClubParam.GAMMA_T * CT);
      let _ = await ledger.icrc1_transfer({
        from_subaccount = ?Constants.ICRC_ACCOUNT_PAYABLE_SA;
        to = {
          owner = Principal.fromActor(this);
          subaccount = ?Constants.ICRC_TREASURY_SA;
        };
        amount = tokensAmount;
        fee = null;
        memo = null;
        created_at_time = null;
      });

      // burn
      let _ = await this.burn(
        ?Constants.ICRC_ACCOUNT_PAYABLE_SA,
        Utils.floatToTokens(ModClubParam.GAMMA_B * CT)
      );

      // inform all providers
      switch (pohEngine.getPohChallengePackage(packageId)) {
        case (null)();
        case (?package) {
          await pohEngine.issueCallbackToProviders(
            package.userId,
            stateV2,
            voteManager.getAllUniqueViolatedRules,
            pohContentQueueManager.getContentStatus,
            canistergeekLogger
          );
        };
      };
    };
  };

  public shared ({ caller }) func issueJwt() : async Text {
    Helpers.logMessage(
      canistergeekLogger,
      "Issue JWT called by " # Principal.toText(caller),
      #info
    );
    switch (PermissionsModule.checkProfilePermission(caller, #vote, stateV2)) {
      case (#err(e)) {
        throw Error.reject("Unauthorized");
      };
      case (_)();
    };
    Helpers.logMessage(
      canistergeekLogger,
      "Issue JWT Check user humanity " # Principal.toText(caller),
      #info
    );
    switch (
      pohVerificationRequestHelper(
        Principal.toText(caller),
        Principal.fromActor(this)
      )
    ) {
      case (#ok(verificationResponse)) {
        if (verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user");
        };
      };
      case (#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case (_)();
    };
    let message = Principal.toText(caller) # "." # Int.toText(Helpers.timeNow());
    let signature = Helpers.generateHash(message # signingKey);
    let base32Message = Helpers.encodeBase32(message);
    switch (base32Message) {
      case (null) {
        throw Error.reject("Jwt creation failed");
      };
      case (?b32Message) {
        return b32Message # "." # signature;
      };
    };
  };

  // Helpers
  public shared ({ caller }) func adminInit() : async () {
    await generateSigningKey();
    await populateChallenges();
  };

  public shared ({ caller }) func retiredDataCanisterIdForWriting(
    canisterId : Text
  ) {
    storageSolution.retiredDataCanisterId(canisterId);
  };

  public shared ({ caller }) func getAllDataCanisterIds() : async (
    [Principal],
    [Text]
  ) {
    let allDataCanisterId = storageSolution.getAllDataCanisterIds();
    let retired = storageSolution.getRetiredDataCanisterIdsStable();
    (allDataCanisterId, retired);
  };

  // Return the principal identifier of this canister.
  public func whoami() : async Principal {
    Principal.fromActor(this);
  };

  public query func getDeployer() : async Principal {
    return deployer;
  };

  public shared ({ caller }) func addProviderAdmin(
    userId : Principal,
    userName : Text,
    providerId : ?Principal
  ) : async Types.ProviderResult {
    await ProviderManager.addProviderAdmin({
      userId;
      username = userName;
      caller;
      providerId;
      state = stateV2;
      isModclubAdmin = authGuard.isAdmin(caller);
      logger = canistergeekLogger;
    });
  };

  public shared ({ caller }) func addToApprovedUser(userId : Principal) : async () {
    voteManager.addToAutoApprovedPOHUser(userId);
  };

  public shared ({ caller }) func getProviderAdmins(providerId : Principal) : async [Types.ProfileStable] {
    let pStable = Buffer.Buffer<Types.ProfileStable>(1);
    for (p in ProviderManager.getProviderAdmins(providerId, stateV2).vals()) {
      pStable.add({
        id = p.id;
        userName = p.userName;
        email = "";
        pic = p.pic;
        role = p.role;
        subaccounts = Iter.toArray(p.subaccounts.entries());
        createdAt = p.createdAt;
        updatedAt = p.updatedAt;
      });
    };
    Buffer.toArray<Types.ProfileStable>(pStable);
  };

  public shared ({ caller }) func removeProviderAdmin(
    providerId : Principal,
    providerAdminPrincipalIdToBeRemoved : Principal
  ) : async Types.ProviderResult {

    return await ProviderManager.removeProviderAdmin(
      {
        providerId;
        providerAdminPrincipalId = providerAdminPrincipalIdToBeRemoved;
        callerPrincipalId = caller;
        state = stateV2;
        isModclubAdmin = authGuard.isAdmin(caller);
      },
      canistergeekLogger
    );
  };

  public shared ({ caller }) func editProviderAdmin(
    providerId : Principal,
    providerAdminPrincipalIdToBeEdited : Principal,
    newUserName : Text
  ) : async Types.ProviderResult {

    return await ProviderManager.editProviderAdmin(
      {
        providerId;
        providerAdminPrincipalId = providerAdminPrincipalIdToBeEdited;
        callerPrincipalId = caller;
        state = stateV2;
        isModclubAdmin = authGuard.isAdmin(caller);
      },
      newUserName
    );
  };

  public query ({ caller }) func getAdminProviderIDs() : async [Principal] {
    return ProviderManager.getAdminProviderIDs(
      caller,
      stateV2,
      canistergeekLogger
    );
  };

  public shared ({ caller }) func getPohAttempts() : async PohStateV2.PohStableState {
    pohEngine.getStableStateV2().0;
  };

  public shared ({ caller }) func shuffleContent() : async () {
    contentQueueManager.shuffleContent();
    contentQueueManager.assignUserIds2QueueId(
      Iter.toArray(stateV2.profiles.keys())
    );
  };

  public shared ({ caller }) func shufflePohContent() : async () {
    pohContentQueueManager.shuffleContent();
    pohContentQueueManager.assignUserIds2QueueId(
      Iter.toArray(stateV2.profiles.keys())
    );
  };

  public shared ({ caller }) func getReservedByContentId(contentId : Text) : async Result.Result<Types.Reserved, Text> {
    let content = await getContent(contentId);
    switch (content) {
      case (null) { #err("Empty") };
      case (?data) {
        let res = await ContentManager.getReservation(Principal.toText(caller), data.reservedList);
        return Result.fromOption<Types.Reserved, Text>(res, "Cannot get Reserveds");
      };
    };
  };

  public shared ({ caller }) func reserveContent(contentId : Text) : async () {
    switch (PermissionsModule.checkProfilePermission(caller, #vote, stateV2)) {
      case (#err(e)) { throw Error.reject("Unauthorized") };
      case (_)();
    };
    let voteCount = getVoteCount(contentId, ?caller);
    let reserved = await ContentManager.createReservation(
      contentId,
      voteCount,
      {
        caller;
        globalState = stateV2;
        contentState = contentStableState;
        storageSolution;
      }
    );
  };

  public shared ({ caller }) func canReserveContent(contentId : Text) : async Result.Result<Bool, Text> {
    return await ContentManager.canReserveContent(contentId, caller, stateV2);
  };

  private func getVoteCount(contentId : Types.ContentId, caller : ?Principal) : Types.VoteCount {
    var voteApproved : Nat = 0;
    var voteRejected : Nat = 0;
    var hasVoted : Bool = false;
    let violatedRulesCount = HashMap.HashMap<Types.RuleId, Nat>(
      1,
      Text.equal,
      Text.hash
    );
    for (vid in stateV2.content2votes.get0(contentId).vals()) {
      switch (stateV2.votes.get(vid)) {
        case (?v) {
          if (v.level != #novice) {
            if (v.decision == #approved) {
              voteApproved += 1;
            } else {
              voteRejected += 1;
            };
          };
          // if caller is null, consider it as modclub calling it so that operation evaluates to false
          // simplifies switch braches
          if (not hasVoted) {
            hasVoted := Principal.equal(
              Option.get(caller, Principal.fromActor(this)),
              v.userId
            );
          };
          for (vRuleId in Option.get(v.violatedRules, []).vals()) {
            violatedRulesCount.put(
              vRuleId,
              Option.get(violatedRulesCount.get(vRuleId), 0) + 1
            );
          };
        };
        case (_)();
      };
    };

    return {
      approvedCount = voteApproved;
      rejectedCount = voteRejected;
      hasVoted = hasVoted;
      violatedRulesCount = violatedRulesCount;
    };
  };

  public shared ({ caller }) func setRandomization(isRandom : Bool) : async () {
    randomizationEnabled := isRandom;
  };

  public shared ({ caller }) func getTaskStats(from : Int) : async (
    Nat,
    Nat,
    Nat,
    Nat
  ) {
    let approvedStats = getContentCountFrom(
      contentQueueManager.getUserContentQueue(caller, #approved, false),
      from
    );
    let rejectedStats = getContentCountFrom(
      contentQueueManager.getUserContentQueue(caller, #rejected, false),
      from
    );
    let newStats = getContentCountFrom(
      contentQueueManager.getUserContentQueue(caller, #new, false),
      from
    );

    for (userId in rejectedStats.1. keys()) {
      approvedStats.1. put(userId, null);
    };
    for (userId in newStats.1. keys()) {
      approvedStats.1. put(userId, null);
    };

    (approvedStats.0, rejectedStats.0, newStats.0, approvedStats.1. size());
  };

  func getContentCountFrom(
    contentQueue : HashMap.HashMap<Text, ?Text>,
    from : Int
  ) : (Nat, HashMap.HashMap<Principal, ?Text>) {
    var count = 0;
    let distinctUsersVoted = HashMap.HashMap<Principal, ?Text>(
      1,
      Principal.equal,
      Principal.hash
    );
    for (cid in contentQueue.keys()) {
      switch (stateV2.content.get(cid)) {
        case (null)();
        case (?con) {
          if (con.createdAt >= from) {
            count := count + 1;
            for (vId in stateV2.content2votes.get0(con.id).vals()) {
              switch (stateV2.votes.get(vId)) {
                case (null)();
                case (?v) {
                  distinctUsersVoted.put(v.userId, null);
                };
              };
            };
          };
        };
      };
    };
    return (count, distinctUsersVoted);
  };

  // For testing purposes
  public query ({ caller }) func showAdmins() : async [Principal] {
    Utils.mod_assert(authGuard.isAdmin(caller), ModSecurity.AccessMode.NotPermitted);
    authGuard.getAdmins();
  };

  public func burn(fromSA : ?ICRCTypes.Subaccount, amount : Nat) : async () {
    let minting_account = switch (await ledger.icrc1_minting_account()) {
      case (?mAcc : ?ICRCTypes.Account) mAcc;
      case (_) {
        throw Error.reject("Unable to get minting_account from ledger.");
      };
    };

    ignore await ledger.icrc1_transfer({
      from_subaccount = fromSA;
      to = minting_account;
      amount;
      fee = null;
      memo = null;
      created_at_time = null;
    });
  };

  public shared ({ caller }) func stakeTokens(amount : Nat) : async ICRCTypes.Result<ICRCTypes.TxIndex, ICRCTypes.TransferError> {
    let moderatorAcc = { owner = caller; subaccount = null };
    let modclubPrincipal = Principal.fromActor(this);
    let modclubStakingAcc = {
      owner = modclubPrincipal;
      subaccount = ?Constants.ICRC_STAKING_SA;
    };

    let moderatorSubAccs = switch (stateV2.profiles.get(caller)) {
      case (?moderator) { moderator.subaccounts };
      case (_) {
        throw Error.reject("Unable to find user with principal::" # Principal.toText(caller));
      };
    };
    let reserveSubAcc = switch (moderatorSubAccs.get("RESERVE")) {
      case (?reserveSA) ?reserveSA;
      case (_) {
        throw Error.reject("No reserve subaccount for moderator::" # Principal.toText(caller));
      };
    };
    let moderReserveBalance = await ledger.icrc1_balance_of({
      owner = modclubPrincipal;
      subaccount = reserveSubAcc;
    });
    switch (Nat.greater(moderReserveBalance, amount)) {
      case (true) {
        let stakeTransfer = await ledger.icrc1_transfer({
          from_subaccount = reserveSubAcc;
          to = modclubStakingAcc;
          amount;
          fee = null;
          memo = null;
          created_at_time = null;
        });

        switch (stakeTransfer) {
          case (#Ok(txIndex)) {
            let stakeRes = await vestingActor.stake(moderatorAcc, amount);
            switch (stakeRes) {
              case (#ok(_)) {
                #Ok(txIndex);
              };
              case (#err(e)) { return throw Error.reject(e) };
            };
          };
          case (#Err(e)) {
            return throw Error.reject("Can't stake necessary amount of tokens: InsufficientAllowance.");
          };
        };
      };
      case (_) {
        throw Error.reject("Insufficient balance on reserve subaccount for moderator::" # Principal.toText(caller));
      };
    };
  };

  public shared ({ caller }) func releaseTokens(amount : ICRCTypes.Tokens) : async ICRCTypes.Result<ICRCTypes.TxIndex, ICRCTypes.TransferError> {
    let moderatorAcc = { owner = caller; subaccount = null };
    let modclubPrincipal = Principal.fromActor(this);

    let moderatorSubAccs = switch (stateV2.profiles.get(caller)) {
      case (?moderator) { moderator.subaccounts };
      case (_) {
        throw Error.reject("Unable to find user with principal::" # Principal.toText(caller));
      };
    };
    let reserveSubAcc = switch (moderatorSubAccs.get("RESERVE")) {
      case (?reserveSA) ?reserveSA;
      case (_) {
        throw Error.reject("No reserve subaccount for moderator::" # Principal.toText(caller));
      };
    };

    let unlockedAmount = await vestingActor.unlocked_stakes_for(moderatorAcc);
    if (unlockedAmount < amount) {
      return throw Error.reject("Withdraw amount cant be more than unlocked amount of tokens.");
    };

    let releaseStakeTransfer = await ledger.icrc1_transfer({
      from_subaccount = ?Constants.ICRC_STAKING_SA;
      to = { owner = modclubPrincipal; subaccount = reserveSubAcc };
      amount;
      fee = null;
      memo = null;
      created_at_time = null;
    });

    switch (releaseStakeTransfer) {
      case (#Ok(txIndex)) {
        let release = await vestingActor.release_staking(moderatorAcc, amount);
        switch (release) {
          case (#Ok(res)) {
            #Ok(txIndex);
          };
          case (#Err(e)) {
            return throw Error.reject("Can't withdraw unlocked amount of tokens.");
          };
        };
      };
      case (#Ok(txIndex)) {
        return throw Error.reject("Can't withdraw unlocked amount of tokens.");
      };
    };
  };

  public shared ({ caller }) func claimStakedTokens(amount : ICRCTypes.Tokens) : async Result.Result<Nat, Text> {
    let moderatorAcc = { owner = caller; subaccount = null };
    let stakedAmount = await vestingActor.staked_for(moderatorAcc);
    if (stakedAmount < amount) {
      return throw Error.reject("Amount can't be more than staked amount of tokens.");
    };

    let claimStaked = await vestingActor.claim_staking(moderatorAcc, amount);

    ignore Timer.setTimer(
      #seconds(Constants.VESTING_DISSOLVE_DELAY_SECONDS + 10),
      func() : async () {
        let releaseStaked = await vestingActor.unlock_staking(moderatorAcc, amount);
      }
    );

    claimStaked;
  };

  // Upgrade logic / code
  stable var provider2IpRestriction : Trie.Trie<Principal, Bool> = Trie.empty();
  stable var stateSharedV2 : StateV2.StateShared = StateV2.emptyShared();

  system func preupgrade() {
    Helpers.logMessage(
      canistergeekLogger,
      "MODCLUB PREUPGRRADE",
      #info
    );
    stateSharedV2 := StateV2.fromState(stateV2);

    storageStateStable := storageSolution.getStableState();
    retiredDataCanisterId := storageSolution.getRetiredDataCanisterIdsStable();
    let pohCombinedStableState = pohEngine.getStableStateV2();
    pohStableStateV2 := pohCombinedStableState.0;
    pohCallbackDataByProvider := pohCombinedStableState.1;
    provider2ProviderUserId2Ip := pohCombinedStableState.2;
    provider2Ip2Wallet := pohCombinedStableState.3;
    pohVoteStableStateV2 := voteManager.getStableState();
    contentStableState := contentState.getStableState();
    emailStableState := emailManager.getStableState();
    _canistergeekMonitorUD := ?canistergeekMonitor.preupgrade();
    _canistergeekLoggerUD := ?canistergeekLogger.preupgrade();
    contentQueueStateStable := ?contentQueueManager.preupgrade();
    pohContentQueueStateStable := ?pohContentQueueManager.preupgrade();

    claimRewardsWhitelist := List.fromArray<Principal>(Buffer.toArray<Principal>(claimRewardsWhitelistBuf));

  };

  stable var migrationDone = false;
  stable var globalStateMigrationDone = false;

  system func postupgrade() {
    Helpers.logMessage(
      canistergeekLogger,
      "MODCLUB POSTUPGRRADE",
      #info
    );
    authGuard.subscribe("admins");
    admins := authGuard.setUpDefaultAdmins(
      admins,
      deployer,
      Principal.fromActor(this)
    );
    claimRewardsWhitelistBuf := Buffer.fromIter<Principal>(List.toIter<Principal>(claimRewardsWhitelist));
    storageSolution := StorageSolution.StorageSolution(
      storageStateStable,
      retiredDataCanisterId,
      admins,
      signingKey,
      authGuard
    );

    stateV2 := StateV2.toState(stateSharedV2);
    stateSharedV2 := StateV2.emptyShared();

    storageStateStable := StorageState.emptyStableState();
    retiredDataCanisterId := [];

    pohStableStateV2 := PohStateV2.emptyStableState();
    pohVoteStableStateV2 := VoteStateV2.emptyStableState();
    emailStableState := EmailState.emptyStableState();
    contentStableState := ContentState.emptyStableState();

    storageSolution.setInitialModerators(ModeratorManager.getModerators(stateV2));
    canistergeekMonitor.postupgrade(_canistergeekMonitorUD);
    _canistergeekMonitorUD := null;
    canistergeekLogger.postupgrade(_canistergeekLoggerUD);
    _canistergeekLoggerUD := null;

    contentQueueManager.postupgrade(contentQueueStateStable, canistergeekLogger);
    pohContentQueueManager.postupgrade(
      pohContentQueueStateStable,
      canistergeekLogger
    );
    contentQueueStateStable := null;
    canistergeekLogger.setMaxMessagesCount(3000);
  };

  system func inspect({
    arg : Blob;
    caller : Principal;
    msg : MsgInspectTypes.ModclubCanisterMethods;
  }) : Bool {
    switch (msg) {
      case (#toggleAllowSubmission _) { authGuard.isAdmin(caller) };
      case (#generateSigningKey _) { authGuard.isAdmin(caller) };
      case (#addToAllowList _) { authGuard.isAdmin(caller) };
      case (#adminUpdateEmail _) { authGuard.isAdmin(caller) };
      case (#AdminCheckPohVerificationResp _) { authGuard.isAdmin(caller) };
      case (#resetUserChallengeAttempt _) { authGuard.isAdmin(caller) };
      case (#populateChallenges _) { authGuard.isAdmin(caller) };
      case (#configurePohForProvider _) { authGuard.isAdmin(caller) };
      case (#adminInit _) { authGuard.isAdmin(caller) };
      case (#retiredDataCanisterIdForWriting _) { authGuard.isAdmin(caller) };
      case (#getAllDataCanisterIds _) { authGuard.isAdmin(caller) };
      case (#getPohAttempts _) { authGuard.isAdmin(caller) };
      case (#shuffleContent _) { authGuard.isAdmin(caller) };
      case (#shufflePohContent _) { authGuard.isAdmin(caller) };
      case (#getTaskStats _) { authGuard.isAdmin(caller) };
      case (#setVoteParamsForLevel _) { authGuard.isAdmin(caller) };
      case (#setRandomization _) { authGuard.isAdmin(caller) };
      case (#sendVerificationEmail _) { not authGuard.isAnonymous(caller) };
      case (#registerModerator _) { not authGuard.isAnonymous(caller) };
      case (#setLambdaToken _) { authGuard.isAdmin(caller) };
      case (#submitText _) { ProviderManager.providerExists(caller, stateV2) };
      case (#submitHtmlContent _) {
        ProviderManager.providerExists(caller, stateV2);
      };
      case (#submitImage _) { ProviderManager.providerExists(caller, stateV2) };
      case (#providerSaBalance _) {
        ProviderManager.isProviderAdmin(caller, stateV2);
      };
      case (#handleSubscription _) { authGuard.isModclubAuth(caller) };
      case (#importAccounts _) { authGuard.isOldModclubInstance(caller) };
      case (#addToApprovedUser _) { authGuard.isAdmin(caller) };
      case _ { not Principal.isAnonymous(caller) };
    };
  };

  public query ({ caller }) func http_request(request : Types.HttpRequest) : async Types.HttpResponse {
    return {
      status_code = 200;
      headers = [];
      body = Text.encodeUtf8("Upgrading");
      streaming_strategy = null;
      upgrade = ?true;
    };
  };

  public shared ({ caller }) func http_request_update(request : Types.HttpRequest) : async Types.HttpResponse {
    var ip = "";
    for ((name, value) in request.headers.vals()) {
      if (name == "x-real-ip") {
        ip := value;
      };
    };

    var token = "";

    switch (Text.stripStart(request.url, #text("/ipRegister?"))) {
      case (null)();
      case (?params) {
        let fields : Iter.Iter<Text> = Text.split(params, #text("&"));
        for (field : Text in fields) {
          let kv : [Text] = Iter.toArray<Text>(Text.split(field, #text("=")));
          if (kv[0] == "token") {
            token := kv[1];
          };
        };
      };
    };
    if (ip == "" or token == "") {
      return {
        status_code = 400;
        headers = [];
        body = Text.encodeUtf8("IP or token couldn't be found");
        streaming_strategy = null;
        upgrade = null;
      };
    };

    var ipRestrictionConfigured = false;
    var providerId = Principal.fromText("aaaaa-aa");
    var providerUserId = "";
    switch (pohEngine.decodeToken(token)) {
      case (#err(err)) {
        return {
          status_code = 400;
          headers = [];
          body = Text.encodeUtf8("Invalid token.");
          streaming_strategy = null;
          upgrade = null;
        };
      };
      case (#ok(providerAndUserData)) {
        providerId := providerAndUserData.providerId;
        providerUserId := providerAndUserData.providerUserId;
        ipRestrictionConfigured := Option.get(
          Trie.get(
            provider2IpRestriction,
            key(providerId),
            Principal.equal
          ),
          false
        );
      };
    };
    if (ipRestrictionConfigured) {
      let registed = pohEngine.registerIPWithProviderUser(
        providerUserId,
        ip,
        providerId
      );
      if (not registed) {
        return {
          status_code = 500;
          headers = [];
          body = Text.encodeUtf8("Token is already associated.");
          streaming_strategy = null;
          upgrade = null;
        };
      };
    };
    {
      status_code = 200;
      headers = [];
      body = Text.encodeUtf8("Token Associated with IP.");
      streaming_strategy = null;
      upgrade = null;
    };
  };

  public query func transform(raw : Types.TransformArgs) : async Types.CanisterHttpResponsePayload {
    let transformed : Types.CanisterHttpResponsePayload = {
      status = raw.response.status;
      body = raw.response.body;
      headers = [
        {
          name = "Content-Security-Policy";
          value = "default-src 'self'";
        },
        { name = "Referrer-Policy"; value = "strict-origin" },
        { name = "Permissions-Policy"; value = "geolocation=(self)" },
        {
          name = "Strict-Transport-Security";
          value = "max-age=63072000";
        },
        { name = "X-Frame-Options"; value = "DENY" },
        { name = "X-Content-Type-Options"; value = "nosniff" }
      ];
    };
    transformed;
  };

  public shared ({ caller }) func setLambdaToken(lambdaCallKey : Text) : async () {
    if (lambdaCallKey == "") {
      throw Error.reject("Lambda key is not provided.");
    };
    keyToCallLambda := lambdaCallKey;
  };

  private func callLambdaToSendEmail(
    userEmail : Text,
    envForBaseURL : Text,
    userPrincipalText : Text,
    emailType : Text,
    totalContents : Nat
  ) : async Bool {

    let host : Text = "bgl2dihq47pqfjtth2odwdakcm0cislr.lambda-url.us-east-1.on.aws";
    var minCycles : Nat = 210244050000;
    // prepare system http_request call

    if (keyToCallLambda == "") {
      throw Error.reject("Lambda key is not provided. Please ask admin to set the key for lambda calls.");
    };

    let request_headers = [
      { name = "Content-Type"; value = "application/json" },
      {
        name = "Authorization";
        value = keyToCallLambda;
      }
    ];
    let url = "https://" # host # "/";

    let body : JSON.JSON = #Object([
      ("userEmail", #String(userEmail)),
      ("emailType", #String(emailType)),
      ("envForURL", #String(envForBaseURL)),
      ("count", #String(Nat.toText(totalContents))),
      ("userPrincipalText", #String(userPrincipalText))
    ]);
    let DATA_POINTS_PER_API : Nat64 = 200;
    let MAX_RESPONSE_BYTES : Nat64 = 10 * 6 * DATA_POINTS_PER_API;

    let transform_context : Types.TransformContext = {
      function = transform;
      context = Blob.fromArray([]);
    };

    let request : Types.CanisterHttpRequestArgs = {
      url = url;
      headers = request_headers;
      body = ?Blob.toArray(Text.encodeUtf8(JSON.show(body)));
      method = #post;
      max_response_bytes = ?MAX_RESPONSE_BYTES;
      transform = ?transform_context;
    };
    try {
      // Dynamically add cycles based on the useremail characters
      minCycles += (100000 * Text.size(userEmail));
      Cycles.add(minCycles);
      let ic : Types.IC = actor ("aaaaa-aa");
      let response : Types.CanisterHttpResponsePayload = await ic.http_request(request);
      switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
        case null {
          throw Error.reject("Remote response had no body.");
        };
        case (?body) {
          return true;
        };
      };
      return false;
    } catch (err) {
      throw Error.reject(Error.message(err));
    };
  };

  public shared ({ caller }) func importAccounts(payload : Types.AccountsImportPayload) : async {
    status : Bool;
  } {
    Helpers.logMessage(
      canistergeekLogger,
      "MODCLUB Instanse has importAccounts call:: ",
      #info
    );

    for (provider in payload.providers.vals()) {
      switch (stateV2.providers.get(provider.id)) {
        case (?p) {};
        case (null) {
          await ProviderManager.addToAllowList(provider.id, stateV2, canistergeekLogger);
          let subAccs = HashMap.fromIter<Text, Blob>(
            (await Helpers.generateSubAccounts(Helpers.providerSubaccountTypes)).vals(),
            Array.size(Helpers.providerSubaccountTypes),
            Text.equal,
            Text.hash
          );

          ignore ProviderManager.registerProvider({
            providerId = provider.id;
            name = provider.name;
            description = provider.description;
            image = provider.image;
            subaccounts = subAccs;
            state = stateV2;
            logger = canistergeekLogger;
          });
          Helpers.logMessage(
            canistergeekLogger,
            "Imported ProviderAccount For: " # provider.name,
            #info
          );
        };
      };
    };
    for (providerAdmins in payload.adminsByProvider.vals()) {
      switch (stateV2.providers.get(providerAdmins.pid)) {
        case (?p) {
          for (admin in providerAdmins.admins.vals()) {
            let result = await ProviderManager.addProviderAdmin({
              userId = admin.id;
              username = admin.userName;
              caller = providerAdmins.pid;
              providerId = ?providerAdmins.pid;
              state = stateV2;
              isModclubAdmin = authGuard.isAdmin(caller);
              logger = canistergeekLogger;
            });
            switch (result) {
              case (#ok(_)) {
                Helpers.logMessage(
                  canistergeekLogger,
                  "IMPORTED ProviderAdmin: " # admin.userName # " For: " # p.name,
                  #info
                );
              };
              case (#err(e)) {
                Helpers.logMessage(
                  canistergeekLogger,
                  "ERROR ON ProviderAdmin: " # admin.userName # " For: " # p.name,
                  #error
                );
              };
            };
          };
        };
        case (_) {};
      };
    };

    for (moderator in payload.moderators.vals()) {
      try {
        let subAccs = HashMap.fromIter<Text, Blob>(
          (await Helpers.generateSubAccounts(Helpers.moderatorSubaccountTypes)).vals(),
          Array.size(Helpers.moderatorSubaccountTypes),
          Text.equal,
          Text.hash
        );

        let profile = await ModeratorManager.registerModerator(
          moderator.id,
          moderator.userName,
          null,
          null,
          stateV2,
          subAccs
        );

        await storageSolution.registerModerators([moderator.id]);
        contentQueueManager.assignUserIds2QueueId([moderator.id]);
        pohContentQueueManager.assignUserIds2QueueId([moderator.id]);
        Helpers.logMessage(
          canistergeekLogger,
          "NEW Moderator Account has been Imported :: " # debug_show profile,
          #info
        );
      } catch (e) {
        Helpers.logMessage(
          canistergeekLogger,
          "AN ERROR OCCURS DURING ModeratorAccount import :: " # Error.message(e),
          #error
        );
      };
    };

    for ((uid, _) in payload.approvedPOHUsers.vals()) {
      try {
        voteManager.addToAutoApprovedPOHUser(uid);
        Helpers.logMessage(
          canistergeekLogger,
          "NEW UserId has been addToAutoApprovedPOHUser SUCCESSFULLY :: " # debug_show uid,
          #info
        );
      } catch (e) {
        Helpers.logMessage(
          canistergeekLogger,
          "AN ERROR OCCURS DURING approvedPOHUsers import :: " # Error.message(e),
          #error
        );
      };
    };

    { status = true };
  };

};
