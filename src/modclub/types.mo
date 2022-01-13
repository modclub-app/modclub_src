import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import HashMap "mo:base/HashMap";

module {
  public type Timestamp = Int; // See mo:base/Time and Time.now()
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
    // Poh Content Package
    #pohPackage
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
    id: RuleId;
    description: Text;
  };

  public type ContentPlus = {
    id: ContentId;
    providerId: Principal;
    providerName: Text;
    contentType: ContentType;
    sourceId: Text;
    status: ContentStatus;
    voteCount: Nat;
    minVotes: Nat;
    minStake: Nat; 
    title: ?Text;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    text: ?Text;
    image: ?Image;
    hasVoted: ?Bool;
  };

  public type Content = {
    id: ContentId;
    providerId: Principal;
    contentType: ContentType;
    sourceId: Text;
    status: ContentStatus; 
    title: ?Text;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  };

  public type TextContent = {
    id: ContentId;
    text: Text;
  };

  public type MultiTextContent = {
    id: ContentId;
    text: [Text];
  };

  public type ImageUrl = {
    id: ContentId;
    url: Text;
  };

  public type ImageContent = {
    id: ContentId;
    image: Image;
  };

  public type Image = {    
    data: [Nat8];
    imageType: Text;
  };

  public type Provider = {
    id: Principal;
    name: Text;    
    description: Text;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    settings: ProviderSettings;
    image: ?Image;
  };

  public type ProviderPlus = {
    id: Principal;
    name: Text;    
    description: Text;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    settings: ProviderSettings;
    image: ?Image;
    contentCount: Nat;
    activeCount: Nat;
    rewardsSpent: Nat;
    rules: [Rule];
  };

  public type ProviderSettings = {
    minVotes: Nat;
    minStaked: Nat;
  };

  public type Profile = {
    id: UserId;
    userName: Text;
    email: Text;
    pic: ?Image;
    role: Role;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  };

  public type Vote = {
    id: VoteId;
    contentId: Text;
    userId: UserId;
    decision: Decision;
    violatedRules: ?[RuleId];  
    createdAt: Timestamp;
  };

  public type ContentResult = {
    sourceId: Text;
    status: ContentStatus;
  };

  public type SubscribeMessage = {
    callback: shared (ContentResult) -> (); 
    };
  
  public type GetContentParams = {
    status: ContentStatus;
    provider: Principal;
  };

  public type VoteCount = {
    approvedCount: Nat;
    rejectedCount: Nat;
    hasVoted: Bool;
  };

  public type Activity = {
    vote: Vote;
    providerId: ProviderId;
    providerName: Text;
    contentType: ContentType;    
    status: ContentStatus;
    title: ?Text;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    voteCount: Nat;
    minVotes: Nat;
    minStake: Nat;    
    reward: Nat;
    rewardRelease: Timestamp;
  };

  public type ActivityResult = {
    activity: Activity;
    voteCount: VoteCount;
  };

  public type AirdropUser = {
    id: Principal;
    createdAt: Timestamp;
  };

   public type Callback = shared () -> async ();
    public func notify(callback : ?Callback) : async () {
        switch(callback) {
            case null   return;
            case (? cb) {ignore cb()};
        };
    };

    public type StagedWrite = {
        #Init : {
            size     : Nat; 
            callback : ?Callback};
        #Chunk : {
            chunk    : Blob; 
            callback : ?Callback
        };
    };

    public type PohRulesViolated = {
      challengeId: Text;
      ruleId: Text;
    };

    public type Error = {
        #Unauthorized;
        #NotFound;
        #InvalidRequest;
        #AuthorizedPrincipalLimitReached : Nat;
        #Immutable;
    };

   
};
