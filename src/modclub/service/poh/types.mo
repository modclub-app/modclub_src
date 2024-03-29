import Int "mo:base/Int";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";

import Types "../../types";
import VoteTypes "../vote/types";

module {
  public type PohChallengeStatus = {
    #notSubmitted;
    #pending;
    #verified;
    #rejected;
    #expired;
    #processing;
    #rejectedDuplicate;
  };

  public type PohVerificationStatus = {
    #startPoh;
    #notSubmitted;
    #pending;
    #verified;
    #rejected;
    #expired;
    #processing;
    #rejectedDuplicate;
  };

  // To be deleted after deployment
  public type PohUsers = {
    userId : Principal;
    userName : ?Text;
    email : ?Text;
    fullName : ?Text;
    aboutUser : ?Text;
    createdAt : Int;
    updatedAt : Int;
  };

  public type ViolatedRules = {
    ruleId : Text;
    ruleDesc : Text;
  };

  // Challeneges Ref Data
  public type PohChallenges = {
    challengeId : Text;
    challengeName : Text;
    challengeDescription : Text;
    // assuming there will be no transitive dependencies. else graph needs to be used
    dependentChallengeId : ?[Text];
    requiredField : PohChallengeRequiredField;
    challengeType : PohChallengeType;
    allowedViolationRules : [ViolatedRules];
    createdAt : Int;
    updatedAt : Int;
  };

  public type PohChallengeRequiredField = {
    #textBlob;
    #imageBlob;
    #videoBlob;
    #profileFieldBlobs;
  };

  public type PohChallengeType = {
    #ssn; // SSN
    #dl; // Draw Lines
    #selfPic; // Profile Pic
    #selfVideo; // Video
    #fullName; // User full name
    #userName; // User name
    #email; // Email
    #uniquePohVideo; // Unique Video
  };

  // To be deleted after deployment
  public type PohUserProviderData = {
    token : Text;
    providerUserId : Principal;
    providerId : Principal;
  };

  public type PohProviderAndUserData = {
    token : Text;
    providerUserId : Text;
    providerId : Principal;
    generatedAt : Int;
  };

  public type PohRequestData = {
    requestId : Text;
    token : Text;
    providerUserId : Text;
    providerId : Principal;
    requestedAt : Int;
  };

  public type PohConfigurationForProvider = {
    challengeIds : [Text];
    expiry : Nat;
  };

  public type PohChallengesAttemptV1 = {
    attemptId : ?Text;
    challengeId : Text;
    challengeName : Text;
    challengeDescription : Text;
    challengeType : PohChallengeType;
    userId : Principal;
    status : PohChallengeStatus;
    createdAt : Int;
    submittedAt : Int;
    updatedAt : Int;
    completedOn : Int;
    dataCanisterId : ?Principal;
    wordList : ?[Text];
  };

  // type representing request for verificaiton
  // to be deleted after deployment
  public type PohVerificationRequest = {
    requestId : Text;
    providerUserId : Principal;
    providerId : Principal;
  };

  // type representing request for verificaiton
  public type PohVerificationRequestV1 = {
    requestId : Text;
    providerUserId : Text;
    providerId : Principal;
  };

  // Response sent to provider for verificaition request
  public type PohVerificationResponsePlus = {
    providerUserId : Text;
    status : PohVerificationStatus;
    // status at each challenge level
    challenges : [ChallengeResponse];
    providerId : Principal;
    token : ?Text;
    rejectionReasons : [Text];
    requestedAt : ?Int;
    submittedAt : ?Int;
    completedAt : ?Int;
    isFirstAssociation : Bool;
  };

  public type PohVerificationResponse = {
    status : PohVerificationStatus;
    requestedAt : ?Int;
    submittedAt : ?Int;
    completedAt : ?Int;
    // status at each challenge level
    challenges : [ChallengeResponse];
  };

  public type ChallengeResponse = {
    challengeId : Text;
    status : PohChallengeStatus;
    requestedAt : ?Int;
    submittedAt : ?Int;
    completedAt : ?Int;
  };

  // type our UI will use to submit data for a challenge along with offset
  public type PohChallengeSubmissionRequest = {
    challengeId : Text;
    // response to challenge can be text or image or video
    challengeDataBlob : ?Blob;
    offset : Nat;
    // default 1
    numOfChunks : Nat;
    // default 1
    mimeType : Text;
    //
    dataSize : Nat;
    // whole size of blob
  };

  public type PohChallengeSubmissionStatus = {
    #ok;
    #notPendingForSubmission;
    #alreadySubmitted;
    #alreadyRejected;
    #alreadyApproved;
    #inputDataMissing;
    #incorrectChallenge;
    #submissionDataLimitExceeded;
  };

  public type PohChallengeSubmissionResponse = {
    challengeId : Text;
    submissionStatus : PohChallengeSubmissionStatus;
  };

  public type PohChallengePackage = {
    id : Text;
    challengeIds : [Text];
    userId : Principal;
    title : ?Text;
    createdAt : Int;
    updatedAt : Int;
  };

  public type PohTaskData = {
    challengeId : Text;
    challengeType : PohChallengeType;
    userId : Principal;
    status : PohChallengeStatus;
    contentId : ?Text;
    dataCanisterId : ?Principal;
    wordList : ?[Text];
    allowedViolationRules : [ViolatedRules];
    createdAt : Int;
    updatedAt : Int;
    submittedAt : Int;
    completedOn : Int;
  };

  public type PohTaskDataWrapper = {
    packageId : Text;
    pohTaskData : [PohTaskData];
    createdAt : Int;
    updatedAt : Int;
  };

  public type PohTaskDataWrapperPlus = {
    packageId : Text;
    pohTaskData : [PohTaskData];
    votes : Nat;
    requiredVotes : Int;
    minStake : Int;
    reward : Float;
    isReserved : Bool;
    reservation : ?Types.Reserved;
    createdAt : Int;
    updatedAt : Int;
  };

  public type PohTaskPlus = {
    packageId : Text;
    status : Types.ContentStatus;
    voteCount : Nat;
    profileImageUrlSuffix : ?Text;
    requiredVotes : Int;
    minStake : Int;
    title : ?Text;
    hasVoted : ?Bool;
    isReserved : Bool;
    reservation : ?Types.Reserved;
    reward : Float;
    createdAt : Int;
    updatedAt : Int;
  };

  public type PohError = {
    #invalidToken;
    #challengeNotPendingForSubmission;
    #invalidPackageId;
    #pohNotConfiguredForProvider;
    #pohCallbackNotRegistered;
    #attemptToAssociateMultipleModclubAccounts : Principal;
    #attemptToCreateMultipleWalletsWithSameIp;
  };

  public type PohTaskPlusForAdmin = {
    packageId : Text;
    status : Types.ContentStatus;
    voteCount : Nat;
    profileImageUrlSuffix : ?Text;
    userModClubId : Text;
    userUserName : Text;
    userEmailId : Text;
    submittedAt : Int;
    completedOn : Int;
    pohTaskData : [PohTaskData];
  };

  public type PohTaskDataAndVotesWrapperPlus = {
    packageId : Text;
    pohTaskData : [PohTaskData];
    voteUserDetails : [VoteTypes.VotePlusUser];
    requiredVotes : Int;
    minStake : Int;
    reward : Float;
    createdAt : Int;
    updatedAt : Int;
  };

  public type VerifyHumanityResponse = {
    status : PohVerificationStatus;
    token : ?Text;
    rejectionReasons : [Text];
  };

  public type SubscribePohMessage = {
    callback : shared (PohVerificationResponsePlus) -> ();
  };
};
