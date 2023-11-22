import Principal "mo:base/Principal";
import Error "mo:base/Error";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import GlobalState "../../statev2";
import CommonTypes "../../../common/types";
import ModSecurity "../../../common/security/guard";
import Helpers "../../../common/helpers";
import Canistergeek "../../../common/canistergeek/canistergeek";
import ICRCTypes "../../../common/ICRCTypes";
import Constants "../../../common/constants";

module StakingService {
  public class StakingManager(env : CommonTypes.ENV, appState : GlobalState.State) {
    private let guard = ModSecurity.Guard(env, "STAKING_SERVICE");
    private let canistergeekLogger = Canistergeek.Logger();
    private let logger = Helpers.getLogger(canistergeekLogger);
    private let vestingActor = guard.getVestingActor();
    private let ledgerActor = guard.getWalletActor();
    private let modclubActor = guard.getModclubCanisterActor();

    public func releaseTokens(recipient : Principal, amount : ICRCTypes.Tokens) : async ICRCTypes.Result<ICRCTypes.TxIndex, ICRCTypes.TransferError> {
      let moderatorAcc = { owner = recipient; subaccount = null };
      let modclubPrincipal = Principal.fromActor(modclubActor);

      let mSubAccs = switch (appState.profiles.get(recipient)) {
        case (?m) { m.subaccounts };
        case (_) {
          let msg = "Unable to find user with principal::" # Principal.toText(recipient);
          logger.logError(msg);
          throw Error.reject(msg);
        };
      };
      let accountPayableSubAcc = switch (mSubAccs.get(Constants.ACCOUNT_PAYABLE_FIELD)) {
        case (?accountPayable) accountPayable;
        case (_) {
          let msg = "No AP subaccount for moderator::" # Principal.toText(recipient);
          logger.logError(msg);
          throw Error.reject(msg);
        };
      };

      let fee = await ledgerActor.icrc1_fee();
      let unlockedAmount = await vestingActor.unlocked_stakes_for(moderatorAcc);
      if (unlockedAmount < amount or amount < fee) {
        let msg = "Withdraw amount cant be more than unlocked amount of tokens, or less than transaction fee. Requested by " # Principal.toText(recipient);
        logger.logError(msg);
        throw Error.reject(msg);
      };

      let release = await vestingActor.release_staking(moderatorAcc, amount);
      switch (release) {
        case (#ok(res)) {
          let releaseStakeTransfer = await ledgerActor.icrc1_transfer({
            from_subaccount = ?Constants.ICRC_STAKING_SA;
            to = {
              owner = modclubPrincipal;
              subaccount = ?accountPayableSubAcc;
            };
            amount = (amount - fee);
            fee = ?fee;
            memo = null;
            created_at_time = null;
          });
          switch (releaseStakeTransfer) {
            case (#Ok(txIndex)) {
              #Ok(txIndex);
            };
            case (#Err(e)) {
              let msg = "Can't withdraw unlocked amount of tokens." # debug_show e;
              logger.logError(msg);
              throw Error.reject(msg);
            };
          };
        };
        case (#err(e)) {
          let msg = "Can't withdraw unlocked amount of tokens." # debug_show e;
          logger.logError(msg);
          throw Error.reject(msg);
        };
      };
    };

    public func claimStakedAmount(caller : Principal, amount : ICRCTypes.Tokens) : async Result.Result<Nat, Text> {
      let moderatorAcc = { owner = caller; subaccount = null };
      let fee = await ledgerActor.icrc1_fee();
      let stakedAmount = await vestingActor.staked_for(moderatorAcc);
      if (stakedAmount < amount or amount < fee) {
        let msg = "Amount can't be more than staked amount of tokens, or less than transaction fee.";
        logger.logError(msg);
        throw Error.reject(msg);
      };
      let claimedtxId = await vestingActor.claim_staking(moderatorAcc, amount);
      claimedtxId;
    };

  };
};
