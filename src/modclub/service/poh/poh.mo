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
import Option "mo:base/Option";

import Source "mo:uuid/async/SourceV4";
import UUID "mo:uuid/UUID";

module PohModule {

    public class PohEngine(stableState : PohState.PohStableState) {

        var state:PohState.PohState = PohState.emptyState();
        
        for( (p, val) in stableState.pohUsers.vals()) {
            state.pohUsers.put(p, val);
        };
        for( (p, val) in stableState.pohChallenges.vals()) {
            state.pohChallenges.put(p, val);
        };

        for( (userId, challenges) in stableState.pohUserChallengeAttempts.vals()) {
            let attemptsByChallengeIdMap = HashMap.HashMap<Text, Buffer.Buffer<PohTypes.PohChallengesAttempt>>(5, Text.equal, Text.hash);
            for((challengeId, attempts) in challenges.vals()) {
                let attemptsBuffer = Buffer.Buffer<PohTypes.PohChallengesAttempt>(attempts.size());
                for(attempt in attempts.vals()) {
                    attemptsBuffer.add(attempt);
                };
                attemptsByChallengeIdMap.put(challengeId, attemptsBuffer);
            };
            state.pohUserChallengeAttempts.put(userId, attemptsByChallengeIdMap);
        };

        for( (p, val) in stableState.pohProviderUserData.vals()) {
            state.pohProviderUserData.put(p, val);
        };
        for( (p, val) in stableState.providerToModclubUser.vals()) {
            state.providerToModclubUser.put(p, val);
        };


        let MILLI_SECONDS_DAY = 3600 * 1000000000;

        public func generateUUID() : Text {
            // let g = Source.Source();
            // return UUID.toText(await g.new());
            return "";
        };

        public func verifyForHumanity(pohVerificationRequest: PohTypes.PohVerificationRequest, validForDays: Nat, configuredChallengeIds: [Text]) 
        : PohTypes.PohVerificationResponse {

            let modClubUserIdOption = do? {state.providerToModclubUser.get(pohVerificationRequest.providerUserId)!};
            if(modClubUserIdOption == null) {
                // No user in our record, Hence we can't comment on his humanity. 
                return
                    {
                        requestId = generateUUID();
                        providerUserId = pohVerificationRequest.providerUserId;
                        challenges = null;
                        providerId = pohVerificationRequest.providerId;
                        requestedOn = Time.now();
                    };
            };

            // if execution is here, modClubUserIdOption
            // second parameter can be ignored here. It's just to unwrap this option
            let modClubUserId = Option.get(modClubUserIdOption, pohVerificationRequest.providerUserId);

            switch(state.pohUserChallengeAttempts.get(modClubUserId)) {
                case(null) 
                    // If user is in record, but no attempt is not possible in our flow
                    // Extra cautious and sending zero challenges attempted array
                    return
                    {
                        requestId = generateUUID();
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
                        requestId = generateUUID();
                        providerUserId = pohVerificationRequest.providerUserId;
                        challenges = ?challenges.toArray();
                        providerId = pohVerificationRequest.providerId;
                        requestedOn = Time.now();
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
            // Sha256.sha256()
            let uuid:Text =  generateUUID(); //generate uuid code here. We can use hash here instead.
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
            // populate provider to userId mapping
            switch(state.pohProviderUserData.get(token)) {
                case(null) return #err(#invalidToken);
                case(?pUser)
                    state.providerToModclubUser.put(pUser.providerUserId, userId);
            };

            // populate pohUsers but with their modclub user id
            switch(state.pohUsers.get(userId)) {
                case(null) {
                    state.pohUsers.put(userId, {
                        userId = userId;
                        createdAt = Time.now();
                        updatedAt = Time.now();
                    });
                };
                case(_)();
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
                                                attemptId = ?generateUUID(); //TODO attemptID
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
        public func submitChallengeData(pohDataRequests : [PohTypes.PohChallengeSubmissionRequest], userId: Principal) : [PohTypes.PohChallengeSubmissionResponse] {
            let  response = Buffer.Buffer<PohTypes.PohChallengeSubmissionResponse>(pohDataRequests.size());
            for(challengeData in pohDataRequests.vals()) {
                let submissionStatus = validateChallengeSubmission(challengeData, userId);
                changeChallengeTaskStatus(challengeData.challengeId, userId, #pending);
                response.add({
                    challengeId=challengeData.challengeId;
                    submissionStatus = submissionStatus
                });

                // let pohContent = createPohContent(challengeData.);
                // Send for moderation
            };
            response.toArray();
        };

        func validateChallengeSubmission(challengeData : PohTypes.PohChallengeSubmissionRequest, userId: Principal) : PohTypes.PohChallengeSubmissionStatus {
            switch(state.pohUserChallengeAttempts.get(userId)) {
                case(null)
                    return #notPendingForSubmission;
                case(?challengeAttempts) {
                    switch(challengeAttempts.get(challengeData.challengeId)) {
                        case(null)
                            return #notPendingForSubmission;
                        case(?attempts) {
                            if(attempts.size() == 0) {
                                return #notPendingForSubmission;
                            };
                            if(attempts.get(attempts.size() -1 ).status == #verified) {
                                return #alreadyApproved;
                            };
                            if(attempts.get(attempts.size() -1 ).status == #rejected) {
                                return #alreadyRejected;
                            };
                            return #ok;
                        }
                    };
                };
            };
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