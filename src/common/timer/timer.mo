import Timer "mo:base/Timer";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import CommonTypes "../types";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import ModclubCanister "./ModclubCanister";
import Canistergeek "../../modclub/canistergeek/canistergeek";
import Constants "../constants";
import ModWallet "../../modclub/remote_canisters/ModWallet";
import ModClubParam "../../modclub/service/parameters/params";
import Principal "mo:base/Principal";

module CommonTimer {

  public class CommonTimer(env : CommonTypes.ENV, context : Text) {
    public var isTimerSet : Bool = false;
    public func emailtimer() : async () {
      Debug.print("[Start Email Timer]");
      let mcactor = ModclubCanister.getActor(env);
      let _ = mcactor.getModeratorEmailsForPOHAndSendEmail("p");
      let _ = mcactor.getModeratorEmailsForPOHAndSendEmail("shc");
    };

    public func releaseNextToken() : async () {
      //TODO: Update with new ICRC
      Debug.print("[Start Next Token Timer]");
      let mcactor = ModclubCanister.getActor(env);
      let _ = await ModWallet.getActor(env).transfer(?ModClubParam.RESERVE_SA, Principal.fromActor(mcactor), ?ModClubParam.TREASURY_SA, ModClubParam.MOD_RELEASE_PER_DAY);
    };

    public func initTimer(
      canistergeekMonitor : Canistergeek.Monitor
    ) : () {
      if (not isTimerSet) {
        Debug.print("[INIT TIMER]");
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

        ignore Timer.setTimer(
          #seconds(0),
          func() : async () {
            let _ = await releaseNextToken();
            ignore Timer.recurringTimer(#nanoseconds(Constants.ONE_YEAR_NANO_SECS), releaseNextToken);
          }
        );
        isTimerSet := true;
      };
      isTimerSet := isTimerSet;
    };
  };
};
