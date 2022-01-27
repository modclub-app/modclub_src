import Bool "mo:base/Bool";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Float "mo:base/Float";
import ModClubParam "service/parameters/params";
import Nat "mo:base/Nat";

import POH "./service/poh/poh";
import PohState "./service/poh/state";
import PohTypes "./service/poh/types";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import State "./state";
import StorageSolution "./service/storage/storage";
import StorageState "./service/storage/storageState";
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

import Helpers "./helpers";

shared ({caller = initializer}) actor class ModClub () = this {

  // Constants
  let MAX_WAIT_LIST_SIZE = 20000; // In case someone spams us, limit the waitlist

  // Airdrop Flags
  stable var allowSubmissionFlag : Bool = true;
  // Global Objects 
  var state = State.empty();
  stable var tokensStable : Token.TokensStable = Token.emptyStable(initializer);
  var tokens = Token.Tokens(
        tokensStable
  );
  
  stable var storageStateStable  = StorageState.emptyStableState();
  // Will be updated with this in postupgrade. Motoko not allowing to use "this" here
  var storageSolution = StorageSolution.StorageSolution(storageStateStable, initializer, initializer);

  stable var pohStableState = PohState.emptyStableState();
  var pohEngine = POH.PohEngine(pohStableState);

  stable var pohVoteStableState = VoteState.emptyStableState();
  var voteManager = VoteManager.VoteManager(pohVoteStableState);

  public shared({ caller }) func toggleAllowSubmission(allow: Bool) : async () {
    await AuthManager.onlyOwner(caller, initializer);
    allowSubmissionFlag := allow;
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
    return ContentManager.submitText(caller, sourceId, text, title, state);
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
    // switch(state.airdropWhitelist.get(caller)){
    //   case(null) throw Error.reject("Unauthorized: user is not in the airdrop whitelist");
    //   case(_) ();
    // };
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

  // Todo: Enable updating profile at a later time
  // public shared({ caller }) func updateProfile(userName: Text, email: Text, pic: ?Image) : async Profile {
  //     switch(state.profiles.get(caller)){
  //       case (null) throw Error.reject("profile not found");
  //       case (?result) {
  //         switch( await checkUsernameAvailable(userName) ) {
  //           case(true) {
  //             let now = Helpers.timeNow();
  //             let profile = {
  //               id = caller;
  //               userName = userName;
  //               pic = pic;
  //               email = email;
  //               role = result.role;
  //               createdAt = result.createdAt;
  //               updatedAt = now;
  //             };
  //             state.profiles.put(caller, profile);
  //             return profile;
  //           };
  //           case(false) throw Error.reject("username already taken");
  //         };
  //       };
  //     };
  // };

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
  public shared({ caller }) func verifyForHumanity(providerUserId: Principal) : async PohTypes.PohVerificationResponse {
    let pohVerificationRequest: PohTypes.PohVerificationRequest = {
        requestId = Helpers.generateId(caller, "pohRequest", state);
        providerUserId = providerUserId;
        providerId = caller;
    };
    // validity and rules needs to come from admin dashboard here
    await pohEngine.verifyForHumanity(pohVerificationRequest, 365, ["challenge-profile-details", "challenge-profile-pic", "challenge-user-video"]);
  };
  
  public shared({ caller }) func generateUniqueToken(providerUserId: Principal) : async PohTypes.PohUniqueToken {
    await pohEngine.generateUniqueToken(providerUserId, caller);
  };

  //----------------------POH Methods For ModClub------------------------------
  public shared({ caller }) func retrieveChallengesForUser(token: Text) : async Result.Result<[PohTypes.PohChallengesAttempt], PohTypes.PohError> {
    await pohEngine.retrieveChallengesForUser(caller, token, ["challenge-profile-details", "challenge-profile-pic", "challenge-user-video"]);
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
      let providerChallenges = ["challenge-profile-details", "challenge-profile-pic", "challenge-user-video"];
      let challengePackage = pohEngine.createChallengePackageForVoting(caller, providerChallenges, generateId);
      switch(challengePackage) {
        case(null)();
        case(?package) {
          voteManager.initiateVotingPoh(package.id);
        };
      }
    };
    return {
      challengeId = pohDataRequest.challengeId;
      submissionStatus = isValid;
    };
  };

  public shared({ caller }) func verifyUserHumanity() : async (PohTypes.PohChallengeStatus, ?PohTypes.PohUniqueToken)  {
    let response =  await verifyForHumanity(caller);
    if(response.status != #verified) {
      return (response.status, ?(await generateUniqueToken(caller)));
    };
    return (response.status, null);
  };

  public shared({ caller }) func verifyUserHumanityAPI() : async {status: PohTypes.PohChallengeStatus; token: ?PohTypes.PohUniqueToken} {
    let response =  await verifyForHumanity(caller);
    if(response.status != #verified) {
      return {status = response.status; token =  ?(await generateUniqueToken(caller))};
    };
    return {status = response.status; token =  null};
  };

  public shared({ caller }) func populateChallenges() : async () {
    pohEngine.populateChallenges();
  };

  public query({ caller }) func getPohTasks(status: Types.ContentStatus) : async [PohTypes.PohTaskPlus] {
     switch(AuthManager.checkProfilePermission(caller, #getContent, state)){
       case(#err(e)) {
         throw Error.reject("Unauthorized");
       };
       case(_)();
     };
    let pohTaskIds = voteManager.getTasksId(status, 10);
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
            userName := data.userName;
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

  public shared({ caller }) func getPohTaskData(packageId: Text) : async Result.Result<[PohTypes.PohTaskData], PohTypes.PohError> {
     switch(AuthManager.checkProfilePermission(caller, #getContent, state)){
       case(#err(e)) {
         throw Error.reject("Unauthorized");
       };
       case(_)();
     };
    let pohTasks = pohEngine.getPohTasks([packageId]);
    if(pohTasks.size() == 0) {
      return #err(#invalidPackageId);
    };
    return #ok(pohTasks[0].pohTaskData);
  };

  public shared({ caller }) func votePohContent(packageId: Text, decision: Types.Decision, violatedRules: [Types.PohRulesViolated]) : async () {
    let holdings = tokens.getHoldings(caller);
    if( holdings.stake < ModClubParam.MIN_STAKE_POH) { 
      throw Error.reject("Not enough tokens staked");
    };

    if(voteManager.getContentStatus(packageId) != #new) {
      throw Error.reject("User has already voted.");
    };

    if(pohEngine.validateRules(violatedRules) == false) {
      throw Error.reject("Valid rules not provided.");
    };

    let finishedVoting = voteManager.votePohContent(caller, packageId, decision, violatedRules);
    if(finishedVoting == #ok(true)) {
      let decision = voteManager.getContentStatus(packageId);
      let votesId = voteManager.getPOHVotesId(packageId);
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
            }
          };
        };
      };
    };
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

    // storageStateStable := storageSolution.getStableState();
    // pohStableState := pohEngine.getStableState();
    // pohVoteStableState := voteManager.getStableState();
    Debug.print("MODCLUB PREUPGRRADE FINISHED");
  };

  system func postupgrade() {
    // Reinitializing storage Solution to add this actor as a controller
    storageSolution := StorageSolution.StorageSolution(storageStateStable, initializer, Principal.fromActor(this));
    Debug.print("MODCLUB POSTUPGRADE");
    Debug.print("MODCLUB POSTUPGRADE");
    state := State.toState(stateShared);

    // Reducing memory footprint by assigning empty stable state
    stateShared := State.emptyShared();
    tokensStable := Token.emptyStable(initializer);
    
    storageStateStable := StorageState.emptyStableState();
    pohStableState := PohState.emptyStableState();
    pohVoteStableState := VoteState.emptyStableState();
    
    // This statement should be run after the storagestate gets restored from stable state
    storageSolution.setInitialModerators(ModeratorManager.getModerators(state));
    Debug.print("MODCLUB POSTUPGRADE FINISHED");
  };

  // Uncomment when required
  // system func heartbeat() : async () {};

};
