import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Error "mo:base/Error";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";

import Types "types";
import Utils "../common/utils";
import Constants "../common/constants";

module ModclubVestingLedger = {

  public class Ledger() {

    var ledger = HashMap.HashMap<Principal, Types.Locks>(0, Principal.equal, Principal.hash);

    public func applyVestingBlock(account : Principal, amount : Nat) : Result.Result<Nat, Text> {
      let now = Nat64.fromNat(Int.abs(Time.now()));
      let logs : Types.Locks = switch (ledger.get(account)) {
        case (?logs) { logs };
        case (_) { createGenesisLogs() };
      };
      let block = {
        operation = #VestingLock;
        amount;
        rewardsAmount = null;
        dissolveDelay = null;
        created_at_time = now;
      };
      logs.vesting.add(block);
      ignore ledger.replace(account, logs);
      #ok(logs.vesting.size());
    };

    public func applyStakingBlock(account : Principal, amount : Nat) : Result.Result<Nat, Text> {
      let now = Nat64.fromNat(Int.abs(Time.now()));
      let logs : Types.Locks = switch (ledger.get(account)) {
        case (?logs) { logs };
        case (_) { createGenesisLogs() };
      };
      let block = {
        operation = #StakingLock;
        amount;
        rewardsAmount = null;
        dissolveDelay = null;
        created_at_time = now;
      };

      logs.staking.add(block);
      ignore ledger.replace(account, logs);
      #ok(logs.staking.size());
    };

    public func claimVesting(account : Principal, amount : Nat) : Result.Result<Nat, Text> {
      let now = Nat64.fromNat(Int.abs(Time.now()));
      let logs : Types.Locks = switch (ledger.get(account)) {
        case (?logs) { logs };
        case (_) return #err("No locked tokens for account: " # Principal.toText(account));
      };

      let locked = lockedFor(account);
      if (amount > locked) {
        return #err("Not enough locked tokens for account: " # Principal.toText(account));
      };

      let block = {
        operation = #VestingClaim;
        amount;
        rewardsAmount = null;
        dissolveDelay = null;
        created_at_time = now;
      };
      logs.vesting.add(block);

      ignore ledger.replace(account, logs);
      #ok(logs.vesting.size());
    };

    public func releaseStaking(account : Principal, amount : Nat) : Result.Result<Nat, Text> {
      let now = Nat64.fromNat(Int.abs(Time.now()));
      let logs : Types.Locks = switch (ledger.get(account)) {
        case (?logs) { logs };
        case (_) return #err("No staked tokens for account: " # Principal.toText(account));
      };

      let unlocked = unlockedStakesFor(account);
      if (amount > unlocked) {
        return #err("Account: " # Principal.toText(account) # " want to release more tokens than actually unlocked.");
      };

      let block = {
        operation = #StakingRelease;
        amount;
        rewardsAmount = null;
        dissolveDelay = null;
        created_at_time = now;
      };
      logs.staking.add(block);

      ignore ledger.replace(account, logs);
      #ok(logs.vesting.size());
    };

    public func claimStaking(account : Principal, amount : Nat) : Result.Result<Nat, Text> {
      let now = Nat64.fromNat(Int.abs(Time.now()));
      let logs : Types.Locks = switch (ledger.get(account)) {
        case (?logs) { logs };
        case (_) return #err("No staked tokens for account: " # Principal.toText(account));
      };

      let staked = stakedFor(account);
      if (amount > staked) {
        return #err("Account: " # Principal.toText(account) # " claimed more tokens than actually staked.");
      };

      let block = {
        operation = #StakingDissolve;
        amount;
        rewardsAmount = null;
        dissolveDelay = ?Nat64.fromNat(Nat.mul(Constants.VESTING_DISSOLVE_DELAY_SECONDS, 1000000000));
        created_at_time = now;
      };
      logs.staking.add(block);

      ignore ledger.replace(account, logs);
      #ok(logs.vesting.size());
    };

    public func unlockStaking(account : Principal, amount : Nat) : Result.Result<Nat, Text> {
      let now = Nat64.fromNat(Int.abs(Time.now()));
      let logs : Types.Locks = switch (ledger.get(account)) {
        case (?logs) { logs };
        case (_) return #err("No staked tokens for account: " # Principal.toText(account));
      };

      let dissolved = dissolvedStakesFor(account);
      if (amount > dissolved) {
        return #err("Account: " # Principal.toText(account) # " wants to unlock more tokens than already dissolved.");
      };

      let block = {
        operation = #StakingUnlock;
        amount;
        rewardsAmount = null;
        dissolveDelay = null;
        created_at_time = now;
      };
      logs.staking.add(block);

      ignore ledger.replace(account, logs);
      #ok(logs.vesting.size());
    };

    func createGenesisLogs() : Types.Locks {
      return {
        staking = Buffer.Buffer<Types.LockBlock>(100);
        vesting = Buffer.Buffer<Types.LockBlock>(100);
      };
    };

