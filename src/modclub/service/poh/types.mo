import Int "mo:base/Int";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";

import Types "../../types";

module {
      
    public type PohChallengeStatus = {
        #notSubmitted;
        #pending;
        #verified;
        #rejected;
        #expired;
    };

    public type PohVerificationStatus = {
        #startPoh;
        #notSubmitted;
        #pending;
        #verified;
        #rejected;
        #expired;
    };

    // public type PohChallengeStatusV1 = {
    //     #notSubmitted;
    //     #pending;
    //     #verified;
    //     #rejected;
    //     #expired;
    // };

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
        dependentChallengeId: ?[Text];
        requiredField: PohChallengeRequiredField;
        challengeType: PohChallengeType;
        allowedViolationRules:  [ViolatedRules];
        createdAt: Int;
        updatedAt: Int;
    };

    public type PohChallengeRequiredField =  {#textBlob; #imageBlob; #videoBlob; #audioBlob; #profileFieldBlobs;};

    public type PohChallengeType =  {
        #ssn; #dl; #selfPic; #selfVideo; #selfAudio; #fullName; #userName; #email;
    };

    public type PohUniqueToken =  {
        token: Text;
    };

    // To be deleted
    public type PohUserProviderData = {
        token: Text;
        providerUserId: Principal;
        providerId: Principal;
    };

    public type PohProviderAndUserData = {
        token: Text;
        providerUserId: Text;
        providerId: Principal;
        generatedAt: Int;
    };

    public type PohRequestData = {
        requestId: Text;
        token: Text;
        providerUserId: Text;
        providerId: Principal;
        requestedAt: Int;
    };

    public type PohConfigurationForProvider = {
        challengeIds: [Text];
        expiry: Nat;
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
        dataCanisterId: ?Principal;
        wordList: ?[Text];
    };

    // type representing request for verificaiton
    public type PohVerificationRequest = {
        requestId: Text;
        providerUserId: Principal;
        providerId: Principal;
    };

    // type representing request for verificaiton
    public type PohVerificationRequestV1 = {
        requestId: Text;
        providerUserId: Text;
        providerId: Principal;
    };

    // Response sent to provider for verificaitio request
    public type PohVerificationResponse = {
        requestId: Text;
        providerUserId: Text;
        status: PohVerificationStatus;
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

    // type our UI will use to submit data for a challenge along with offset
    public type PohChallengeSubmissionRequest = {
        challengeId: Text;
        // response to challenge can be text or image or video
        challengeDataBlob : ?Blob;
        offset: Nat; // default 1
        numOfChunks: Nat; // default 1
        mimeType: Text; // 
        dataSize: Nat; // whole size of blob
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
        title: ?Text;
        createdAt: Int;
        updatedAt: Int;
    };

    public type PohTaskData = {
        challengeId: Text;
        challengeType: PohChallengeType;
        userId: Principal;
        status: PohChallengeStatus;
        contentId: ?Text;
        dataCanisterId: ?Principal;
        wordList: ?[Text];
        allowedViolationRules: [ViolatedRules];
        createdAt: Int;
        updatedAt: Int;
    };

    public type PohTaskDataWrapper = {
        packageId: Text;
        pohTaskData: [PohTaskData];
        createdAt: Int;
        updatedAt: Int;
    };

    public type PohTaskDataWrapperPlus = {
        packageId: Text;
        pohTaskData: [PohTaskData];
        votes: Nat;
        minVotes: Int;
        minStake: Int;
        reward: Float;
        createdAt: Int;
        updatedAt: Int;
    };

    public type PohTaskPlus = {
        packageId: Text;
        status: Types.ContentStatus;
        voteCount: Nat;
        profileImageUrlSuffix: ?Text;
        minVotes: Int;
        minStake: Int; 
        title: ?Text;
        hasVoted: ?Bool;
        reward: Float;
        createdAt: Int;
        updatedAt: Int;
    };

    public type PohError = {
        #invalidToken;
        #challengeNotPendingForSubmission;
        #invalidPackageId;
        #pohNotConfiguredForProvider
    };

    public type VerifyHumanityResponse = {
        status: PohChallengeStatus;
        token: ?PohUniqueToken;
        rejectionReasons: [Text];
    };

};