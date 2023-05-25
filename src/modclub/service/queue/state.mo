import Buffer "mo:base/Buffer";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";

module State {

  public type QueueState = {
    var newContentQueues : HashMap.HashMap<Text, HashMap.HashMap<Text, ?Text>>;
    allNewContentQueue : HashMap.HashMap<Text, ?Text>;
    approvedContentQueue : HashMap.HashMap<Text, ?Text>;
    rejectedContentQueue : HashMap.HashMap<Text, ?Text>;
    queueIds : Buffer.Buffer<Text>;
    userId2QueueId : HashMap.HashMap<Principal, Text>;
    var lastUserQueueIndex : Int;
  };

  public type QueueStateStable = {
    newContentQueues : [(Text, [Text])];
    allNewContentQueue : [Text];
    approvedContentQueue : [Text];
    rejectedContentQueue : [Text];
    queueIds : [Text];
    userId2QueueId : [(Principal, Text)];
    var lastUserQueueIndex : Int;
  };

  public func emptyState() : QueueState {
    return {
      var newContentQueues = HashMap.HashMap<Text, HashMap.HashMap<Text, ?Text>>(
        1,
        Text.equal,
        Text.hash
      );
      allNewContentQueue = HashMap.HashMap<Text, ?Text>(
        1,
        Text.equal,
        Text.hash
      );
      approvedContentQueue = HashMap.HashMap<Text, ?Text>(
        1,
        Text.equal,
        Text.hash
      );
      rejectedContentQueue = HashMap.HashMap<Text, ?Text>(
        1,
        Text.equal,
        Text.hash
      );
      queueIds = Buffer.Buffer<Text>(1);
      userId2QueueId = HashMap.HashMap<Principal, Text>(
        1,
        Principal.equal,
        Principal.hash
      );
      var lastUserQueueIndex = -1;
    };
  };

  public func emptyStableState() : QueueStateStable {
    return {
      newContentQueues = [];
      allNewContentQueue = [];
      approvedContentQueue = [];
      rejectedContentQueue = [];
      queueIds = [];
      userId2QueueId = [];
      var lastUserQueueIndex = -1;
    };
  };

  public func getState(stableState : QueueStateStable) : QueueState {
    let state = emptyState();
    for ((qId, q) in stableState.newContentQueues.vals()) {
      let qMap = HashMap.HashMap<Text, ?Text>(1, Text.equal, Text.hash);
      for (qItem in q.vals()) {
        qMap.put(qItem, null);
      };
      state.newContentQueues.put(qId, qMap);
    };
    for (qItem in stableState.allNewContentQueue.vals()) {
      state.allNewContentQueue.put(qItem, null);
    };
    for (qItem in stableState.approvedContentQueue.vals()) {
      state.approvedContentQueue.put(qItem, null);
    };
    for (qItem in stableState.rejectedContentQueue.vals()) {
      state.rejectedContentQueue.put(qItem, null);
    };
    for (qItem in stableState.queueIds.vals()) {
      state.queueIds.add(qItem);
    };
    for ((userId, qId) in stableState.userId2QueueId.vals()) {
      state.userId2QueueId.put(userId, qId);
    };
    state.lastUserQueueIndex := stableState.lastUserQueueIndex;
    return state;
  };

  public func getStableState(state : QueueState) : QueueStateStable {
    let newContentQBuff = Buffer.Buffer<(Text, [Text])>(1);
    for ((qId, qMap) in state.newContentQueues.entries()) {
      newContentQBuff.add((qId, Iter.toArray(qMap.keys())));
    };
    let stableState : QueueStateStable = {
      newContentQueues = Buffer.toArray<(Text, [Text])>(newContentQBuff);
      allNewContentQueue = Iter.toArray(state.allNewContentQueue.keys());
      approvedContentQueue = Iter.toArray(state.approvedContentQueue.keys());
      rejectedContentQueue = Iter.toArray(state.rejectedContentQueue.keys());
      queueIds = Buffer.toArray<Text>(state.queueIds);
      userId2QueueId = Iter.toArray(state.userId2QueueId.entries());
      var lastUserQueueIndex = state.lastUserQueueIndex;
    };
    return stableState;
  };
};
