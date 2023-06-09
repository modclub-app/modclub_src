import Buffer "mo:base/Buffer";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Types "../../types";

module ContentState {
  public type Map<X, Y> = HashMap.HashMap<X, Y>;
  public type ContentState = {
    voteParams : Map<Types.VoteParamsId, Types.VoteParameters>;
    receipts : Map<Types.ReceiptId, Types.Receipt>;
    reservedList : Map<Types.ReservedId, Types.Reserved>;
    voteParams2content : Map<Types.ContentId, Types.VoteParamsId>;
  };

  public type ContentStateStable = {
    voteParams : [(Types.VoteParamsId, Types.VoteParameters)];
    receipts : [(Types.ReceiptId, Types.Receipt)];
    reservedList : [(Types.ReservedId, Types.Reserved)];
    voteParams2content : [(Types.ContentId, Types.VoteParamsId)];
  };

  public func emptyState() : ContentState {
    return {
      voteParams = HashMap.HashMap<Types.VoteParamsId, Types.VoteParameters>(
        1,
        Text.equal,
        Text.hash
      );

      receipts = HashMap.HashMap<Types.ReceiptId, Types.Receipt>(
        1,
        Text.equal,
        Text.hash
      );
      reservedList = HashMap.HashMap<Types.ReservedId, Types.Reserved>(
        1,
        Text.equal,
        Text.hash
      );
      voteParams2content = HashMap.HashMap<Types.ContentId, Types.VoteParamsId>(
        1,
        Text.equal,
        Text.hash
      );
    };
  };

  public func emptyStableState() : ContentStateStable {
    return {
      voteParams = [];
      receipts = [];
      reservedList = [];
      voteParams2content = [];
    };
  };

  public func getState(stableState : ContentStateStable) : ContentState {
    let state = emptyState();
    for ((pid, value) in stableState.voteParams.vals()) {
      state.voteParams.put(pid, value);
    };
    for ((pid, value) in stableState.receipts.vals()) {
      state.receipts.put(pid, value);
    };
    for ((pid, value) in stableState.reservedList.vals()) {
      state.reservedList.put(pid, value);
    };
    for ((pid, value) in stableState.voteParams2content.vals()) {
      state.voteParams2content.put(pid, value);
    };
    return state;
  };

  public func getStableState(state : ContentState) : ContentStateStable {
    let stableState : ContentStateStable = {
      voteParams = Iter.toArray(
        state.voteParams.entries()
      );
      receipts = Iter.toArray(
        state.receipts.entries()
      );
      reservedList = Iter.toArray(
        state.reservedList.entries()
      );
      voteParams2content = Iter.toArray(
        state.voteParams2content.entries()
      );
    };
    return stableState;
  };
};
