import Array "mo:base/Array";
import Base32 "mo:encoding/Base32";
import Blob "mo:base/Blob";
import Bool "mo:base/Bool";
import Buffer "mo:base/Buffer";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import Helpers "./helpers";
import IC "./remote_canisters/IC";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import ModClubParam "service/parameters/params";
import ModClubParams "./service/parameters/params";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Order "mo:base/Order";
import Random "mo:base/Random";
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
import Prim "mo:prim";
import Token "./token";
import TrieSet "mo:base/TrieSet";
import Types "./types";
import VoteManager "./service/vote/vote";
import VoteState "./service/vote/state";


import Canistergeek "./canistergeek/canistergeek";


shared ({caller = initializer}) actor class ModClub () = this {

  // Constants
  let MAX_WAIT_LIST_SIZE = 20000; // In case someone spams us, limit the waitlist
  let DEFAULT_MIN_VOTES = 2;
  let DEFAULT_MIN_STAKED = 0;
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
  type VerifyHumanityResponse = PohTypes.VerifyHumanityResponse;


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
  // Will be updated with this in postupgrade. Motoko not allowing to use "this" here
  var storageSolution = StorageSolution.StorageSolution(storageStateStable, initializer, initializer, signingKey);

  stable var pohStableState = PohState.emptyStableState();
  var pohEngine = POH.PohEngine(pohStableState);

  stable var pohVoteStableState = VoteState.emptyStableState();
  var voteManager = VoteManager.VoteManager(pohVoteStableState);

  stable var _canistergeekMonitorUD: ? Canistergeek.UpgradeData = null;
  private let canistergeekMonitor = Canistergeek.Monitor();

  func onlyOwner(p: Principal) : async() {
    if( p != initializer) throw Error.reject( "unauthorized" );
  };

  public shared({ caller }) func toggleAllowSubmission(allow: Bool) : async () {
    await onlyOwner(caller);
    allowSubmissionFlag := allow;
  };

  public shared({ caller }) func addToApprovedUser(userId: Principal) : async () {
    await onlyOwner(caller);
    voteManager.addToAutoApprovedPOHUser(userId);
  };

  public shared({ caller }) func generateSigningKey() : async () {
    await onlyOwner(caller);
    switch(Helpers.encodeNat8ArraytoBase32(Blob.toArray(await Random.blob()))) {
      case(null){throw Error.reject("Couldn't generate key");};
      case(?key) {
        signingKey := key;
        await storageSolution.setSigningKey(signingKey);
      };
    };
  };

  // Airdrop Methods
  public shared({ caller }) func airdropRegister() : async AirdropUser {
    Debug.print("AirdropRegister");
    Debug.print(Principal.toText(caller));  
    switch(state.airdropUsers.get(caller)) {
      case(?result) {
        throw Error.reject("You are already registered for airdrop");
      };
      case(null) {
        let user: AirdropUser = {
          id = caller;
          createdAt = Helpers.timeNow();
        };
        state.airdropUsers.put(caller, user);
        return user;
      };
    };
  };

  public shared({ caller }) func isAirdropRegistered() : async AirdropUser {
    Debug.print("isAirdropRegistered");
    Debug.print(Principal.toText(caller));  
    switch(state.airdropUsers.get(caller)) {
      case(?result) {
        return result;
      };
      case(null) {
        throw Error.reject("User not registered");
      };
    };
  };

  public shared({ caller }) func getAirdropUsers() : async [AirdropUser] {
    await onlyOwner(caller);
    let buf = Buffer.Buffer<AirdropUser>(0);      
      for ( (id, u) in state.airdropUsers.entries()) {        
        buf.add(u);                        
      }; 
    return Array.sort(buf.toArray(), compareUsers);
  };

  // Add principals to airdropWhitelist
  public shared({ caller }) func addToAirdropWhitelist(pids: [Principal]) : async () {
    await onlyOwner(caller);
    for ( pid in pids.vals()) {
      state.airdropWhitelist.put(pid, pid);
    };
  };

  // Get airdropWhitelist entries
  public shared({ caller }) func getAirdropWhitelist() : async [Principal] {
    await onlyOwner(caller);
    let buf = Buffer.Buffer<Principal>(0);      
      for ( (id, u) in state.airdropWhitelist.entries()) {        
        buf.add(u);                        
      };
    return buf.toArray();
  };

   private func compareUsers(a : AirdropUser, b: AirdropUser) : Order.Order {
      if(a.createdAt > b.createdAt) {
        #greater;
      } else if ( a.createdAt < b.createdAt) {
        #less;
      } else {
        #equal;
      }
    }; 

  // Provider functions
  // todo: Require cylces on provider registration, add provider imageURl, description 
  public shared({ caller }) func registerProvider(
    name: Text,
    description: Text,
    image: ?Image
    ) : async Text {
    // Todo remove this after airdrop
    // await onlyOwner(caller);
    switch(state.providers.get(caller)){
      case (null) {
        let now = Helpers.timeNow();
        state.providers.put(caller, {
          id = caller;
          name = name;
          description = description;
          image = image;
          createdAt = now;
          updatedAt = now;
          settings = {
            minVotes = DEFAULT_MIN_VOTES; // At least 2 votes required to finalize a decision
            minStaked = DEFAULT_MIN_STAKED; // Default amount staked, change when tokens are released
          };
        });
        return "Registration successful";
      };
       case (?result) return "Provider already registered";
    };
  };

  public shared({ caller }) func deregisterProvider() : async Text {
    switch(state.providers.get(caller)){
      case (null) {
        return "Provider does not exist";
      };
       case (?result) {
         state.providers.delete(caller);
         return "Provider deregistered";
       };
    };
  };



  public shared({ caller }) func updateSettings(settings: Types.ProviderSettings) : async () {
    // Todo remove this after airdrop
    // await onlyOwner(caller);
    var provider = state.providers.get(caller);
    switch(provider) {
      case (?result) {
        let now = Helpers.timeNow();
        // Update the providers settings
        state.providers.put(caller, {
              id = caller;
              name = result.name;
              description = result.description;
              image = result.image;
              createdAt = result.createdAt;
              updatedAt = now;
              settings = settings;
        });
      };
      case(null) ();
    };

    // todo: Re-evaluate all new content with votes to determine if a potential decision can be made 
  };

  public query func getProvider(providerId: Principal) : async ProviderPlus {
    switch(state.providers.get(providerId)){
      case(?provider) {      
      let result : ProviderPlus = {
        id = provider.id;
        name = provider.name;
        description = provider.description;
        image = provider.image;
        createdAt = provider.createdAt;
        updatedAt = provider.updatedAt;
        settings = provider.settings;
        rules = getProviderRules(providerId);
        contentCount = state.provider2content.get0Size(provider.id); 
        activeCount = 100; // Todo calculate active content count
        rewardsSpent = 5000; // Todo calculate rewards spent           
        };
        return result;
      };
      case(null) {
        throw Error.reject( "Provider does not exist" );         
      };
    };
  };

  public shared({ caller }) func addRules(rules: [Text]) {
    // await onlyOwner(caller);
    await checkProviderPermission(caller);
    for(rule in rules.vals()) {
      var ruleId = generateId(caller, "rule");       
      state.rules.put(ruleId, {
        id = ruleId;
        description = rule;
      });
      state.provider2rules.put(caller, ruleId);
    };
  };

  public shared({ caller }) func removeRules(ruleIds: [Types.RuleId]) {
    for(ruleId in ruleIds.vals()) {
      state.provider2rules.delete(caller, ruleId);
    };
  };

  // Subscribe function for providers to register their callback after a vote decision has been made
  public shared({caller}) func subscribe(sub: SubscribeMessage) : async() {
    await checkProviderPermission(caller);
    Debug.print(Principal.toText(caller) # " subscribed" );
    state.providerSubs.put(caller, sub);
  };

  public query({caller}) func getContent(id: Text) : async ?ContentPlus {
      return getContentPlus(id, ?caller);  
  };

  func checkProviderPermission(p: Principal) : async () {
    switch(state.providers.get(p)){
      case (null) throw Error.reject("unauthorized");
      case(_) ();
    };
  };

  private func checkProviderAdminPermission(p: Principal, admin: Principal) : async Types.ProviderResult {
      switch(state.providerAdmins.get(p)) {
        case (null) return #err(#NotFound);
        case (?adminMap) {
          switch(adminMap.get(admin)) {
            case (null) return #err(#Unauthorized);
            case(?_) {
              return #ok();
            };
          };
        };
      };
  };


  public shared({ caller }) func submitText(sourceId: Text, text: Text, title: ?Text ) : async Text {
    if(allowSubmissionFlag == false) {
      throw Error.reject("Submissions are disabled");
    };

    await checkProviderPermission(caller);
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
      await checkProviderPermission(caller);
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
  
  // Moderator functions

  public query({ caller }) func getAllContent(status: Types.ContentStatus) : async [ContentPlus] {
     switch(checkProfilePermission(caller, #getContent)){
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

  func checkProfilePermission(p: Principal, action: Types.Action) : Result.Result<(), Types.Error>{
    var unauthorized = true;

    // Anonymous principal 
    if(Principal.toText(p) == "2vxsx-fae") {
        Debug.print("Anonymous principal");
       return #err(#Unauthorized);
    };
    switch(state.profiles.get(p)){
      case (null) ();
      case(?result) {
        switch(action) {
          case(#vote) {
            if(result.role == #moderator) unauthorized := false;
          };
          case(#getProfile) {
            if(result.role == #moderator) unauthorized := false;
          };
          case(#getContent) {
            if(result.role == #moderator) unauthorized := false;
          };
          case(#getRules) {
            if(result.role == #moderator) unauthorized := false;
          };
          case(#getActivity) {
            if(result.role == #moderator) unauthorized := false;
          };         
          case(_) ();
        };
      };
    };
    if(unauthorized) {
      Debug.print("Unauthorized");
      return #err(#Unauthorized);
    };
    #ok();
  }; 

  public shared({ caller }) func registerModerator(userName: Text, email: Text, pic: ?Image) : async Profile {
       // Anonymous principal 
      if(Principal.toText(caller) == "2vxsx-fae") {
          throw Error.reject("Unauthorized, user does not have an identity");
      };

      switch(state.airdropWhitelist.get(caller)){
        case(null) throw Error.reject("Unauthorized: user is not in the airdrop whitelist");
        case(_) ();
      };

      Debug.print("Registering moderator");
      var _userName = Text.trim(userName, #text " ");
      var _email = Text.trim(email, #text " ");
      if(_email.size() > 320) 
        throw Error.reject("Invalid email, too long");
      if(_userName.size() > 64 or _userName.size() < 3) 
        throw Error.reject("Username length must be longer than 3 and less than 64 characters");

      switch(pic){
        case(null) ();
        case(?result) {
            Debug.print(debug_show(result));
        };
      };


      // Check if already registered
      switch(state.profiles.get(caller)){
        case (null) {
          switch( await checkUsernameAvailable(userName) ) {
            case(true) {
              let now = Helpers.timeNow();
              let profile : Profile = {
                id = caller;
                userName = _userName;
                pic = pic;
                role = #moderator; 
                email = _email;
                createdAt = now;
                updatedAt = now;
              };
              // Todo: Remove this after testnet
              // Give new users MOD points
              await tokens.transfer(initializer, caller, DEFAULT_TEST_TOKENS);
              state.profiles.put(caller, profile);
              await storageSolution.registerModerators([caller]);
              return profile;
            };
            case(false) throw Error.reject("username already taken");
          };
        };
        case (?result) throw Error.reject("Already registered");
      }
  };

  public query({ caller }) func getProfile() : async Profile {    
      Debug.print("getProfile for principal ID " # Principal.toText(caller) );
      switch(state.profiles.get(caller)){
        case (null) throw Error.reject("profile not found");
        case (?result) return result;
      };
  };

  public query func getProfileById(pid: Principal) : async Profile {    
      Debug.print("getProfile for principal ID " # Principal.toText(pid) );
      switch(state.profiles.get(pid)){
        case (null) throw Error.reject("profile not found");
        case (?result) return result;
      };
  };

  public query func getAllProfiles() : async [Profile] {
      let buf = Buffer.Buffer<Profile>(0);
      for ( (pid, p) in state.profiles.entries()) {
        Debug.print("getAllProfiles pid " # Principal.toText(pid) );
        buf.add(p);                        
      }; 
      return buf.toArray();
  };

  public query func getModeratorLeaderboard(start: Nat, end: Nat) : async [ModeratorLeaderboard] {
      let rewardsEarnedBuffer = Buffer.Buffer<RewardsEarnedMap>(0);
      for ( (pid, p) in state.profiles.entries()) {
        let holdings = tokens.getHoldings(p.id);
        rewardsEarnedBuffer.add({
          rewardsEarned = holdings.pendingRewards;
          userId = p.id;
        });
      };
      let sortedArray = Array.sort(
        rewardsEarnedBuffer.toArray(), 
        func (a: RewardsEarnedMap, b: RewardsEarnedMap) : { #less; #equal; #greater } {
          if (a.rewardsEarned > b.rewardsEarned) { #less }
          else if (a.rewardsEarned == b.rewardsEarned) { #equal }
          else { #greater }
        }
      );

      let buf = Buffer.Buffer<ModeratorLeaderboard>(0);
      var i: Nat = start;
      while (i < end and i < sortedArray.size()) {
        let pid = sortedArray[i].userId;
        let rewardsEarned = sortedArray[i].rewardsEarned;
        let profile = state.profiles.get(pid);

        switch (profile) {
          case (?p) {
            Debug.print("getModeratorLeaderboard pid " # Principal.toText(pid) );
            var correctVoteCount : Int = 0;
            var completedVoteCount : Int = 0;
            var lastVoted : Timestamp = 0;
            for (vid in state.mods2votes.get0(pid).vals()) {
              switch(state.votes.get(vid)) {
                case (?vote) {
                  switch(state.content.get(vote.contentId)) {
                    case (?content) {
                      if (content.status != #new) {
                        completedVoteCount := completedVoteCount + 1;
                        if (lastVoted == 0 or lastVoted < vote.createdAt) {
                          lastVoted := vote.createdAt;
                        };
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
            
            let item : ModeratorLeaderboard = {
                id = pid;
                userName = p.userName;
                completedVoteCount = completedVoteCount;
                rewardsEarned = rewardsEarned;
                performance = performance;
                lastVoted = ?lastVoted;
            };
            buf.add(item);
          };
          case (_) ();
        };

        i := i + 1;
      }; 
      return buf.toArray();
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
    
    switch (checkProfilePermission(caller, #vote)) {
      case (#err(e)) { throw Error.reject("Unauthorized"); };
      case (_) ();
    };

    let voteId = "vote-" # Principal.toText(caller) # contentId;
    switch(state.votes.get(voteId)){
      case(?v){
        throw Error.reject("You have already voted");
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
    switch (checkProfilePermission(caller, #getActivity)) {
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
  
  public query func getRules(providerId: Principal) : async [Types.Rule] {
    getProviderRules(providerId); 
  };

  public query func checkUsernameAvailable(userName_ : Text): async Bool {
    switch (state.usernames.get(userName_)) {
      case (?_) { /* error -- ID already taken. */ false };
      case null { /* ok, not taken yet. */ true };
    }
  };

  // Token Methods
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

  // POH Methods
  // Method called by provider
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

  // Method called by user on UI
  public shared({ caller }) func retrieveChallengesForUser(token: Text) : async Result.Result<[PohTypes.PohChallengesAttempt], PohTypes.PohError> {
    await pohEngine.retrieveChallengesForUser(caller, token, ["challenge-profile-pic", "challenge-user-video"]);
  };

  // Method called by user on UI
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
      let challengePackage = pohEngine.createChallengePackageForVoting(caller, providerChallenges, generateId);
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

  public shared({ caller }) func verifyUserHumanity() : async VerifyHumanityResponse {
    Debug.print("Verifying humanity called by: " # Principal.toText(caller));
    if(voteManager.isAutoApprovedPOHUser(caller)) {
      return {
        status = #verified;
        token = null;
      };
    } else {
      Debug.print("Calling pohVerificationRequest");
      let result = await pohVerificationRequest(caller);
      if(result.status != #verified) {
        return {
          status = result.status;
          token = ?(await pohGenerateUniqueToken(caller));
        };
      };
      return {status = result.status; token = null;};
    }
  };

  public shared({ caller }) func populateChallenges() : async () {
    Debug.print("Populating challenges called by: " # Principal.toText(caller));
    await onlyOwner(caller);
    pohEngine.populateChallenges();
  };

  public query({ caller }) func getPohTasks(status: Types.ContentStatus) : async [PohTypes.PohTaskPlus] {
    switch(checkProfilePermission(caller, #getContent)){
      case(#err(e)) {
        throw Error.reject("Unauthorized");
      };
      case(_)();
    };
    if(pohVerificationRequestHelper(caller, initializer).status != #verified) {
      throw Error.reject("Proof of Humanity not completed user");
    };
    let pohTaskIds = voteManager.getTasksId(status, 20);
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
    switch(checkProfilePermission(caller, #getContent)){
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

  public shared({ caller }) func votePohContent(packageId: Text, decision: Decision, violatedRules: [Types.PohRulesViolated]) : async () {
    switch(checkProfilePermission(caller, #vote)){
      case(#err(e)) {
        throw Error.reject("Unauthorized");
      };
      case(_)();
    };
    if((await pohVerificationRequest(caller)).status != #verified) {
      throw Error.reject("Proof of Humanity not completed user");
    };
    let holdings = tokens.getHoldings(caller);
    if( holdings.stake < ModClubParams.MIN_STAKE_POH) { 
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
    switch(checkProfilePermission(caller, #vote)){
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
    await onlyOwner(caller);
    await generateSigningKey();
    await populateChallenges();
  };

  private func getProviderRules(providerId: Principal) : [Rule] {
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
        switch(await checkProviderAdminPermission(_providerId, caller)) {
          case (#err(error)) return #err(error);
          case (#ok()) authorized := true;
        };
      };

    if(authorized == false) return #err(#Unauthorized);

    // Add the user to the provider admin list
    let now = Helpers.timeNow();

    let adminProfile : Profile = {
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

  private func createContentObj(sourceId: Text, caller: Principal, contentType: Types.ContentType, title: ?Text): Content {
    let now = Helpers.timeNow();
    let content : Content  = {
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

  func getModerators() : [Principal] {
    let moderatorIds = Buffer.Buffer<Principal>(1);
    for((id, profile) in state.profiles.entries()) {
      if(profile.role == #moderator) {
        Debug.print("Moderator: " # Principal.toText(id));
        moderatorIds.add(id);
      };
    };
    return moderatorIds.toArray();
  };
  // Upgrade logic / code
  stable var stateShared : State.StateShared = State.emptyShared();

  system func preupgrade() {
    Debug.print("MODCLUB PREUPGRRADE");
    Debug.print("MODCLUB PREUPGRRADE");
    stateShared := State.fromState(state);
    tokensStable := tokens.getStable();

    storageStateStable := storageSolution.getStableState();
    pohStableState := pohEngine.getStableState();
    pohVoteStableState := voteManager.getStableState();
    _canistergeekMonitorUD := ? canistergeekMonitor.preupgrade();
    Debug.print("MODCLUB PREUPGRRADE FINISHED");
  };

  system func postupgrade() {
    // Reinitializing storage Solution to add this actor as a controller
    storageSolution := StorageSolution.StorageSolution(storageStateStable, initializer, Principal.fromActor(this), signingKey);
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
    storageSolution.setInitialModerators(getModerators());
    canistergeekMonitor.postupgrade(_canistergeekMonitorUD);
    _canistergeekMonitorUD := null;
    Debug.print("MODCLUB POSTUPGRADE FINISHED");
  };

  // Uncomment when required
  // system func heartbeat() : async () {};

};


