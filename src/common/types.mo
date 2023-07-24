import Result "mo:base/Result";
import List "mo:base/List";
import Bool "mo:base/Bool";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Float "mo:base/Float";
import ICRCTypes "../wallet/ICRC/types";

module {
  public type ENV = {
      modclub_canister_id : Principal;
      old_modclub_canister_id : Principal;
      rs_canister_id : Principal;
      wallet_canister_id : Principal;
      auth_canister_id : Principal;
      vesting_canister_id : Principal;
    };

  public type VestingCanisterActor = actor {
    stake : (ICRCTypes.Account, ICRCTypes.Tokens) -> async Result.Result<Nat, Text>;
    claim_staking : (ICRCTypes.Account, ICRCTypes.Tokens) -> async Result.Result<Nat, Text>;
    unlock_staking : (ICRCTypes.Account, ICRCTypes.Tokens) -> async Result.Result<Nat, Text>;
    release_staking : (ICRCTypes.Account, ICRCTypes.Tokens) -> async Result.Result<Nat, Text>;
    stage_vesting_block : (ICRCTypes.Account, ICRCTypes.Tokens) -> async Result.Result<Nat, Text>;
    claim_vesting : (ICRCTypes.Account, ICRCTypes.Tokens) -> async Result.Result<Nat, Text>;
    locked_for : (ICRCTypes.Account) -> async Nat;
    staked_for : (ICRCTypes.Account) -> async Nat;
    unlocked_stakes_for : (ICRCTypes.Account) -> async Nat;
  };

  public type AuthActorType = actor {
    subscribe : (Text) -> async ();
    getAdmins : () -> async Result.Result<[Principal], Text>;
    isAdmin : (Principal) -> async Bool;
    registerAdmin : (Principal) -> async Result.Result<List.List<Principal>, Text>;
    unregisterAdmin : (Principal) -> async Result.Result<List.List<Principal>, Text>;
  };

  public type WalletActorType = actor {
    queryBalance : (?Text) -> async Float;
    transfer : (?Text, Principal, ?Text, Float) -> async ();
    transferBulk : ([ICRCTypes.UserAndAmount]) -> async ();
    burn : (?ICRCTypes.Subaccount, ICRCTypes.Tokens) -> async ();
    icrc1_balance_of : (ICRCTypes.Account) -> async ICRCTypes.Tokens;
    icrc1_fee : () -> async Nat;
    icrc1_transfer : ({
      from_subaccount : ?ICRCTypes.Subaccount;
      to : ICRCTypes.Account;
      amount : ICRCTypes.Tokens;
      fee : ?ICRCTypes.Tokens;
      memo : ?ICRCTypes.Memo;
      created_at_time : ?ICRCTypes.Timestamp;
    }) -> async ICRCTypes.Result<ICRCTypes.TxIndex, ICRCTypes.TransferError>;
    icrc2_transfer_from : (args : ICRCTypes.TransferFromArgs) -> async ICRCTypes.Result<ICRCTypes.TxIndex, ICRCTypes.TransferFromError>;
    ledger_account : () -> async ICRCTypes.Account;
  };

  public type RSActorType = actor {
    topUsers : (Nat, Nat) -> async [UserAndRS];
    queryRSAndLevel : () -> async RSAndLevel;
    queryRSAndLevelByPrincipal : (Principal) -> async RSAndLevel;
    updateRSBulk : ([UserAndVote]) -> async [UserAndRS];
    updateRS : (Principal, Bool) -> async UserAndRS;
    setRS : (Principal, Int) -> async Result.Result<Bool, Text>;
    subscribe : (Text) -> async ();
  };

  public type IcRootActorType = actor {
    canister_status : shared { canister_id : Principal } -> async {
      status : { #stopped; #stopping; #running };
      memory_size : Nat;
      cycles : Nat;
      settings : DefiniteCanisterSettings;
      module_hash : ?[Nat8];
    };
    create_canister : shared { settings : ?CanisterSettings } -> async {
      canister_id : Principal;
    };
    delete_canister : shared { canister_id : Principal } -> async ();
    deposit_cycles : shared { canister_id : Principal } -> async ();
    install_code : shared {
      arg : [Nat8];
      wasm_module : WasmModule;
      mode : { #reinstall; #upgrade; #install };
      canister_id : Principal;
    } -> async ();
    provisional_create_canister_with_cycles : shared {
      settings : ?CanisterSettings;
      amount : ?Nat;
    } -> async { canister_id : Principal };
    provisional_top_up_canister : shared {
      canister_id : Principal;
      amount : Nat;
    } -> async ();
    raw_rand : shared () -> async [Nat8];
    start_canister : shared { canister_id : Principal } -> async ();
    stop_canister : shared { canister_id : Principal } -> async ();
    uninstall_code : shared { canister_id : Principal } -> async ();
    update_settings : shared {
      canister_id : Principal;
      settings : CanisterSettings;
    } -> async ();
  };

  public type ModclubCanisterActorType = actor {
    getModeratorEmailsForPOHAndSendEmail : (Text) -> async ();
  };

  public type UserAndVote = {
    userId : Principal;
    votedCorrect : Bool;
    decision : Decision;
  };

  public type Decision = {
    #approved;
    #rejected;
  };

  public type UserAndRS = {
    userId : Principal;
    score : Int;
  };

  public type RSAndLevel = {
    score : Int;
    level : UserLevel;
  };

  public type UserLevel = {
    #novice;
    #junior;
    #senior1;
    #senior2;
    #senior3;
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
    #modclub_old;
    #rs;
    #wallet;
    #auth;
    #vesting;
  };

  public type CanisterSettings = {
    freezing_threshold : ?Nat;
    controllers : ?[Principal];
    memory_allocation : ?Nat;
    compute_allocation : ?Nat;
  };
  public type DefiniteCanisterSettings = {
    freezing_threshold : Nat;
    controllers : [Principal];
    memory_allocation : Nat;
    compute_allocation : Nat;
  };
  public type WasmModule = [Nat8];

};
