import Buffer "mo:base/Buffer";
import Error "mo:base/Error";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Timer "mo:base/Timer";

import Types "types";
import Utils "../common/utils";
import Constants "../common/constants";
import Helpers "../common/helpers";
import CommonTypes "../common/types";

import VestingLedger "./ledger";
import ModSecurity "../common/security/guard";

module Scheduler = {

  public class Scheduler(ledger : VestingLedger.Ledger, logger : CommonTypes.ModclubLogger, guard : ModSecurity.Guard) {

    var schedule = HashMap.HashMap<Principal, Buffer.Buffer<Types.UnlockJob>>(0, Principal.equal, Principal.hash);
    var scheduler : Nat = 0;
    var failedJobs = Buffer.Buffer<Types.UnlockJob>(100);

    public func applyUnlockJob(uid : Principal, amount : Nat) : async Bool {
      let now = Helpers.nowSeconds(); // in seconds for more simple math;
      let job = {
        id = await Helpers.generateUUID();
        uid;
        amount;
        dissolve_at_time = (now + Constants.VESTING_DISSOLVE_DELAY_SECONDS);
        created_at_time = now;
      };
      let userJobs = switch (schedule.get(uid)) {
        case (?list) { list };
        case (null) { Buffer.Buffer<Types.UnlockJob>(100) };
      };
      userJobs.add(job);
      schedule.put(uid, userJobs);
      true;
    };

    public func dropFromSchedule(uid : Principal, toRemove : Buffer.Buffer<Types.UnlockJob>) : Bool {
      let userJobs = switch (schedule.get(uid)) {
        case (?list) { list };
        case (null) { return true };
      };
      userJobs.filterEntries(func(_, j) = not Buffer.contains<Types.UnlockJob>(toRemove, j, func(rj, cj) = Text.equal(rj.id, cj.id)));
      schedule.put(uid, userJobs);
      true;
    };

    private func reviewJobs() : async () {
      let now = Helpers.nowSeconds();
      for ((uid, jobs) in schedule.entries()) {
        let executedJobs = Buffer.Buffer<Types.UnlockJob>(100);
        for (job in jobs.vals()) {
          if (job.dissolve_at_time <= now) {
            executedJobs.add(job);
            ignore Timer.setTimer(
              #seconds(0),
              func() : async () { ignore handleJob(job) }, // for async/parallel execution
            );
          };
        };
        let _ = dropFromSchedule(uid, executedJobs);
      };
      scheduler := Timer.setTimer(
        #seconds(Constants.STAKING_UNLOCK_HANDLER_INTERVAL_SECONDS),
        reviewJobs
      );
    };

    private func handleJob(job : Types.UnlockJob) : async () {
      switch (ledger.unlockStaking(job.uid, job.amount)) {
        case (#ok(r)) {
          // Log success message
          logger.logMessage("[STAKING_SCHEDULER][TOKENS_UNLOCK] :: Successfull for User: " # Principal.toText(job.uid) # " Amount: " # Nat.toText(job.amount));
          switch (await guard.getModclubCanisterActor().releaseTokensFor(job.amount, job.uid)) {
            case (#Ok(_)) {
              logger.logMessage("[STAKING_SCHEDULER][TOKENS_RELEASE] :: Successfull for User: " # Principal.toText(job.uid) # " Amount: " # Nat.toText(job.amount));
            };
            case (#Err(e)) {
              let message = switch (e) {
                case (#InsufficientFunds(tokens)) {
                  "#InsufficientFunds " # Nat.toText(tokens.balance);
                };
                case (_) { "GeneralError" };
              };
              logger.logError("[STAKING_SCHEDULER][TOKENS_RELEASE][ERROR] :: User: " # Principal.toText(job.uid) # " Amount: " # Nat.toText(job.amount) # "Error: " # message);
            };
          };
        };
        case (#err(e)) {
          // Log the error and put to failed list.
          logger.logError("[STAKING_SCHEDULER][TOKENS_UNLOCK][ERROR] :: User: " # Principal.toText(job.uid) # " Amount: " # Nat.toText(job.amount) # "Error: " # e);
          failedJobs.add(job);
        };
      };
    };

    public func startScheduler() : Bool {
      if (scheduler == 0) {
        scheduler := Timer.setTimer(
          #seconds(Constants.STAKING_UNLOCK_HANDLER_INTERVAL_SECONDS),
          reviewJobs
        );
        return true;
      };
      return false;
    };

    public func stopScheduler() : () {
      Timer.cancelTimer(scheduler);
      scheduler := 0;
    };

    public func toPersistentSchedule() : [(Principal, [Types.UnlockJob])] {
      let stableBuf = Buffer.Buffer<(Principal, [Types.UnlockJob])>(100);
      for ((uid, jobs) in schedule.entries()) {
        stableBuf.add((uid, Buffer.toArray<Types.UnlockJob>(jobs)));
      };

      return Buffer.toArray<(Principal, [Types.UnlockJob])>(stableBuf);
    };

    public func fromPersistentSchedule(stableList : [(Principal, [Types.UnlockJob])]) : () {
      for ((uid, jobs) in stableList.vals()) {
        schedule.put(uid, Buffer.fromArray<Types.UnlockJob>(jobs));
      };
    };

    public func toPersistentFailedJobs() : [Types.UnlockJob] {
      Buffer.toArray<Types.UnlockJob>(failedJobs);
    };

    public func fromPersistentFailedJobs(jobs : [Types.UnlockJob]) : () {
      failedJobs := Buffer.fromArray<Types.UnlockJob>(jobs);
    };

  };
};
