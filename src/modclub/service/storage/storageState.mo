import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Buckets "./buckets";
import Types "./types";

module StorageState {
  type Bucket = Buckets.Bucket;

  public type DataCanisterState = {
    // data canisters to hold data
    dataCanisters: HashMap.HashMap<Types.DataCanisterId, Bucket>;
    contentIdToCanisterId: HashMap.HashMap<Text, Types.DataCanisterId>;
  };

  public type DataCanisterStateStable = {    
    dataCanisters: [(Types.DataCanisterId, Bucket)];
    contentIdToCanisterId: [(Text, Types.DataCanisterId)];

  };

  public func emptyState() : DataCanisterState {
    var st : DataCanisterState = {
      dataCanisters = HashMap.HashMap<Types.DataCanisterId, Bucket> (1, Principal.equal, Principal.hash);
      contentIdToCanisterId = HashMap.HashMap<Text, Types.DataCanisterId> (1, Text.equal, Text.hash);
    };
    st;
  };

  public func emptyStableState(): DataCanisterStateStable {
    var st : DataCanisterStateStable = {
      dataCanisters = [];
      contentIdToCanisterId = [];
    };
    st;
  };

  public func getStableState(state: DataCanisterState) : DataCanisterStateStable {
    let st : DataCanisterStateStable = {
      dataCanisters = Iter.toArray(state.dataCanisters.entries());
      contentIdToCanisterId = Iter.toArray(state.contentIdToCanisterId.entries());
    };
    st;
  };

  public func getState(stateShared: DataCanisterStateStable) : DataCanisterState {
    let state = emptyState();
    for( (id, pid) in stateShared.dataCanisters.vals()) {
      state.dataCanisters.put(id, pid);
    };
    for( (id, pid) in stateShared.contentIdToCanisterId.vals()) {
      state.contentIdToCanisterId.put(id, pid);
    };
    return state;
  };


};
