import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import GlobalState "../../state";
import HashMap "mo:base/HashMap";
import Helpers "../../helpers";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import ModClubParam "../parameters/params";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import PohState "./statev1";
import PohTypes "./types";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Types "../../types";

module PohModule {

    public let CHALLENGE_PROFILE_DETAILS_ID = "challenge-profile-details";
    public let CHALLENGE_PROFILE_PIC_ID = "challenge-profile-pic";
    public let CHALLENGE_USER_VIDEO_ID = "challenge-user-video";

    public class PohEngine(stableState : PohState.PohStableState) {

        let state = PohState.getState(stableState);

        let userToPackageIdState = HashMap.HashMap<Principal, Text>(1, Principal.equal, Principal.hash);

        let MILLI_SECONDS_DAY = 3600 * 1000000000;

        public func pohVerificationRequest(pohVerificationRequest: PohTypes.PohVerificationRequest, validForDays: Nat, configuredChallengeIds: [Text]) 
        : PohTypes.PohVerificationResponse {
            // request audit
            state.pohVerificationRequests.put(pohVerificationRequest.requestId, pohVerificationRequest);
            state.provider2PohVerificationRequests.put(pohVerificationRequest.providerId, pohVerificationRequest.requestId);

            let modClubUserIdOption = do? {state.providerToModclubUser.get(pohVerificationRequest.providerUserId)!};
            if(modClubUserIdOption == null) {
                // No user in our record, Hence we can't comment on his humanity. 
                return
                    {
                        requestId = pohVerificationRequest.requestId;
                        providerUserId = pohVerificationRequest.providerUserId;
                        status = #notSubmitted;
                        challenges = [];
                        providerId = pohVerificationRequest.providerId;
                        requestedOn = Helpers.timeNow();
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
                        requestId = pohVerificationRequest.requestId;
                        providerUserId = pohVerificationRequest.providerUserId;
                        status = #notSubmitted;
                        challenges = [];
                        providerId = pohVerificationRequest.providerId;
                        requestedOn = Helpers.timeNow();
                    };
                case(?attemptsByChallenges) {
                    let challenges = Buffer.Buffer<PohTypes.ChallengeResponse>(configuredChallengeIds.size());
                    var overAllStatus: ?PohTypes.PohChallengeStatus = null;

                    for(challengeId in configuredChallengeIds.vals()) {
                        switch(attemptsByChallenges.get(challengeId)) {
                            case(null) {
                                overAllStatus := ?#notSubmitted;
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
                                    let statusAndDate = findChallengeStatus(attempts, validForDays);
                                    status := statusAndDate.0;
                                    completedOn := statusAndDate.1;
                                };
                                challenges.add({
                                    challengeId = challengeId;
                                    status = status;
                                    completedOn = completedOn;
                                });

                                // if any of the challenge is rejected, then overall status is rejected
                                if(status == #rejected) {
                                    overAllStatus := ?#rejected;
                                } else if(overAllStatus != ?#rejected and status == #expired) {
                                // if any of the challenge is expired and none is rejected, then overall status is expired
                                    overAllStatus := ?#expired;
                                };

                                // so that rejected or expired overallstatus can't be overidden
                                if(overAllStatus != ?#rejected and overAllStatus != ?#expired) {
                                    // if any of the challenge is not submitted then it's not submitted.
                                    if(status == #notSubmitted) {
                                        overAllStatus := ?#notSubmitted;
                                    } else if(overAllStatus != ?#notSubmitted and status == #pending) {
                                        overAllStatus := ?#pending;
                                    };
                                };
                            };
                        };
                    };
                    {
                        requestId = pohVerificationRequest.requestId;
                        providerUserId = pohVerificationRequest.providerUserId;
                        status = Option.get(overAllStatus, #verified);
                        challenges = challenges.toArray();
                        providerId = pohVerificationRequest.providerId;
                        requestedOn = Helpers.timeNow();
                    };
                };
            };
        };

            // User A
            // 4 years back	 3 years back	2 year back	
            // rejected	      verified	     verified	pending

            // User B         
            // 4 years back	 1 years back		
            //  rejected	       verified	     rejected	rejected

