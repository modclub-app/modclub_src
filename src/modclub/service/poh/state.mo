
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import PohTypes "./types";

module State {

    public type PohState = {
        //All pohUsers + modclub users
        pohUsers: HashMap.HashMap<Principal, PohTypes.PohUsers>;
        // All poh Challenges with dependent challenges
        pohChallenges: HashMap.HashMap<Nat, PohTypes.PohChallenges>;
        // Challenges attempted by each user
        // inner hashmap is for every challenge, how many times challenge user attempted and details
        pohUserChallengeAttempts: HashMap.HashMap<Principal, HashMap.HashMap<Nat, Buffer.Buffer<PohTypes.PohChallengesAttempt> >>;
        // Verificaion requests coming from provider
        pohVerificationRequests: HashMap.HashMap<Principal, HashMap.HashMap<Nat, PohTypes.PohChallengesAttempt>>;
    };

};