import Error "mo:base/Error";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Float "mo:base/Float";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Int "mo:base/Int";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Types "./types";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Utils "../common/utils";
import ICRCTypes "../common/ICRCTypes";
import CommonTypes "../common/types";
import ModSecurity "../common/security/guard";
import VestingLedger "./ledger";

shared ({ caller = deployer }) actor class Vesting({
  env : CommonTypes.ENV;
}) = this {

  stable var persistedVestingsStorage : [(Principal, Types.LocksStable)] = [];

  var ledger = VestingLedger.Ledger();
  let authGuard = ModSecurity.Guard(env, "VESTING_CANISTER");
  ignore authGuard.setUpDefaultAdmins(List.nil<Principal>(), deployer, authGuard.getCanisterId(#modclub));
  authGuard.subscribe("admins");

  public shared ({ caller }) func handleSubscription(payload : CommonTypes.ConsumerPayload) : async () {
    authGuard.handleSubscription(payload);
  };

  public shared ({ caller }) func stake(
    account : ICRCTypes.Account,
    amount : ICRCTypes.Tokens
  ) : async Result.Result<Nat, Text> {
    ledger.applyStakingBlock(
      account.owner,
      amount
    );
  };

  public shared ({ caller }) func stage_vesting_block(
    account : ICRCTypes.Account,
    amount : ICRCTypes.Tokens
  ) : async Result.Result<Nat, Text> {
    ledger.applyVestingBlock(
      account.owner,
      amount
    );
  };

  public shared ({ caller }) func locked_for(
    account : ICRCTypes.Account
  ) : async Nat {
    ledger.lockedFor(account.owner);
  };

  public shared ({ caller }) func staked_for(
    account : ICRCTypes.Account
  ) : async Nat {
    ledger.stakedFor(account.owner);
  };

  public shared ({ caller }) func unlocked_stakes_for(
    account : ICRCTypes.Account
  ) : async Nat {
    ledger.unlockedStakesFor(account.owner);
  };

  public shared ({ caller }) func claimed_stakes_for(
    account : ICRCTypes.Account
  ) : async Nat {
    ledger.dissolvedStakesFor(account.owner);
  };

  public shared ({ caller }) func claim_vesting(
    account : ICRCTypes.Account,
    amount : ICRCTypes.Tokens
  ) : async Result.Result<Nat, Text> {
    ledger.claimVesting(account.owner, amount);
  };

  public shared ({ caller }) func claim_staking(
    account : ICRCTypes.Account,
    amount : ICRCTypes.Tokens
  ) : async Result.Result<Nat, Text> {
    ledger.claimStaking(account.owner, amount);
  };

  public shared ({ caller }) func unlock_staking(
    account : ICRCTypes.Account,
    amount : ICRCTypes.Tokens
  ) : async Result.Result<Nat, Text> {
    ledger.unlockStaking(account.owner, amount);
  };

  public shared ({ caller }) func release_staking(
    account : ICRCTypes.Account,
    amount : ICRCTypes.Tokens
  ) : async Result.Result<Nat, Text> {
    ledger.releaseStaking(account.owner, amount);
  };

  system func preupgrade() {
    persistedVestingsStorage := ledger.toPersistedStorage();
  };

  system func postupgrade() {
    ledger.fromPersistedStorage(persistedVestingsStorage);

    authGuard.subscribe("admins");
    ignore authGuard.setUpDefaultAdmins(
      List.nil<Principal>(),
      deployer,
      Principal.fromActor(this)
    );
  };

  system func inspect({
    arg : Blob;
    caller : Principal;
    msg : Types.VestingCanisterMethods;
  }) : Bool {
    switch (msg) {
      case (#stage_vesting_block _) {
        authGuard.isModclubCanister(caller) or authGuard.isAdmin(caller);
      };
      case (#stake _) {
        authGuard.isModclubCanister(caller) or authGuard.isAdmin(caller);
      };
      case (#claim_vesting _) {
        authGuard.isModclubCanister(caller) or authGuard.isAdmin(caller);
      };
      case (#unlock_staking _) {
        authGuard.isModclubCanister(caller) or authGuard.isAdmin(caller);
      };
      case (#release_staking _) {
        authGuard.isModclubCanister(caller) or authGuard.isAdmin(caller);
      };
      case (#handleSubscription _) { authGuard.isModclubAuth(caller) };
      case _ { not Principal.isAnonymous(caller) };
    };
  };

};
