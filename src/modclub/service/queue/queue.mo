import Buffer "mo:base/Buffer";
import Option "mo:base/Option";
import Iter "mo:base/Iter";
import Int "mo:base/Int";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import QueueTypes "./types";
import QueueState "./state";
import Types "../../types";
import Params "../parameters/params";
import Helpers "../../helpers";

module QueueManager {

    public class QueueManager() {

        var state : QueueState.QueueState = QueueState.emptyState();

        public func addContent(contentId: Text, contentStatus: Types.ContentStatus) {
            switch(contentStatus) {
                case(#new) {
                    submitContentToNewQueue(contentId);
                };
                case(#approved) {
                    submitContentToApprovedQueue(contentId);
                };
                case(#rejected) {
                    submitContentToRejectedQueue(contentId);
                };
            };
        };
        // This function returns a queue for reading purpose
        // Don't modify/remove any element of the queue while calling this method
        // Call addContent method with arguments if you want to remove
        public func getUserContentQueue(userId: Principal, status: Types.ContentStatus) : HashMap.HashMap<Text, ?Text> {
            switch(status) {
                case(#approved) {
                    return state.approvedContentQueue;
                };
                case(#rejected) {
                    return state.rejectedContentQueue;
                };
                case(_) {
                    let qId = getUserQueueId(userId);
                    return Option.get(state.newContentQueues.get(qId), HashMap.HashMap<Text, ?Text>(1, Text.equal, Text.hash));
                };
            };
        };

        private func getUserQueueId(userId: Principal) : Text {
            switch(state.userId2QueueId.get(userId)) {
                case(null) {
                    assignUserIds2QueueId([userId]);
                    return getUserQueueId(userId);
                };
                case(?qId) {
                    return qId;
                };
            }
        };

        private func submitContentToNewQueue(contentId: Text) {
            let queueList = Helpers.generateRandomWordList(Params.ASSIGN_CONTENT_QUEUES, state.queueIds.toArray());
            for(qId in queueList.vals()) {
                initializeQueue(qId);
                let _ = do ? {
                    let q = state.newContentQueues.get(qId)!;
                    q.put(contentId, null);
                };
            };
            state.allNewContentQueue.put(contentId, null);
        };

        private func submitContentToApprovedQueue(contentId: Text) {
            for((qId, q) in state.newContentQueues.entries()) {
                q.delete(contentId);
            };
            state.allNewContentQueue.delete(contentId);
            state.approvedContentQueue.put(contentId, null);
        };

        private func submitContentToRejectedQueue(contentId: Text) {
            for((qId, q) in state.newContentQueues.entries()) {
                q.delete(contentId);
            };
            state.allNewContentQueue.delete(contentId);
            state.rejectedContentQueue.put(contentId, null);
        };

        private func assignUserIds2QueueId(allUserIds: [Principal]) {
            for(i in Iter.range(0, allUserIds.size())) {
                state.userIndex := (state.userIndex + 1) % Params.TOTAL_QUEUES;
                if(state.queueIds.size() <= state.userIndex + 1) {
                    let qId = "Queue: " # Int.toText(state.userIndex);
                    state.queueIds.add(qId);
                    state.userId2QueueId.put(allUserIds.get(i), qId);
                } else {
                    let qId = state.queueIds.get(Int.abs(state.userIndex));
                    state.userId2QueueId.put(allUserIds.get(i), qId);
                }
            };
        };

        private func createAllQueues() {
            for(i in Iter.range(0, Params.TOTAL_QUEUES)) {
                let qId = "Queue: " # Int.toText(i);
                initializeQueue(qId);
                state.queueIds.add(qId);
            }
        };

        private func assignAllContentToQueues() {
            for(contentId in state.allNewContentQueue.keys()) {
                let queueList = Helpers.generateRandomWordList(Params.ASSIGN_CONTENT_QUEUES, state.queueIds.toArray());
                for(qId in queueList.vals()) {
                    initializeQueue(qId);
                    let _ = do ? {
                        let q = state.newContentQueues.get(qId)!;
                        q.put(contentId, null);
                    };
                };
            };
        };

        private func initializeQueue(qId: Text) {
            switch(state.newContentQueues.get(qId)) {
                case(null) {
                    state.newContentQueues.put(qId, HashMap.HashMap<Text, ?Text>(1, Text.equal, Text.hash));
                };
                case(_) ();
            };
        };

        public func moveContentIds(allNewContentIds: [Text], approvedContentIds: [Text], rejectedContentIds: [Text]) {
            for(id in allNewContentIds.vals()) {
                state.allNewContentQueue.put(id, null);
            };
            for(id in approvedContentIds.vals()) {
                state.approvedContentQueue.put(id, null);
            };
            for(id in rejectedContentIds.vals()) {
                state.rejectedContentQueue.put(id, null);
            };
        };

        // It assumes that all contentIds are already moved into this class
        public func postupgrade(_stableStateOpt : ?QueueState.QueueStateStable) {
            switch(_stableStateOpt) {
                case(null) {
                    createAllQueues();
                    assignAllContentToQueues();
                };
                case(?_stableState) {
                    state := QueueState.getState(_stableState);
                };
            }
        };

        public func preupgrade() : QueueState.QueueStateStable {
            QueueState.getStableState(state);
        };
    };
};