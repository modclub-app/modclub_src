import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Types "./types";
import Int "mo:base/Int";
import Result "mo:base/Result";

import Array "mo:base/Array";
import Error "mo:base/Error";
import State "./state/state";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Buffer "mo:base/Buffer";

shared ({caller = initializer}) actor class ModClub () {

    // Vars
    let minVotes = 1;

    // Types
    type Content = Types.Content;
    type ContentPlus = Types.ContentPlus;
    type TextContent = Types.TextContent;
    type MultiTextContent = Types.MultiTextContent;
    type ImageUrlContent = Types.ImageUrl;
    type Profile = Types.Profile;
    type Timestamp = Types.Timestamp;
    type ContentId = Types.ContentId;

    let contentMap = HashMap.HashMap<Text, Content>(1, Text.equal, Text.hash );
    type UserId = Types.UserId;
    type Role = Types.Role;
    let profileMap =  HashMap.HashMap<UserId, Profile>(1, Principal.equal, Principal.hash);
    let waitList = HashMap.HashMap<Text, Text>(1, Text.equal, Text.hash);
    var maxWaitListSize = 20000;
    var state = State.empty();

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
        // state.contentNew.put(caller, )
        return "Registration successful";
      };
       case (?result) return "Provider already registered";
    };
  };

  public query({caller}) func getContent(id: Text) : async ?Content {
      // await checkProviderPermission(caller);
      return state.content.get(id);
  };

  func checkProviderPermission(p: Principal) : async () {
    switch(state.providers.get(p)){
      case (null) throw Error.reject("unauthorized");
      case(_) ();
    };
  }; 

  // private func changeStatus(oldStatus: Types)

  public shared({ caller }) func submitText(sourceId: Text, text: Text, title: ?Text ) : async Text {
    await checkProviderPermission(caller);
    let now = timeNow_();
    let content : Content  = {
        id = Principal.toText(caller) # "-content-" # (Int.toText(now));
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
      return content.id;
    };

  public query({ caller }) func getProviderContent() : async [ContentPlus] {
      let buf = Buffer.Buffer<ContentPlus>(0);
      for (cid in state.provider2content.get0(caller).vals()) {
        switch(state.content.get(cid)) {
          case (?result) buf.add({
                    id = result.id;
                    contentType = result.contentType;
                    status = result.status;
                    sourceId = result.sourceId;
                    title = result.title;
                    createdAt= result.createdAt;
                    updateAt= result.updateAt;
                    text = do ? {
                      switch(state.textContent.get(result.id)){
                        case(?x) x.text;
                        case(_) ("");
                      };
                    };
          });
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
