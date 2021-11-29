import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Result "mo:base/Result";


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
  public type ProviderError = {
      #Unauthorized;
      #ProviderIsRegistered;
      #NotFound;
      #RequiresWhitelisting;
      #InvalidProvider;
      #InvalidContentType;
      #InvalidContentStatus;
  };
  public type ProviderResult = Result.Result<(), ProviderError>;
  public type ProviderTextResult = Result.Result<Text, ProviderError>;
  public type SubscribeMessage = { callback: shared ContentResult -> (); };

  // Have to hardcode principal for modclub, change it to production canister ID later
  public let ModClub =
      actor "la3yy-gaaaa-aaaah-qaiuq-cai" : actor {      
        registerProvider: (Text, Text, ?Image) -> async ProviderTextResult;
        deregisterProvider: () -> async ProviderTextResult;
        addRules: ([Text]) -> async ProviderResult;
        removeRules: ([Text]) -> async ProviderResult;
        updateSettings: (ProviderSettings) -> async ProviderResult;
        submitText: (Text, Text, ?Text) -> async ProviderTextResult;
        submitImage: (Text, [Nat8], Text, ?Text) -> async ProviderTextResult;
        subscribe: (SubscribeMessage) -> async ProviderResult;
        addProviderAdmin: (Text, Principal, ?Principal) -> async ProviderResult;
      };
};