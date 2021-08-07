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

shared ({caller = initializer}) actor class ModClub () {

  // Vars
  var minVotes = 1;
  var maxWaitListSize = 20000;
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

  // todo: Require cylces on provider registration
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

  public shared({caller}) func subscribe(sub: SubscribeMessage) : async() {
    await checkProviderPermission(caller);
    state.providerSubs.put(caller, sub);
  };

  public query func getAllContent() : async [Content] {
     let buf = Buffer.Buffer<Content>(0);
     for( (id, content) in state.content.entries()){
       buf.add(content);
     };
    return buf.toArray();
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

  public shared({ caller }) func submitText(sourceId: Text, text: Text, title: ?Text ) : async Text {
    await checkProviderPermission(caller);
    let now = timeNow_();
    let content : Content  = {
        id = Principal.toText(caller) # "-content-" # (Int.toText(now));
        providerId = caller;
        contentType = #text;
        status = #reviewRequired;
        sourceId = sourceId;
        title = title;
        createdAt= now;
        updateAt= now;
    };
    let textContent : TextContent = {
      id = content.id;
      text = text;
    };
      state.content.put(content.id, content);
      state.textContent.put(content.id, textContent);
      state.provider2content.put(caller, content.id);
      state.contentNew.put(caller, content.id);
      return content.id;
    };

  public query({ caller }) func getProviderContent() : async [ContentPlus] {
      let buf = Buffer.Buffer<ContentPlus>(0);
      for (cid in state.provider2content.get0(caller).vals()) {
        switch(state.content.get(cid)) {
          case (?result) {
            buf.add({
                    id = result.id;
                    providerId = result.providerId;
                    contentType = result.contentType;
                    status = result.status;
                    sourceId = result.sourceId;
                    title = result.title;
                    createdAt = result.createdAt;
                    updateAt = result.updateAt;
                    text = do  ?{
                      switch(state.textContent.get(result.id)) {
                        case(?x) x.text;
                        case(_) "";
                      };
                    };
                  });
          };
          case (_) ();
        };
      };
      buf.toArray();
  };
  
  // Moderator functions

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
        if(content.status != #reviewRequired) return "Content has already been reviewed";
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
          //todo: Eventually add rules that were broken
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
          state.mods2votes.put(caller, vote.id);
          state.votes.put(vote.id, vote);
          await evaluateVotes(content, voteApproved, voteRejected);
          return "Vote successful";
        };
        case(_)( return "Content does not exist");
        }; 
        return "";         
      };
  
  private func evaluateVotes(content: Content, aCount: Nat, rCount: Nat) : async() {
    var finishedVote = false;
    var status : Types.ContentStatus = #reviewRequired;
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

  func timeNow_() : Timestamp {
      Time.now() 
  };

  // Upgrade logic / code
  stable var stateShared : State.StateShared = State.emptyShared();

  system func preupgrade() {
    stateShared := State.fromState(state);
  };

  system func postupgrade() {
    state := State.toState(stateShared);
    stateShared := State.emptyShared();
  };
};
