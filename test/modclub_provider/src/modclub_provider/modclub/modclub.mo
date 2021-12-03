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

  // Have to hardcode principal for modclub, change it to production canister ID later
  public let ModClub =
      actor "la3yy-gaaaa-aaaah-qaiuq-cai" : actor {      
        registerProvider: (Text, Text, ?Image) -> async Text;
        deregisterProvider: () -> async Text;
        addRules: ([Text]) -> async ();
        removeRules: ([Text]) -> async ();
        updateSettings: (ProviderSettings) -> async ();
        submitText: (Text, Text, ?Text) -> async Text;
        submitImage: (Text, [Nat8], Text, ?Text) -> async Text;
        subscribe: (SubscribeMessage) -> async ();
      };
};