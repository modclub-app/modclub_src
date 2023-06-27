import Result "mo:base/Result";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import ICRCTypes "../wallet/ICRC/types";

module {
  public type ENV = {
    #local : {
      modclub_canister_id : Principal;
      rs_canister_id : Principal;
      wallet_canister_id : Principal;
      auth_canister_id : Principal;
      vesting_canister_id : Principal;
    };
    #prod;
    #dev;
    #qa;
  };

  public type VestingCanisterActor = actor {
    stake : (ICRCTypes.Account, ICRCTypes.Tokens) -> async Result.Result<Nat, Text>;
    unlock_staking : (ICRCTypes.Account, ICRCTypes.Tokens) -> async Result.Result<Nat, Text>;
    claim_staking : (ICRCTypes.Account, ICRCTypes.Tokens) -> async Result.Result<Nat, Text>;
    stage_vesting_block : (ICRCTypes.Account, ICRCTypes.Tokens) -> async Result.Result<Nat, Text>;
    claim_vesting : (ICRCTypes.Account, ICRCTypes.Tokens) -> async Result.Result<Nat, Text>;
    locked_for : (ICRCTypes.Account) -> async Nat;
    staked_for : (ICRCTypes.Account) -> async Nat;
    unlocked_stakes_for : (ICRCTypes.Account) -> async Nat;
  };

  public type Event = {
    topic : Text;
    payload : Principal;
  };

  public type ConsumerPayload = {
    #admins : [Principal];
    #events : [Event];
  };

  public type SubscriberCallback = shared ConsumerPayload -> async ();

  public type ModclubCanister = {
    #modclub;
    #rs;
    #wallet;
    #auth;
    #vesting;
  };
};
