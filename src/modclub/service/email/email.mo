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

import Content "../queue/state";
import EmailState "./state";
import GlobalState "../../statev2";
import Helpers "../../../common/helpers";
import PohStateV2 "../poh/statev2";
import PohTypes "../poh/types";
import VoteStateV3 "../vote/pohVoteState";

module EmailModule {

  // Time in milliseconds equivalent to 5 minutes
  let FIVE_MINUTES_IN_MS : Int = 300_000;

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

    // This function filters out the new content created within the last 5 minutes.
    public func filterNewContent(
      contentIds : HashMap.HashMap<Text, ?Text>,
      globalState : GlobalState.State,
      pohState : ?PohStateV2.PohState,
      currentTime : Int
    ) : HashMap.HashMap<Text, ?Text> {
      var newContent = HashMap.HashMap<Text, ?Text>(1, Text.equal, Text.hash);

      for (contentId in contentIds.keys()) {
        // Determine the source of the content based on whether it's a PoH content or not
        let createdAtTime = switch (pohState) {
          // If it's a PoH content, get the createdAt time from pohChallengePackage
          case (?poh) {
            switch (poh.pohChallengePackages.get(contentId)) {
              case (null) null;
              case (?pohChallengePackage) ?pohChallengePackage.createdAt;
            };
          };
          // Otherwise, get the content from globalState and use its createdAt time
          case null {
            switch (globalState.content.get(contentId)) {
              case (null) null;
              case (?content) ?content.createdAt;
            };
          };
        };
        // Check if the content or pohChallengePackage was created within the last 5 minutes
        switch (createdAtTime) {
          case (null)();
          case (?createdAt) {
            if (createdAt > currentTime - FIVE_MINUTES_IN_MS and createdAt <= currentTime) {
              newContent.put(contentId, null);
            };
          };
        };
      };

      // TODO: Move filtering of already voted content here

      return newContent;
    };

    public func getModeratorEmailsForContent(contentState : Content.QueueState, globalState : GlobalState.State, isRandomized : Bool) : HashMap.HashMap<Text, Nat> {
      var userEmailIDs = HashMap.HashMap<Text, Nat>(1, Text.equal, Text.hash);
      let currentTime = Time.now() / 1000000;

      if (not isRandomized) {
        let newContent = filterNewContent(contentState.allNewContentQueue, globalState, null, currentTime);
        let newContentAmount = newContent.size();
        userEmailIDs := Helpers.getEmailsForNotifs(globalState, state.usersToReceiveEmailAlerts, newContentAmount, null);
        return userEmailIDs;
      };

      for ((qId, contentMap) in contentState.newContentQueues.entries()) {
        let newContent = filterNewContent(contentMap, globalState, null, currentTime);
        if (newContent.size() != 0) {
          for ((userID, userQID) in contentState.userId2QueueId.entries()) {
            if (userQID == qId) {
              var totalUserContents : Nat = newContent.size();
              for (contentID in newContent.keys()) {
                let userVoteId = Helpers.getContentVoteId(userID, contentID);
                for (vId in globalState.content2votes.get0(contentID).vals()) {
                  if (Text.equal(vId, userVoteId)) {
                    totalUserContents := totalUserContents - 1;
                  };
                };
              };
              if (totalUserContents > 0) {
                switch (state.usersToReceiveEmailAlerts.get(userID)) {
                  case (null)();
                  case (?userWantsToReceiveAlerts) {
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

    public func getModeratorEmailsForPOH(
      voteState : VoteStateV3.PohVoteState,
      pohContentState : Content.QueueState,
      globalState : GlobalState.State,
      pohState : PohStateV2.PohState,
      seniorMods : Buffer.Buffer<Principal>,
      isRandomized : Bool
    ) : HashMap.HashMap<Text, Nat> {
      var userEmailIDs = HashMap.HashMap<Text, Nat>(1, Text.equal, Text.hash);
      let currentTime = Time.now() / 1000000;

      if (not isRandomized) {
        let newContent = filterNewContent(pohContentState.allNewContentQueue, globalState, ?pohState, currentTime);
        let newContentAmount = newContent.size();
        userEmailIDs := Helpers.getEmailsForNotifs(globalState, state.usersToReceiveEmailAlerts, newContentAmount, ?seniorMods);

        return userEmailIDs;
      };
      for ((qId, contentMap) in pohContentState.newContentQueues.entries()) {
        let newContent = filterNewContent(pohContentState.allNewContentQueue, globalState, ?pohState, currentTime);
        // Proceed further if there is content in present queue
        if (newContent.size() != 0) {
          for ((userID, userQID) in pohContentState.userId2QueueId.entries()) {
            if (Buffer.contains<Principal>(seniorMods, userID, Principal.equal)) {
              // If current queueID matches with current user's queue then proceed further for that user
              if (userQID == qId) {
                var totalUserContents : Nat = newContent.size();
                for (contentID in newContent.keys()) {
                  for (voteID in voteState.pohContent2votes.get0(contentID).vals()) {
                    for (votedUserID in voteState.mods2Pohvotes.get1(voteID).vals()) {
                      totalUserContents := totalUserContents - 1;
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
      };
      return userEmailIDs;
    };
  };
};
