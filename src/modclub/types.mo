import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Result "mo:base/Result";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";

module {
  public type Timestamp = Int;
  // See mo:base/Time and Time.now()
  public type UserId = Principal;
  public type ContentId = Text;
  public type RuleId = Text;
  public type VoteId = Text;
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
    sourceId : Text;
    status : ContentStatus;
    voteCount : Nat;
    minVotes : Nat;
    minStake : Nat;
    title : ?Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
    text : ?Text;
    image : ?Image;
    hasVoted : ?Bool;
  };

  public type Content = {
    id : ContentId;
    providerId : Principal;
    contentType : ContentType;
    sourceId : Text;
    status : ContentStatus;
    title : ?Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
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

  public type Provider = {
    id : Principal;
    name : Text;
    description : Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
    settings : ProviderSettings;
    image : ?Image;
  };

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
    image : ?Image;
    contentCount : Nat;
    activeCount : Nat;
    rewardsSpent : Nat;
    rules : [Rule];
  };

  public type ProviderSettings = {
    minVotes : Nat;
    minStaked : Nat;
  };

  public type Profile = {
    id : UserId;
    userName : Text;
    email : Text;
    pic : ?Image;
    role : Role;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type ModeratorLeaderboard = {
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

  public type ContentResult = {
    sourceId : Text;
    status : ContentStatus;
  };

  public type SubscribeMessage = {
    callback : shared (ContentResult) -> ();
  };

  public type GetContentParams = {
    status : ContentStatus;
    provider : Principal;
  };

  public type VoteCount = {
    approvedCount : Nat;
    rejectedCount : Nat;
    hasVoted : Bool;
  };

  public type Activity = {
    vote : Vote;
    providerId : ProviderId;
    providerName : Text;
    contentType : ContentType;
    status : ContentStatus;
    title : ?Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
    voteCount : Nat;
    minVotes : Nat;
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

  public type PohRulesViolated = {
    challengeId : Text;
    ruleId : Text;
  };

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
    upgrade: ?Bool;
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

};
