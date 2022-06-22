import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Buckets "./buckets";
import Types "./types";
// import DownloadSupport "./downloadSupport";

module StorageState {
  type Bucket = Buckets.Bucket;

  public type DataCanisterState = {
    // data canisters to hold data
    dataCanisters: HashMap.HashMap<Types.DataCanisterId, Bucket>;
    contentIdToCanisterId: HashMap.HashMap<Text, Types.DataCanisterId>;
    moderatorsId : HashMap.HashMap<Principal, Principal>;
  };

  public type DataCanisterStateStable = {    
    dataCanisters: [(Types.DataCanisterId, Bucket)];
    contentIdToCanisterId: [(Text, Types.DataCanisterId)];
    moderatorsId : [(Principal, Principal)];
  };

  public func emptyState() : DataCanisterState {
    var st : DataCanisterState = {
      dataCanisters = HashMap.HashMap<Types.DataCanisterId, Bucket> (1, Principal.equal, Principal.hash);
      contentIdToCanisterId = HashMap.HashMap<Text, Types.DataCanisterId> (1, Text.equal, Text.hash);
      moderatorsId = HashMap.HashMap<Principal, Principal> (1, Principal.equal, Principal.hash);
    };
    st;
  };

  public func emptyStableState(): DataCanisterStateStable {
    var st : DataCanisterStateStable = {
      dataCanisters = [];
      contentIdToCanisterId = [];
      moderatorsId = [];
    };
    st;
  };

  public func getStableState(state: DataCanisterState) : DataCanisterStateStable {
    let st : DataCanisterStateStable = {
      dataCanisters = Iter.toArray(state.dataCanisters.entries());
      contentIdToCanisterId = Iter.toArray(state.contentIdToCanisterId.entries());
      moderatorsId = Iter.toArray(state.moderatorsId.entries());
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
    for( (id, pid) in stateShared.moderatorsId.vals()) {
      state.moderatorsId.put(id, pid);
    };
    return state;
  };


};
