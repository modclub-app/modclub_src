import Array "mo:base/Array";
import Base32 "mo:encoding/Base32";
import Blob "mo:base/Blob";
import Bool "mo:base/Bool";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import Helpers "./helpers";
import IC "./remote_canisters/IC";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import ModClubParam "service/parameters/params";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Order "mo:base/Order";
import Random "mo:base/Random";
import POH "./service/poh/poh";
import PohState "./service/poh/state";
import PohStateV1 "./service/poh/statev1";
import PohTypes "./service/poh/types";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import State "./state";
import StorageSolution "./service/storage/storage";
import StorageState "./service/storage/storageState";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Prim "mo:prim";
import Token "./token";
import Types "./types";

import VoteManager "./service/vote/vote";
import VoteState "./service/vote/state";
import AirDropManager "./service/airdrop/airdrop";
import ProviderManager "./service/provider/provider";
import ModeratorManager "./service/moderator/moderator";
import AuthManager "./service/auth/auth";
import ContentManager "./service/content/content";
import ContentVotingManager "./service/content/vote";

import RelObj "./data_structures/RelObj";

import Canistergeek "./canistergeek/canistergeek";
import LoggerTypesModule "./canistergeek/logger/typesModule";

shared ({caller = initializer}) actor class ModClub () = this {

  // Constants
  let MAX_WAIT_LIST_SIZE = 20000; // In case someone spams us, limit the waitlist

  stable var signingKey = "";
  // Airdrop Flags
  stable var allowSubmissionFlag : Bool = true;
  // Global Objects 
  var state = State.empty();
  stable var tokensStable : Token.TokensStable = Token.emptyStable(initializer);
  var tokens = Token.Tokens(
        tokensStable
  );
  
  stable var storageStateStable  = StorageState.emptyStableState();
  stable var retiredDataCanisterId : [Text] = [];
  // Will be updated with "this" in postupgrade. Motoko not allowing to use "this" here
  var storageSolution = StorageSolution.StorageSolution(storageStateStable, retiredDataCanisterId, initializer, initializer, signingKey);

  stable var pohStableState = PohState.emptyStableState();
  stable var pohStableStateV1 = PohStateV1.emptyStableState();
  var pohEngine = POH.PohEngine(pohStableStateV1);

  stable var pohVoteStableState = VoteState.emptyStableState();
  var voteManager = VoteManager.VoteManager(pohVoteStableState);

  stable var _canistergeekMonitorUD: ? Canistergeek.UpgradeData = null;
  private let canistergeekMonitor = Canistergeek.Monitor();

  stable var _canistergeekLoggerUD: ? Canistergeek.LoggerUpgradeData = null;
  private let canistergeekLogger = Canistergeek.Logger();

  public shared({ caller }) func toggleAllowSubmission(allow: Bool) : async () {
    await AuthManager.onlyOwner(caller, initializer);
    allowSubmissionFlag := allow;
  };

  public shared({ caller }) func generateSigningKey() : async () {
    await AuthManager.onlyOwner(caller, initializer);
    switch(Helpers.encodeNat8ArraytoBase32(Blob.toArray(await Random.blob()))) {
      case(null){throw Error.reject("Couldn't generate key");};
      case(?key) {
        signingKey := key;
        await storageSolution.setSigningKey(signingKey);
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
    await AuthManager.onlyOwner(caller, initializer);
    AirDropManager.getAirdropUsers(state);
  };

  // Add principals to airdropWhitelist
  public shared({ caller }) func addToAirdropWhitelist(pids: [Principal]) : async () {
    await AuthManager.onlyOwner(caller, initializer);
    AirDropManager.addToAirdropWhitelist(pids, state);
  };

  // Get airdropWhitelist entries
  public shared({ caller }) func getAirdropWhitelist() : async [Principal] {
    await AuthManager.onlyOwner(caller, initializer);
    AirDropManager.getAirdropWhitelist(state);
  };

  public shared({ caller }) func addToApprovedUser(userId: Principal) : async () {
     await AuthManager.onlyOwner(caller, initializer);
    voteManager.addToAutoApprovedPOHUser(userId);
  };

  // ----------------------Provider Methods------------------------------
  // todo: Require cylces on provider registration, add provider imageURl, description 
  public shared({ caller }) func registerProvider(name: Text, description: Text, image: ?Types.Image) : async Text {
    ProviderManager.registerProvider(caller, name, description, image, state);
  };

  public shared({ caller }) func deregisterProvider() : async Text {
    ProviderManager.deregisterProvider(caller, state);
  };

  public shared({ caller }) func updateSettings(settings: Types.ProviderSettings) : async () {
    ProviderManager.updateProviderSettings(caller, settings, state);
  };

  public shared func getProvider(providerId: Principal) : async Types.ProviderPlus {
    await ProviderManager.getProvider(providerId, state);
  };

  public shared({ caller }) func addRules(rules: [Text]) {
    await AuthManager.checkProviderPermission(caller, state);
    ProviderManager.addRules(caller, rules, state);
  };

  public shared({ caller }) func removeRules(ruleIds: [Types.RuleId]) {
    ProviderManager.removeRules(caller, ruleIds, state);
  };

  public query func getRules(providerId: Principal) : async [Types.Rule] {
    ProviderManager.getProviderRules(providerId, state);
  };

  // Subscribe function for providers to register their callback after a vote decision has been made
  public shared({caller}) func subscribe(sub: Types.SubscribeMessage) : async() {
    await AuthManager.checkProviderPermission(caller, state);
    ProviderManager.subscribe(caller, sub, state);
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
    await AuthManager.checkProviderPermission(caller, state);
    return ContentManager.submitTextOrHtmlContent(caller, sourceId, text, title, #text, state);
  };

  public shared({ caller }) func submitHtmlContent(sourceId: Text, htmlContent: Text, title: ?Text) : async Text {
    if(allowSubmissionFlag == false) {
      throw Error.reject("Submissions are disabled");
    };
    await AuthManager.checkProviderPermission(caller, state);

    ContentManager.submitTextOrHtmlContent(caller, sourceId, htmlContent, title, #htmlContent, state);
  };
    
  public shared({ caller }) func submitImage(sourceId: Text, image: [Nat8], imageType: Text, title: ?Text ) : async Text {
    if(allowSubmissionFlag == false) {
      throw Error.reject("Submissions are disabled");
    };
    await AuthManager.checkProviderPermission(caller, state);
    return ContentManager.submitImage(caller, sourceId, image, imageType, title, state);
  };

  // Retreives all content for the calling Provider
  public query({ caller }) func getProviderContent() : async [Types.ContentPlus] {
    return ContentManager.getProviderContent(caller, getVoteCount, state);
  };
  
  public query({ caller }) func getAllContent(status: Types.ContentStatus) : async [Types.ContentPlus] {
    switch(AuthManager.checkProfilePermission(caller, #getContent, state)){
      case(#err(e)) {
        throw Error.reject("Unauthorized");
      };
      case(_)();
    };
    return ContentManager.getAllContent(caller, status, getVoteCount, state);
  };
  
  // ----------------------Moderator Methods------------------------------
  public shared({ caller }) func registerModerator(userName: Text, email: Text, pic: ?Types.Image) : async Types.Profile {
    if(Principal.toText(caller) == "2vxsx-fae") {
      throw Error.reject("Unauthorized, user does not have an identity");
    };
    switch(state.airdropWhitelist.get(caller)){
      case(null) throw Error.reject("Unauthorized: user is not in the airdrop whitelist");
      case(_) ();
    };
    let profile = await ModeratorManager.registerModerator(caller, userName, email, pic, state);
    // Todo: Remove this after testnet
    // Give new users MOD points
    await tokens.transfer(initializer, caller, ModClubParam.DEFAULT_TEST_TOKENS);
    await storageSolution.registerModerators([caller]);
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
    var voteCount = getVoteCount(contentId, ?caller);
    await ContentVotingManager.vote(caller, contentId, decision, violatedRules, voteCount, tokens, initializer, state);
  };
  
  // ----------------------Token Methods------------------------------
  public query({ caller }) func getTokenHoldings() : async Token.Holdings {
     tokens.getHoldings(caller);
  };

  public shared({ caller }) func stakeTokens(amount: Nat) : async Text {
    await tokens.stake(caller, amount);
    "Staked " # Nat.toText(amount) # " tokens";
  };

  public shared({ caller }) func unStakeTokens(amount: Nat) : async Text {
    await tokens.unstake(caller, amount);
    "Unstaked " # Nat.toText(amount) # " tokens";
  };

  public query func getModclubHoldings() : async Token.Holdings {
    tokens.getHoldings(initializer);
  };

  //----------------------POH Methods For Providers------------------------------

  public shared({ caller }) func pohVerificationRequest(providerUserId: Principal) : async PohTypes.PohVerificationResponse {
    pohVerificationRequestHelper(providerUserId, caller);
  };

  private func pohVerificationRequestHelper(providerUserId: Principal, providerId: Principal) : PohTypes.PohVerificationResponse  {
    if(voteManager.isAutoApprovedPOHUser(providerUserId)) {
      return
      {
          requestId = "null";
          providerUserId = providerId;
          status = #verified;
          challenges = [];
          providerId = initializer;
          requestedOn = Helpers.timeNow();
      };
    };
    let pohVerificationRequest: PohTypes.PohVerificationRequest = {
        requestId = generateId(providerId, "pohRequest");
        providerUserId = providerUserId;
        providerId = providerId;
    };
    // validity and rules needs to come from admin dashboard here
    pohEngine.pohVerificationRequest(pohVerificationRequest, 365, ["challenge-profile-pic", "challenge-user-video"]);
  };
  
  // Method called by provider
  public shared({ caller }) func pohGenerateUniqueToken(providerUserId: Principal) : async PohTypes.PohUniqueToken {
    await pohEngine.pohGenerateUniqueToken(providerUserId, caller);
  };

  //----------------------POH Methods For ModClub------------------------------
  public shared({ caller }) func retrieveChallengesForUser(token: Text) : async Result.Result<[PohTypes.PohChallengesAttempt], PohTypes.PohError> {
    let tokenResponse = pohEngine.decodeToken(caller, token);
    if(tokenResponse == #err(#invalidToken)) {
      return #err(#invalidToken);
    };
    await pohEngine.retrieveChallengesForUser(caller, ["challenge-profile-pic", "challenge-user-video"], false);
  };

  // Admin method to create new attempts
  public shared({ caller }) func resetUserChallengeAttempt(packageId: Text) : async Result.Result<[PohTypes.PohChallengesAttempt], PohTypes.PohError> {
    await AuthManager.onlyOwner(caller, initializer);
    switch(pohEngine.getPohChallengePackage(packageId)) {
      case(null) {
        throw Error.reject("Package doesn't exist");
      };
      case(?package) {
        pohEngine.changeChallengePackageStatus(packageId, #rejected);
        voteManager.changePohPackageVotingStatus(packageId, #rejected);
        await pohEngine.retrieveChallengesForUser(package.userId, ["challenge-profile-pic", "challenge-user-video"], true);
      };
    };
   
  };

  public shared({ caller }) func submitChallengeData(pohDataRequest : PohTypes.PohChallengeSubmissionRequest) : async PohTypes.PohChallengeSubmissionResponse {
    // let caller = Principal.fromText("2vxsx-fae");
    let isValid = pohEngine.validateChallengeSubmission(pohDataRequest, caller);
    if(isValid == #ok) {
      let _ = do ? {
        if(pohDataRequest.challengeDataBlob != null) {
          let attemptId = pohEngine.getAttemptId(pohDataRequest.challengeId, caller);
          let dataCanisterId = await storageSolution.putBlobsInDataCanister(attemptId, pohDataRequest.challengeDataBlob!, pohDataRequest.offset, 
                  pohDataRequest.numOfChunks, pohDataRequest.mimeType,  pohDataRequest.dataSize);
          if(pohDataRequest.offset == pohDataRequest.numOfChunks) {//last Chunk coming in
            pohEngine.changeChallengeTaskStatus(pohDataRequest.challengeId, caller, #pending);
            pohEngine.updateDataCanisterId(pohDataRequest.challengeId, caller, dataCanisterId);
          };
        } else {
          // It's a username, email task
          pohEngine.updatePohUserObject(caller, pohDataRequest.fullName!, pohDataRequest.email!, pohDataRequest.userName!, pohDataRequest.aboutUser!);
          pohEngine.changeChallengeTaskStatus(pohDataRequest.challengeId, caller, #pending);
        };
      };
      // TODO dynamic list will be fetched from admin dashboard state
      let providerChallenges = ["challenge-profile-pic", "challenge-user-video"];
      let challengePackage = pohEngine.createChallengePackageForVoting(caller, providerChallenges, generateId, voteManager.getContentStatus);
      switch(challengePackage) {
        case(null)();
        case(?package) {
          voteManager.initiateVotingPoh(package.id, caller);
          if(voteManager.isAutoApprovedPOHUser(caller)) {
            pohEngine.changeChallengePackageStatus(package.id, #verified);
          };
        };
      };
    };
    return {
      challengeId = pohDataRequest.challengeId;
      submissionStatus = isValid;
    };
  };

  public shared({ caller }) func verifyUserHumanity() : async PohTypes.VerifyHumanityResponse {
    // TODO add security check
    Debug.print("Verifying humanity called by: " # Principal.toText(caller));
    var rejectionReasons: [Text] = [];
    if(voteManager.isAutoApprovedPOHUser(caller)) {
      return {
        status = #verified;
        token = null;
        rejectionReasons = rejectionReasons;
      };
    } else {
      Debug.print("Calling pohVerificationRequest");
      let result = await pohVerificationRequest(caller);
      if(result.status == #rejected) {
        let rejectedPackageId = pohEngine.retrieveRejectedPackageId(caller, ["challenge-profile-pic", "challenge-user-video"]);
        switch(rejectedPackageId) {
          case(null)();
          case(?id) {
            let violatedRules = voteManager.getAllUniqueViolatedRules(id);
            rejectionReasons := pohEngine.resolveViolatedRulesById(violatedRules);
          }
        };
      };
      if(result.status != #verified) {
        return {
          status = result.status;
          token = ?(await pohGenerateUniqueToken(caller));
          rejectionReasons = rejectionReasons;
        };
      };
      return {status = result.status; token = null; rejectionReasons = rejectionReasons;};
    }
  };

  public shared({ caller }) func populateChallenges() : async () {
    Debug.print("Populating challenges called by: " # Principal.toText(caller));
    await AuthManager.onlyOwner(caller, initializer);
    pohEngine.populateChallenges();
  };

  public query({ caller }) func getPohTasks(status: Types.ContentStatus, start: Nat, end: Nat) : async [PohTypes.PohTaskPlus] {
    switch(AuthManager.checkProfilePermission(caller, #getContent, state)){
      case(#err(e)) {
        throw Error.reject("Unauthorized");
      };
      case(_)();
    };
    if(pohVerificationRequestHelper(caller, initializer).status != #verified) {
      throw Error.reject("Proof of Humanity not completed user");
    };
    let pohTaskIds = voteManager.getTasksId(status, start, end);
    let tasks = Buffer.Buffer<PohTypes.PohTaskPlus>(pohTaskIds.size());
    for(id in pohTaskIds.vals()) {
      let voteCount = voteManager.getVoteCountForPoh(caller, id);
      let taskDataWrapper = pohEngine.getPohTasks([id]);
      var userName :?Text = null;
      var email:?Text = null;
      var fullName :?Text = null;
      var aboutUser:?Text = null;
      var profileImageUrlSuffix :?Text = null;
      for(wrapper in taskDataWrapper.vals()) {
        for(data in wrapper.pohTaskData.vals()) {
          if(data.challengeId == POH.CHALLENGE_PROFILE_DETAILS_ID) {
            // userName := data.userName;
            email := data.email;
            fullName := data.fullName;
            aboutUser := data.aboutUser;
          };
          
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
          switch(state.profiles.get(package.userId)){
            case (null) ();
            case (?result) userName := ?result.userName;
          };
          let taskPlus = {
            packageId = id;
            status = voteManager.getContentStatus(id);
            userName = userName;
            email = email;
            fullName = fullName;
            aboutUser = aboutUser;
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
    if(pohVerificationRequestHelper(caller, initializer).status != #verified) {
      throw Error.reject("Proof of Humanity not completed user");
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
    if((await pohVerificationRequest(caller)).status != #verified) {
      throw Error.reject("Proof of Humanity not completed user");
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
      let decision = voteManager.getContentStatus(packageId);
      let votesId = voteManager.getPOHVotesId(packageId);
      if(decision == #approved) {
        pohEngine.changeChallengePackageStatus(packageId, #verified);
      } else {
        pohEngine.changeChallengePackageStatus(packageId, #rejected);
      };
      for(id in votesId.vals()) {
        let vote = voteManager.getPOHVote(id);
        switch(vote) {
          case(null)();
          case(?v) {
            let reward = (ModClubParam.STAKE_REWARD_PERCENTAGE * Float.fromInt(ModClubParam.MIN_STAKE_POH));
            if((v.decision == #approved and decision == #approved) or
                (v.decision == #rejected and decision == #rejected)
              ) {
              //reward only some percentage
              await tokens.reward(initializer, v.userId, Float.toInt(reward));
            } else {
              // burn only some percentage
              await tokens.burnStakeFrom(v.userId, Float.toInt(reward));
            };
          };
        };
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
    if((await pohVerificationRequest(caller)).status != #verified) {
      throw Error.reject("Proof of Humanity not completed user");
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
    await AuthManager.onlyOwner(caller, initializer);
    await generateSigningKey();
    await populateChallenges();
  };

  public shared({caller}) func retiredDataCanisterIdForWriting(canisterId: Text) {
    await AuthManager.onlyOwner(caller, initializer);
    storageSolution.retiredDataCanisterId(canisterId);
  };

  public shared({caller}) func getAllDataCanisterIds() : async ([Principal], [Text]) {
    await AuthManager.onlyOwner(caller, initializer);
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

   public shared({ caller }) func addProviderAdmin( userId: Principal) : async Types.ProviderResult {
    var authorized = false;
    var isProvider = false;
    var _providerId : Principal = caller;

    // Provider check
    switch(state.providers.get(_providerId)) {
      case (null) return #err(#NotFound);
      case (?result) {
        if(caller == result.id) {
          authorized := true;
          isProvider := true;
        };
      };
    };

    // Check if the caller is an admin of this provider
    if(isProvider == false) {
        switch(await AuthManager.checkProviderAdminPermission(_providerId, caller, state)) {
          case (#err(error)) return #err(error);
          case (#ok()) authorized := true;
        };
      };

    if(authorized == false) return #err(#Unauthorized);

    // Add the user to the provider admin list
    let now = Helpers.timeNow();

    let adminProfile : Types.Profile = {
      id = userId;
      userName = "Safi";
      email = "";
      pic = null;
      role = #admin;
      createdAt = now;
      updatedAt =now;
    };

    state.profiles.put(userId, adminProfile);
    switch(state.providerAdmins.get(_providerId)) { 
      case (null) {
        let adminMap = HashMap.HashMap<Types.UserId, ()>(1, Principal.equal, Principal.hash);
        adminMap.put(userId, ());
        state.providerAdmins.put(_providerId, adminMap);
        };
      case (?adminMap) {
        adminMap.put(userId, ());
      };
    };

    #ok();
  };

  private func createContentObj(sourceId: Text, caller: Principal, contentType: Types.ContentType, title: ?Text): Types.Content {
    let now = Helpers.timeNow();
    let content : Types.Content  = {
        id = generateId(caller, "content");
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

  // Generates a semi unique ID
  private func generateId(caller: Principal, category: Text): Text {
    var count : Nat = 0;
    switch(state.GLOBAL_ID_MAP.get(category)){
      case(?result){
        count := result;
      };
      case(_) ();
    };
    count := count + 1;
    state.GLOBAL_ID_MAP.put(category, count);
    return Principal.toText(caller) # "-" # category # "-" # (Nat.toText(count));
  };

 private func getVoteCount(contentId: Types.ContentId, caller: ?Principal) : Types.VoteCount {
   var voteApproved : Nat = 0;
   var voteRejected : Nat  = 0;
   var hasVoted : Bool = false;
    for(vid in state.content2votes.get0(contentId).vals()){
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

  // Upgrade logic / code
  stable var stateShared : State.StateShared = State.emptyShared();

  system func preupgrade() {
    Debug.print("MODCLUB PREUPGRRADE");
    Debug.print("MODCLUB PREUPGRRADE");
    stateShared := State.fromState(state);
    tokensStable := tokens.getStable();

    storageStateStable := storageSolution.getStableState();
    retiredDataCanisterId := storageSolution.getRetiredDataCanisterIdsStable();
    //pohStableState := pohEngine.getStableState();
    pohStableStateV1 := pohEngine.getStableState();
    pohVoteStableState := voteManager.getStableState();
    _canistergeekMonitorUD := ? canistergeekMonitor.preupgrade();
    _canistergeekLoggerUD := ? canistergeekLogger.preupgrade();
    Debug.print("MODCLUB PREUPGRRADE FINISHED");
  };

  system func postupgrade() {
    // Reinitializing storage Solution to add "this" actor as a controller
    storageSolution := StorageSolution.StorageSolution(storageStateStable, retiredDataCanisterId, initializer, Principal.fromActor(this), signingKey);
    Debug.print("MODCLUB POSTUPGRADE");
    Debug.print("MODCLUB POSTUPGRADE");
    state := State.toState(stateShared);

    // Reducing memory footprint by assigning empty stable state
    stateShared := State.emptyShared();
    tokensStable := Token.emptyStable(initializer);
    
    storageStateStable := StorageState.emptyStableState();
    retiredDataCanisterId := [];
    // Delete these two lines after one deployment
    pohStableStateV1 := mergeV0StateIntoV1(pohStableStateV1, pohStableState);
    pohEngine := POH.PohEngine(pohStableStateV1);
    // Upto Here
    pohStableStateV1 := PohStateV1.emptyStableState();
    pohVoteStableState := VoteState.emptyStableState();
    
    // This statement should be run after the storagestate gets restored from stable state
    storageSolution.setInitialModerators(ModeratorManager.getModerators(state));
    canistergeekMonitor.postupgrade(_canistergeekMonitorUD);
    _canistergeekMonitorUD := null;
    canistergeekLogger.postupgrade(_canistergeekLoggerUD);
    _canistergeekLoggerUD := null;
    canistergeekLogger.setMaxMessagesCount(3000);

    Debug.print("MODCLUB POSTUPGRADE FINISHED");
  };

  // Delete this function after one deployment
  func mergeV0StateIntoV1(pohStableStateV1 : PohStateV1.PohStableState, pohStableState :  PohState.PohStableState) 
  : PohStateV1.PohStableState {
    let userToPackage : RelObj.RelObj<Principal, Text> = RelObj.RelObj((Principal.hash, Text.hash), (Principal.equal, Text.equal));
    for((packageId, package) in pohStableState.pohChallengePackages.vals()) {
      userToPackage.put(package.userId, packageId);
    };
    let st = {
            pohUsers = Array.append(pohStableState.pohUsers, pohStableStateV1.pohUsers);
            pohChallenges = Array.append(pohStableState.pohChallenges, pohStableStateV1.pohChallenges);
            pohUserChallengeAttempts = Array.append(pohStableState.pohUserChallengeAttempts, pohStableStateV1.pohUserChallengeAttempts);
            pohProviderUserData = Array.append(pohStableState.pohProviderUserData, pohStableStateV1.pohProviderUserData);
            providerToModclubUser = Array.append(pohStableState.providerToModclubUser, pohStableStateV1.providerToModclubUser);
            pohChallengePackages = Array.append(pohStableState.pohChallengePackages, pohStableStateV1.pohChallengePackages);
            userToPohChallengePackageId =  pohStableStateV1.userToPohChallengePackageId;
            wordList = Array.append(pohStableState.wordList, pohStableStateV1.wordList);
            provider2PohVerificationRequests =  Array.append(pohStableState.provider2PohVerificationRequests, pohStableStateV1.provider2PohVerificationRequests);
            pohVerificationRequests = Array.append(pohStableState.pohVerificationRequests, pohStableStateV1.pohVerificationRequests);
        };
        return st;
  }

  // Uncomment when required
  // system func heartbeat() : async () {};

};


