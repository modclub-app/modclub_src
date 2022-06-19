import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import TrieMap "mo:base/TrieMap";
import Iter "mo:base/Iter";
import PohTypes "./types";

import Rel "../../data_structures/Rel";
import RelObj "../../data_structures/RelObj";

module State {

    public type PohState = {
        pohChallenges: HashMap.HashMap<Text, PohTypes.PohChallenges>;
        // Challenges attempted by each user
        // inner hashmap is for every challenge, how many times challenge user attempted and details
        pohUserChallengeAttempts: HashMap.HashMap<Principal, HashMap.HashMap<Text, Buffer.Buffer<PohTypes.PohChallengesAttemptV1>>>;
        // POH User data by unique token
        token2ProviderAndUserData: HashMap.HashMap<Text, PohTypes.PohProviderAndUserData>;
        //mapping providerUserId to our userId
        providerUserIdToModclubUserIdByProviderId: HashMap.HashMap<Principal, RelObj.RelObj<Text, Principal>>;
        pohChallengePackages: TrieMap.TrieMap<Text, PohTypes.PohChallengePackage>;
        userToPohChallengePackageId: RelObj.RelObj<Principal, Text>;
        wordList: Buffer.Buffer<Text>;
        providersCallback: HashMap.HashMap<Principal, PohTypes.SubscribePohMessage>;
        // Callback issued for all user at what time by provider id
        callbackIssuedByProvider: HashMap.HashMap<Principal, TrieMap.TrieMap<Principal, Int>>;
    };

    public type PohStableState = {
        // All poh Challenges with dependent challenges
        pohChallenges: [(Text, PohTypes.PohChallenges)];
        // Challenges attempted by each user
        // inner hashmap is for every challenge, how many times challenge user attempted and details
        pohUserChallengeAttempts: [(Principal, [(Text, [PohTypes.PohChallengesAttemptV1])])];

        // POH User data by unique token
        token2ProviderAndUserData: [(Text, PohTypes.PohProviderAndUserData)];
        //mapping providerUserId to our userId
        providerUserIdToModclubUserIdByProviderId: [(Principal, Rel.RelShared<Text, Principal>)];
        pohChallengePackages : [(Text, PohTypes.PohChallengePackage)];
        userToPohChallengePackageId: Rel.RelShared<Principal, Text>;
        wordList: [Text];
        providersCallback: [(Principal, PohTypes.SubscribePohMessage)];
        callbackIssuedByProvider: [(Principal,[(Principal, Int)])];
    };

    public func emptyState(): PohState {
        return {
            pohChallenges = HashMap.HashMap<Text, PohTypes.PohChallenges>(1, Text.equal, Text.hash);
            pohUserChallengeAttempts = HashMap.HashMap<Principal, HashMap.HashMap<Text, Buffer.Buffer<PohTypes.PohChallengesAttemptV1>>>(10, Principal.equal, Principal.hash);
            token2ProviderAndUserData = HashMap.HashMap<Text, PohTypes.PohProviderAndUserData>(1, Text.equal, Text.hash);
            providerUserIdToModclubUserIdByProviderId = HashMap.HashMap<Principal, RelObj.RelObj<Text, Principal>>(1, Principal.equal, Principal.hash);
            pohChallengePackages = HashMap.HashMap<Text, PohTypes.PohChallengePackage>(1, Text.equal, Text.hash);
            userToPohChallengePackageId = RelObj.RelObj((Principal.hash, Text.hash), (Principal.equal, Text.equal));
            wordList = Buffer.Buffer<Text>(1);
            providersCallback = HashMap.HashMap<Principal, PohTypes.SubscribePohMessage>(1, Principal.equal, Principal.hash);
            callbackIssuedByProvider = HashMap.HashMap<Principal, HashMap.HashMap<Principal, Int>>(1, Principal.equal, Principal.hash);
        };
    };

    public func emptyStableState(): PohStableState {
        let st = {
            pohChallenges = [];
            pohUserChallengeAttempts = [];
            token2ProviderAndUserData = [];
            providerUserIdToModclubUserIdByProviderId = [];
            pohChallengePackages = [];
            userToPohChallengePackageId = Rel.emptyShared<Principal, Text>();
            wordList = [];
            providersCallback = [];
            callbackIssuedByProvider = [];
        };
        return st;
    };

