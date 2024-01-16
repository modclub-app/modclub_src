import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Buffer "mo:base/Buffer";
import CommonTypes "../common/types";
import ICRCTypes "../common/ICRCTypes";
import Canistergeek "../common/canistergeek/canistergeek";
import LoggerTypesModule "../common/canistergeek/logger/typesModule";

module {
  public type Operation = {
    #VestingLock;
    #VestingClaim;
    #StakingLock;
    #StakingDissolve;
    #StakingUnlock;
    #StakingRelease;
  };

  public type LockType = {
    #Vesting;
    #Staking;
  };

  public type LockBlock = {
    operation : Operation;
    amount : Nat;
    dissolveDelay : ?Nat64;
    rewardsAmount : ?Nat;
    created_at_time : Nat64;
  };

  public type UnlockJob = {
    id : Text;
    uid : Principal;
    amount : Nat;
    dissolve_at_time : Int;
    created_at_time : Int;
  };

  public type LocksLog = Buffer.Buffer<LockBlock>;

  public type Locks = {
    staking : LocksLog;
    vesting : LocksLog;
  };

  public type LocksStable = {
    staking : [LockBlock];
    vesting : [LockBlock];
  };

  public type VestingCanisterMethods = {
    #handleSubscription : () -> CommonTypes.ConsumerPayload;
    #collectCanisterMetrics : () -> ();
    #getCanisterMetrics : () -> Canistergeek.GetMetricsParameters;
    #getCanisterLog : () -> ?LoggerTypesModule.CanisterLogRequest;
    #claim_vesting : () -> (account : ICRCTypes.Account, amount : ICRCTypes.Tokens);
    #stage_vesting_block : () -> (account : ICRCTypes.Account, amount : ICRCTypes.Tokens);
    #stake : () -> (account : ICRCTypes.Account, amount : ICRCTypes.Tokens);
    #unlock_staking : () -> (ICRCTypes.Account, ICRCTypes.Tokens);
    #claim_staking : () -> (account : ICRCTypes.Account, amount : ICRCTypes.Tokens);
    #release_staking : () -> (account : ICRCTypes.Account, amount : ICRCTypes.Tokens);
    #locked_for : () -> ICRCTypes.Account;
    #staked_for : () -> ICRCTypes.Account;
    #unlocked_stakes_for : () -> ICRCTypes.Account;
    #pending_stakes_for : () -> ICRCTypes.Account;
    #claimed_stakes_for : () -> ICRCTypes.Account;
    #validate : () -> Any;
  };
};
