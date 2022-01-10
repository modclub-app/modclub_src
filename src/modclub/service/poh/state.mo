import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import PohTypes "./types";

module State {

    public type PohState = {
        //All pohUsers + modclub users
        pohUsers: HashMap.HashMap<Principal, PohTypes.PohUsers>;
        // All poh Challenges with dependent challenges
        pohChallenges: HashMap.HashMap<Text, PohTypes.PohChallenges>;
        // Challenges attempted by each user
        // inner hashmap is for every challenge, how many times challenge user attempted and details
        pohUserChallengeAttempts: HashMap.HashMap<Principal, HashMap.HashMap<Text, Buffer.Buffer<PohTypes.PohChallengesAttempt>>>;
        // Verificaion requests coming from provider
        // pohVerificationRequests: HashMap.HashMap<Principal, HashMap.HashMap<Text, PohTypes.PohChallengesAttempt>>;
        // POH User data by unique token
        pohProviderUserData: HashMap.HashMap<Text, PohTypes.PohUserProviderData>;
        //mapping providerUserId to our userId
        providerToModclubUser: HashMap.HashMap<Principal, Principal>;
        pohChallengePackages: HashMap.HashMap<Text, PohTypes.PohChallengePackage>;
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
        // Verificaion requests coming from provider
        // pohVerificationRequests: [(Principal, [(Text, PohTypes.PohChallengesAttempt)])];
        // POH User data by unique token
        pohProviderUserData: [(Text, PohTypes.PohUserProviderData)];
        //mapping providerUserId to our userId
        providerToModclubUser: [(Principal, Principal)];
        pohChallengePackages : [(Text, PohTypes.PohChallengePackage)];
        wordList: [Text];
        provider2PohVerificationRequests: [(Principal, Text)];
        pohVerificationRequests: [(Text, PohTypes.PohVerificationRequest)];
    };

    public func emptyState(): PohState {
        return {
            pohUsers = HashMap.HashMap<Principal, PohTypes.PohUsers>(1, Principal.equal, Principal.hash);
            pohChallenges = HashMap.HashMap<Text, PohTypes.PohChallenges>(1, Text.equal, Text.hash);
            pohUserChallengeAttempts = HashMap.HashMap<Principal, HashMap.HashMap<Text, Buffer.Buffer<PohTypes.PohChallengesAttempt>>>(10, Principal.equal, Principal.hash);
            // pohVerificationRequests = HashMap.HashMap<Principal, HashMap.HashMap<Text, PohTypes.PohChallengesAttempt>>(10, Principal.equal, Principal.hash);
            pohProviderUserData = HashMap.HashMap<Text, PohTypes.PohUserProviderData>(1, Text.equal, Text.hash);
            providerToModclubUser = HashMap.HashMap<Principal, Principal>(1, Principal.equal, Principal.hash);
            pohChallengePackages = HashMap.HashMap<Text, PohTypes.PohChallengePackage>(1, Text.equal, Text.hash);
            wordList = Buffer.Buffer<Text>(1);
            provider2PohVerificationRequests = HashMap.HashMap<Principal, Text>(1, Principal.equal, Principal.hash);
            pohVerificationRequests = HashMap.HashMap<Text, PohTypes.PohVerificationRequest>(1, Text.equal, Text.hash);
        };
    };

    public func emptyStableState(): PohStableState {
        return {
            pohUsers = [];
            pohChallenges = [];
            pohUserChallengeAttempts = [];
            pohProviderUserData = [];
            providerToModclubUser = [];
            pohChallengePackages = [];
            wordList = [];
            provider2PohVerificationRequests =  [];
            pohVerificationRequests = [];
        };
    };

    public func getStableState(state: PohState): PohStableState {
        let stableState = emptyStableState();
    };

};