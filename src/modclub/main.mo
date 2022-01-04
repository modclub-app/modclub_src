import Array "mo:base/Array";

import Buffer "mo:base/Buffer";
import Error "mo:base/Error";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Bool "mo:base/Bool";
import State "./state";
import Text "mo:base/Text";
import Time "mo:base/Time";
import TrieSet "mo:base/TrieSet";
import Types "./types";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import Order "mo:base/Order";
import Blob "mo:base/Blob";
import Cycles "mo:base/ExperimentalCycles";

import Rel "data_structures/Rel";
import Token "./token";
import IC "./remote_canisters/IC";
import StorageState "./service/storage/storageState";
import POH "./service/poh/poh";
import PohTypes "./service/poh/types";
import PohState "./service/poh/state";

import storageSolution "./service/storage/storage";



shared ({caller = initializer}) actor class ModClub () = this {

  

  // Constants
  let MAX_WAIT_LIST_SIZE = 20000; // In case someone spams us, limit the waitlist
  let DEFAULT_MIN_VOTES = 2;
  let DEFAULT_MIN_STAKED = 0;
  let NANOS_PER_MILLI = 1000000;
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


  // Airdrop Flags
  stable var allowSubmissionFlag : Bool = true;
  // Global Objects  
  var state = State.empty();
  stable var tokensStable : Token.TokensStable = Token.emptyStable(initializer);
  var tokens = Token.Tokens(
        tokensStable
  );
  var bucketState = StorageState.empty();
  stable var bucketStateStable  = StorageState.emptyShared();

  var pohState = PohState.emptyStableState();
  var pohEngine = POH.PohEngine(pohState);


  func onlyOwner(p: Principal) : async() {
    if( p != initializer) throw Error.reject( "unauthorized" );
  };

  public shared({ caller }) func toggleAllowSubmission(allow: Bool) : async () {
    await onlyOwner(caller);
    allowSubmissionFlag := allow;
  };

  // Airdrop Methods
  public shared({ caller }) func airdropRegister() : async AirdropUser {
    Debug.print("AirdropRegister");
    Debug.print(Principal.toText(caller));  
    switch(state.airdropUsers.get(caller)) {
      case(?result) {
        throw Error.reject("User already registered for airdrop");
      };
      case(null) {
        let user: AirdropUser = {
          id = caller;
          createdAt = timeNow_();
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
        let now = timeNow_();
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
        let now = timeNow_();
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
          Debug.print("Anonymous principal");
          throw Error.reject("Unauthorized, user does not have an identity");
      };

      switch(state.airdropWhitelist.get(caller)){
        case(null) throw Error.reject("Unauthorized");
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
              let now = timeNow_();
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

  public query func getAllProfiles() : async [Profile] {
      let buf = Buffer.Buffer<Profile>(0);
      for ( (pid, p) in state.profiles.entries()) {
        Debug.print("getAllProfiles pid " # Principal.toText(pid) );
        buf.add(p);                        
      }; 
      return buf.toArray();
  };

  // Todo: Enable updating profile at a later time
  // public shared({ caller }) func updateProfile(userName: Text, email: Text, pic: ?Image) : async Profile {
  //     switch(state.profiles.get(caller)){
  //       case (null) throw Error.reject("profile not found");
  //       case (?result) {
  //         switch( await checkUsernameAvailable(userName) ) {
  //           case(true) {
  //             let now = timeNow_();
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
              createdAt = timeNow_();
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
                        reward = 1; // Todo: Calculate reward
                        rewardRelease = timeNow_();
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
                updatedAt = timeNow_();
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
  public shared({ caller }) func verifyForHumanity(providerUserId: Principal) : async PohTypes.PohVerificationResponse {
    let pohVerificationRequest: PohTypes.PohVerificationRequest = {
        requestId = (await pohEngine.generateUUID());
        providerUserId = providerUserId;
        providerId = caller;
    };
    // validity and rules needs to come from admin dashboard here
    await pohEngine.verifyForHumanity(pohVerificationRequest, 365, ["1", "2", "3"]);
  };
  
  // Method called by provider
  public shared({ caller }) func generateUniqueToken(providerUserId: Principal) : async PohTypes.PohUniqueToken {
    await pohEngine.generateUniqueToken(providerUserId, caller);
  };

  // Method called by user on UI
  public shared({ caller }) func retrieveChallengesForUser(token: Text) : async Result.Result<[PohTypes.PohChallengesAttempt], PohTypes.PohError> {
    await pohEngine.retrieveChallengesForUser(caller, token, ["1", "2", "3"]);
  };

  // Method called by user on UI
  public shared({ caller }) func submitChallengeData(pohDataRequest : PohTypes.PohChallengeSubmissionRequest) : async PohTypes.PohChallengeSubmissionResponse {
    let response = pohEngine.submitChallengeData(pohDataRequest, caller);
    return response;
  };

  // Method called by user on UI
  public shared({ caller }) func verifyUserHumanity() : async (PohTypes.PohChallengeStatus, ?PohTypes.PohUniqueToken)  {
    let response =  await verifyForHumanity(caller);
    if(response.challenges.size() == 0 ) {
      return (#notSubmitted, ?(await generateUniqueToken(caller)));
    };

    for(challenge in response.challenges.vals()) {
      if(challenge.status == #pending) {
        return (#pending, ?(await generateUniqueToken(caller)));
      } else if(challenge.status == #rejected) {
        return (#rejected, ?(await generateUniqueToken(caller)));
      } else if(challenge.status == #expired) {
        return (#expired, ?(await generateUniqueToken(caller)));
      }
    };

    return (#verified, null);
  };

  public shared({ caller }) func populateChallenges() : async () {
    pohEngine.populateChallenges();
  };

  // Helpers
  
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

  private func createContentObj(sourceId: Text, caller: Principal, contentType: Types.ContentType, title: ?Text): Content {
    let now = timeNow_();
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

 private func timeNow_() : Timestamp {
      Time.now()  / NANOS_PER_MILLI; // Convert to milliseconds
  };

  // Upgrade logic / code
  stable var stateShared : State.StateShared = State.emptyShared();
  

  system func preupgrade() {
    Debug.print("MODCLUB PREUPGRRADE");
    Debug.print("MODCLUB PREUPGRRADE");
    stateShared := State.fromState(state);
    tokensStable := tokens.getStable();
    bucketStateStable := StorageState.fromState(bucketState);
    Debug.print("MODCLUB PREUPGRRADE FINISHED");
  };

  system func postupgrade() {
    Debug.print("MODCLUB POSTUPGRADE");
    Debug.print("MODCLUB POSTUPGRADE");
    state := State.toState(stateShared);
    bucketState := StorageState.toState(bucketStateStable);
    Debug.print("MODCLUB POSTUPGRADE FINISHED");
  };

};
