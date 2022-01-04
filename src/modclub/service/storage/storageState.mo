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

  public func empty () : DataCanisterState {
    var st : DataCanisterState = {
      dataCanisters = HashMap.HashMap<Types.DataCanisterId, Bucket> (1, Principal.equal, Principal.hash);
      contentIdToCanisterId = HashMap.HashMap<Text, Types.DataCanisterId> (1, Text.equal, Text.hash);
    };
    st;
  };

  public func emptyShared(): DataCanisterStateStable {
    var st : DataCanisterStateStable = {
      dataCanisters = [];
      contentIdToCanisterId = [];
    };
    st;
  };

  public func fromState(state: DataCanisterState) : DataCanisterStateStable {
    let st : DataCanisterStateStable = {
      dataCanisters = Iter.toArray(state.dataCanisters.entries());
      contentIdToCanisterId = Iter.toArray(state.contentIdToCanisterId.entries());
    };
    st;
  };

  public func toState(stateShared: DataCanisterStateStable) : DataCanisterState {
    let state = empty();
    for( (id, pid) in stateShared.dataCanisters.vals()) {
      state.dataCanisters.put(id, pid);
    };
    for( (id, pid) in stateShared.contentIdToCanisterId.vals()) {
      state.contentIdToCanisterId.put(id, pid);
    };
    return state;
  };


};
