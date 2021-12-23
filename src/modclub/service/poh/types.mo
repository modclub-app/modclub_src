import Int "mo:base/Int";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Types "./types";
import State "./state";
import Error "mo:base/Error";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug"; 

module {

    //POH Users Ref Data
    public type PohUsers {
        userId: Principal;
        createdAt: Int;
        updatedAt: Int;
    };
    // Challeneges Ref Data
    public type PohChallenges {
        challengeId: Nat;
        challengeName: Text;
        challengeDescription: Text;
        // assuming there will be no transitive dependencies. else graph needs to be used
        dependentChallengeId: Buffer.Buffer<Nat>;
        createdAt: Int;
        updatedAt: Int;
    };

    // Type representing Challenge attempt
    public type PohChallengesAttempt {
        attemptId: Nat;
        challengeId: Nat;
        userId: Principal;
        status : {#pending; #verified;};
        createdAt: Int;
        updatedAt: Int;
    };

    // type representing request for verificaiton
    public type PohVerificationRequest {
        // We will generate request Id for each request, provider won't provide us. Hence it's mutable and optional
        requestId: var ?Nat;
        userId: Principal;
        challengeIds: [Nat];
        providerId: Principal;
        requestedOn: Int;
        expiresOn: Int;
    };

    // Response sent to provider for verificaitio request
    public type PohVerificationResponse {
        requestId: Nat;
        userId: Principal;
        // status at each challenge level
        challenges: [{challengeId: Nat, status : {#notSubmitted; #pending; #verified; #rejected;}}];
        // overall status 
        status : {#notFound; #pending; #verified; #rejected;}
        providerId: Principal;
        requestedOn: Int;
        expiresOn: Int;
    };

    // type our UI will use to submit data for a challenge along with offset
    public type PohChallengeSubmissionRequest {
        challengeId: Nat;
        // response to challenge can be text or image or video
        challengeText: ?Text;
        challengeImage: ?[Nat8];
        challengeVideo: ?[Nat8];
        offset: Nat;
    };

};