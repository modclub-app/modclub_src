import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import PohState "./state";
import PohTypes "./types";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Source "mo:uuid/async/SourceV4";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Types "../../types";
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

        public func generateUUID() : async  Text {
            let g = Source.Source();
            let uuid = await g.new();
            return UUID.toText(await g.new());
        };

        public func verifyForHumanity(pohVerificationRequest: PohTypes.PohVerificationRequest, validForDays: Nat, configuredChallengeIds: [Text]) 
        : async PohTypes.PohVerificationResponse {
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
                        challenges = [];
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
                        requestId = pohVerificationRequest.requestId;
                        providerUserId = pohVerificationRequest.providerUserId;
                        challenges = [];
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
                        requestId = pohVerificationRequest.requestId;
                        providerUserId = pohVerificationRequest.providerUserId;
                        challenges = challenges.toArray();
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
                return (attempts.get(index).status, ?attempts.get(index).completedOn);
            } else {
                return findChallengeStatus(attempts, validForDays, index - 1);
            };
        };

        //Pre Step 4 Generate token
        public func generateUniqueToken(providerUserId: Principal, providerId: Principal) : async PohTypes.PohUniqueToken {
            // Sha256.sha256()
            let uuid:Text =  await generateUUID(); //generate uuid code here. We can use hash here instead.
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
        public func retrieveChallengesForUser(userId: Principal, token: Text, challengeIds: [Text]) : async Result.Result<[PohTypes.PohChallengesAttempt], PohTypes.PohError> {
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
                        userName = null;
                        fullName = null;
                        email = null;
                        aboutUser = null;
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
                                                attemptId = ?(await generateUUID());
                                                challengeId = challengeId;
                                                userId = userId;
                                                challengeName = state.pohChallenges.get(challengeId)!.challengeName;
                                                challengeDescription = state.pohChallenges.get(challengeId)!.challengeDescription;
                                                challengeType = state.pohChallenges.get(challengeId)!.challengeType;
                                                status = #notSubmitted;
                                                contentId = null;
                                                dataCanisterId = null;
                                                createdAt = Time.now();
                                                updatedAt = Time.now();
                                                completedOn = -1; // -1 means not completed
                                                wordList = do ?{
                                                    switch(state.pohChallenges.get(challengeId)!.challengeType) {
                                                        case(#selfVideo) generateRandomWordList(5);
                                                        case(_) [];
                                                    };
                                                };
                                        };
                        state.pohUserChallengeAttempts.get(userId)!.get(challengeId)!.add(newAttempt);
                        challengesCurrent.add(newAttempt);
                    } else {
                        challengesCurrent.add(attempts.get(attempts.size() - 1));
                    };
                };
            };
            #ok(challengesCurrent.toArray());
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
                    // contentId = attempt.contentId;
                    dataCanisterId = attempt.dataCanisterId;
                    createdAt = attempt.createdAt;
                    updatedAt = Time.now();
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
                    updatedAt = Time.now();
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
                        updatedAt = Time.now();
                    });
                };
            };
        };

        public func createChallengePackageForVoting(userId: Principal, challengeIds: [Text], generateId: (Principal, Text) -> Text) : ?PohTypes.PohChallengePackage {
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
                    id = generateId(userId, "poh-content");
                    challengeIds =  challengeIds;
                    userId =  userId;
                    contentType = #pohPackage;
                    status = #new;
                    title = ?("POH Content for User: " # Principal.toText(userId));
                    createdAt =  Time.now();
                    updatedAt = Time.now();
                };
                state.pohChallengePackages.put(pohPackage.id, pohPackage);
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
                            // status = package.status;
                            // contentType = package.contentType;
                        });
                    };
                };
                
            };
            return pohTasks.toArray();
        };

        public func validateRules(violatedRules: [Types.PohRulesViolated]) : Bool {
            var violated = false;
            for(vRule in violatedRules.vals()) {
                let _ = do ?{
                    let challenge = state.pohChallenges.get(vRule.challengeId)!;
                    switch(challenge.allowedViolationRules.get(vRule.ruleId)){
                        case(null) {
                            violated := true;
                        };
                        case(_)();
                    };
                };
            };
            return violated;
        };

        public func populateChallenges() : () {
            state.pohChallenges.put("challenge-profile-details", {
                challengeId = "challenge-profile-details";
                challengeName = "Please create a username";
                challengeDescription = "Please create a username";
                // assuming there will be no transitive dependencies. else graph needs to be used
                requiredField = #profileFieldBlobs;
                dependentChallengeId = null;
                challengeType =  #userName;
                allowedViolationRules = HashMap.HashMap<Text, PohTypes.ViolatedRules>(1, Text.equal, Text.hash);
                createdAt = Time.now();
                updatedAt = Time.now();
            });
            state.pohChallenges.put("challenge-profile-pic", {
                challengeId = "challenge-profile-pic";
                challengeName = "Please provide your picture";
                challengeDescription = "Please provide your picture";
                requiredField = #imageBlob;
                // assuming there will be no transitive dependencies. else graph needs to be used
                dependentChallengeId = null;
                challengeType =  #selfPic;
                allowedViolationRules = HashMap.HashMap<Text, PohTypes.ViolatedRules>(1, Text.equal, Text.hash);
                createdAt = Time.now();
                updatedAt = Time.now();
            });
            state.pohChallenges.put("challenge-user-video", {
                challengeId = "challenge-user-video";
                challengeName = "Please record your video saying these words";
                challengeDescription = "Please record your video saying these words";
                requiredField = #videoBlob;
                // assuming there will be no transitive dependencies. else graph needs to be used
                dependentChallengeId = null;
                challengeType =  #selfVideo;
                allowedViolationRules = HashMap.HashMap<Text, PohTypes.ViolatedRules>(1, Text.equal, Text.hash);
                createdAt = Time.now();
                updatedAt = Time.now();
            });
            state.wordList.add("sentence");
            state.wordList.add("free");
            state.wordList.add("crowd");
            state.wordList.add("drawer");
            state.wordList.add("safe");
            state.wordList.add("basket");
            state.wordList.add("inaugurate");
            state.wordList.add("skate");
            state.wordList.add("need");
            state.wordList.add("guess");
            state.wordList.add("embarrassed");
            state.wordList.add("song");
            state.wordList.add("birth");
            state.wordList.add("owl");
            state.wordList.add("slam");
            state.wordList.add("implant");
            state.wordList.add("nutty");
            state.wordList.add("fanatical");
            state.wordList.add("delicate");
            state.wordList.add("doll");
            state.wordList.add("groovy");
            state.wordList.add("bulb");
            state.wordList.add("addition");
            state.wordList.add("arrest");
            state.wordList.add("guiltless");
            state.wordList.add("guess");
            state.wordList.add("roll");
            state.wordList.add("cause");
            state.wordList.add("alleged");
            state.wordList.add("aware");
            state.wordList.add("copy");
            state.wordList.add("knock");
            state.wordList.add("offer");
            state.wordList.add("onerous");
            state.wordList.add("mountain");
            state.wordList.add("panoramic");
            state.wordList.add("school");
            state.wordList.add("tasty");
            state.wordList.add("sand");
            state.wordList.add("turkey");
            state.wordList.add("heave");
            state.wordList.add("adamant");
            state.wordList.add("disgusting");
            state.wordList.add("salt");
            state.wordList.add("mushy");
            state.wordList.add("party");
            state.wordList.add("possible");
            state.wordList.add("print");
            state.wordList.add("bless");
            state.wordList.add("cakes");
        };

        // range should always be greater than 3 for this implementation
        func psuedoRandom(seed: Nat, range: Nat) : Nat {
            // Every third number, first number decided by seed
            return (seed + 3) % range;
        };

        func generateRandomWordList(size: Nat) : [Text] {
            let randomWords = Buffer.Buffer<Text>(size);

            // using hashmap since hashset is not available
            let allAvailableWordIndices  = HashMap.HashMap<Int, Nat>(1, Int.equal, Int.hash);
            for(i in Iter.range(0, state.wordList.size() - 1)) {
                allAvailableWordIndices.put(i, 1); //value is useless here
            };
            // using abs to convert Int to Nat
            var seed = Int.abs(Time.now());
            var wordListLength = state.wordList.size();
            while(randomWords.size() < size) {
                seed := psuedoRandom(seed, allAvailableWordIndices.size());
                // same word index shouldn't be chosen again
                allAvailableWordIndices.delete(seed);
                randomWords.add(state.wordList.get(seed));
            };
            randomWords.toArray();
        }
    };

};