    public func stakedFor(account : Principal) : Nat {
      var sum = 0;
      switch (get_locks(account, #Staking)) {
        case (#ok(log)) {
          for (block in log.vals()) {
            switch (block.operation) {
              case (#StakingLock) {
                sum += block.amount;
              };
              case (#StakingDissolve) {
                sum -= block.amount;
              };
              case (_) {};
            };
          };
        };
        case (_) {};
      };
      sum;
    };

    public func claimedStakesFor(account : Principal) : Nat {
      var sum = 0;
      switch (get_locks(account, #Staking)) {
        case (#ok(log)) {
          for (block in log.vals()) {
            switch (block.operation) {
              case (#StakingDissolve) {
                sum += block.amount;
              };
              case (#StakingUnlock) {
                sum -= block.amount;
              };
              case (_) {};
            };
          };
        };
        case (_) {};
      };
      sum;
    };

    public func dissolvedStakesFor(account : Principal) : Nat {
      let now = Nat64.fromNat(Int.abs(Time.now()));
      var sum = 0;
      switch (get_locks(account, #Staking)) {
        case (#ok(log)) {
          for (block in log.vals()) {
            switch (block.operation) {
              case (#StakingDissolve) {
                if (
                  Nat64.lessOrEqual(
                    Nat64.add(block.created_at_time, Option.get<Nat64>(block.dissolveDelay, 0)),
                    now
                  )
                ) {
                  sum += block.amount;
                };
              };
              case (#StakingUnlock) {
                sum -= block.amount;
              };
              case (_) {};
            };
          };
        };
        case (_) {};
      };
      sum;
    };

    public func unlockedStakesFor(account : Principal) : Nat {
      var sum = 0;
      switch (get_locks(account, #Staking)) {
        case (#ok(log)) {
          for (block in log.vals()) {
            switch (block.operation) {
              case (#StakingUnlock) {
                sum += block.amount;
              };
              case (#StakingRelease) {
                sum -= block.amount;
              };
              case (_) {};
            };
          };
        };
        case (_) {};
      };
      sum;
    };

    public func pendingStakesFor(account : Principal) : Types.LocksLog {
      var pending = Buffer.Buffer<Types.LockBlock>(1);
      let now = Nat64.fromNat(Int.abs(Time.now()));
      switch (get_locks(account, #Staking)) {
        case (#ok(log)) {
          for (block in log.vals()) {
            switch (block.operation) {
              case (#StakingDissolve) {
                if (
                  Nat64.less(
                    now,
                    Nat64.add(block.created_at_time, Option.get<Nat64>(block.dissolveDelay, 0))
                  )
                ) {
                  pending.add(block);
                };
              };
              case (_) {};
            };
          };
        };
        case (_) {};
      };
      pending;
    };

    public func lockedFor(account : Principal) : Nat {
      var sum = 0;
      switch (get_locks(account, #Vesting)) {
        case (#ok(log)) {
          for (block in log.vals()) {
            switch (block.operation) {
              case (#VestingLock) {
                sum += block.amount;
              };
              case (#VestingClaim) {
                sum -= block.amount;
              };
              case (_) {};
            };
          };
        };
        case (_) {};
      };
      sum;
    };

    func get_locks(account : Principal, lockType : Types.LockType) : Result.Result<Types.LocksLog, Text> {
      let logs : Types.Locks = switch (ledger.get(account)) {
        case (?logs) { logs };
        case (_) return #err("No locked tokens for account: " # Principal.toText(account));
      };
      switch (lockType) {
        case (#Vesting) { #ok(logs.vesting) };
        case (#Staking) { #ok(logs.staking) };
        case (_) return #err("Invalid lock type");
      };
    };

    public func fromPersistedStorage(persistedData : [(Principal, Types.LocksStable)]) : () {
      var ledgerRestored = HashMap.HashMap<Principal, Types.Locks>(0, Principal.equal, Principal.hash);
      for ((acc, locksStable) in Array.vals<(Principal, Types.LocksStable)>(persistedData)) {
        let locks = {
          vesting = Buffer.fromIter<Types.LockBlock>(locksStable.vesting.vals());
          staking = Buffer.fromIter<Types.LockBlock>(locksStable.staking.vals());
        };
        ledgerRestored.put(acc, locks);
      };

      ledger := ledgerRestored;
    };

    public func toPersistedStorage() : [(Principal, Types.LocksStable)] {
      var bufLedger = Buffer.Buffer<(Principal, Types.LocksStable)>(ledger.size());
      for ((acc, accLocks) in ledger.entries()) {
        let stableLocks = {
          vesting = Buffer.toArray<Types.LockBlock>(accLocks.vesting);
          staking = Buffer.toArray<Types.LockBlock>(accLocks.staking);
        };
        bufLedger.add((acc, stableLocks));
      };
      Buffer.toArray<(Principal, Types.LocksStable)>(bufLedger);
    };

  };
};
