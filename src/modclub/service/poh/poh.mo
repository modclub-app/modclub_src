import Debug "mo:base/Debug";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Text "mo:base/Text";

import Iter "mo:base/Iter";
import Buffer "mo:base/Buffer";
import PohState "./state";
import PohTypes "./types";
import Principal "mo:base/Principal";
import Result "mo:base/Result";

module Poh {

    public class Poh() {

        var state:PohState.PohState = PohState.emptyState();
        let MILLI_SECONDS_DAY = 3600 * 1000000000;

        public func verifyForHumanity(pohVerificationRequest: PohTypes.PohVerificationRequest, validForDays: Nat, configuredChallengeIds: [Text]) : PohTypes.PohVerificationResponse {
            switch(state.pohUsers.get(pohVerificationRequest.providerUserId)){
                case(null) 
                return
                {
                    requestId = "";
                    providerUserId = pohVerificationRequest.providerUserId;
                    challenges = null;
                    providerId = pohVerificationRequest.providerId;
                    requestedOn = Time.now();
                };
                case(?pohUser) {
                    let userId = switch(state.providerToModclubUser.get(pohUser.userId)) {
                        case(null) pohUser.userId; //it's a modclub user
                        case(?modclubUserId) modclubUserId;
                    };
                    
                    switch(state.pohUserChallengeAttempts.get(userId)) {
                        case(null) 
                            return
                            {
                                requestId = "";
                                providerUserId = pohVerificationRequest.providerUserId;
                                challenges = null;
                                providerId = pohVerificationRequest.providerId;
                                requestedOn = Time.now();
                            };
                        case(?attemptsByChallenges) {
                            let challenges = Buffer.Buffer<PohTypes.ChallengeResponse>(configuredChallengeIds.size());
                            for(challengeId in configuredChallengeIds.vals()) {
                                switch(attemptsByChallenges.get(challengeId)) {
                                    case(null) {
                                        challenges.add({
                                            challengeId = challengeId;
                                            status = #notSubmitted;
                                            completedOn = null;
                                        });
                                    };
                                    case(?attempts) {
                                        var status: PohTypes.PohChallengeStatus = #notSubmitted;
                                        var completedOn: ?Int = null;
                                        if(attempts.size() != 0) {
                                            let statusAndDate = findChallengeStatus(attempts, validForDays, attempts.size() - 1);
                                            status := statusAndDate.0;
                                            completedOn := statusAndDate.1;
                                        };
                                        challenges.add({
                                            challengeId = challengeId;
                                            status = status;
                                            completedOn = completedOn;
                                        });
                                    };
                                };
                            };
                            {
                                requestId = "";
                                providerUserId = pohVerificationRequest.providerUserId;
                                challenges = ?challenges.toArray();
                                providerId = pohVerificationRequest.providerId;
                                requestedOn = Time.now();
                            };
                        };
                    };
                };
            };
        };


