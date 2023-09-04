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
      caller : Principal,
      globalState : GlobalState.State,
      expireTime : Types.Timestamp,
    ) : async Types.Reserved {
      let now = Helpers.timeNow();
      let rid = Helpers.generateId(caller, "Reservations", globalState);
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

    public func getVoteParamsIdByContentId(
      contentId : Types.ContentId
    ) : ?Types.VoteParamsId {
      let voteParamId : ?Types.VoteParamsId = contentState.voteParams2content.get(contentId);
      return voteParamId;
    };
    public func getVoteParamsByVoteParamId(
      voteParamId : Types.VoteParamsId
    ) : ?Types.VoteParameters {
      let voteParam : ?Types.VoteParameters = contentState.voteParams.get(voteParamId);
      return voteParam;
    };

    public func getVoteParamIdByLevel(
      level : Types.Level,
      globalState : GlobalState.State
    ) : Text {
      let lv = Helpers.level2Text(level);
      let id = lv # "voteParameter";
      var count : Nat = 0;
      switch (globalState.GLOBAL_ID_MAP.get(id)) {
        case (?result) {
          count := result - 1;
        };
        case (_)();
      };
      return id # "-" # (Nat.toText(count));
    };

    public func setVoteParams(
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
