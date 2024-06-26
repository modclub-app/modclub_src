import Timer "mo:base/Timer";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import CommonTypes "../types";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Canistergeek "../canistergeek/canistergeek";
import Constants "../constants";
import ModClubParam "../../modclub/service/parameters/params";
import ModSecurity "../security/guard";
import Principal "mo:base/Principal";

module CommonTimer {

  public class CommonTimer(env : CommonTypes.ENV, context : Text) {
    private let guard = ModSecurity.Guard(env, "TIMERS_SERVICE");
    private let ledger = guard.getWalletActor();
    private let mcactor = guard.getModclubCanisterActor();

    public var isTimerSet : Bool = false;
    public func emailtimer() : async () {
      let _ = mcactor.getModeratorEmailsForPOHAndSendEmail(
        Constants.EMAIL_NOTIFICATION_NEW_POH
      );
      let _ = mcactor.getModeratorEmailsForPOHAndSendEmail(
        Constants.EMAIL_NOTIFICATION_NEW_CONTENT
      );
    };

    public func releaseNextToken() : async () {
      let _ = await ledger.icrc1_transfer({
        from_subaccount = ?Constants.ICRC_RESERVE_SA;
        to = {
          owner = Principal.fromActor(mcactor);
          subaccount = ?Constants.ICRC_TREASURY_SA;
        };
        amount = ModClubParam.MOD_RELEASE_PER_DAY;
        fee = null;
        memo = null;
        created_at_time = null;
      });
    };

    public func initTimer<system>(
      canistergeekMonitor : Canistergeek.Monitor
    ) : () {
      if (not isTimerSet) {
        ignore Timer.setTimer<system>(
          #seconds(0),
          func() : async () {
            let _ = await emailtimer();
            ignore Timer.recurringTimer<system>(
              #nanoseconds(Constants.FIVE_MIN_NANO_SECS),
              emailtimer
            );
          }
        );
        isTimerSet := true;
      };
      isTimerSet := isTimerSet;
    };
  };
};
