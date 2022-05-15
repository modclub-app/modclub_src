import Buffer "mo:base/Buffer";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";

module State {

    public type QueueState = {
        newContentQueues: HashMap.HashMap<Text, Buffer.Buffer<Text>>;
        approvedContentQueue: Buffer.Buffer<Text>;
        rejectedContentQueue: Buffer.Buffer<Text>;
        userId2QueueId: HashMap.HashMap<Principal, Text>;
    };

    public type QueueStateStable = {
        newContentQueues: [(Text, [Text])];
        approvedContentQueue: [Text];
        rejectedContentQueue: [Text];
        userId2QueueId: [(Principal, Text)];
    };

    public func emptyState(): QueueState {
        return {
            newContentQueues = HashMap.HashMap<Text, Buffer.Buffer<Text>>(1, Text.equal, Text.hash);
            approvedContentQueue = Buffer.Buffer<Text>(1);
            rejectedContentQueue = Buffer.Buffer<Text>(1);
            userId2QueueId = HashMap.HashMap<Principal, Text>(1, Principal.equal, Principal.hash);
        };
    };

    public func getState(stableState: QueueStateStable): QueueState {
        let state = emptyState();
        for( (qId, q) in stableState.newContentQueues.vals()) {
            let buff = Buffer.Buffer<Text>(1);
            for(qItem in q.vals()) {
                buff.add(qItem);
            };
            state.newContentQueues.put(qId, buff);
        };
        for(package in stableState.approvedContentQueue.vals()) {
            state.approvedContentQueue.add(package);
        };
        for(package in stableState.rejectedContentQueue.vals()) {
            state.rejectedContentQueue.add(package);
        };
        for( (userId, qId) in stableState.userId2QueueId.vals()) {
            state.userId2QueueId.put(userId, qId);
        };

        return state;
    };

    public func getStableState(state: QueueState): QueueStateStable {
        let newContentQBuff = Buffer.Buffer<(Text, [Text])>(1);
        for( (qId, q) in state.newContentQueues.entries()) {
            newContentQBuff.add((qId, q.toArray()));
        };
        let stableState : QueueStateStable = {
            newContentQueues = newContentQBuff.toArray();
            approvedContentQueue = state.approvedContentQueue.toArray();
            rejectedContentQueue = state.rejectedContentQueue.toArray();
            userId2QueueId = Iter.toArray(state.userId2QueueId.entries());
        };
        return stableState;
    };
};