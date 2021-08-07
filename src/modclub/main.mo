import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Error "mo:base/Error";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import State "./state/state";
import Text "mo:base/Text";
import Time "mo:base/Time";
import TrieSet "mo:base/TrieSet";
import Types "./types";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import Order "mo:base/Order";
import Rel "./state/Rel";

shared ({caller = initializer}) actor class ModClub () {

  // Vars
  var minVotes = 1; //todo: Temp var, will switch to provider defined rules in next release
  var maxWaitListSize = 20000; // In case someone spams us, limit the waitlist
  let waitList = HashMap.HashMap<Text, Text>(1, Text.equal, Text.hash);
  var state = State.empty();

  // Types
  type Content = Types.Content;
  type ContentPlus = Types.ContentPlus;
  type TextContent = Types.TextContent;
  type MultiTextContent = Types.MultiTextContent;
  type ImageUrlContent = Types.ImageUrl;
  type Profile = Types.Profile;
  type Timestamp = Types.Timestamp;
  type ContentId = Types.ContentId;
  type Decision = Types.Decision;
  type SubscribeMessage = Types.SubscribeMessage;
  type UserId = Types.UserId;
  type Role = Types.Role;

 // Waitlist functions
 public func addToWaitList(email : Text) : async Text {
      if(waitList.size() > maxWaitListSize) {
        return "Sorry, the waitlist is full";
      };
      switch (waitList.get(email)) {        
        case (?result) return "The email address " # email # " has already joined the waitlist";
        case (_) waitList.put(email, email);
      };
      return "Thank you for joining the waitlist";
    };
  
  public shared({ caller }) func getWaitList() : async [Text] {
    await checkPermission(caller);
    var result : [Text] = [];
    for( x in waitList.entries()) {
      result := Array.append<Text>(result, [x.1]);
    };
    return result;
  };

  func checkPermission(p: Principal) : async() {
    if( p != initializer) throw Error.reject( "unauthorized" );
  };

  // Provider functions
  // todo: Require cylces on provider registration, add provider imageURl, description 
  public shared({ caller }) func registerProvider(appName: Text) : async Text {
    switch(state.providers.get(caller)){
      case (null) {
        let now = timeNow_();
        state.providers.put(caller, {
          id = caller;
          appName = appName;
          createdAt = now;
          updatedAt = now;
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

  // Subscribe function for providers to register their callback after a vote decision has been made
  public shared({caller}) func subscribe(sub: SubscribeMessage) : async() {
    await checkProviderPermission(caller);
    Debug.print(Principal.toText(caller) # " subscribed" );
    state.providerSubs.put(caller, sub);
  };

  public query({caller}) func getContent(id: Text) : async ?Content {
      return state.content.get(id);
  };

  func checkProviderPermission(p: Principal) : async () {
    switch(state.providers.get(p)){
      case (null) throw Error.reject("unauthorized");
      case(_) ();
    };
  };

  public shared({ caller }) func submitText(sourceId: Text, text: Text, title: ?Text ) : async Text {
    await checkProviderPermission(caller);
    let now = timeNow_();
    let content : Content  = {
        id = Principal.toText(caller) # "-content-" # (Int.toText(now));
        providerId = caller;
        contentType = #text;
        status = #new;
        sourceId = sourceId;
        title = title;
        createdAt= now;
        updateAt= now;
    };
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

  // Retreives all content for the calling Provider
  public query({ caller }) func getProviderContent() : async [ContentPlus] {
      let buf = Buffer.Buffer<ContentPlus>(0);
      for (cid in state.provider2content.get0(caller).vals()) {
        switch(getContentPlus((cid))) {
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
     var contentRel : ?Rel.Rel<Principal, Types.ContentId> = null;
     let buf = Buffer.Buffer<ContentPlus>(0);
     for ( (pid, p) in state.providers.entries()){
       switch(status){
         case(#new){
          for(cid in state.contentNew.get0(pid).vals()){
            switch(getContentPlus((cid))) {
              case (?result) {
                buf.add(result);
              };
              case (_) ();
              };
          };
         };
         case(#approved){
          for(cid in state.contentApproved.get0(pid).vals()){
            switch(getContentPlus((cid))) {
              case (?result) {
                buf.add(result);
              };
              case (_) ();
              };
          };
         };
         case(#rejected){
          for(cid in state.contentRejected.get0(pid).vals()){
            switch(getContentPlus((cid))) {
              case (?result) {
                buf.add(result);
              };
              case (_) ();
              };
          };
         };
       };
     };
    return Array.sort(buf.toArray(), compareContent);
  };

  func checkProfilePermission(p: Principal, action: Types.Action) : async () {
    var unauthorized = true;
    switch(state.profiles.get(p)){
      case (null) ();
      case(?result) {
        switch(action) {
          case(#vote) {
            if(result.role == #moderator) unauthorized := false;
          }; case(_) ();
        };
      };
    };
    if(unauthorized) throw Error.reject("unauthorized");
  }; 

  public shared({ caller }) func registerModerator(userName: Text, picUrl: ?Text) : async Text {
      // Check if already registered
      switch(state.profiles.get(caller)){
        case (null) {
          let now = timeNow_();
          state.profiles.put(caller, {
            id=caller;
            userName= userName;
            picUrl = picUrl;
            createdAt = now;
            updatedAt = now;
            role = #moderator;
          });
          return "Registered successfully"; 
        };
        case (?result) return "Already registered";
      }
  };

  public shared({ caller }) func vote(contentId: ContentId, decision: Decision) : async Text {
    await checkProfilePermission(caller, #vote);
    let voteId = "vote-" # Principal.toText(caller) # contentId;
    switch(state.votes.get(voteId)){
      case(?v){
        return "User already voted";
      };
      case(_)();
    };

    switch(state.content.get(contentId)){
      case(?content) {
        if(content.status != #new) return "Content has already been reviewed";
        var voteApproved : Nat = 0;
        var voteRejected : Nat = 0;
        for(vid in state.content2votes.get0(contentId).vals()){
              switch(state.votes.get(vid)){
                case(?v){
                  if(v.decision == #approved){
                    voteApproved += 1;
                  } else {
                    voteRejected += 1;
                  };
                }; 
                case(_) ();
              };
          };
          //todo: Eventually accept rules that this content broke
          let vote : Types.Vote = {
              id = voteId;
              contentId =  contentId;
              userId = caller;
              decision = decision; 
              rulesBroken = null;
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
        case(_)( return "Content does not exist");
        }; 
        return "";         
      };
  
  private func evaluateVotes(content: Content, aCount: Nat, rCount: Nat) : async() {
    var finishedVote = false;
    var status : Types.ContentStatus = #new;
    // todo: Get the rules for this provider to determine if the votes have passed or not
    if(aCount >= minVotes) {
      // Approved
      finishedVote := true;
      status := #approved;
      state.contentNew.delete(content.providerId, content.id);
      state.contentApproved.put(content.providerId, content.id);
    } else if ( rCount >= minVotes) {
      // Rejected
      status := #rejected;
      finishedVote := true;
      state.contentNew.delete(content.providerId, content.id);
      state.contentRejected.put(content.providerId, content.id);
    } else {
      return;
    };

    if(finishedVote) {
      state.content.put(content.id, {
            id = content.id;
            providerId = content.providerId;
            contentType = content.contentType;
            status = status;
            sourceId = content.sourceId;
            title = content.title;
            createdAt = content.createdAt;
            updateAt = timeNow_();
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
      }
    }
  };

  // Helpers

  private func getContentPlus(contentId: ContentId) : ?ContentPlus {
    switch(state.content.get(contentId)) {
          case (?result) {
            let content : ContentPlus = {
                    id = result.id;
                    providerId = result.providerId;
                    contentType = result.contentType;
                    status = result.status;
                    sourceId = result.sourceId;
                    title = result.title;
                    createdAt = result.createdAt;
                    updatedAt = result.updateAt;
                    text = do  ?{
                      switch(state.textContent.get(result.id)) {
                        case(?x) x.text;
                        case(_) "";
                      };
                    };
                  };
            return ?content;
          };
          case (_) null;
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
      Time.now() 
  };

  // Upgrade logic / code
  stable var stateShared : State.StateShared = State.emptyShared();

  system func preupgrade() {
    stateShared := State.fromState(state);
    Debug.print("MODCLUB PREUPGRRADE");
  };

  system func postupgrade() {
    state := State.empty();
    state := State.toState(stateShared);
    stateShared := State.emptyShared();
    Debug.print("MODCLUB POSTUPGRADE");
  };
};
