import Timer "mo:base/Timer";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import CommonTypes "../types";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Canistergeek "../../modclub/canistergeek/canistergeek";
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
      let _ = mcactor.getModeratorEmailsForPOHAndSendEmail("p");
      let _ = mcactor.getModeratorEmailsForPOHAndSendEmail("shc");
    };

    public func releaseNextToken() : async () {
      // TODO: Wallet canister update in progress
    };

    public func initTimer(
      canistergeekMonitor : Canistergeek.Monitor
    ) : () {
      if (not isTimerSet) {
        canistergeekMonitor.collectMetrics();
        ignore Timer.setTimer(
          #seconds(0),
          func() : async () {
            let _ = await emailtimer();
            ignore Timer.recurringTimer(
              #nanoseconds(Constants.FIVE_MIN_NANO_SECS),
              emailtimer
            );
          }
        );

        // TODO: Uncomment this when MOD-364 is complete
        // ignore Timer.setTimer(
        //   #seconds(0),
        //   func() : async () {
        //     let _ = await releaseNextToken();
        //     ignore Timer.recurringTimer(#nanoseconds(Constants.ONE_YEAR_NANO_SECS), releaseNextToken);
        //   }
        // );
        isTimerSet := true;
      };
      isTimerSet := isTimerSet;
    };
  };
};
