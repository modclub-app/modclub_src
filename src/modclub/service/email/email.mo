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

import AuthManager "../auth/auth";
import EmailState "./state";
import GlobalState "../../statev1";
import PohTypes "../poh/types";
import VoteState "../vote/state";

module EmailModule {

    public class EmailManager(stableState : EmailState.EmailStateStable) {

        var state : EmailState.EmailState = EmailState.getState(stableState);

        public func registerUserToReceiveAlerts(id : Principal, wantsToGetAlerts: Bool) : async Bool {
            if(wantsToGetAlerts == true){
                switch(state.userQueueToReceiveAlerts.get(id)){
                    case(?result){
                        state.usersToReceiveEmailAlerts.put(id, true);
                    };
                    case(_){};
                };
                state.userQueueToReceiveAlerts.delete(id);
                return true;
            }else{
                state.usersToReceiveEmailAlerts.delete(id);
                return true;
            };
            return false;
        };

        public func checkIfUserOptToReciveAlerts(id : Principal) : Bool {
            switch(state.usersToReceiveEmailAlerts.get(id)){
                case(?result){
                    return true;
                };
                case(_){ 
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
            return userPrincipalBuff.toArray();
        };

        public func getAllUsersEmailWhoWantsToReceiveAlerts(globalState: GlobalState.State) : HashMap.HashMap<Text, ?Text> {
            let userEmailIDs = HashMap.HashMap<Text, ?Text>(1, Text.equal, Text.hash);
            for (userID in state.usersToReceiveEmailAlerts.keys()) {
                switch(globalState.profiles.get(userID)) {
                    case(null)();
                    case (?result) {
                        userEmailIDs.put(result.email,null);
                    };
                };
            };
            return userEmailIDs;
        };

        public func addUserToQueueToReceiveAlerts(userPrincipal: Principal) : async Bool {
            state.userQueueToReceiveAlerts.put(userPrincipal, true);
            return true;
        };

        public func sendVerificationEmail(userPrincipal: Principal,envForBaseURL:Text,globalState: GlobalState.State) : async Text{
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

        public func getEmailsFromPackageID(newContents: HashMap.HashMap<Text, ?Text>, voteState: VoteState.PohVoteState, globalState: GlobalState.State, packages: HashMap.HashMap<Text, PohTypes.PohChallengePackage>, modClubAmins: List.List<Principal>) : HashMap.HashMap<Text, ?Text> { 
            let userEmailIDs = HashMap.HashMap<Text, ?Text>(1, Text.equal, Text.hash);
            for(packageID in newContents.keys()){
                let usersAlreadyVoted = HashMap.HashMap<Principal, Bool>(1, Principal.equal, Principal.hash);
                //Remove owner of the content
                switch(packages.get(packageID)){
                    case(null)();
                    case(?packageExist) { 
                        for(voteID in voteState.pohContent2votes.get0(packageID).vals()){
                            for(votedUserID in voteState.mods2Pohvotes.get1(voteID).vals()){
                                usersAlreadyVoted.put(votedUserID,true);
                            };
                        };
                    };
                };
                for(userID in state.usersToReceiveEmailAlerts.keys()){
                    var isPOHOwner = Text.startsWith(packageID,#text(Principal.toText(userID)));
                    switch(usersAlreadyVoted.get(userID)) {
                        case (?result) {
                            //Debug.print("User voted already" # Principal.toText(userID));
                        };
                        case (_) {
                            switch(globalState.profiles.get(userID)) {
                                case(null)();
                                case (?result) {
                                    // Add only non Admin users to map
                                    if(not AuthManager.isAdmin(userID, modClubAmins) and isPOHOwner == false) {
                                        userEmailIDs.put(result.email,null);
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