            // Provider A expiry: 1 year
            // Provider B expiry: 2 year
        func findChallengeStatus(attempts: Buffer.Buffer<PohTypes.PohChallengesAttempt>, validForDays: Nat) : 
        (PohTypes.PohChallengeStatus, ?Int) {
            for(i in Iter.revRange(attempts.size() - 1, 0)) {
                let attempt = attempts.get(Helpers.intToNat(i));
                // search for a verified and non expired attempt through all attempts in reverse order
                if(attempt.status == #verified and not isChallengeExpired(attempt, validForDays)) {
                    return (#verified, ?attempt.completedOn);
                }
            };
            // if not found, return the status of last attempt whatsoever it is
            // but check for expiry if the last one is verified
            let lastAttempt = attempts.get(attempts.size()-1);
            if(isChallengeExpired(lastAttempt, validForDays)) {
                return (#expired, ?lastAttempt.completedOn);
            };
            return (lastAttempt.status, ?lastAttempt.completedOn);
        };

        func isChallengeExpired(attempt: PohTypes.PohChallengesAttempt, validForDays: Nat) : Bool {
            return Helpers.timeNow() - attempt.completedOn >= validForDays * MILLI_SECONDS_DAY and attempt.status == #verified;
        };

        //Pre Step 4 Generate token
        public func pohGenerateUniqueToken(providerUserId: Principal, providerId: Principal) : async PohTypes.PohUniqueToken {
            //using token: as salt instead of time here to keep behavior deterministic for us
            let hash: Text = Helpers.generateHash("token:" # Principal.toText(providerUserId) # Principal.toText(providerId));
            // let uuid:Text =  await Helpers.generateUUID(); //generate uuid code here. We can use hash here instead.
            let providerUser:PohTypes.PohUserProviderData = {
                token = hash;
                providerUserId = providerUserId;
                providerId = providerId;
            };
            state.pohProviderUserData.put(hash, providerUser);
            {
                token = hash;
            };
        };

        public func decodeToken(userId: Principal, token: Text) : Result.Result<(), PohTypes.PohError> {
            switch(state.pohProviderUserData.get(token)) {
                case(null) return #err(#invalidToken);
                case(?pUser)
                    state.providerToModclubUser.put(pUser.providerUserId, userId);
            };
            #ok();
        };

        // Step 4 The dApp asks the user to perform POH and presents an iFrame which loads MODCLUB’s POH screens.
        // Modclub UI will ask for all the challenge for a user to show
        public func retrieveChallengesForUser(userId: Principal, challengeIds: [Text], validForDays: Nat, forceCreateNewAttempts: Bool) : async Result.Result<[PohTypes.PohChallengesAttempt], PohTypes.PohError> {
            // populate pohUsers but with their modclub user id
            switch(state.pohUsers.get(userId)) {
                case(null) {
                    state.pohUsers.put(userId, {
                        userId = userId;
                        userName = null;
                        fullName = null;
                        email = null;
                        aboutUser = null;
                        createdAt = Helpers.timeNow();
                        updatedAt = Helpers.timeNow();
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

                    if(attempts.size() == 0 or forceCreateNewAttempts == true) {
                        let newAttempt = createNewAttempt(userId, challengeId, attempts.size())!;
                        state.pohUserChallengeAttempts.get(userId)!.get(challengeId)!.add(newAttempt);
                        challengesCurrent.add(newAttempt);
                    } else {
                        let lastAttempt = attempts.get(attempts.size() - 1);
                        // if last attempt was rejected, auto create a new one.
                        if(lastAttempt.status == #rejected or isChallengeExpired(lastAttempt, validForDays)) {
                            let newAttempt = createNewAttempt(userId, challengeId, attempts.size())!;
                            state.pohUserChallengeAttempts.get(userId)!.get(challengeId)!.add(newAttempt);
                        };
                        challengesCurrent.add(attempts.get(attempts.size() - 1));
                    };
                };
            };
            #ok(challengesCurrent.toArray());
        };

        func createNewAttempt(userId: Principal, challengeId: Text, nextAttemptIndex: Nat) : ?PohTypes.PohChallengesAttempt {
            do? 
            {
                {
                    attemptId = ?Helpers.generateHash(Principal.toText(userId) # challengeId # Nat.toText(nextAttemptIndex));
                    challengeId = challengeId;
                    userId = userId;
                    challengeName = state.pohChallenges.get(challengeId)!.challengeName;
                    challengeDescription = state.pohChallenges.get(challengeId)!.challengeDescription;
                    challengeType = state.pohChallenges.get(challengeId)!.challengeType;
                    status = #notSubmitted;
                    contentId = null;
                    dataCanisterId = null;
                    createdAt = Helpers.timeNow();
                    updatedAt = Helpers.timeNow();
                    completedOn = -1; // -1 means not completed
                    wordList = do ?{
                        switch(state.pohChallenges.get(challengeId)!.challengeType) {
                            case(#selfVideo) Helpers.generateRandomList(6, state.wordList.toArray(), Helpers.getRandomFeedGenerator());
                            case(_) [];
                        };
                    };
                };
            };
        };

        public func validateChallengeSubmission(challengeData : PohTypes.PohChallengeSubmissionRequest, userId: Principal) : PohTypes.PohChallengeSubmissionStatus {
            Debug.print(Principal.toText(userId));
            switch(state.pohChallenges.get(challengeData.challengeId)) {
                case(null)
                    return #incorrectChallenge;
                case(?pohChallenge){
                    if(pohChallenge.requiredField == #profileFieldBlobs 
                            and (challengeData.userName == null or challengeData.email == null or challengeData.fullName == null or challengeData.aboutUser == null)) {
                        return #inputDataMissing;
                    } else if(pohChallenge.requiredField != #profileFieldBlobs and challengeData.challengeDataBlob == null) {
                        return #inputDataMissing;
                    };
                }
            };
            
            switch(state.pohUserChallengeAttempts.get(userId)) {
                case(null) {
                    Debug.print("Empty null");
                    return #notPendingForSubmission;
                };
                case(?challengeAttempts) {
                    switch(challengeAttempts.get(challengeData.challengeId)) {
                        case(null) {
                            Debug.print("It's a null");
                            return #notPendingForSubmission;
                        };
                        case(?attempts) {
                            Debug.print(Nat.toText(attempts.size()));
                            if(attempts.size() == 0) {
                                return #notPendingForSubmission;
                            } else if(attempts.get(attempts.size() -1 ).status == #pending) {
                                return #alreadySubmitted;
                            } else if(attempts.get(attempts.size() -1 ).status == #verified) {
                                return #alreadyApproved;
                            } else if(attempts.get(attempts.size() -1 ).status == #rejected) {
                                return #alreadyRejected;
                            };
                            return #ok;
                        }
                    };
                };
            };
        };

        public func changeChallengePackageStatus(packageId: Text, status: PohTypes.PohChallengeStatus) : () {
            switch(state.pohChallengePackages.get(packageId)) {
                case(null)();
                case(?package) {
                    for(id in package.challengeIds.vals()) {
                        changeChallengeTaskStatus(id, package.userId, status);
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
                    completedOn := Helpers.timeNow();
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
                    // contentId = attempt.contentId;
                    dataCanisterId = attempt.dataCanisterId;
                    createdAt = attempt.createdAt;
                    updatedAt = Helpers.timeNow();
                    completedOn = completedOn;
                    wordList = attempt.wordList;
                };
                attempts.put(attempts.size() - 1, updatedAttempt);
            };
        };

        public func updateDataCanisterId(challengeId: Text, userId: Principal, dataCanisterId: ?Principal) {
            let _    = do ?{
                let attempts = state.pohUserChallengeAttempts.get(userId)!.get(challengeId)!;
                let attempt = attempts.get(attempts.size() - 1);
                let updatedAttempt = {
                    attemptId = attempt.attemptId;
                    challengeId = attempt.challengeId;
                    challengeName = attempt.challengeName;
                    challengeDescription = attempt.challengeDescription;
                    challengeType = attempt.challengeType;
                    userId = attempt.userId;
                    status =  attempt.status;
                    // contentId = attempt.contentId;
                    dataCanisterId = dataCanisterId;
                    createdAt = attempt.createdAt;
                    updatedAt = Helpers.timeNow();
                    completedOn = attempt.completedOn;
                    wordList = attempt.wordList;
                };
                attempts.put(attempts.size() - 1, updatedAttempt);
            };
        };

        public func getAttemptId(challengeId: Text, userId: Principal) : Text {
            var contentId = "";
            let _ = do ? {
                let attempts = state.pohUserChallengeAttempts.get(userId)!.get(challengeId)!;
                let attempt = attempts.get(attempts.size() - 1);
                contentId := attempt.attemptId!;
            };
            return contentId; 
        };

        public func updatePohUserObject(userId:Principal, fullName:Text, email:Text, userName:Text, aboutUser : Text) : () {
            switch(state.pohUsers.get(userId)) {
                case(null) ();
                case(?user) {
                    state.pohUsers.put(userId, {
                        userId = user.userId;
                        userName = ?userName;
                        email = ?email;
                        fullName = ?fullName;
                        aboutUser = ?aboutUser;
                        createdAt = user.createdAt;
                        updatedAt = Helpers.timeNow();
                    });
                };
            };
        };

        public func createChallengePackageForVoting(
            userId: Principal,
            challengeIds: [Text], 
            getContentStatus: Text -> Types.ContentStatus,
            globalState: GlobalState.State) 
            : ?PohTypes.PohChallengePackage {
            for(packageId in state.userToPohChallengePackageId.get0(userId).vals()) {
                switch(state.pohChallengePackages.get(packageId)) {
                    case(null)();
                    case(?package) {
                        if(package.challengeIds.size() == challengeIds.size()) {
                            let cIdsMap = HashMap.HashMap<Text, Text>(1, Text.equal, Text.hash);
                            for(id in package.challengeIds.vals()) {
                                cIdsMap.put(id, id);
                            };
                            var allMatched = true;
                            label l for(id in challengeIds.vals()) {
                                switch(cIdsMap.get(id)) {
                                    case(null) {
                                        allMatched := false;
                                        break l;
                                    };
                                    case(_)();
                                };
                            };
                            // if package exists with same challenge and not voted approved/rejected
                            // don't create a new package
                            if(allMatched and getContentStatus(package.id) == #new) {
                                return null;
                            };
                        };
                    };
                };
            };

            do? {
                let challengeAttempts = state.pohUserChallengeAttempts.get(userId)!;
                var allChallengeSubmitted = true;
                for(id in challengeIds.vals()) {
                    let attempts = challengeAttempts.get(id)!;
                    if(attempts.size() == 0) {
                        return null;
                    };
                    if(attempts.get(attempts.size() - 1).status != #pending) {
                        allChallengeSubmitted:=false;
                    }
                };
                if(allChallengeSubmitted == false) {
                    return null;
                };
                let pohPackage = {
                    id = Helpers.generateId(userId, "poh-content", globalState);
                    challengeIds =  challengeIds;
                    userId =  userId;
                    contentType = #pohPackage;
                    title = ?("POH Content for User: " # Principal.toText(userId));
                    createdAt =  Helpers.timeNow();
                    updatedAt = Helpers.timeNow();
                };
                state.pohChallengePackages.put(pohPackage.id, pohPackage);
                state.userToPohChallengePackageId.put(userId, pohPackage.id);
                return ?pohPackage;
            };
        };

        public func getPohTasks(taskIds: [Text]) : [PohTypes.PohTaskDataWrapper] {
            let pohTasks = Buffer.Buffer<PohTypes.PohTaskDataWrapper>(taskIds.size());

            for(id in taskIds.vals()) {
                let pohChallengePackage = state.pohChallengePackages.get(id);
                let taskData = Buffer.Buffer<PohTypes.PohTaskData>(taskIds.size());
                switch(pohChallengePackage) {
                    case(null)();
                    case(?package) {
                        for(challengeId in package.challengeIds.vals()) {
                            let attempt = do ? {
                                let attempts = state.pohUserChallengeAttempts.get(package.userId)!.get(challengeId)!;
                                attempts.get(attempts.size() - 1);
                            };
                            let challenge = state.pohChallenges.get(challengeId);

                            switch(attempt) {
                                case(null)();
                                case(?att){
                                    let pohTaskData = {
                                        challengeId = challengeId;
                                        challengeType  = att.challengeType;
                                        userId = package.userId;
                                        status = att.status;
                                        userName = do ?{state.pohUsers.get(package.userId)!.userName!};
                                        email = do ?{state.pohUsers.get(package.userId)!.email!};
                                        fullName = do ?{state.pohUsers.get(package.userId)!.fullName!};
                                        aboutUser = do ?{state.pohUsers.get(package.userId)!.aboutUser!};
                                        contentId = att.attemptId; //attemptId is contentId for a challenge
                                        dataCanisterId = att.dataCanisterId;
                                        wordList = att.wordList;
                                        allowedViolationRules = switch(challenge) {
                                            case(?c) {
                                                c.allowedViolationRules;
                                            };
                                            case(null) {[]};
                                        };
                                        createdAt =  att.createdAt;
                                        updatedAt = att.updatedAt;
                                    };
                                    taskData.add(pohTaskData);
                                };
                            };
                        };
                        pohTasks.add({
                            packageId = id;
                            pohTaskData = taskData.toArray();
                            createdAt = package.createdAt;
                            updatedAt = package.updatedAt;
                        });
                    };
                };
                
            };
            return pohTasks.toArray();
        };

        public func retrieveRejectedPackageId(userId: Principal, challengeIds: [Text], getContentStatus: Text -> Types.ContentStatus) : ?Text {
            let packageIds = state.userToPohChallengePackageId.get0(userId);
            if(packageIds.size() == 0) {
                return null;
            };
            for(i in Iter.range(packageIds.size() - 1, 0)) {
                switch(state.pohChallengePackages.get(packageIds.get(i))) {
                    case(null)();
                    case(?package) {
                        if(package.challengeIds.size() == challengeIds.size() and getContentStatus(package.id) == #rejected) {
                            let cIdsMap = HashMap.HashMap<Text, Text>(1, Text.equal, Text.hash);
                            for(id in package.challengeIds.vals()) {
                                cIdsMap.put(id, id);
                            };
                            var allMatched = true;
                            label l for(id in challengeIds.vals()) {
                                switch(cIdsMap.get(id)) {
                                    case(null) {
                                        allMatched := false;
                                        break l;
                                    };
                                    case(_)();
                                };
                            };
                            // if package exists with same challenge
                            if(allMatched) {
                                return ?package.id;
                            };
                        };
                    };
                };
            };
            return null;
        };

        public func resolveViolatedRulesById(violatedRules: [Types.PohRulesViolated]) : [Text] {
            let buff = Buffer.Buffer<Text>(violatedRules.size());
            for(vRule in violatedRules.vals()) {
                switch(state.pohChallenges.get(vRule.challengeId)) {
                    case(null)();
                    case(?challenge) {
                        label l for(allowedVRule in challenge.allowedViolationRules.vals()) {
                            if(allowedVRule.ruleId == vRule.ruleId) {
                                buff.add(allowedVRule.ruleDesc);
                                break l;
                            };
                        };
                    };
                };
            };
            return buff.toArray();
        };

        public func getPohChallengePackage(packageId: Text) : ?PohTypes.PohChallengePackage {
            return state.pohChallengePackages.get(packageId);
        };

        public func validateRules(violatedRules: [Types.PohRulesViolated]) : Bool {
            let validRules : ?Bool = do ?{
                for(vRule in violatedRules.vals()) {
                    let challenge = state.pohChallenges.get(vRule.challengeId)!;
                        var found = false;
                        for(aVRule in challenge.allowedViolationRules.vals()) {
                            if(aVRule.ruleId == vRule.ruleId) {
                                found := true;
                            };
                        };
                        if(found == false) {
                            return false;
                        };
                };
                return true;
            };
            return Option.get(validRules, false);
        };

        public func populateChallenges() : () {
            let allowedViolationRules1 = Buffer.Buffer<PohTypes.ViolatedRules>(2);
            allowedViolationRules1.add( {
                ruleId= "1";
                ruleDesc = "The username is not offensive or uses fowl language";
            }); 
            allowedViolationRules1.add( {
                ruleId= "2";
                ruleDesc = "The fullname is not offensive or uses fowl language";
            });
            allowedViolationRules1.add( {
                ruleId= "3";
                ruleDesc = "The about section is not offensive or uses fowl language";
            });
            state.pohChallenges.put(CHALLENGE_PROFILE_DETAILS_ID, {
                challengeId = CHALLENGE_PROFILE_DETAILS_ID;
                challengeName = "Please create a username";
                challengeDescription = "Please create a username";
                // assuming there will be no transitive dependencies. else graph needs to be used
                requiredField = #profileFieldBlobs;
                dependentChallengeId = null;
                challengeType =  #userName;
                allowedViolationRules = allowedViolationRules1.toArray();
                createdAt = Helpers.timeNow();
                updatedAt = Helpers.timeNow();
            });

            let allowedViolationRules2 = Buffer.Buffer<PohTypes.ViolatedRules>(3);
            allowedViolationRules2.add({
                ruleId= "1";
                ruleDesc = "The person face is well lit";
            }); 
            allowedViolationRules2.add( {
                ruleId= "2";
                ruleDesc = "You can clearly see the persons face";
            });
            allowedViolationRules2.add( {
                ruleId= "3";
                ruleDesc = "The person is not wearing a mask or hiding their face";
            });
            state.pohChallenges.put(CHALLENGE_PROFILE_PIC_ID, {
                challengeId = CHALLENGE_PROFILE_PIC_ID;
                challengeName = "Please provide your picture";
                challengeDescription = "Please provide your picture";
                requiredField = #imageBlob;
                // assuming there will be no transitive dependencies. else graph needs to be used
                dependentChallengeId = null;
                challengeType =  #selfPic;
                allowedViolationRules = allowedViolationRules2.toArray();
                createdAt = Helpers.timeNow();
                updatedAt = Helpers.timeNow();
            });

            let allowedViolationRules3 = Buffer.Buffer<PohTypes.ViolatedRules>(4);
            allowedViolationRules3.add( {
                ruleId= "1";
                ruleDesc = "The person in the video is the same person in the picture above";
            }); 
            allowedViolationRules3.add( {
                ruleId= "2";
                ruleDesc = "The person in the video says all the words in order in the box above";
            });
            allowedViolationRules3.add( {
                ruleId= "3";
                ruleDesc = "The person in the video appears to be a real person and not AI generated";
            });
            state.pohChallenges.put(CHALLENGE_USER_VIDEO_ID, {
                challengeId = CHALLENGE_USER_VIDEO_ID;
                challengeName = "Please record your video saying these words";
                challengeDescription = "Please record your video saying these words";
                requiredField = #videoBlob;
                // assuming there will be no transitive dependencies. else graph needs to be used
                dependentChallengeId = null;
                challengeType =  #selfVideo;
                allowedViolationRules = allowedViolationRules3.toArray();
                createdAt = Helpers.timeNow();
                updatedAt = Helpers.timeNow();
            });
            state.wordList.add("Cute");
            state.wordList.add("Free");
            state.wordList.add("Pair");
            state.wordList.add("Jolt");
            state.wordList.add("Safe");
            state.wordList.add("Lack");
            state.wordList.add("Live");
            state.wordList.add("Seal");
            state.wordList.add("Need");
            state.wordList.add("Crop");
            state.wordList.add("Five");
            state.wordList.add("Dull");
            state.wordList.add("Dead");
            state.wordList.add("Tile");
            state.wordList.add("Meet");
            state.wordList.add("Till");
            state.wordList.add("Form");
            state.wordList.add("Very");
            state.wordList.add("Blue");
            state.wordList.add("City");
            state.wordList.add("Neat");
            state.wordList.add("Stun");
            state.wordList.add("Rank");
            state.wordList.add("Cove");
            state.wordList.add("Bell");
            state.wordList.add("Fail");
            state.wordList.add("Rose");
            state.wordList.add("Rook");
            state.wordList.add("Disk");
            state.wordList.add("Sing");
            state.wordList.add("List");
            state.wordList.add("Fear");
            state.wordList.add("Shop");
            state.wordList.add("Okra");
            state.wordList.add("Side");
            state.wordList.add("Cask");
            state.wordList.add("Axie");
            state.wordList.add("Stag");
            state.wordList.add("Cake");
            state.wordList.add("Bold");
            state.wordList.add("Desk");
            state.wordList.add("Stub");
            state.wordList.add("Soar");
            state.wordList.add("Pole");
            state.wordList.add("Halo");
            state.wordList.add("Plow");
            state.wordList.add("Team");
            state.wordList.add("Lace");
            state.wordList.add("Gaze");
            state.wordList.add("Kill");
        };

        public func getStableState() : PohState.PohStableState {
            return PohState.getStableState(state);
        };

        public func getStableStateV1() : PohState.PohStableState {
            return PohState.getStableState(state);
        };

        // to be deleted after a deployment
        public func assignAllPohAuditstoModClub() : () {
            for((reqId, pohReq) in state.pohVerificationRequests.entries()) {
                state.pohVerificationRequests.put(reqId, {
                    requestId = reqId;
                    providerUserId = pohReq.providerUserId;
                    providerId = ModClubParam.getModClubProviderId();
                });

            };
        };
    };

};