import ContentState "./state";
import GlobalState "../../statev2";
import Types "../../types";
import Utils "../../../common/utils";
import Helpers "../../../common/helpers";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Debug "mo:base/Debug";
import Canistergeek "../../../common/canistergeek/canistergeek";
import ContentTypes "types";
import Constants "../../../common/constants";
import Error "mo:base/Error";
import Result "mo:base/Result";

module Reserved {

  public class ContentStateManager(stableState : ContentState.ContentStateStable) {

    var contentState : ContentState.ContentState = ContentState.getState(stableState);
    var logger : ?Canistergeek.Logger = null;

    public func getStableState() : ContentState.ContentStateStable {
      return ContentState.getStableState(contentState);
    };
    public func getContentState() : ContentState.ContentState {
      return contentState;
    };

    public func takeReservation(
      rid : Text,
      caller : Principal,
      expireTime : Types.Timestamp
    ) : Types.Reserved {
      let now = Helpers.timeNow();
      let reserved : Types.Reserved = {
        id = rid;
        profileId = Principal.toText(caller);
        createdAt = now;
        updatedAt = now;
        reservedExpiryTime = now + expireTime;
      };
      contentState.reservedList.put(rid, reserved);
      return reserved;
    };

    public func setVotingParams(
      vp : Types.VoteParameters
    ) : async () {
      if (((vp.requiredVotes % 2) != 0) and (vp.requiredVotes > 1)) {
        contentState.voteParams.put(vp.id, vp);
      } else {
        throw Error.reject("Only Odd number (3,5,7,11)");
      };
    };

    public func createReceipt(
      caller : Principal,
      globalState : GlobalState.State,
      cost : Int
    ) : Types.Receipt {
      let now = Helpers.timeNow();
      let id = Helpers.generateId(caller, "receipt", globalState);
      let receipt : Types.Receipt = {
        id = id;
        cost = cost;
        createdAt = now;
      };
      contentState.receipts.put(id, receipt);
      return receipt;
    };

    public func postupgrade(
      _stableStateOpt : ?ContentState.ContentStateStable,
      _logger : Canistergeek.Logger
    ) {
      switch (_stableStateOpt) {
        case (null)();
        case (?_stableState) {
          contentState := ContentState.getState(_stableState);
        };
      };
      logger := ?_logger;
    };

    public func preupgrade() : ContentState.ContentStateStable {
      ContentState.getStableState(contentState);
    };

    private func logMessage(logger : ?Canistergeek.Logger, message : Text) {
      let _ = do ? {
        Helpers.logMessage(logger!, message, #info);
      };
    };
  };
};
