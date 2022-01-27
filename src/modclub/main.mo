import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Bool "mo:base/Bool";
import Buffer "mo:base/Buffer";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import IC "./remote_canisters/IC";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import ModClubParam "service/parameters/params";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Order "mo:base/Order";
import POH "./service/poh/poh";
import PohState "./service/poh/state";
import PohTypes "./service/poh/types";
import Principal "mo:base/Principal";
import Rel "data_structures/Rel";
import Result "mo:base/Result";
import State "./state";
import StorageSolution "./service/storage/storage";
import StorageState "./service/storage/storageState";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Token "./token";
import TrieSet "mo:base/TrieSet";
import Types "./types";
import VoteManager "./service/vote/vote";
import VoteState "./service/vote/state";
import AirDropManager "./service/airdrop/airdrop";
import ProviderManager "./service/provider/provider";
import ModeratorManager "./service/moderator/moderator";
import AuthManager "./service/auth/auth";
import ContentManager "./service/content/content";




import Helpers "./helpers";


shared ({caller = initializer}) actor class ModClub () = this {

  // Constants
  let MAX_WAIT_LIST_SIZE = 20000; // In case someone spams us, limit the waitlist
  let DEFAULT_TEST_TOKENS = 100;
  // Types
  type Content = Types.Content;
  type ContentPlus = Types.ContentPlus;
  type ContentStatus = Types.ContentStatus;
  type TextContent = Types.TextContent;
  type MultiTextContent = Types.MultiTextContent;
  type ImageUrlContent = Types.ImageUrl;
  type ImageContent = Types.ImageContent;
  type Profile = Types.Profile;
  type Timestamp = Types.Timestamp;
  type ContentId = Types.ContentId;
  type Decision = Types.Decision;
  type SubscribeMessage = Types.SubscribeMessage;
  type UserId = Types.UserId;
  type Role = Types.Role;
  type Rule = Types.Rule;
  type Image = Types.Image;
  type ProviderPlus = Types.ProviderPlus; 
  type Activity = Types.Activity;
  type AirdropUser = Types.AirdropUser;
  type ModeratorLeaderboard = Types.ModeratorLeaderboard;
  type RewardsEarnedMap = Types.RewardsEarnedMap;

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
  public shared({ caller }) func airdropRegister() : async AirdropUser {
    await AirDropManager.airdropRegister(caller, state);
  };

  public shared({ caller }) func isAirdropRegistered() : async AirdropUser {
    await AirDropManager.isAirdropRegistered(caller, state);
  };

  public shared({ caller }) func getAirdropUsers() : async [AirdropUser] {
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
  public shared({ caller }) func registerProvider(name: Text, description: Text, image: ?Image) : async Text {
    ProviderManager.registerProvider(caller, name, description, image, state);
  };

  public shared({ caller }) func deregisterProvider() : async Text {
    ProviderManager.deregisterProvider(caller, state);
  };

  public shared({ caller }) func updateSettings(settings: Types.ProviderSettings) : async () {
    ProviderManager.updateProviderSettings(caller, settings, state);
  };

  public shared func getProvider(providerId: Principal) : async ProviderPlus {
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
  public shared({caller}) func subscribe(sub: SubscribeMessage) : async() {
    await AuthManager.checkProviderPermission(caller, state);
    ProviderManager.subscribe(caller, sub, state);
  };

  // ----------------------Content Related Methods------------------------------
  public query({caller}) func getContent(id: Text) : async ?ContentPlus {
    return getContentPlus(id, ?caller);  
  };

  public shared({ caller }) func submitText(sourceId: Text, text: Text, title: ?Text ) : async Text {
    if(allowSubmissionFlag == false) {
      throw Error.reject("Submissions are disabled");
    };

    await AuthManager.checkProviderPermission(caller, state);
    let content = createContentObj(sourceId, caller, #text, title);
    let textContent : TextContent = {
      id = content.id;
      text = text;
    };
      // Store and update relationships
      state.content.put(content.id, content);
      state.textContent.put(content.id, textContent);
      state.provider2content.put(caller, content.id);
      state.contentNew.put(caller, content.id);
      return content.id;
  };
  
  public shared({ caller }) func submitImage(sourceId: Text, image: [Nat8], imageType: Text, title: ?Text ) : async Text {
    if(allowSubmissionFlag == false) {
      throw Error.reject("Submissions are disabled");
    };
    await AuthManager.checkProviderPermission(caller, state);
    let content = createContentObj(sourceId, caller, #imageBlob, title);

    let imageContent : ImageContent = {
      id = content.id;
      image  = {
        data = image;
        imageType = imageType;
      }
    };
    // Store and update relationships
    state.content.put(content.id, content);
    state.imageContent.put(content.id, imageContent);
    state.provider2content.put(caller, content.id);
    state.contentNew.put(caller, content.id);
    return content.id;
  };

  // Retreives all content for the calling Provider
  public query({ caller }) func getProviderContent() : async [ContentPlus] {
      let buf = Buffer.Buffer<ContentPlus>(0);
      for (cid in state.provider2content.get0(caller).vals()) {
        switch(getContentPlus((cid), ?caller)) {
          case (?result) {
            buf.add(result);
          };
          case (_) ();
        };
      };
      buf.toArray();
  };
  
  public query({ caller }) func getAllContent(status: Types.ContentStatus) : async [ContentPlus] {
     switch(AuthManager.checkProfilePermission(caller, #getContent, state)){
       case(#err(e)) {
         throw Error.reject("Unauthorized");
       };
       case(_)();
     };

     var contentRel : ?Rel.Rel<Principal, Types.ContentId> = null;
     let buf = Buffer.Buffer<ContentPlus>(0);
     var count = 0;
     for ( (pid, p) in state.providers.entries()){
       if( count < 11) {
        switch(status){
          case(#new){
            for(cid in state.contentNew.get0(pid).vals()){
              if( count < 11) {
              switch(getContentPlus((cid), ?caller)) {
                case (?result) {
                  buf.add(result);
                  count := count + 1;
                };
                case (_) ();
                };
              };
            };
          };
          case(#approved){
            for(cid in state.contentApproved.get0(pid).vals()){
              if( count < 11) {
              switch(getContentPlus((cid), ?caller)) {
                case (?result) {
                  buf.add(result);
                  count := count + 1;
                };
                case (_) ();
                };
              };
            };
          };
          case(#rejected){
            for(cid in state.contentRejected.get0(pid).vals()){
              if( count < 11) {
              switch(getContentPlus((cid), ?caller)) {
                case (?result) {
                  buf.add(result);
                  count := count + 1;
                };
                case (_) ();
                };
              };
            };
          };
        };
       };
     };
    return Array.sort(buf.toArray(), compareContent);
  };
  
  // ----------------------Moderator Methods------------------------------
  public shared({ caller }) func registerModerator(userName: Text, email: Text, pic: ?Image) : async Profile {
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

  public query({ caller }) func getProfile() : async Profile {
    switch(ModeratorManager.getProfile(caller, state)) {
      case(#ok(p)) {
        return p;
      };
      case(_) {
        throw Error.reject("profile not found")
      };
    };
  };

  public query func getProfileById(pid: Principal) : async Profile { 
    switch(ModeratorManager.getProfile(pid, state)) {
      case(#ok(p)) {
        return p;
      };
      case(_) {
        throw Error.reject("profile not found")
      };
    };   
  };

  public query func getAllProfiles() : async [Profile] {
    return ModeratorManager.getAllProfiles(state);
  };

  public query func getModeratorLeaderboard(start: Nat, end: Nat) : async [ModeratorLeaderboard] {
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
        throw Error.reject("Somethign went wrong");
      };
    };
  };

  public query({ caller }) func getVotePerformance() : async Float {
    var correctVoteCount : Int = 0;
    var completedVoteCount : Int = 0;
    for (vid in state.mods2votes.get0(caller).vals()) {
      switch(state.votes.get(vid)) {
        case (?vote) {
          switch(state.content.get(vote.contentId)) {
            case (?content) {
              if (content.status != #new) {
                completedVoteCount := completedVoteCount + 1;
                if (vote.decision == content.status) {
                  correctVoteCount := correctVoteCount + 1;
                };
              };
            };
            case(_) throw Error.reject("Content does not exist"); 
          };          
        };
        case (_) throw Error.reject("Vote does not exist");
      };
    };
    var performance : Float = 0;
    if (completedVoteCount != 0) {
      performance := Float.fromInt(correctVoteCount) / Float.fromInt(completedVoteCount);
    };
    return performance;
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

  public shared({ caller }) func vote(contentId: ContentId, decision: Decision, violatedRules: ?[Types.RuleId]) : async Text {
    
    switch (AuthManager.checkProfilePermission(caller, #vote, state)) {
      case (#err(e)) { throw Error.reject("Unauthorized"); };
      case (_) ();
    };

    let voteId = "vote-" # Principal.toText(caller) # contentId;
    switch(state.votes.get(voteId)){
      case(?v){
        throw Error.reject("User already voted");
      };
      case(_)();
    };

    switch(state.content.get(contentId)){
      case(?content) {
        if(content.status != #new) throw Error.reject("Content has already been reviewed");
        
        // Check the user has enough tokens staked
        switch(state.providers.get(content.providerId)){
          case(?provider) {
              let holdings = tokens.getHoldings(caller);
              Debug.print("Holdings: wallet" # Int.toText(holdings.wallet) # "stake" # Int.toText(holdings.stake));
              Debug.print("Provider: minStake" # Nat.toText(provider.settings.minStaked));
              
              if( holdings.stake < provider.settings.minStaked ) 
                throw Error.reject("Not enough tokens staked");
          };
          case(_) throw Error.reject("Provider not found");
        };

        var voteApproved : Nat = 0;
        var voteRejected : Nat = 0;
        var voteCount = getVoteCount(contentId, ?caller);
        voteApproved := voteApproved + voteCount.approvedCount;
        voteRejected := voteRejected + voteCount.rejectedCount;

        // Check if the rules provided are valid
        if(decision == #rejected) {
          switch(violatedRules){
            case(?result){
              if(validateRules(contentId, result) != true){
                throw Error.reject("The violated rules provided are incorrect");
              };
            };
            case(_) throw Error.reject("Must provide rules that were violated");
          };
        };

          let vote : Types.Vote = {
              id = voteId;
              contentId =  contentId;
              userId = caller;
              decision = decision; 
              violatedRules = violatedRules;
              createdAt = Helpers.timeNow();
          };
          switch(decision){
            case(#approved) {
              voteApproved += 1 
            };
            case(#rejected) {
              voteRejected += 1;
            };
          };

          // Update relations
          state.content2votes.put(content.id, vote.id);
          state.mods2votes.put(caller, vote.id);
          state.votes.put(vote.id, vote);

          // Evaluate and send notification to provider
          await evaluateVotes(content, voteApproved, voteRejected);
          return "Vote successful";
        };
        case(_)( throw Error.reject("Content does not exist"));
        }; 
        return "";         
      };

  public query({ caller }) func getActivity(isComplete: Bool) : async [Activity] {
    switch (AuthManager.checkProfilePermission(caller, #getActivity, state)) {
      case (#err(e)) { throw Error.reject("Unauthorized"); };
      case (_) ();
    };
      let buf = Buffer.Buffer<Types.Activity>(0);
      label l for (vid in state.mods2votes.get0(caller).vals()) {
        switch(state.votes.get(vid)) {
          case (?vote) {
            switch(state.content.get(vote.contentId)) {
              case (?content) {
                // Filter out wrong results
                if(content.status == #new and isComplete == true) {
                  continue l;
                } else if(content.status != #new and isComplete == false) {
                  continue l;
                };
                switch(state.providers.get(content.providerId)) {
                  case(?provider) {
                    let voteCount = getVoteCount(content.id, ?caller);

                    let item : Activity = {
                        vote = vote;
                        providerId = content.providerId;
                        providerName =  provider.name;
                        contentType = content.contentType;    
                        status =  content.status;
                        title = content.title;
                        createdAt = content.createdAt;
                        updatedAt = content.updatedAt;
                        voteCount = Nat.max(voteCount.approvedCount, voteCount.rejectedCount);
                        minVotes = provider.settings.minVotes;
                        minStake = provider.settings.minStaked;
                        rewardRelease = Helpers.timeNow();
                        reward = do  {
                          switch(isComplete == true) {
                            case(true) {
                              switch(vote.decision == content.status) {
                                case(true) Float.fromInt(provider.settings.minStaked);
                                case(false) -1 * Float.fromInt(provider.settings.minStaked);
                              };
                            };
                            case(false) 0;
                          };
                        }; 
                    };
                    buf.add(item);
                };
                case(_) throw Error.reject("Provider does not exist");
                };
              };
              case(_) throw Error.reject("Content does not exist"); 
          };          
        };
        case (_) throw Error.reject("Vote does not exist");
      };    
    };
    return buf.toArray();
  };
  
  private func evaluateVotes(content: Content, aCount: Nat, rCount: Nat) : async() {
    var finishedVote = false;
    var status : Types.ContentStatus = #new;
    var decision : Decision = #approved;

    switch(state.providers.get(content.providerId)) {
      case(?provider) {
        var minVotes = provider.settings.minVotes;
        if(aCount >= minVotes) {
          // Approved
          finishedVote := true;
          status := #approved;
          decision := #approved;
          state.contentNew.delete(content.providerId, content.id);
          state.contentApproved.put(content.providerId, content.id);
        } else if ( rCount >= minVotes) {
          // Rejected
          status := #rejected;
          decision := #rejected;
          finishedVote := true;
          state.contentNew.delete(content.providerId, content.id);
          state.contentRejected.put(content.providerId, content.id);
        } else {
          return;
        };

        if(finishedVote) {
          // Reward / Slash voters ;                      
            await tokens.voteFinalization(
                initializer, 
                decision, 
                state.content2votes.get0(content.id), 
                provider.settings.minStaked, // TODO: Change this to a percentage
                state
            );              
          };

          // Update content status
          state.content.put(content.id, {
                id = content.id;
                providerId = content.providerId;
                contentType = content.contentType;
                status = status;
                sourceId = content.sourceId;
                title = content.title;
                createdAt = content.createdAt;
                updatedAt = Helpers.timeNow();
          });

            // Call the providers callback
            switch(state.providerSubs.get(content.providerId)){
              case(?result){
                result.callback({
                  id = content.id;
                  sourceId = content.sourceId;
                  status = status;
                });
                Debug.print("Called callback for provider " # Principal.toText(content.providerId) );
              };
              case(_){
                Debug.print("Provider " # Principal.toText(content.providerId) # " has not subscribed a callback");
              }
            };
          };
          case(null) ();
      };
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

  public shared({ caller }) func votePohContent(packageId: Text, decision: Decision, violatedRules: [Types.PohRulesViolated]) : async () {
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

  private func createContentObj(sourceId: Text, caller: Principal, contentType: Types.ContentType, title: ?Text): Content {
    let now = Helpers.timeNow();
    let content : Content  = {
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

  private func getContentPlus(contentId: ContentId, caller: ?Principal) : ?ContentPlus {
    switch(state.content.get(contentId)) {
          case (?content) {
            let voteCount = getVoteCount(contentId, caller);
            switch (state.providers.get(content.providerId)){
              case(?provider) {
                let result : ContentPlus = {
                        id = content.id;
                        providerName = provider.name;
                        minStake = provider.settings.minStaked;
                        minVotes = provider.settings.minVotes;
                        voteCount = Nat.max(voteCount.approvedCount, voteCount.rejectedCount);
                        hasVoted = ?voteCount.hasVoted;
                        providerId = content.providerId;
                        contentType = content.contentType;
                        status = content.status;
                        sourceId = content.sourceId;
                        title = content.title;
                        createdAt = content.createdAt; 
                        updatedAt = content.updatedAt; 
                        text = do  ?{
                          switch(state.textContent.get(content.id)) {
                            case(?x) x.text;
                            case(_) "";
                          };
                        };
                        image = do  ?{
                          switch(state.imageContent.get(content.id)) {
                            case(?x) x.image;
                            case(null) { 
                                { data = []; imageType = ""};
                            };
                          };
                        };
                      };
                return ?result;
              };
            case(_) null;
            };
          };
          case (_) null;
    };
  };

 private func validateRules(contentId: ContentId, violatedRules: [Types.RuleId]) : Bool {
    if(violatedRules.size() == 0) {
      return false;
    };

    switch(state.content.get(contentId)){
      case(?content) {
        for(rule in violatedRules.vals()){
          let isMember : Bool = state.provider2rules.isMember(content.providerId, rule);
          if(isMember != true) {
            return false;
          };
        };
      };
      case(_) { 
        return false;
      }
    };

    return true;
 };

 private func getVoteCount(contentId: ContentId, caller: ?Principal) : Types.VoteCount {
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

 private func compareContent(a : ContentPlus, b: ContentPlus) : Order.Order {
      if(a.updatedAt > b.updatedAt) {
        #greater;
      } else if ( a.updatedAt < b.updatedAt) {
        #less;
      } else {
        #equal;
      }
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
