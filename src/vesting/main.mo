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
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Types "./types";
import Timer "mo:base/Timer";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Utils "../common/utils";
import ICRCTypes "../common/ICRCTypes";
import CommonTypes "../common/types";
import ModSecurity "../common/security/guard";
import VestingLedger "./ledger";
import Scheduler "./scheduler";
import GlobalConstants "../common/constants";
import Canistergeek "../common/canistergeek/canistergeek";
import LoggerTypesModule "../common/canistergeek/logger/typesModule";
import Helpers "../common/helpers";

shared ({ caller = deployer }) actor class Vesting(env : CommonTypes.ENV) = this {

  stable var _canistergeekMonitorUD : ?Canistergeek.UpgradeData = null;
  private let canistergeekMonitor = Canistergeek.Monitor();

  stable var _canistergeekLoggerUD : ?Canistergeek.LoggerUpgradeData = null;
  private let canistergeekLogger = Canistergeek.Logger();

  stable var persistedVestingsStorage : [(Principal, Types.LocksStable)] = [];

  stable var persistedStakingUnlocks : [(Principal, [Types.UnlockJob])] = [];
  stable var persistedFailedUnlocks : [Types.UnlockJob] = [];

  var ledger = VestingLedger.Ledger();
  var logger = Helpers.getLogger(canistergeekLogger);
  let authGuard = ModSecurity.Guard(env, "VESTING_CANISTER");
  var scheduler = Scheduler.Scheduler(ledger, logger, authGuard);
  ignore scheduler.startScheduler();
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

  public shared ({ caller }) func pending_stakes_for(
    account : ICRCTypes.Account
  ) : async [Types.LockBlock] {
    let pending = ledger.pendingStakesFor(account.owner);
    Buffer.toArray<Types.LockBlock>(pending);
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
    switch (ledger.claimStaking(account.owner, amount)) {
      case (#ok(txId)) {
        ignore await scheduler.applyUnlockJob(account.owner, amount);
        #ok(txId);
      };
      case (#err(e)) {
        logger.logError("[STAKING][ERROR] Unable to claim staked tokens, User: " # Principal.toText(account.owner) # " Amount: " # Nat.toText(amount) # " Message: " # e);
        #err(e);
      };
    };
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

  public query ({ caller }) func getCanisterMetrics(
    parameters : Canistergeek.GetMetricsParameters
  ) : async ?Canistergeek.CanisterMetrics {
    if (not Helpers.allowedCanistergeekCaller(caller)) {
      throw Error.reject("Unauthorized");
    };
    canistergeekMonitor.getMetrics(parameters);
  };

  public shared ({ caller }) func collectCanisterMetrics() : async () {
    if (not Helpers.allowedCanistergeekCaller(caller)) {
      throw Error.reject("Unauthorized");
    };
    canistergeekMonitor.collectMetrics();
  };

  public query ({ caller }) func getCanisterLog(
    request : ?LoggerTypesModule.CanisterLogRequest
  ) : async ?LoggerTypesModule.CanisterLogResponse {
    if (not Helpers.allowedCanistergeekCaller(caller)) {
      throw Error.reject("Unauthorized");
    };
    canistergeekLogger.getLog(request);
  };

  //SNS generic validate function
  public shared ({ caller }) func validate(input : Any) : async CommonTypes.Validate {
    return #Ok("success");
  };

  ignore Timer.setTimer(
    #seconds 0,
    func() : async () {
      canistergeekMonitor.collectMetrics();
      ignore Timer.recurringTimer(
        #nanoseconds(GlobalConstants.FIVE_MIN_NANO_SECS),
        func() : async () { canistergeekMonitor.collectMetrics() }
      );
    }
  );

  system func preupgrade() {
    _canistergeekMonitorUD := ?canistergeekMonitor.preupgrade();
    _canistergeekLoggerUD := ?canistergeekLogger.preupgrade();
    persistedVestingsStorage := ledger.toPersistedStorage();
    scheduler.stopScheduler();
    persistedStakingUnlocks := scheduler.toPersistentSchedule();
    persistedFailedUnlocks := scheduler.toPersistentFailedJobs();
  };

  system func postupgrade() {
    ledger.fromPersistedStorage(persistedVestingsStorage);

    authGuard.subscribe("admins");
    ignore authGuard.setUpDefaultAdmins(
      List.nil<Principal>(),
      deployer,
      Principal.fromActor(this)
    );
    canistergeekMonitor.postupgrade(_canistergeekMonitorUD);
    _canistergeekMonitorUD := null;
    canistergeekLogger.postupgrade(_canistergeekLoggerUD);
    _canistergeekLoggerUD := null;
    canistergeekLogger.setMaxMessagesCount(3000);

    scheduler.fromPersistentSchedule(persistedStakingUnlocks);
    scheduler.fromPersistentFailedJobs(persistedFailedUnlocks);
    ignore scheduler.startScheduler();
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
      case (#validate _) { authGuard.isAdmin(caller) };
      case _ { not Principal.isAnonymous(caller) };
    };
  };

};
