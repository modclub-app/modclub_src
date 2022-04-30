import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";

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
      actor "r7inp-6aaaa-aaaaa-aaabq-cai" : actor {      
        registerProvider: (Text, Text, ?Image) -> async Text;
        deregisterProvider: () -> async Text;
        addProviderAdmin:(Principal, Text, ?Principal) -> async ();
        addRules: ([Text], ?Principal) -> async ();
        removeRules: ([Text], ?Principal) -> async ();
        updateSettings: (ProviderSettings, ?Principal) -> async ();
        submitText: (Text, Text, ?Text) -> async Text;
        submitHtmlContent: (Text, Text, ?Text) -> async Text;
        submitImage: (Text, [Nat8], Text, ?Text) -> async Text;
        subscribe: (SubscribeMessage) -> async ();
        putBlobsInDataCanister: (Text, Blob, Nat, Nat, Text) -> async (Principal, Nat);
        getBlob: (Text, Principal, Nat) -> async ?Blob 
      };
}