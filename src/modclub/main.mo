import AirDropManager "./service/airdrop/airdrop";
import Array "mo:base/Array";
import Arrays "mo:base/Array";
import AuthManager "./service/auth/auth";
import Base32 "mo:encoding/Base32";
import Blob "mo:base/Blob";
import Bool "mo:base/Bool";
import Buffer "mo:base/Buffer";
import Canistergeek "./canistergeek/canistergeek";
import ContentManager "./service/content/content";
import ContentVotingManager "./service/content/vote";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import Helpers "./helpers";
import IC "./remote_canisters/IC";
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
import PohStateV1 "./service/poh/statev1";
import PohStateV2 "./service/poh/statev2";
import PohTypes "./service/poh/types";
import Prim "mo:prim";
import Principal "mo:base/Principal";
import ProviderManager "./service/provider/provider";
import Random "mo:base/Random";
import RelObj "./data_structures/RelObj";
import Rel "./data_structures/Rel";
import Result "mo:base/Result";
import StateV1 "./statev1";
import StorageSolution "./service/storage/storage";
import StorageState "./service/storage/storageState";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Token "./token";
import Types "./types";
import VoteManager "./service/vote/vote";
import VoteState "./service/vote/state";
import QueueManager "./service/queue/queue";
import QueueState "./service/queue/state";


