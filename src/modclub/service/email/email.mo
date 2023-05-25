import Bool "mo:base/Bool";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";

import EmailState "./state";
import GlobalState "../../statev2";
import PohTypes "../poh/types";
import VoteStateV2 "../vote/statev2";
import Content "../queue/state";
import PohStateV2 "../poh/statev2";

module EmailModule {

  public class EmailManager(stableState : EmailState.EmailStateStable) {

    var state : EmailState.EmailState = EmailState.getState(stableState);

    public func registerUserToReceiveAlerts(id : Principal, wantsToGetAlerts : Bool) : async Bool {
      if (wantsToGetAlerts == true) {
        switch (state.userQueueToReceiveAlerts.get(id)) {
          case (?result) {
            state.usersToReceiveEmailAlerts.put(id, true);
          };
          case (_) {};
        };
        state.userQueueToReceiveAlerts.delete(id);
        return true;
      } else {
        state.usersToReceiveEmailAlerts.delete(id);
        return true;
      };
      return false;
    };

    public func checkIfUserOptToReciveAlerts(id : Principal) : Bool {
      switch (state.usersToReceiveEmailAlerts.get(id)) {
        case (?result) {
          return true;
        };
        case (_) {
          return false;
        };
      };
      return false;
    };

    public func getAllUsersWantToReceiveAlerts() : [Text] {
      let userPrincipalBuff = Buffer.Buffer<Text>(0);
      for (user in state.usersToReceiveEmailAlerts.keys()) {
        userPrincipalBuff.add(Principal.toText(user));
      };
      return Buffer.toArray<Text>(userPrincipalBuff);
    };

    public func getAllUsersEmailWhoWantsToReceiveAlerts(globalState : GlobalState.State) : HashMap.HashMap<Text, ?Text> {
      let userEmailIDs = HashMap.HashMap<Text, ?Text>(1, Text.equal, Text.hash);
      for (userID in state.usersToReceiveEmailAlerts.keys()) {
        switch (globalState.profiles.get(userID)) {
          case (null)();
          case (?result) {
            userEmailIDs.put(result.email, null);
          };
        };
      };
      return userEmailIDs;
    };

    public func addUserToQueueToReceiveAlerts(userPrincipal : Principal) : async Bool {
      state.userQueueToReceiveAlerts.put(userPrincipal, true);
      return true;
    };

    public func sendVerificationEmail(userPrincipal : Principal, envForBaseURL : Text, globalState : GlobalState.State) : async Text {
      var userEmailToReturn : Text = "";
      var callResult : Bool = false;
      switch (globalState.profiles.get(userPrincipal)) {
        case (null)(
          throw Error.reject("User has not provided email id")
        );
        case (?result) {
          userEmailToReturn := result.email;
          state.userQueueToReceiveAlerts.put(userPrincipal, true);
        };
      };

      return userEmailToReturn;
    };

    public func getStableState() : EmailState.EmailStateStable {
      return EmailState.getStableState(state);
    };

    public func getModeratorEmailsForContent(voteState : VoteStateV2.PohVoteState, contentState : Content.QueueState, globalState : GlobalState.State) : HashMap.HashMap<Text, Nat> {
      let userEmailIDs = HashMap.HashMap<Text, Nat>(1, Text.equal, Text.hash);
      for ((qId, contentMap) in contentState.newContentQueues.entries()) {
        // Proceed further if there is content in present queue
        if (contentMap.size() != 0) {
          for ((userID, userQID) in contentState.userId2QueueId.entries()) {
            // If current queueID matches with current user's queue then proceed further for that user
            if (userQID == qId) {
              var totalUserContents : Nat = 0;
              for (contentID in contentMap.keys()) {
                switch (globalState.content.get(contentID)) {
                  case (null)();
                  case (?contentToCheck) {
                    let currentTime = Time.now() / 1000000;
                    if (contentToCheck.createdAt > currentTime -300000 and contentToCheck.createdAt < currentTime) {
                      totalUserContents := totalUserContents +1;
                      for (voteID in voteState.pohContent2votes.get0(contentID).vals()) {
                        for (votedUserID in voteState.mods2Pohvotes.get1(voteID).vals()) {
                          totalUserContents := totalUserContents -1;
                        };
                      };
                    };
                  };
                };
              };
              if (totalUserContents > 0) {
                // Check if current user opted in for email alerts
                switch (state.usersToReceiveEmailAlerts.get(userID)) {
                  case (null)();
                  case (?userWantsToReceiveAlerts) {
                    // If user opted in for email alerts
                    switch (globalState.profiles.get(userID)) {
                      case (null)();
                      case (?result) {
                        if (result.email != "") {
                          userEmailIDs.put(result.email, totalUserContents);
                        };
                      };
                    };
                  };
                };
              };
            };
          };
        };
      };
      return userEmailIDs;
    };
    public func getModeratorEmailsForPOH(voteState : VoteStateV2.PohVoteState, contentState : Content.QueueState, globalState : GlobalState.State, pohState : PohStateV2.PohState) : HashMap.HashMap<Text, Nat> {
      let userEmailIDs = HashMap.HashMap<Text, Nat>(1, Text.equal, Text.hash);
      for ((qId, contentMap) in contentState.newContentQueues.entries()) {
        // Proceed further if there is content in present queue
        if (contentMap.size() != 0) {
          for ((userID, userQID) in contentState.userId2QueueId.entries()) {
            // If current queueID matches with current user's queue then proceed further for that user
            if (userQID == qId) {
              var totalUserContents : Nat = 0;
              for (contentID in contentMap.keys()) {
                switch (pohState.pohChallengePackages.get(contentID)) {
                  case (null)();
                  case (?contentToCheck) {
                    let currentTime = Time.now() / 1000000;
                    if (contentToCheck.createdAt > currentTime -300000 and contentToCheck.createdAt < currentTime) {
                      totalUserContents := totalUserContents +1;
                      for (voteID in voteState.pohContent2votes.get0(contentID).vals()) {
                        for (votedUserID in voteState.mods2Pohvotes.get1(voteID).vals()) {
                          totalUserContents := totalUserContents -1;
                        };
                      };
                    };
                  };
                };
              };
              if (totalUserContents > 0) {
                // Check if current user opted in for email alerts
                switch (state.usersToReceiveEmailAlerts.get(userID)) {
                  case (null)();
                  case (?userWantsToReceiveAlerts) {
                    // If user opted in for email alerts
                    switch (globalState.profiles.get(userID)) {
                      case (null)();
                      case (?result) {
                        if (result.email != "") {
                          userEmailIDs.put(result.email, totalUserContents);
                        };
                      };
                    };
                  };
                };
              };
            };
          };
        };
      };
      return userEmailIDs;
    };
  };
};
