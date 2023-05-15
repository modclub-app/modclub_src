import List "mo:base/List";
import Principal "mo:base/Principal";

module {
  public type AdminsList = List.List<Principal>;

  public type ConsumerPayload = {
    #admins : [Principal];
  };

  public type Subscriber = {
    topic : Text;
    consumer : Principal;
    _actor : SubcriberCanisterType;
  };

  public type SubcriberCanisterType = actor {
    handleSubscription : (ConsumerPayload) -> async ();
  };

  public type AuthCanisterMethods = {
    #getAdmins : () -> ();
    #getSubscriptions : () -> ();
    #isAdmin : () -> Principal;
    #registerAdmin : () -> Principal;
    #subscribe : () -> (Text);
    #manualPublish : () -> ();
    #unregisterAdmin : () -> Text;
  };
};