shared ({caller = deployer}) actor class ModClub() = this {

  // Constants
  let MAX_WAIT_LIST_SIZE = 20000; // In case someone spams us, limit the waitlist
  stable var signingKey = "";
  // Airdrop Flags
  stable var allowSubmissionFlag : Bool = true;
  // Global Objects
  var state = StateV1.empty();

  stable var tokensStableV1 : Token.TokensStableV1 = Token.emptyStableV1(ModClubParam.getModclubWallet());
  var tokens = Token.Tokens(
        tokensStableV1
  );

  stable var storageStateStable  = StorageState.emptyStableState();
  stable var retiredDataCanisterId : [Text] = [];

  // Delete one line 
  stable var pohStableStateV1 = PohStateV1.emptyStableState();
  stable var pohStableStateV2 = PohStateV2.emptyStableState();
  var pohEngine = POH.PohEngine(pohStableStateV2);

  stable var pohVoteStableState = VoteState.emptyStableState();
  var voteManager = VoteManager.VoteManager(pohVoteStableState);

  stable var _canistergeekMonitorUD: ?Canistergeek.UpgradeData = null;
  private let canistergeekMonitor = Canistergeek.Monitor();

  stable var _canistergeekLoggerUD: ?Canistergeek.LoggerUpgradeData = null;
  private let canistergeekLogger = Canistergeek.Logger();

  stable var contentQueueStateStable: ?QueueState.QueueStateStable = null;
  private let contentQueueManager = QueueManager.QueueManager();
  stable var randomizationEnabled = true;

  // stable var pohContentQueueStateStable: ?QueueState.QueueStateStable = null;
  // private let pohContentQueueManager = QueueManager.QueueManager();

  stable var admins : List.List<Principal> = List.nil<Principal>();
  // Will be updated with "this" in postupgrade. Motoko not allowing to use "this" here
  var storageSolution = StorageSolution.StorageSolution(storageStateStable, retiredDataCanisterId, admins, signingKey);

  public shared({ caller }) func toggleAllowSubmission(allow: Bool) : async () {
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    allowSubmissionFlag := allow;
  };

  public shared({ caller }) func generateSigningKey() : async () {
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    switch(Helpers.encodeNat8ArraytoBase32(Blob.toArray(await Random.blob()))) {
      case(null){throw Error.reject("Couldn't generate key");};
      case(?key) {
        signingKey := key;
        await storageSolution.setSigningKey(signingKey);
      };
    };
  };

  public shared query ({ caller }) func getAdmins() : async Result.Result<[Principal], Text> {
    AuthManager.getAdmins(caller, admins);
  };

  //This function should be invoked immediately after the canister is deployed via script.
  public shared({ caller }) func registerAdmin(id : Principal) : async Result.Result<(), Text> {
    await resolveAdminResponse(AuthManager.registerAdmin(caller, admins, id));
  };

  public shared({ caller }) func unregisterAdmin(id : Text) : async Result.Result<(), Text> {
    await resolveAdminResponse(AuthManager.unregisterAdmin(caller, admins, id));
  };

  func resolveAdminResponse(adminListResponse: Result.Result<List.List<Principal>, Text>) : async Result.Result<(), Text> {
    switch(adminListResponse) {
      case(#err(Unauthorized)) {
        return #err(Unauthorized);
      };
      case(#ok(adminList)) {
        admins := adminList;
        await storageSolution.updateBucketControllers(admins);
        #ok();
      };
    };
  };

  // ----------------------Airdrop Methods------------------------------
  public shared({ caller }) func airdropRegister() : async Types.AirdropUser {
    await AirDropManager.airdropRegister(caller, state);
  };

  public shared({ caller }) func isAirdropRegistered() : async Types.AirdropUser {
    await AirDropManager.isAirdropRegistered(caller, state);
  };

  public shared({ caller }) func getAirdropUsers() : async [Types.AirdropUser] {
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    AirDropManager.getAirdropUsers(state);
  };

  // Add principals to airdropWhitelist
  public shared({ caller }) func addToAirdropWhitelist(pids: [Principal]) : async () {
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    AirDropManager.addToAirdropWhitelist(pids, state);
  };

  // Get airdropWhitelist entries
  public shared({ caller }) func getAirdropWhitelist() : async [Principal] {
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    AirDropManager.getAirdropWhitelist(state);
  };

  public shared({ caller }) func addToApprovedUser(userId: Principal) : async () {
     if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    voteManager.addToAutoApprovedPOHUser(userId);
  };

  // ----------------------Provider Methods------------------------------
  // todo: Require cylces on provider registration, add provider imageURl, description
  public shared({ caller }) func registerProvider(name: Text, description: Text, image: ?Types.Image) : async Text {
    Debug.print("registerProvider caller: " # Principal.toText(caller));
    switch(state.providersWhitelist.get(caller)) {
      case(null) {
         Helpers.logMessage(canistergeekLogger, "registerProvider - Provider not in allow list with provider ID: " # Principal.toText(caller), #info);
        return "Caller " # Principal.toText(caller) # " not in allow list";
      };
      case(?_) ();
    };
    ProviderManager.registerProvider(caller, name, description, image, state, canistergeekLogger);
  };

  public shared({ caller }) func updateProvider(providerId: Principal, updatedProviderVal:Types.ProviderMeta) : async Types.ProviderMetaResult {
    Debug.print("updateProvider caller: " # Principal.toText(caller) # ", providerId: " # Principal.toText(providerId));
    return await ProviderManager.updateProviderMetaData(providerId, updatedProviderVal, caller, state, canistergeekLogger);
  };

  public shared({ caller }) func updateProviderLogo(providerId: Principal, logoToUpload: [Nat8], logoType: Text) : async Text {

    return await ProviderManager.updateProviderLogo(providerId, logoToUpload, logoType, caller, state, canistergeekLogger);
  };

  public shared({ caller }) func deregisterProvider() : async Text {
    ProviderManager.deregisterProvider(caller, state, canistergeekLogger);
  };

  public shared({ caller }) func updateSettings(providerId : Principal, updatedSettings: Types.ProviderSettings) : async Types.ProviderSettingResult {
    Debug.print("updateSettings caller: " # Principal.toText(caller) # ", providerId: " # Principal.toText(providerId));
    return await ProviderManager.updateProviderSettings(providerId, updatedSettings, caller, state, canistergeekLogger);
  };

  public shared({ caller }) func getProvider(providerId: Principal) : async Types.ProviderPlus {
    Debug.print("getProvider caller: " # Principal.toText(caller) # ", providerId: " # Principal.toText(providerId));
    await ProviderManager.getProvider(providerId, state, contentQueueManager);
  };

  public shared({ caller }) func addRules(
    rules: [Text],
    providerId: ?Principal,
  ) : async () {
    // checkProviderPermission will return either the caller or the passed in providerId depending if the caller is the provider or not
    switch(AuthManager.checkProviderPermission(caller, providerId, state)){
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p)){
        ProviderManager.addRules(p, rules, state, canistergeekLogger);
      }
    };
  };

  public shared({ caller }) func removeRules(
    ruleIds: [Types.RuleId],
    providerId: ?Principal
    ): async () {
    switch(AuthManager.checkProviderPermission(caller, providerId, state)){
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p)){
        ProviderManager.removeRules(p, ruleIds, state, canistergeekLogger);
      }
    };
  };

  public shared({ caller }) func updateRules(
    rulesList: [Types.Rule],
    providerId: ?Principal
  ): async () {
    switch(AuthManager.checkProviderPermission(caller, providerId, state)){
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p)){
        ProviderManager.updateRules(p, rulesList, state);
      }
    };
  };

  public query func getRules(providerId: Principal) : async [Types.Rule] {
    ProviderManager.getProviderRules(providerId, state);
  };

  // Subscribe function for providers to register their callback after a vote decision has been made
  public shared({caller}) func subscribe(sub: Types.SubscribeMessage) : async() {
    switch(AuthManager.checkProviderPermission(caller, null, state)) {
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p))();
    };
    ProviderManager.subscribe(caller, sub, state, canistergeekLogger);
  };

  public shared({caller}) func subscribePohCallback(sub: PohTypes.SubscribePohMessage) : async() {
    switch(AuthManager.checkProviderPermission(caller, null, state)) {
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p))();
    };
    pohEngine.subscribe(caller, sub);
  };

  public shared({caller}) func addToAllowList(providerId: Principal): async() {
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
   await ProviderManager.addToAllowList(providerId, state, canistergeekLogger);
  };


  // ----------------------Content Related Methods------------------------------
  public query({caller}) func getContent(id: Text) : async ?Types.ContentPlus {
    let voteCount = getVoteCount(id, ?caller);
    return ContentManager.getContent(caller, id, voteCount, state);
  };

  public shared({ caller }) func submitText(sourceId: Text, text: Text, title: ?Text ) : async Text {
    if(allowSubmissionFlag == false) {
      throw Error.reject("Submissions are disabled");
    };
    if ( ContentManager.checkIfAlreadySubmitted(sourceId, caller, state) ) {
      throw Error.reject("Content already submitted");
    };
    switch(AuthManager.checkProviderPermission(caller, null, state)){
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p)) ();
    };
    return ContentManager.submitTextOrHtmlContent(caller, sourceId, text, title, #text, contentQueueManager, state);
  };

  public shared({ caller }) func submitHtmlContent(sourceId: Text, htmlContent: Text, title: ?Text) : async Text {
    if(allowSubmissionFlag == false) {
      throw Error.reject("Submissions are disabled");
    };
    switch(AuthManager.checkProviderPermission(caller, null, state)){
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p)) ();
    };
    if ( ContentManager.checkIfAlreadySubmitted(sourceId, caller, state) ) {
      throw Error.reject("Content already submitted");
    };
    ContentManager.submitTextOrHtmlContent(caller, sourceId, htmlContent, title, #htmlContent, contentQueueManager, state);
  };

  public shared({ caller }) func submitImage(sourceId: Text, image: [Nat8], imageType: Text, title: ?Text ) : async Text {
    if(allowSubmissionFlag == false) {
      throw Error.reject("Submissions are disabled");
    };
    if ( ContentManager.checkIfAlreadySubmitted(sourceId, caller, state) ) {
      throw Error.reject("Content already submitted");
    };
    switch(AuthManager.checkProviderPermission(caller, null, state)){
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p)) ();
    };
    return ContentManager.submitImage(caller, sourceId, image, imageType, title, contentQueueManager, state);
  };

  // Retrieve all content for the calling Provider
  public query({ caller }) func getProviderContent(
    providerId: Principal,
    status: Types.ContentStatus,
    start: Nat,
    end: Nat
    ) : async [Types.ContentPlus] {
    switch(AuthManager.checkProviderPermission(caller, ?providerId, state)){
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p)) ();
    };
    if( start < 0 or end < 0 or start > end) {
       throw Error.reject("Invalid range");
    };
    return ContentManager.getProviderContent(providerId, getVoteCount, state, status, start, end, contentQueueManager);
  };

  public query({ caller }) func getAllContent(status: Types.ContentStatus) : async [Types.ContentPlus] {
    switch(AuthManager.checkProfilePermission(caller, #getContent, state)){
      case(#err(e)) {
        throw Error.reject("Unauthorized");
      };
      case(_)();
    };
    switch(pohVerificationRequestHelper(Principal.toText(caller), Principal.fromActor(this))) {
      case(#ok(verificationResponse)) {
        if(verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user");
        };
      };
      case(#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case(_)();
    };
    return ContentManager.getAllContent(caller, status, getVoteCount, contentQueueManager, canistergeekLogger, state, randomizationEnabled);
  };

  public query({ caller }) func getTasks(
        start: Nat,
        end: Nat,
        filterVoted: Bool
  ) : async [Types.ContentPlus] {
    Helpers.logMessage(canistergeekLogger, "getTasks - provider called with provider ID: " # Principal.toText(caller), #info);
    switch(AuthManager.checkProfilePermission(caller, #getContent, state)){
      case(#err(e)) {
        throw Error.reject("Unauthorized");
      };
      case(_)();
    };
    switch(pohVerificationRequestHelper(Principal.toText(caller), Principal.fromActor(this))) {
      case(#ok(verificationResponse)) {
        if(verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user");
        };
      };
      case(#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case(_)();
    };
    switch(ContentManager.getTasks(caller, getVoteCount, state, start, end, filterVoted, canistergeekLogger, contentQueueManager, randomizationEnabled)){
      case(#err(e)) {
        throw Error.reject(e);
      };
      case(#ok(tasks)) {
        Helpers.logMessage(canistergeekLogger, "getTasks - FINISHED - provider called with provider ID: " # Principal.toText(caller), #info);
        return tasks;
      };
    };
  };

  // ----------------------Moderator Methods------------------------------
  public shared({ caller }) func registerModerator(userName: Text, email: Text, pic: ?Types.Image) : async Types.Profile {
    if(Principal.toText(caller) == "2vxsx-fae") {
      throw Error.reject("Unauthorized, user does not have an identity");
    };
    let profile = await ModeratorManager.registerModerator(caller, userName, email, pic, state);
    // Todo: Remove this after testnet
    // Give new users MOD points
    await tokens.transfer(ModClubParam.getModclubWallet(), caller, ModClubParam.DEFAULT_TEST_TOKENS);
    await storageSolution.registerModerators([caller]);
    contentQueueManager.assignUserIds2QueueId([caller]);
    return profile;
  };

  public query({ caller }) func getProfile() : async Types.Profile {
    switch(ModeratorManager.getProfile(caller, state)) {
      case(#ok(p)) {
        return p;
      };
      case(_) {
        throw Error.reject("profile not found")
      };
    };
  };

  public query func getProfileById(pid: Principal) : async Types.Profile {
    switch(ModeratorManager.getProfile(pid, state)) {
      case(#ok(p)) {
        return p;
      };
      case(_) {
        throw Error.reject("profile not found")
      };
    };
  };

  public query func getAllProfiles() : async [Types.Profile] {
    return ModeratorManager.getAllProfiles(state);
  };

  public query func getModeratorLeaderboard(start: Nat, end: Nat) : async [Types.ModeratorLeaderboard] {
    switch(ModeratorManager.getModeratorLeaderboard(start, end, state, tokens.getHoldings)) {
      case(#ok(leaderboard)) {
        return leaderboard;
      };
      case(#err(#contentNotFound)) {
        throw Error.reject("Content does not exist");
      };
      case(#err(#voteNotFound)) {
        throw Error.reject("Vote does not exist");
      };
      case(_) {
        throw Error.reject("Something went wrong");
      };
    };
  };

  public query({ caller }) func getActivity(isComplete: Bool) : async [Types.Activity] {
    switch (AuthManager.checkProfilePermission(caller, #getActivity, state)) {
      case (#err(e)) { throw Error.reject("Unauthorized"); };
      case (_) ();
    };
    switch(pohVerificationRequestHelper(Principal.toText(caller), Principal.fromActor(this))) {
      case(#ok(verificationResponse)) {
        if(verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user");
        };
      };
      case(#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case(_)();
    };
    switch(ModeratorManager.getActivity(caller, isComplete, getVoteCount, state)) {
      case(#ok(activity)) return activity;
      case(#err(#providerNotFound)) throw Error.reject("Provider does not exist");
      case(#err(#contentNotFound)) throw Error.reject("Content does not exist");
      case(#err(#voteNotFound)) throw Error.reject("Vote does not exist");
      case(_) throw Error.reject("Something went wrong");
    };
  };

  // ----------------------Content Voting Methods------------------------------
  public query({ caller }) func getVotePerformance() : async Float {
    switch(ContentVotingManager.getVotePerformance(caller, state)) {
      case(#ok(vp)) {
        return vp;
      };
      case(#err(#contentNotFound)) {
        throw Error.reject("Content does not exist");
      };
      case(#err(#voteNotFound)) {
        throw Error.reject("Vote does not exist");
      };
    }
  };

  public shared({ caller }) func vote(contentId: Types.ContentId, decision: Types.Decision, violatedRules: ?[Types.RuleId]) : async Text {

    switch (AuthManager.checkProfilePermission(caller, #vote, state)) {
      case (#err(e)) { throw Error.reject("Unauthorized"); };
      case (_) ();
    };
    switch(pohVerificationRequestHelper(Principal.toText(caller), Principal.fromActor(this))) {
      case(#ok(verificationResponse)) {
        if(verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user");
        };
      };
      case(#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case(_)();
    };

    var voteCount = getVoteCount(contentId, ?caller);
    Helpers.logMessage(canistergeekLogger, "vote - User ID: " #
    Principal.toText(caller) #
    " approved: " # Bool.toText( decision == #approved) #
    " voting on content ID : " # contentId #
    " approve count : " # Nat.toText(voteCount.approvedCount) #
    " rejected count : " # Nat.toText(voteCount.rejectedCount)
    , #info);
    await ContentVotingManager.vote(caller, contentId, decision, violatedRules, voteCount, tokens, state, canistergeekLogger, contentQueueManager, randomizationEnabled);
  };

  // ----------------------Token Methods------------------------------
  public query({ caller }) func getTokenHoldings() : async Token.Holdings {
     tokens.getHoldings(caller);
  };

  public shared({ caller }) func stakeTokens(amount: Nat) : async Text {
    switch(pohVerificationRequestHelper(Principal.toText(caller), Principal.fromActor(this))) {
      case(#ok(verificationResponse)) {
        if(verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user");
        };
      };
      case(#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case(_)();
    };
    await tokens.stake(caller, amount);
    "Staked " # Nat.toText(amount) # " tokens";
  };

  public shared({ caller }) func unStakeTokens(amount: Nat) : async Text {
    await tokens.unstake(caller, amount);
    "Unstaked " # Nat.toText(amount) # " tokens";
  };

  public query({ caller }) func getModclubHoldings() : async Token.Holdings {
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    tokens.getHoldings(ModClubParam.getModclubWallet());
  };

  public query({ caller }) func getAllModeratorHoldings() : async [(Principal, Token.Holdings)] {
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    return tokens.getAllHoldings();
  };

  public shared({ caller }) func distributeAllPendingRewards() : async () {
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    for((p,h) in tokens.getAllHoldings().vals()) {
      Helpers.logMessage(canistergeekLogger, "Distributing reward for " # Principal.toText(p) # " For amount: " # Int.toText(h.pendingRewards), #info);
      await tokens.distributePendingReward(p, h.pendingRewards);
    };
  };

  // TODO Delete this function
  public shared({ caller}) func adminTransferTokens(to: Principal, amount: Nat) : async () {
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    await tokens.transfer(ModClubParam.getModclubWallet(), to, amount);
  };

  //----------------------POH Methods For Providers------------------------------
  public shared({ caller }) func verifyHumanity(providerUserId: Text) : async PohTypes.PohVerificationResponsePlus {
    switch(pohVerificationRequestHelper(providerUserId, caller)) {
      case(#ok(verificationResponse)) {
        return verificationResponse;
      };
      case(_) {
        throw Error.reject("Poh Not configured for provider.");
      };
    };
  };

  private func pohVerificationRequestHelper(providerUserId: Text, providerId: Principal) : Result.Result<PohTypes.PohVerificationResponsePlus, PohTypes.PohError>  {
    if(Principal.equal(providerId, Principal.fromActor(this)) and voteManager.isAutoApprovedPOHUser(Principal.fromText(providerUserId))) {
      return
      #ok({
          requestId = "null";
          providerUserId = providerUserId;
          status = #verified;
          challenges = [];
          providerId = providerId;
          token = null;
          rejectionReasons = [];
          requestedOn = Helpers.timeNow();
      });
    };
    let pohVerificationRequest: PohTypes.PohVerificationRequestV1 = {
        requestId = Helpers.generateId(providerId, "pohRequest", state);
        providerUserId = providerUserId;
        providerId = providerId;
    };
    // validity and rules needs to come from admin dashboard here
    switch(pohEngine.getProviderPohConfiguration(providerId, state)) {
      case(#ok(providerPohConfig)) {
        let verificationResponse = pohEngine.pohVerificationRequest(pohVerificationRequest, providerPohConfig.expiry, providerPohConfig.challengeIds);
        var reasons:[Text] = [];
        if(verificationResponse.status == #rejected) {
          let modclubUserId = pohEngine.findModclubId(providerUserId, providerId);
          // second part of get won't get evaluated so giving random value
          reasons := findRejectionReasons(Option.get(modclubUserId, Principal.fromText("")), providerPohConfig.challengeIds);
        };
        var token: Text = "";
        if(verificationResponse.status == #startPoh) {
          token := pohEngine.pohGenerateUniqueToken(providerUserId, providerId);
        };
        #ok({
            requestId = "";
            providerUserId = providerUserId;
            status = verificationResponse.status;
            // status at each challenge level
            challenges = verificationResponse.challenges;
            providerId = providerId;
            token = ?token;
            rejectionReasons = reasons;
            requestedOn = Helpers.timeNow();
        });
      };
      case(#err(er)) {
        return #err(er);
      };
    };
  };

  private func findRejectionReasons(userId: Principal, challengeIds: [Text]) : [Text] {
    let rejectedPackageId = pohEngine.retrieveRejectedPackageId(userId, challengeIds, voteManager.getContentStatus);
    switch(rejectedPackageId) {
      case(null) {
        return [];
      };
      case(?id) {
        let violatedRules = voteManager.getAllUniqueViolatedRules(id);
        return pohEngine.resolveViolatedRulesById(violatedRules);
      }
    };
  };

  //----------------------POH Methods For ModClub------------------------------
  // for modclub only
  public shared({ caller }) func verifyUserHumanityForModclub() : async PohTypes.VerifyHumanityResponse {
      let response = await verifyHumanity(Principal.toText(caller));
      return {
        status = response.status;
        token = null;
        rejectionReasons = response.rejectionReasons;
      };
  };

  public shared({ caller }) func retrieveChallengesForUser(token: Text) : async Result.Result<[PohTypes.PohChallengesAttempt], PohTypes.PohError> {
    switch(pohEngine.decodeToken(caller, token)) {
      case(#err(err)) {
        return #err(err);
      };
      case(#ok(tokenResponse)) {
        switch(pohEngine.getProviderPohConfiguration(tokenResponse.providerId, state)) {
          case(#ok(pohConfigForProvider)) {
            pohEngine.associateProviderUserId2ModclubUserId(tokenResponse, caller);
            await pohEngine.retrieveChallengesForUser(caller, pohConfigForProvider.challengeIds, pohConfigForProvider.expiry, false);
          };
          case(#err(er)) {
            return #err(er);
          };
        };
      };
    };
  };

  public shared({ caller }) func submitChallengeData(pohDataRequest : PohTypes.PohChallengeSubmissionRequest) : async PohTypes.PohChallengeSubmissionResponse {
    // let caller = Principal.fromText("2vxsx-fae");
    let isValid = pohEngine.validateChallengeSubmission(pohDataRequest, caller);
    if(isValid == #ok) {
      let _ = do ? {
        let attemptId = pohEngine.getAttemptId(pohDataRequest.challengeId, caller);
        let dataCanisterId = await storageSolution.putBlobsInDataCanister(attemptId, pohDataRequest.challengeDataBlob!, pohDataRequest.offset,
                pohDataRequest.numOfChunks, pohDataRequest.mimeType,  pohDataRequest.dataSize);
        if(pohDataRequest.offset == pohDataRequest.numOfChunks) {
          //last Chunk coming in
          pohEngine.changeChallengeTaskStatus(pohDataRequest.challengeId, caller, #pending);
          pohEngine.updateDataCanisterId(pohDataRequest.challengeId, caller, dataCanisterId);

          let challengePackages = pohEngine.createChallengePackageForVoting(
            caller,
            voteManager.getContentStatus,
            state
          );
          for(package in challengePackages.vals()) {
            voteManager.initiateVotingPoh(package.id, caller);
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
  public shared({ caller }) func resetUserChallengeAttempt(packageId: Text) : async Result.Result<[PohTypes.PohChallengesAttempt], PohTypes.PohError> {
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    switch(pohEngine.getPohChallengePackage(packageId)) {
      case(null) {
        throw Error.reject("Package doesn't exist");
      };
      case(?package) {
        pohEngine.changeChallengePackageStatus(packageId, #rejected);
        voteManager.changePohPackageVotingStatus(packageId, #rejected);
        // when true is passed, validity is not used in the function. so passing 0
        await pohEngine.retrieveChallengesForUser(package.userId, package.challengeIds, 0, true);
      };
    };
  };

  public shared({ caller }) func populateChallenges() : async () {
    Debug.print("Populating challenges called by: " # Principal.toText(caller));
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    pohEngine.populateChallenges();
  };

  public shared({ caller }) func configurePohForProvider(providerId: Principal, challengeId: [Text], expiry: Nat) : async () {
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    let challengeBuffer = Buffer.Buffer<Text>(challengeId.size());
    for(id in challengeId.vals()) {
      challengeBuffer.add(id);
    };
    state.provider2PohChallengeIds.put(providerId, challengeBuffer);
    state.provider2PohExpiry.put(providerId, expiry);
  };

  public query({ caller }) func getPohTasks(status: Types.ContentStatus, start: Nat, end: Nat) : async [PohTypes.PohTaskPlus] {
    switch(AuthManager.checkProfilePermission(caller, #getContent, state)){
      case(#err(e)) {
        throw Error.reject("Unauthorized");
      };
      case(_)();
    };
    switch(pohVerificationRequestHelper(Principal.toText(caller), Principal.fromActor(this))) {
      case(#ok(verificationResponse)) {
        if(verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user");
        };
      };
      case(#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case(_)();
    };
    let pohTaskIds = voteManager.getTasksId(status, start, end);
    let tasks = Buffer.Buffer<PohTypes.PohTaskPlus>(pohTaskIds.size());
    for(id in pohTaskIds.vals()) {
      let voteCount = voteManager.getVoteCountForPoh(caller, id);
      let taskDataWrapper = pohEngine.getPohTasks([id]);
      var profileImageUrlSuffix :?Text = null;
      for(wrapper in taskDataWrapper.vals()) {
        for(data in wrapper.pohTaskData.vals()) {
          if(data.challengeId == POH.CHALLENGE_PROFILE_PIC_ID) {
            profileImageUrlSuffix := do ? {
              ("canisterId=" # Principal.toText(data.dataCanisterId!) # "&contentId=" # data.contentId!)
            };
          };
        }
      };
      let pohPackage = pohEngine.getPohChallengePackage(id);
      switch(pohPackage) {
        case(null)();
        case(?package) {
          let taskPlus = {
            packageId = id;
            status = voteManager.getContentStatus(id);
            profileImageUrlSuffix = profileImageUrlSuffix;
            // TODO: change these vote settings
            voteCount = Nat.max(voteCount.approvedCount, voteCount.rejectedCount);
            minVotes = ModClubParam.MIN_VOTE_POH;
            minStake = ModClubParam.MIN_STAKE_POH;
            title = null;
            hasVoted = ?voteCount.hasVoted;
            reward = ModClubParam.STAKE_REWARD_PERCENTAGE * Float.fromInt(ModClubParam.MIN_STAKE_POH);
            createdAt = package.createdAt;
            updatedAt = package.updatedAt;
          };
          tasks.add(taskPlus);
        };
      }

    };
    return tasks.toArray();
  };

  public query({ caller }) func getPohTaskData(packageId: Text) : async Result.Result<PohTypes.PohTaskDataWrapperPlus, PohTypes.PohError> {
    switch(AuthManager.checkProfilePermission(caller, #getContent, state)){
      case(#err(e)) {
        throw Error.reject("Unauthorized");
      };
      case(_)();
    };
    switch(pohVerificationRequestHelper(Principal.toText(caller), Principal.fromActor(this))) {
      case(#ok(verificationResponse)) {
        if(verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user");
        };
      };
      case(#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case(_)();
    };
    let pohTasks = pohEngine.getPohTasks([packageId]);
    if(pohTasks.size() == 0) {
      return #err(#invalidPackageId);
    };
    let voteCount = voteManager.getVoteCountForPoh(caller, packageId);
    #ok({
        packageId = pohTasks[0].packageId;
        pohTaskData = pohTasks[0].pohTaskData;
        votes = Nat.max(voteCount.approvedCount, voteCount.rejectedCount);
        minVotes =  ModClubParam.MIN_VOTE_POH;
        minStake = ModClubParam.MIN_STAKE_POH;
        reward = ModClubParam.STAKE_REWARD_PERCENTAGE * Float.fromInt(ModClubParam.MIN_STAKE_POH);
        createdAt = pohTasks[0].createdAt;
        updatedAt = pohTasks[0].updatedAt;
    });
  };

  public query ({caller}) func getCanisterMetrics(parameters: Canistergeek.GetMetricsParameters): async ?Canistergeek.CanisterMetrics {
      // validateCaller(caller);
      canistergeekMonitor.getMetrics(parameters);
  };

  public shared ({caller}) func collectCanisterMetrics(): async () {
      // validateCaller(caller);
      canistergeekMonitor.collectMetrics();
  };

  public query ({caller}) func getCanisterLog(request: ?LoggerTypesModule.CanisterLogRequest) : async ?LoggerTypesModule.CanisterLogResponse {
        // validateCaller(caller);
        Helpers.logMessage(canistergeekLogger, "Log from canister Log method.", #info);
        canistergeekLogger.getLog(request);
  };

  public shared({ caller }) func votePohContent(packageId: Text, decision: Types.Decision, violatedRules: [Types.PohRulesViolated]) : async () {
    switch(AuthManager.checkProfilePermission(caller, #vote, state)){
      case(#err(e)) {
        throw Error.reject("Unauthorized");
      };
      case(_)();
    };
    switch(pohVerificationRequestHelper(Principal.toText(caller), Principal.fromActor(this))) {
      case(#ok(verificationResponse)) {
        if(verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user");
        };
      };
      case(#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case(_)();
    };
    let holdings = tokens.getHoldings(caller);
    if( holdings.stake < ModClubParam.MIN_STAKE_POH) {
      throw Error.reject("Not enough tokens staked");
    };
    if(voteManager.checkPohUserHasVoted(caller, packageId)) {
      throw Error.reject("You have already voted");
    };
    if(voteManager.getContentStatus(packageId) != #new) {
      throw Error.reject("Vote has been finalized.");
    };

    if(pohEngine.validateRules(violatedRules) == false) {
      throw Error.reject("Valid rules not provided.");
    };

    let finishedVoting = voteManager.votePohContent(caller, packageId, decision, violatedRules);
    if(finishedVoting == #ok(true)) {
      Helpers.logMessage(canistergeekLogger, "Voting completed for packageId: " # packageId, #info);
      let finalDecision = voteManager.getContentStatus(packageId);
      let votesId = voteManager.getPOHVotesId(packageId);
      if(finalDecision == #approved) {
        pohEngine.changeChallengePackageStatus(packageId, #verified);
        Helpers.logMessage(canistergeekLogger, "Voting completed for packageId: " # packageId # " Final decision: approved" , #info);
      } else {
        pohEngine.changeChallengePackageStatus(packageId, #rejected);
        Helpers.logMessage(canistergeekLogger, "Voting completed for packageId: " # packageId # " Final decision: rejected" , #info);
      };
      // should be taken out to some job
      for(id in votesId.vals()) {
        let vote = voteManager.getPOHVote(id);
        switch(vote) {
          case(null)();
          case(?v) {
            let reward = (ModClubParam.STAKE_REWARD_PERCENTAGE * Float.fromInt(ModClubParam.MIN_STAKE_POH));
            if((v.decision == #approved and finalDecision == #approved) or
                (v.decision == #rejected and finalDecision == #rejected)
              ) {
               Helpers.logMessage(canistergeekLogger, "User Point before distribution: " # Int.toText(tokens.getUserPointForUser(v.userId)) , #info);
               Helpers.logMessage(canistergeekLogger, "Distributing reward to user: " # Principal.toText(v.userId) , #info);
              //reward only some percentage
              await tokens.reward(ModClubParam.getModclubWallet(), v.userId, Float.toInt(reward));
               Helpers.logMessage(canistergeekLogger, "User Point after distribution: " # Int.toText(tokens.getUserPointForUser(v.userId)) , #info);
            } else {
              // burn only some percentage
              Helpers.logMessage(canistergeekLogger, "User Point before distribution: " # Int.toText(tokens.getUserPointForUser(v.userId)) , #info);
              Helpers.logMessage(canistergeekLogger, "Burning reward from user: " # Principal.toText(v.userId) , #info);
              await tokens.burnStakeFrom(v.userId, Float.toInt(reward));
              Helpers.logMessage(canistergeekLogger, "User Point after distribution: " # Int.toText(tokens.getUserPointForUser(v.userId)) , #info);
            };
          };
        };
      };
      // inform all providers
      if(finalDecision == #approved) {
        await pohEngine.issueCallbackToProviders(packageId, #approved, state);
      } else {
        await pohEngine.issueCallbackToProviders(packageId, #rejected, state);
      };
    };
  };

  public shared({ caller }) func issueJwt() : async Text {
    Debug.print("Issue JWT called by " # Principal.toText(caller));
    switch(AuthManager.checkProfilePermission(caller, #vote, state)){
      case(#err(e)) {
        throw Error.reject("Unauthorized");
      };
      case(_)();
    };
    Debug.print("Issue JWT Check user humanity " # Principal.toText(caller));
    switch(pohVerificationRequestHelper(Principal.toText(caller), Principal.fromActor(this))) {
      case(#ok(verificationResponse)) {
        if(verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user");
        };
      };
      case(#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case(_)();
    };
    let message = Principal.toText(caller) # "." # Int.toText(Helpers.timeNow());
    let signature = Helpers.generateHash(message # signingKey);
    let base32Message = Helpers.encodeBase32(message);
    switch(base32Message) {
      case(null) {
        throw Error.reject("Jwt creation failed");
      };
      case(?b32Message) {
        return b32Message # "." # signature;
      };
    }
  };

  // Helpers
  public shared({caller}) func adminInit() : async () {
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    await generateSigningKey();
    await populateChallenges();
  };

  public shared({caller}) func retiredDataCanisterIdForWriting(canisterId: Text) {
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    storageSolution.retiredDataCanisterId(canisterId);
  };

  public shared({caller}) func getAllDataCanisterIds() : async ([Principal], [Text]) {
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    let allDataCanisterId = storageSolution.getAllDataCanisterIds();
    let retired = storageSolution.getRetiredDataCanisterIdsStable();
    (allDataCanisterId, retired);
  };

  private func getProviderRules(providerId: Principal) : [Types.Rule] {
    let buf = Buffer.Buffer<Types.Rule>(0);
    for(ruleId in state.provider2rules.get0(providerId).vals()){
      switch(state.rules.get(ruleId)){
        case(?rule){
          buf.add(rule);
        };
        case(_)();
      };
    };
    buf.toArray();
  };

  // Return the principal identifier of this canister.
  public func whoami () : async Principal {
    Principal.fromActor(this);
  };

  public query func getDeployer () : async Principal {
    return deployer;
  };

  public shared({ caller }) func addProviderAdmin(
    userId: Principal,
     userName: Text,
      providerId: ?Principal
      ) : async Types.ProviderResult {
        Debug.print("addProviderAdmin caller: " # Principal.toText(caller));
        let result = await ProviderManager.addProviderAdmin(
          userId,
          userName,
          caller,
          providerId,
          state,
          admins,
          canistergeekLogger
        );
    return result;
  };

  public shared({ caller }) func getProviderAdmins(providerId: Principal) : async [Types.Profile] {
    Debug.print("getProviderAdmins caller: " # Principal.toText(caller));
    return ProviderManager.getProviderAdmins(providerId, state);
  };

  public shared({ caller }) func removeProviderAdmin(providerId: Principal, providerAdminPrincipalIdToBeRemoved: Principal)
  : async Types.ProviderResult {

    return await ProviderManager.removeProviderAdmin(providerId, providerAdminPrincipalIdToBeRemoved, caller, state, admins, canistergeekLogger);
  };

  public shared({ caller }) func editProviderAdmin(providerId: Principal, providerAdminPrincipalIdToBeEdited: Principal, newUserName: Text)
  : async Types.ProviderResult {

    return await ProviderManager.editProviderAdmin(providerId, providerAdminPrincipalIdToBeEdited, newUserName, caller, admins, state);
  };

  public query({caller}) func getAdminProviderIDs(): async [Principal] {
    return ProviderManager.getAdminProviderIDs(caller, state, canistergeekLogger);
  };

  public shared({caller}) func getPohAttempts(): async [(Principal, [(Text, [PohTypes.PohChallengesAttempt])])] {
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    pohEngine.getStableState().pohUserChallengeAttempts;
  };

  public shared({caller}) func shuffleContent() : async () {
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    contentQueueManager.shuffleContent();
    contentQueueManager.assignUserIds2QueueId(Iter.toArray(state.profiles.keys()));
  };

  private func createContentObj(sourceId: Text, caller: Principal, contentType: Types.ContentType, title: ?Text): Types.Content {
    let now = Helpers.timeNow();
    let content : Types.Content  = {
        id = Helpers.generateId(caller, "content", state);
        providerId = caller;
        contentType = contentType;
        status = #new;
        sourceId = sourceId;
        title = title;
        createdAt= now;
        updatedAt= now;
    };
    return content;
  };

 private func getVoteCount(contentId: Types.ContentId, caller: ?Principal) : Types.VoteCount {
   var voteApproved : Nat = 0;
   var voteRejected : Nat  = 0;
   var hasVoted : Bool = false;
    for(vid in state.content2votes.get0(contentId).vals()) {
      switch(state.votes.get(vid)){
        case(?v){
          if(v.decision == #approved){
            voteApproved += 1;
          } else {
            voteRejected += 1;
          };
          switch (caller) {
            case(?x){
              if (v.userId == x) {
                hasVoted := true;
              };
            };
            case(_) ();
          };
        };
        case(_) ();
      };
  };

  return {
    approvedCount = voteApproved;
    rejectedCount = voteRejected;
    hasVoted = hasVoted;
  };
 };

  public shared({caller}) func rewardPoints(p: Principal, amount: Int) : async () {
   if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
   tokens.rewardPoints(p, amount);
  };

  // Methods to debug and look into Queues state
  public query({caller}) func userId2QueueId() : async [(Principal, Text)] {
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    let qStableState = contentQueueManager.preupgrade();
    qStableState.userId2QueueId;
  };

  public shared({caller}) func allNewContent() : async [Text] {
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    let qStableState = contentQueueManager.preupgrade();
    qStableState.allNewContentQueue;
  };

  public shared({caller}) func newContentQueuesByqId(qId: Nat) : async [Text] {
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    let qStableState = contentQueueManager.preupgrade();
    qStableState.newContentQueues.get(qId).1;
  };

  public shared({caller}) func setRandomization(isRandom: Bool) : async () {
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    randomizationEnabled := isRandom;
  };

  public shared({caller}) func getTaskStats(from: Int) : async (Nat, Nat, Nat, Nat) {
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    let approvedStats = getContentCountFrom(contentQueueManager.getUserContentQueue(caller, #approved, false), from);
    let rejectedStats = getContentCountFrom(contentQueueManager.getUserContentQueue(caller, #rejected, false), from);
    let newStats = getContentCountFrom(contentQueueManager.getUserContentQueue(caller, #new, false), from);

    for(userId in rejectedStats.1.keys()) {
      approvedStats.1.put(userId, null);
    };
    for(userId in newStats.1.keys()) {
      approvedStats.1.put(userId, null);
    };
    
    (approvedStats.0, rejectedStats.0, newStats.0, approvedStats.1.size());
  };

  func getContentCountFrom(contentQueue: HashMap.HashMap<Text, ?Text>, from: Int) : (Nat, HashMap.HashMap<Principal, ?Text>) {
    var count = 0;
    let distinctUsersVoted = HashMap.HashMap<Principal, ?Text>(1, Principal.equal, Principal.hash);
    for(cid in contentQueue.keys()) {
      switch(state.content.get(cid)) {
        case(null)();
        case(?con) {
          if(con.createdAt >= from) {
            count := count + 1;
            for(vId in state.content2votes.get0(con.id).vals()) {
              switch(state.votes.get(vId)) {
                case(null)();
                case(?v) {
                  distinctUsersVoted.put(v.userId, null);
                };
              }
            };
          };
        };
      };
    };
    return (count, distinctUsersVoted);
  };

  public shared({caller}) func newContentQueuesqIdCount() : async ([Nat], [Nat]) {
    if(not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    let qStableState = contentQueueManager.preupgrade();
    let res = Buffer.Buffer<Nat>(1);
    for( (id, q) in qStableState.newContentQueues.vals()) {
      res.add(q.size());
    };

    let userInQueueCount =  HashMap.HashMap<Text, Nat>(1, Text.equal, Text.hash);
    for((userId, qId) in qStableState.userId2QueueId.vals()) {
      switch(userInQueueCount.get(qId)) {
        case(null) {
          userInQueueCount.put(qId, 1);
        };
        case(?count) {
          userInQueueCount.put(qId, count + 1);
        };
      };
    };

    let userCount = Buffer.Buffer<Nat>(1);
    for(i in Iter.range(0, ModClubParam.TOTAL_QUEUES - 1)) {
      let qId = "Queue: " # Int.toText(i);
      switch(userInQueueCount.get(qId)) {
        case(null) {
          userCount.add(0);
        };
        case(?count) {
          userCount.add(count);
        };
      };
    };
    return (res.toArray(), userCount.toArray());
  };

  // Upgrade logic / code
  stable var stateSharedV1 : StateV1.StateShared = StateV1.emptyShared();

  system func preupgrade() {
    Debug.print("MODCLUB PREUPGRRADE");
    stateSharedV1 := StateV1.fromState(state);
    tokensStableV1 := tokens.getStableV1();

    storageStateStable := storageSolution.getStableState();
    retiredDataCanisterId := storageSolution.getRetiredDataCanisterIdsStable();
    pohStableStateV2 := pohEngine.getStableState();
    pohVoteStableState := voteManager.getStableState();
    _canistergeekMonitorUD := ?canistergeekMonitor.preupgrade();
    _canistergeekLoggerUD := ?canistergeekLogger.preupgrade();
    contentQueueStateStable := ?contentQueueManager.preupgrade();
    // pohContentQueueStateStable := ?pohContentQueueManager.preupgrade();
    Debug.print("MODCLUB PREUPGRRADE FINISHED");
  };

  stable var pohRunOnce = false;
  system func postupgrade() {
    // Reinitializing storage Solution to add "this" actor as a controller
    admins := AuthManager.setUpDefaultAdmins(admins, deployer, Principal.fromActor(this));
    storageSolution := StorageSolution.StorageSolution(storageStateStable, retiredDataCanisterId, admins, signingKey);
    Debug.print("MODCLUB POSTUPGRADE");
    
    state := StateV1.toState(stateSharedV1);
    // Reducing memory footprint by assigning empty stable state
    stateSharedV1 := StateV1.emptyShared();

    tokensStableV1 := Token.emptyStableV1(ModClubParam.getModclubWallet());
    storageStateStable := StorageState.emptyStableState();
    retiredDataCanisterId := [];
    // Delete from here after deployment
    if(not pohRunOnce) {
      pohStableStateV2 := pohEngine.migrateV1ToV2(pohStableStateV1, pohStableStateV2, Principal.fromActor(this));
      pohEngine := POH.PohEngine(pohStableStateV2);
      pohRunOnce := true;
    };
    pohStableStateV1 := PohStateV1.emptyStableState();
    // Delete upto here

    pohStableStateV2 := PohStateV2.emptyStableState();
    pohVoteStableState := VoteState.emptyStableState();

    // This statement should be run after the storagestate gets restored from stable state
    storageSolution.setInitialModerators(ModeratorManager.getModerators(state));
    canistergeekMonitor.postupgrade(_canistergeekMonitorUD);
    _canistergeekMonitorUD := null;
    canistergeekLogger.postupgrade(_canistergeekLoggerUD);
    _canistergeekLoggerUD := null;

    contentQueueManager.postupgrade(contentQueueStateStable, canistergeekLogger);
    // pohContentQueueManager.postupgrade(pohContentQueueStateStable, canistergeekLogger);
    

    contentQueueStateStable := null;
    canistergeekLogger.setMaxMessagesCount(3000);
    Debug.print("MODCLUB POSTUPGRADE FINISHED");
  };

  var nextRunTime = Time.now();
  let FIVE_MIN_NANO_SECS = 300000000000;
  system func heartbeat() : async () {
    if(Time.now() > nextRunTime) {
      Debug.print("Running Metrics Collection");
      canistergeekMonitor.collectMetrics();
      nextRunTime := Time.now() + FIVE_MIN_NANO_SECS;
    };
  };
};


