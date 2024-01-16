import Text "mo:base/Text";
import Principal "mo:base/Principal";
import CommonTypes "../common/types";
import Canistergeek "../common/canistergeek/canistergeek";
import LoggerTypesModule "../common/canistergeek/logger/typesModule";

module {

  public type Subscriber = {
    topic : Text;
    consumer : Principal;
    _actor : SubscriberCanisterType;
  };

  public type SubscriberCanisterType = actor {
    handleSubscription : (CommonTypes.ConsumerPayload) -> async ();
  };

  public type UserLevel = {
    #novice;
    #junior;
    #senior1;
    #senior2;
    #senior3;
  };

  public type RSAndLevel = {
    score : Int;
    level : UserLevel;
  };

  public type Decision = {
    #approved;
    #rejected;
  };

  public type UserAndVote = {
    userId : Principal;
    votedCorrect : Bool;
    decision : Decision;
  };

  public type UserAndRS = {
    userId : Principal;
    score : Int;
  };

  public type RSCanisterMessageInspection = {
    #collectCanisterMetrics : () -> ();
    #getCanisterLog : () -> ?LoggerTypesModule.CanisterLogRequest;
    #getCanisterMetrics : () -> Canistergeek.GetMetricsParameters;
    #handleSubscription : () -> CommonTypes.ConsumerPayload;
    #subscribe : () -> Text;
    #queryRSAndLevel : () -> ();
    #showAdmins : () -> ();
    #queryRSAndLevelByPrincipal : () -> Principal;
    #setRS : () -> (Principal, Int);
    #topUsers : () -> (Nat, Nat);
    #updateRS : () -> (Principal, Bool, Decision);
    #updateRSBulk : () -> [UserAndVote];
    #validate : () -> Any;
  };

};
