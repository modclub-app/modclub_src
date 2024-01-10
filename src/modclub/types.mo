import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Result "mo:base/Result";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import Blob "mo:base/Blob";
import JSON "mo:json/JSON";
import ICRCTypes "../common/ICRCTypes";
import PohTypes "service/vote/types"

module {
  public type TransferToProviderArgs = {
    fromSubaccount : Blob;
    to : ICRCTypes.Account;
    amount : ICRCTypes.Tokens;
  };

  public type AirdropMetadataImportPayload = {
    userPoints : [(Principal, Int)];
  };

  public type ProviderAdmins = {
    pid : Principal;
    admins : [ProfileStable];
  };

  public type ProviderAdminsInfo = {
    pid : Principal;
    admins : [ProfileInfoStable];
  };

  public type CanClaimLockedResponse = {
    canClaim : Bool;
    claimAmount : ICRCTypes.Tokens;
    claimPrice : ICRCTypes.Tokens;
  };

  public type Timestamp = Int;
  // See mo:base/Time and Time.now()
  public type UserId = Principal;
  public type ContentId = Text;
  public type RuleId = Text;
  public type VoteId = Text;
  public type ReceiptId = Text;
  public type ReservedId = Text;
  public type VoteParamsId = Text;
  public type ProviderId = Principal;

  public type Action = {
    #submit;
    #vote;
    #registerRule;
    #getProfile;
    #getContent;
    #getRules;
    #getVotes;
    #getProviders;
    #getAllusers;
    #getActivity;
  };

  public type Decision = {
    #approved;
    #rejected;
  };

  public type ContentStatus = {
    #approved;
    #rejected;
    #new;
  };

  public type ContentType = {
    // Simple plain text
    #text;
    // Multiple lines of text;
    #multiText;
    // A link to an image
    #imageUrl;
    // Image Data
    #imageBlob;
    #htmlContent;

    #media;
  };

  public type Role = {
    // A content moderator
    #moderator;
    // A provider admin
    #admin;
    // Modclub owner aka me
    #owner;
  };

  public type Rule = {
    id : RuleId;
    description : Text;
  };

  public type ContentPlus = {
    id : ContentId;
    providerId : Principal;
    providerName : Text;
    contentType : ContentType;
    contentCategory : CategoryId;
    sourceId : Text;
    status : ContentStatus;
    voteCount : Nat;
    requiredVotes : Nat;
    minStake : Nat;
    title : ?Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
    text : ?Text;
    image : ?Image;
    contentCanisterId : ?Principal;
    hasVoted : ?Bool;
    // voteParameters : ?VoteParamsId;
    voteParameters : VoteParameters;
    reservedList : [Reserved];
    receipt : Receipt;
  };

  public type Content = {
    id : ContentId;
    providerId : Principal;
    contentType : ContentType;
    sourceId : Text;
    status : ContentStatus;
    title : ?Text;
    createdAt : Int;
    updatedAt : Int;
    // voteParameters : ?VoteParamsId;
    voteParameters : VoteParameters;
    reservedList : [Reserved];
    receipt : Receipt;
  };

  public type CategoryId = Text;

  public type ContentCategory = {
    id : CategoryId;
    pid : ?CategoryId;
    providerId : Principal;
    title : Text;
  };

  public type Level = {
    #simple;
    #normal;
    #hard;
    #xhard;
  };

  public type Complexity = {
    level : Level;
    expiryTime : Timestamp;
  };

  public type RunResult = Result.Result<(), RunError>;
  public type RunError = {
    #UnexpectedValue : Text;
    #UnexpectedError : Text;
  };
  public type Reserved = {
    id : ReservedId;
    profileId : Text;
    // role: Text; // Should we add this?
    createdAt : Timestamp; // Based on a timeout we should be able to remove Reserveds
    updatedAt : Timestamp;
    reservedExpiryTime : Timestamp; // High complexity may also have higher Reserved expiry time.
  };

  public type Receipt = {
    id : ReceiptId;
    cost : Int; // High complexity may also have higher Reserved expiry time. In MOD Tokens
    createdAt : Timestamp;
  };

  public type VoteParameters = {
    id : VoteParamsId;
    requiredVotes : Int;

    // Should we add these?
    // requiredVotes: Int;
    // requiredSenior: Int;
    // requiredJunior: Int;
    // votingPowerSenior: Int;
    // votingPowerJunior: Int;

    createdAt : Timestamp;
    updatedAt : Timestamp;
    complexity : Complexity; // High complexity may also have higher Reserved expiry time.
  };

  public type TextContent = {
    id : ContentId;
    text : Text;
  };

  public type MultiTextContent = {
    id : ContentId;
    text : [Text];
  };

  public type ImageUrl = {
    id : ContentId;
    url : Text;
  };

  public type ImageContent = {
    id : ContentId;
    image : Image;
  };

  public type Image = {
    data : [Nat8];
    imageType : Text;
  };

  public type SubAccountsList = HashMap.HashMap<Text, Blob>;

  public type SubAccounts = {
    subaccounts : SubAccountsList;
  };

  public type SubAccountsStable = {
    subaccounts : [(Text, Blob)];
  };

  public type ProviderInfo = {
    id : Principal;
    name : Text;
    description : Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
    image : ?Image;
  };

  public type SettingsForProvider = {
    settings : ProviderSettings;
  };

  public type Provider = ProviderInfo and SubAccounts and SettingsForProvider;

  public type ProviderInfoStable = {
    id : Principal;
    name : Text;
    description : Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
    settings : ProviderSettings;
    image : ?Image;
  };

  public type ProviderStable = ProviderInfoStable and SubAccountsStable;

  public type ProviderMeta = {
    name : Text;
    description : Text;
  };

  public type ProviderPlus = {
    id : Principal;
    name : Text;
    description : Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
    settings : ProviderSettings;
    subaccounts : [(Text, Blob)];
    image : ?Image;
    contentCount : Nat;
    activeCount : Nat;
    rewardsSpent : Nat;
    rules : [Rule];
  };

  public type ProviderSettings = {
    requiredVotes : Nat;
    minStaked : Nat;
  };

  public type Profile = SubAccounts and {
    id : UserId;
    userName : Text;
    email : Text;
    role : Role;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type ProfileInfoStable = {
    id : UserId;
    userName : Text;
    email : Text;
    role : Role;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type ProfileStable = ProfileInfoStable and SubAccountsStable;

  public type ImportProfile = ProfileInfoStable and {
    pic : ?Image;
  };

  public type ModeratorLeaderboard = {
    id : UserId;
    userName : Text;
    completedVoteCount : Int;
    rewardsEarned : Int;
    rs : Float;
    performance : Float;
    lastVoted : ?Timestamp;
  };

  public type OldModeratorLeaderboard = {
    id : UserId;
    userName : Text;
    completedVoteCount : Int;
    rewardsEarned : Int;
    performance : Float;
    lastVoted : ?Timestamp;
  };

  public type RewardsEarnedMap = {
    rewardsEarned : Int;
    userId : Principal;
  };

  public type Vote = {
    id : VoteId;
    contentId : Text;
    userId : UserId;
    decision : Decision;
    violatedRules : ?[RuleId];
    createdAt : Timestamp;
  };

  public type UserLevel = {
    #novice;
    #junior;
    #senior1;
    #senior2;
    #senior3;
  };

  public type VoteV2 = {
    id : VoteId;
    contentId : Text;
    userId : UserId;
    decision : Decision;
    rsBeforeVoting : Int;
    level : UserLevel;
    violatedRules : ?[RuleId];
    createdAt : Timestamp;
    totalReward : ?Float; // Once voting concludes, the rewards should be issued.
    lockedReward : ?Float;
    rsReceived : ?Int;
  };

  public type ViolatedRules = {
    id : RuleId;
    rejectionCount : Nat;
  };

  public type ContentResult = {
    sourceId : Text;
    approvedCount : Nat;
    rejectedCount : Nat;
    status : ContentStatus;
    violatedRules : [ViolatedRules];
  };

  public type SubscribeMessage = {
    callback : shared (ContentResult) -> ();
  };

  public type GetContentParams = {
    status : ContentStatus;
    provider : Principal;
  };

  public type VotingStats = ContentResult and {
    cid : Text;
  };

  public type ProviderContentResponse = {
    content : [ContentPlus];
    voting : [VotingStats];
  };

  public type VoteCount = {
    approvedCount : Nat;
    rejectedCount : Nat;
    hasVoted : Bool;
    violatedRulesCount : HashMap.HashMap<RuleId, Nat>;
  };

  public type Activity = {
    vote : ?VoteV2;
    pohVote : ?PohTypes.PohVote;
    providerId : ProviderId;
    providerName : Text;
    contentType : ContentType;
    status : ContentStatus;
    title : ?Text;
    createdAt : Timestamp;
    updatedAt : ?Timestamp;
    voteCount : Nat;
    requiredVotes : Nat;
    minStake : Nat;
    reward : Float;
    rewardRelease : Timestamp;
  };

  public type ActivityResult = {
    activity : Activity;
    voteCount : VoteCount;
  };

  public type AirdropUser = {
    id : Principal;
    createdAt : Timestamp;
  };

  public type Callback = shared () -> async ();
  public func notify(callback : ?Callback) : async () {
    switch (callback) {
      case null return;
      case (?cb) { ignore cb() };
    };
  };

  public type StagedWrite = {
    #Init : {
      size : Nat;
      callback : ?Callback;
    };
    #Chunk : {
      chunk : Blob;
      callback : ?Callback;
    };
  };

  public type PohRulesViolated = PohTypes.PohRulesViolated;

  public type Error = {
    #Unauthorized;
    #NotFound;
    #InvalidRequest;
    #AuthorizedPrincipalLimitReached : Nat;
    #Immutable;
  };

  type HeaderField = (Text, Text);

  type Token = {};

  type StreamingCallbackHttpResponse = {
    body : Blob;
    token : Token;
  };

  type StreamingStrategy = {
    #Callback : {
      callback : shared Token -> async StreamingCallbackHttpResponse;
      token : Token;
    };
  };

  public type HttpRequest = {
    method : Text;
    url : Text;
    headers : [HeaderField];
    body : Blob;
  };

  public type HttpResponse = {
    status_code : Nat16;
    headers : [HeaderField];
    body : Blob;
    streaming_strategy : ?StreamingStrategy;
    upgrade : ?Bool;
  };

  public type ProviderError = {
    #Unauthorized;
    #ProviderIsRegistered;
    #NotFound;
    #RequiresWhitelisting;
    #InvalidProvider;
    #InvalidContentType;
    #InvalidContentStatus;
    #ProviderAdminIsAlreadyRegistered;
  };

  public type ProviderMetaResult = Result.Result<ProviderMeta, ProviderError>;
  public type ProviderSettingResult = Result.Result<ProviderSettings, ProviderError>;
  public type ProviderResult = Result.Result<(), ProviderError>;
  public type ProviderTextResult = Result.Result<Text, ProviderError>;

  public type HttpHeader = {
    name : Text;
    value : Text;
  };

  public type HttpMethod = {
    #post;
  };

  public type TransformContext = {
    function : shared query TransformArgs -> async CanisterHttpResponsePayload;
    context : Blob;
  };

  public type CanisterHttpRequestArgs = {
    url : Text;
    headers : [HttpHeader];
    body : ?[Nat8];
    method : HttpMethod;
    max_response_bytes : ?Nat64;
    transform : ?TransformContext;
  };

  public type CanisterHttpResponsePayload = {
    status : Nat;
    headers : [HttpHeader];
    body : [Nat8];
  };

  public type TransformArgs = {
    response : CanisterHttpResponsePayload;
    context : Blob;
  };

  public type IC = actor {
    http_request : CanisterHttpRequestArgs -> async CanisterHttpResponsePayload;
  };

  public type ModerationTasksFilter = {
    categories : ?[CategoryId];
    providers : ?[Principal];
  };

  public type ProviderSummaries = {
    totalRejected : Nat;
    totalApproved : Nat;
    totalCost : Nat;
  };

};
