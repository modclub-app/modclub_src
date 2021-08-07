import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Hash "mo:base/Hash"

module {
  public type Timestamp = Int; // See mo:base/Time and Time.now()
  public type UserId = Principal;
  public type RuleId = Hash.Hash;
  public type ContentId = Text;
  public type VoteId = Text;
  public type ProviderId = Principal;

  public type Action = {
    #submit;
    #vote;
    #registerRule;
  };

  public type Decision = {
    #approved;
    #rejected;
  };
  
  public type ContentStatus = {
    #approved;
    #rejected;
    #reviewRequired;
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
  };

  public type Role = {
    // A content moderator
    #moderator;
    // A modclub admin
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
    contentType: ContentType;
    sourceId: Text;
    status: ContentStatus; 
    title: ?Text;
    createdAt: Timestamp;
    updateAt: Timestamp;
    text: ?Text;
  };

  public type Content = {
    id: ContentId;
    providerId: Principal;
    contentType: ContentType;
    sourceId: Text;
    status: ContentStatus; 
    title: ?Text;
    createdAt: Timestamp;
    updateAt: Timestamp;
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

  public type Image = {
    id: ContentId;
    data: [Nat8]
  };

  public type Provider = {
    id: Principal;
    appName: Text;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  };

  public type Profile = {
    id: UserId;
    userName: Text;
    role: Role;
    picUrl: ?Text;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  };

  public type Vote = {
    id: VoteId;
    contentId: Text;
    userId: UserId;
    decision: Decision;
    rulesBroken: ?[RuleId];  
  };

  public type ContentResult = {
    sourceId: Text;
    status: ContentStatus;
  };

  public type SubscribeMessage = {
     callback: shared (ContentResult) -> (); 
    };
};
