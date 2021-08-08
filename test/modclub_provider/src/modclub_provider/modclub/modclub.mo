import Text "mo:base/Text";

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

  public type SubscribeMessage = { callback: shared ContentResult -> (); };

  // Have to hardcode principal for modclub, change it to production canister ID later
  public let ModClub =
      actor "rrkah-fqaaa-aaaaa-aaaaq-cai" : actor {      
        registerProvider: (Text) -> async Text;
        deregisterProvider: () -> async Text;
        submitText: (Text, Text, ?Text) -> async Text;
        subscribe: (SubscribeMessage) -> async ();
      };
};