        func findChallengeStatus(attempts: Buffer.Buffer<PohTypes.PohChallengesAttempt>, validForDays: Nat, index: Nat) : 
        (PohTypes.PohChallengeStatus, ?Int) {
            if(attempts.get(index).status == #rejected) {
                return (#rejected, ?attempts.get(index).completedOn);
            } else if(Time.now() - attempts.get(index).completedOn >= validForDays * MILLI_SECONDS_DAY and attempts.get(index).status == #verified) {
                return (#expired, ?attempts.get(index).completedOn);
            } else if(attempts.get(index).status == #verified) {
                return (#verified, ?attempts.get(index).completedOn);
            } else if(index == 0) {
                return (#pending, ?attempts.get(index).completedOn);
            } else {
                return findChallengeStatus(attempts, validForDays, index - 1);
            };
        };

        //Pre Step 4 Generate token
        public func generateUniqueToken(providerUserId: Principal, providerId: Principal) : PohTypes.PohUniqueToken {
            let uuid:Text =  ""; //generate uuid code here. We can use hash here instead.
            let providerUser:PohTypes.PohUserProviderData = {
                token = uuid;
                providerUserId = providerUserId;
                providerId = providerId;
            };
            state.pohProviderUserData.put(uuid, providerUser);
            {
                token = uuid;
            };
        };

        // Step 4 The dApp asks the user to perform POH and presents an iFrame which loads MODCLUB’s POH screens.
        // Modclub UI will ask for all the challenge for a user to show
        // ResponseType of this function is yet to be designed.
        public func retrieveChallengesForUser(userId: Principal, token: Text, challengeIds: [Text]) : Result.Result<[PohTypes.PohChallengesAttempt], PohTypes.PohError> {
            let providerUser  =  state.pohProviderUserData.get(token);
            switch(providerUser) {
                case(null) return #err(#invalidToken);
                case(?pUser)
                    state.providerToModclubUser.put(pUser.providerUserId, userId);
            };

            switch(state.pohUserChallengeAttempts.get(userId)) {
                case(null)
                    state.pohUserChallengeAttempts.put(userId, HashMap.HashMap<Text, Buffer.Buffer<PohTypes.PohChallengesAttempt>>(5, Text.equal, Text.hash));
                case(_)();
            };

            let challengesCurrent = Buffer.Buffer<PohTypes.PohChallengesAttempt>(challengeIds.size());
            let _ = do ? {
                for(challengeId in challengeIds.vals()) {
                    switch((state.pohUserChallengeAttempts.get(userId))!.get(challengeId)) {
                        case(null) {
                            (state.pohUserChallengeAttempts.get(userId))!.put(challengeId,  Buffer.Buffer<PohTypes.PohChallengesAttempt>(1));
                        };
                        case(_)();
                    };
                    let attempts = state.pohUserChallengeAttempts.get(userId)!.get(challengeId)!;
                    if(attempts.size() == 0) {
                        let newAttempt = {
                                                attemptId = ?"";
                                                challengeId = challengeId;
                                                userId = userId;
                                                challengeName = state.pohChallenges.get(challengeId)!.challengeName;
                                                challengeDescription = state.pohChallenges.get(challengeId)!.challengeDescription;
                                                challengeType = state.pohChallenges.get(challengeId)!.challengeType;
                                                status = #notSubmitted;
                                                createdAt = Time.now();
                                                updatedAt = Time.now();
                                                completedOn = -1; // -1 means not completed
                                        };
                        state.pohUserChallengeAttempts.get(userId)!.get(challengeId)!.add(newAttempt);
                        challengesCurrent.add(newAttempt);
                    } else {
                        challengesCurrent.add(attempts.get(attempts.size() - 1));
                    }
                };
            };
            #ok(challengesCurrent.toArray());
        };

        // Step 5 The user provides all POH evidence that the dApp requested.
        // one challenege =  PohChallengeSubmissionRequest. Hence using array here
        // User can come in multiple times and submit one challenge a time. Array will allow that
        public func submitChallengeData(pohDataRequests : [PohTypes.PohChallengeSubmissionRequest], userId: Principal) : Result.Result<Text, PohTypes.PohError> {
            // Todo validateSubmissionData();
            for(challengeData in pohDataRequests.vals()) {
                // switch(state.pohUserChallengeAttempts.get(userId)) {
                //     case(null)
                //         return #err(#challengeNotPendingForSubmission);
                //     case(?challengeAttempts) {
                //         switch(challengeAttempts.get(challengeData.challengeId)) {
                //             case(null)
                //                 return #err(#challengeNotPendingForSubmission);
                //             case(?attempts) {
                //                 if(attempts.size() == 0) {
                //                     return #err(#challengeNotPendingForSubmission);
                //                 }
                //             }
                //         };
                //     };
                // };
                changeChallengeTaskStatus(challengeData.challengeId, userId, #pending);

                // let pohContent = createPohContent(challengeData.);
                // Send for moderation
            
            };
            #ok("Done");
        };

        // Step 6 MODCLUB mods verify that user data and approve the user. The 
        // dApp is then notified that the user has verified their POH.
        public func changeChallengeTaskStatus(challengeId: Text, userId: Principal, status: PohTypes.PohChallengeStatus) {
            let _ = do ?{
                var completedOn = -1;
                if(status == #verified or status == #rejected) {
                    completedOn := Time.now();
                };
                let attempts = state.pohUserChallengeAttempts.get(userId)!.get(challengeId)!;
                let attempt = attempts.get(attempts.size() - 1);
                let updatedAttempt = {
                    attemptId = attempt.attemptId;
                    challengeId = attempt.challengeId;
                    challengeName = attempt.challengeName;
                    challengeDescription = attempt.challengeDescription;
                    challengeType = attempt.challengeType;
                    userId = attempt.userId;
                    status =  status;
                    createdAt = attempt.createdAt;
                    updatedAt = Time.now();
                    completedOn = completedOn;
                };
                attempts.put(attempts.size() - 1, updatedAttempt);
            };
        };

        // This function will be called from changeChallengeTaskStatus function when all challenges are complete
        // And this function will provide a callback to provider about the status completion of a user.
        func completeUserPoh(challengeId: Text, userId: Principal, status: PohTypes.PohChallengeStatus) {
            changeChallengeTaskStatus(challengeId, userId, status);
            // Todo notify providers code here
        };
    };

};