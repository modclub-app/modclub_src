import List "mo:base/List";
import Principal "mo:base/Principal";
import Canistergeek "../common/canistergeek/canistergeek";
import LoggerTypesModule "../common/canistergeek/logger/typesModule";

module {
  public type AdminsList = List.List<Principal>;

  public type ConsumerPayload = {
    #admins : [Principal];
  };

  public type Subscriber = {
    topic : Text;
    consumer : Principal;
    _actor : SubscriberCanisterType;
  };

  public type SubscriberCanisterType = actor {
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
    #collectCanisterMetrics : () -> ();
    #getCanisterMetrics : () -> Canistergeek.GetMetricsParameters;
    #getCanisterLog : () -> ?LoggerTypesModule.CanisterLogRequest;
    #setModclubBuckets : () -> ([Principal]);
    #validate : () -> Any;
  };
};
