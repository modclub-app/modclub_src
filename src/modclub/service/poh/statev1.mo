import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import PohTypes "./types";
import PohStateV0 "./state";

import Rel "../../data_structures/Rel";
import RelObj "../../data_structures/RelObj";

module State {

    public type PohState = {
        //All pohUsers + modclub users
        pohUsers: HashMap.HashMap<Principal, PohTypes.PohUsers>;
        // All poh Challenges with dependent challenges
        pohChallenges: HashMap.HashMap<Text, PohTypes.PohChallenges>;
        // Challenges attempted by each user
        // inner hashmap is for every challenge, how many times challenge user attempted and details
        pohUserChallengeAttempts: HashMap.HashMap<Principal, HashMap.HashMap<Text, Buffer.Buffer<PohTypes.PohChallengesAttempt>>>;
        // POH User data by unique token
        pohProviderUserData: HashMap.HashMap<Text, PohTypes.PohUserProviderData>;
        //mapping providerUserId to our userId
        providerToModclubUser: HashMap.HashMap<Principal, Principal>;
        pohChallengePackages: HashMap.HashMap<Text, PohTypes.PohChallengePackage>;
        userToPohChallengePackageId: RelObj.RelObj<Principal, Text>;
        // rejectedPohPackages: Buffer.Buffer<Text>;
        wordList: Buffer.Buffer<Text>;
        provider2PohVerificationRequests: HashMap.HashMap<Principal, Text>;
        pohVerificationRequests: HashMap.HashMap<Text, PohTypes.PohVerificationRequest>;
    };

    public type PohStableState = {
        //All pohUsers + modclub users
        pohUsers: [(Principal, PohTypes.PohUsers)];
        // All poh Challenges with dependent challenges
        pohChallenges: [(Text, PohTypes.PohChallenges)];
        // Challenges attempted by each user
        // inner hashmap is for every challenge, how many times challenge user attempted and details
        pohUserChallengeAttempts: [(Principal, [(Text, [PohTypes.PohChallengesAttempt])])];

        // POH User data by unique token
        pohProviderUserData: [(Text, PohTypes.PohUserProviderData)];
        //mapping providerUserId to our userId
        providerToModclubUser: [(Principal, Principal)];
        pohChallengePackages : [(Text, PohTypes.PohChallengePackage)];
        userToPohChallengePackageId: Rel.RelShared<Principal, Text>;
        wordList: [Text];
        provider2PohVerificationRequests: [(Principal, Text)];
        pohVerificationRequests: [(Text, PohTypes.PohVerificationRequest)];
    };

    public func emptyState(): PohState {
        return {
            pohUsers = HashMap.HashMap<Principal, PohTypes.PohUsers>(1, Principal.equal, Principal.hash);
            pohChallenges = HashMap.HashMap<Text, PohTypes.PohChallenges>(1, Text.equal, Text.hash);
            pohUserChallengeAttempts = HashMap.HashMap<Principal, HashMap.HashMap<Text, Buffer.Buffer<PohTypes.PohChallengesAttempt>>>(10, Principal.equal, Principal.hash);
            pohProviderUserData = HashMap.HashMap<Text, PohTypes.PohUserProviderData>(1, Text.equal, Text.hash);
            providerToModclubUser = HashMap.HashMap<Principal, Principal>(1, Principal.equal, Principal.hash);
            pohChallengePackages = HashMap.HashMap<Text, PohTypes.PohChallengePackage>(1, Text.equal, Text.hash);
            userToPohChallengePackageId = RelObj.RelObj((Principal.hash, Text.hash), (Principal.equal, Text.equal));
            wordList = Buffer.Buffer<Text>(1);
            provider2PohVerificationRequests = HashMap.HashMap<Principal, Text>(1, Principal.equal, Principal.hash);
            pohVerificationRequests = HashMap.HashMap<Text, PohTypes.PohVerificationRequest>(1, Text.equal, Text.hash);
        };
    };

    public func emptyStableState(): PohStableState {
        let st = {
            pohUsers = [];
            pohChallenges = [];
            pohUserChallengeAttempts = [];
            pohProviderUserData = [];
            providerToModclubUser = [];
            pohChallengePackages = [];
            userToPohChallengePackageId = Rel.emptyShared<Principal, Text>();
            wordList = [];
            provider2PohVerificationRequests =  [];
            pohVerificationRequests = [];
        };
        return st;
    };

    public func getState(stableState: PohStableState) : PohState {
        var state : PohState = emptyState();
        
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
        for( (p, val) in stableState.pohChallengePackages.vals()) {
            state.pohChallengePackages.put(p, val);
        };

        state.userToPohChallengePackageId.setRel(
                Rel.fromShare<Principal, Text>(stableState.userToPohChallengePackageId, (Principal.hash, Text.hash), (Principal.equal, Text.equal))
        );
        for(w in stableState.wordList.vals()) {
            state.wordList.add(w);
        };
        for( (p, val) in stableState.provider2PohVerificationRequests.vals()) {
            state.provider2PohVerificationRequests.put(p, val);
        };
        for( (p, val) in stableState.pohVerificationRequests.vals()) {
            state.pohVerificationRequests.put(p, val);
        };
        return state;
    };

    public func getStableState(state: PohState): PohStableState {

        let pohUserChallengeAttempts = Buffer.Buffer<(Principal, [(Text, [PohTypes.PohChallengesAttempt])])>(state.pohUserChallengeAttempts.size());
        for( (userId, challenges) in state.pohUserChallengeAttempts.entries()) {
            let challengeMap = Buffer.Buffer<(Text, [PohTypes.PohChallengesAttempt])>(challenges.size());
            for((challengeId, attempts) in challenges.entries()) {
                let attemptsBuffer = Buffer.Buffer<PohTypes.PohChallengesAttempt>(attempts.size());
                for(attempt in attempts.vals()) {
                    attemptsBuffer.add(attempt);
                };
                challengeMap.add((challengeId, attemptsBuffer.toArray()));
            };
            pohUserChallengeAttempts.add((userId, challengeMap.toArray()));
        };

        let st = {
            pohUsers = Iter.toArray(state.pohUsers.entries());
            pohChallenges = Iter.toArray(state.pohChallenges.entries());
            pohUserChallengeAttempts = pohUserChallengeAttempts.toArray();
            pohProviderUserData = Iter.toArray(state.pohProviderUserData.entries());
            providerToModclubUser = Iter.toArray(state.providerToModclubUser.entries());
            pohChallengePackages = Iter.toArray(state.pohChallengePackages.entries());
            userToPohChallengePackageId = Rel.share<Principal, Text>(state.userToPohChallengePackageId.getRel());
            wordList = state.wordList.toArray();
            provider2PohVerificationRequests =  Iter.toArray(state.provider2PohVerificationRequests.entries());
            pohVerificationRequests = Iter.toArray(state.pohVerificationRequests.entries());
        };
        return st;
    };

    public func createState(state: PohStateV0.PohState): PohStableState {

        return emptyStableState();
    };

};