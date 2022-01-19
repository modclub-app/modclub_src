import Int "mo:base/Int";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";

import Types "../../types";

module {

    //POH Users Ref Data
    public type PohUsers = {
        userId: Principal;
        userName: ?Text;
        email: ?Text;
        fullName: ?Text;
        aboutUser: ?Text;
        createdAt: Int;
        updatedAt: Int;
    };

     public type ViolatedRules =  {
         ruleId: Text;
         ruleDesc: Text;
     };
    
    // Challeneges Ref Data
    public type PohChallenges =  {
        challengeId: Text;
        challengeName: Text;
        challengeDescription: Text;
        // assuming there will be no transitive dependencies. else graph needs to be used
        dependentChallengeId: ?Buffer.Buffer<Text>;
        requiredField: PohChallengeRequiredField;
        challengeType: PohChallengeType;
        allowedViolationRules: HashMap.HashMap<Text, ViolatedRules>;
        createdAt: Int;
        updatedAt: Int;
    };

    public type PohChallengeRequiredField =  {#textBlob; #imageBlob; #videoBlob; #profileFieldBlobs;};

    public type PohChallengeType =  {
        #ssn; #dl; #selfPic; #selfVideo; #fullName; #userName; #email;
    };

    public type PohUniqueToken =  {
        token: Text;
    };

    public type PohUserProviderData = {
        token: Text;
        providerUserId: Principal;
        providerId: Principal;
    };

    // Type representing Challenge attempt
    public type PohChallengesAttempt = {
        attemptId: ?Text;
        challengeId: Text;
        challengeName: Text;
        challengeDescription: Text;
        challengeType: PohChallengeType;
        userId: Principal;
        status: PohChallengeStatus;
        createdAt: Int;
        updatedAt: Int;
        completedOn: Int;
        // contentId: ?Text;
        dataCanisterId: ?Principal;
        wordList: ?[Text];
    };

    // type representing request for verificaiton
    public type PohVerificationRequest = {
        // We will generate request Id for each request, provider won't provide us. Hence it's mutable and optional
        requestId: Text;
        providerUserId: Principal;
        providerId: Principal;
    };

    // Response sent to provider for verificaitio request
    public type PohVerificationResponse = {
        requestId: Text;
        providerUserId: Principal;
        status: PohChallengeStatus;
        // status at each challenge level
        challenges: [ChallengeResponse];
        providerId: Principal;
        requestedOn: Int;
    };

    public type ChallengeResponse = {
        challengeId: Text;
        status : PohChallengeStatus;
        completedOn : ?Int;
    };

    public type PohChallengeStatus = {#notSubmitted; #pending; #verified; #rejected; #expired;};

    // type our UI will use to submit data for a challenge along with offset
    public type PohChallengeSubmissionRequest = {
        challengeId: Text;
        // response to challenge can be text or image or video
        challengeDataBlob : ?Blob;
        userName: ?Text;
        email: ?Text;
        fullName: ?Text;
        aboutUser: ?Text;
        offset: Nat;
        numOfChunks: Nat;
        mimeType: Text;
        dataSize: Nat;
    };

    public type PohChallengeSubmissionStatus = {#ok; #notPendingForSubmission; #alreadySubmitted; #alreadyRejected; #alreadyApproved; #inputDataMissing; #incorrectChallenge;};

    public type PohChallengeSubmissionResponse = {
        challengeId: Text;
        submissionStatus: PohChallengeSubmissionStatus;
    };

    public type PohChallengePackage = {
        id: Text;
        challengeIds: [Text];
        userId: Principal;
        // contentType: Types.ContentType;
        // status: Types.ContentStatus; 
        title: ?Text;
        createdAt: Int;
        updatedAt: Int;
    };

    public type PohTaskData = {
        challengeId: Text;
        challengeType: PohChallengeType;
        userId: Principal;
        status: PohChallengeStatus;
        userName: ?Text;
        email: ?Text;
        fullName: ?Text;
        aboutUser: ?Text;
        contentId: ?Text;
        dataCanisterId: ?Principal;
        createdAt: Int;
        updatedAt: Int;
    };

    public type PohTaskDataWrapper = {
        packageId: Text;
        pohTaskData: [PohTaskData];
    };

    public type PohTaskPlus = {
        packageId: Text;
        pohTaskData: [PohTaskData];
        status: Types.ContentStatus;
        voteCount: Nat;
        minVotes: Nat;
        minStake: Nat; 
        title: ?Text;
        hasVoted: ?Bool;
    };

    public type PohError = {
        #invalidToken;
        #challengeNotPendingForSubmission;
    };

};