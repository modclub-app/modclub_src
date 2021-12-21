import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Buckets "./buckets";
import Types "../types";

module BucketState {
  type Bucket = Buckets.Bucket;

  public type DataCanisterState = {
    // data canisters to hold data
    dataCanisters: HashMap.HashMap<Types.DataCanisterId, Bucket>;
  };

  public type DataCanisterStateStable = {    
    dataCanisters: [(Types.DataCanisterId, Bucket)];
  };

  public func empty () : DataCanisterState {
    var st : DataCanisterState = {
      dataCanisters = HashMap.HashMap<Types.DataCanisterId, Bucket> (1, Principal.equal, Principal.hash);
    };
    st;
  };

  public func emptyShared(): DataCanisterStateStable {
    var st : DataCanisterStateStable = {
      dataCanisters = [];
    };
    st;
  };

  public func fromState(state: DataCanisterState) : DataCanisterStateStable {
    let st : DataCanisterStateStable = {
      dataCanisters = Iter.toArray(state.dataCanisters.entries());
    };
    st;
  };

  public func toState(stateShared: DataCanisterStateStable) : DataCanisterState {
    let state = empty();
    for( (id, pid) in stateShared.dataCanisters.vals()) {
      state.dataCanisters.put(id, pid);
    };
    return state;
  };


};