    public func getState(stableState: PohStableState) : PohState {
        var state : PohState = emptyState();
        
        for( (p, val) in stableState.pohChallenges.vals()) {
            state.pohChallenges.put(p, val);
        };

        for( (userId, challenges) in stableState.pohUserChallengeAttempts.vals()) {
            let attemptsByChallengeIdMap = HashMap.HashMap<Text, Buffer.Buffer<PohTypes.PohChallengesAttemptV1>>(5, Text.equal, Text.hash);
            for((challengeId, attempts) in challenges.vals()) {
                let attemptsBuffer = Buffer.Buffer<PohTypes.PohChallengesAttemptV1>(attempts.size());
                for(attempt in attempts.vals()) {
                    attemptsBuffer.add(attempt);
                };
                attemptsByChallengeIdMap.put(challengeId, attemptsBuffer);
            };
            state.pohUserChallengeAttempts.put(userId, attemptsByChallengeIdMap);
        };

        for( (p, val) in stableState.token2ProviderAndUserData.vals()) {
            state.token2ProviderAndUserData.put(p, val);
        };
        for( (provider, user2ModclubUser) in stableState.providerUserIdToModclubUserIdByProviderId.vals()) {
            let user2ModclubUserRelObj = RelObj.RelObj<Text, Principal> ((Text.hash, Principal.hash), (Text.equal, Principal.equal));
            user2ModclubUserRelObj.setRel(
                    Rel.fromShare<Text, Principal>(user2ModclubUser, (Text.hash, Principal.hash), (Text.equal, Principal.equal))
            );
            state.providerUserIdToModclubUserIdByProviderId.put(provider, user2ModclubUserRelObj);
        };

        for( (p, val) in stableState.pohChallengePackages.vals()) {
            state.pohChallengePackages.put(p, val);
        };

        state.userToPohChallengePackageId.setRel(
                Rel.fromShare<Principal, Text>(stableState.userToPohChallengePackageId, (Principal.hash, Text.hash), (Principal.equal, Text.equal))
        );
        for(w in stableState.wordList.vals()) {
            state.wordList.add(w);
        };
        for((pId, callback) in stableState.providersCallback.vals()) {
            state.providersCallback.put(pId, callback);
        };

        for((providerId, callbackByUser) in stableState.callbackIssuedByProvider.vals()) {
            let callbackDataMap = HashMap.fromIter<Principal, Int> (callbackByUser.vals(), callbackByUser.size(), Principal.equal, Principal.hash);
            state.callbackIssuedByProvider.put(providerId, callbackDataMap);
        };
        return state;
    };

    public func getStableState(state: PohState): PohStableState {

        let pohUserChallengeAttempts = Buffer.Buffer<(Principal, [(Text, [PohTypes.PohChallengesAttemptV1])])>(state.pohUserChallengeAttempts.size());
        for( (userId, challenges) in state.pohUserChallengeAttempts.entries()) {
            let challengeMap = Buffer.Buffer<(Text, [PohTypes.PohChallengesAttemptV1])>(challenges.size());
            for((challengeId, attempts) in challenges.entries()) {
                let attemptsBuffer = Buffer.Buffer<PohTypes.PohChallengesAttemptV1>(attempts.size());
                for(attempt in attempts.vals()) {
                    attemptsBuffer.add(attempt);
                };
                challengeMap.add((challengeId, attemptsBuffer.toArray()));
            };
            pohUserChallengeAttempts.add((userId, challengeMap.toArray()));
        };

        let providerUserIdToModclubUserIdByProviderIdBuf = Buffer.Buffer<(Principal, Rel.RelShared<Text, Principal>)>(1);
        for((provider, user2ModclubUserRelObj) in state.providerUserIdToModclubUserIdByProviderId.entries()) {
            providerUserIdToModclubUserIdByProviderIdBuf.add((provider, Rel.share(user2ModclubUserRelObj.getRel())));
        };

        let callbackIssuedByProviderBuff = Buffer.Buffer<(Principal, [(Principal, Int)])>(1);
        for((providerId, callbackByUser) in state.callbackIssuedByProvider.entries()) {
            let callbackByUserBuff = Buffer.Buffer<(Principal, Int)>(1);
            for((userId, time) in callbackByUser.entries()) {
                callbackByUserBuff.add((userId, time));
            };
            callbackIssuedByProviderBuff.add((providerId, callbackByUserBuff.toArray()));
        };

        let st = {
            pohChallenges = Iter.toArray(state.pohChallenges.entries());
            pohUserChallengeAttempts = pohUserChallengeAttempts.toArray();
            token2ProviderAndUserData = Iter.toArray(state.token2ProviderAndUserData.entries());
            providerUserIdToModclubUserIdByProviderId = providerUserIdToModclubUserIdByProviderIdBuf.toArray();
            pohChallengePackages = Iter.toArray(state.pohChallengePackages.entries());
            userToPohChallengePackageId = Rel.share<Principal, Text>(state.userToPohChallengePackageId.getRel());
            wordList = state.wordList.toArray();
            providersCallback = Iter.toArray(state.providersCallback.entries());
            callbackIssuedByProvider = callbackIssuedByProviderBuff.toArray();
        };
        return st;
    };

    //  public func downloadSupport(state: PohState, varName: Text, start: Int, end: Int): () {
    //     switch(varName) {
    //         case("pohChallenges") {
    //             let buff = Buffer.Buffer<[Text]>(1);
    //             for((challengeId, challenge) in state.pohChallenges.entries()) {
    //                 buff.add([challengeId, challenge.challengeId, challenge.challengeName, 
    //                 challenge.challengeDescription, challenge.dependentChallengeId, challenge.requiredField, challenge.challengeType, 
    //                 challenge.allowedViolationRules, challenge.createdAt, challenge.updatedAt
    //                 ])
    //             };
    //         };
    //         case(_) {

    //         };
    //     };
    // };
};