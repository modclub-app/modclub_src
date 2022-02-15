import Text "mo:base/Text";
import Nat "mo:base/Nat";

// This is the interface to modclub for providers
module { 

  type ContentId = Text;
  public type ContentStatus = {
    #approved;
    #rejected;
    #reviewRequired;
  };

  public type ContentResult = {
    sourceId: Text;
    status: ContentStatus;
  };

  public type ProviderSettings = {
    minVotes: Nat;
    minStaked: Nat;
  };

  public type Image = {
    data: [Nat8];
    imageType: Text;
  };

  public type SubscribeMessage = { callback: shared ContentResult -> (); };

  public type PohVerificationResponse = {
    requestId: Text;
    providerUserId: Principal;
    status : PohChallengeStatus;
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

  public type PohUniqueToken =  {
    token: Text;
  };

  // Have to hardcode principal for modclub, change it to production canister ID later
  public let ModClub =
      actor "MODCLUB public principal ID" : actor {      
        registerProvider: (Text, Text, ?Image) -> async Text;
        deregisterProvider: () -> async Text;
        addRules: ([Text]) -> async ();
        removeRules: ([Text]) -> async ();
        updateSettings: (ProviderSettings) -> async ();
        submitText: (Text, Text, ?Text) -> async Text;
        submitImage: (Text, [Nat8], Text, ?Text) -> async Text;
        subscribe: (SubscribeMessage) -> async ();
        // Proof of Humanity APIs
        pohVerificationRequest: (Principal) -> async PohVerificationResponse;
        pohGenerateUniqueToken: (Principal) -> async PohUniqueToken;
      };
};