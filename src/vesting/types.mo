import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Buffer "mo:base/Buffer";
import CommonTypes "../common/types";
import ICRCTypes "../wallet/ICRC/types";

module {
  public type Operation = {
    #VestingLock;
    #VestingClaim;
    #StakingLock;
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
    #claim_vesting : () -> (account : ICRCTypes.Account, amount : ICRCTypes.Tokens);
    #stage_vesting_block : () -> (account : ICRCTypes.Account, amount : ICRCTypes.Tokens);
    #stake : () -> (account : ICRCTypes.Account, amount : ICRCTypes.Tokens);
    #unlock_staking : () -> (ICRCTypes.Account, ICRCTypes.Tokens);
    #claim_staking : () -> (account : ICRCTypes.Account, amount : ICRCTypes.Tokens);
    #locked_for : () -> ICRCTypes.Account;
    #staked_for : () -> ICRCTypes.Account;
    #unlocked_stakes_for : () -> ICRCTypes.Account;
  };
};
