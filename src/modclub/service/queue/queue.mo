import Buffer "mo:base/Buffer";
import Canistergeek "../../canistergeek/canistergeek";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Helpers "../../helpers";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Params "../parameters/params";
import Principal "mo:base/Principal";
import QueueState "./state";
import Text "mo:base/Text";
import Types "../../types";

module QueueManager {

    public class QueueManager() {

        var state : QueueState.QueueState = QueueState.emptyState();
        var logger: ?Canistergeek.Logger = null;

        public func changeContentStatus(contentId: Text, contentStatus: Types.ContentStatus) {
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
                case(#new) {
                    // there will always be queue assigned to user
                    let qId = Option.get(state.userId2QueueId.get(userId), "");
                    Debug.print( "QueueId: " # qId # " assigned to user: " # Principal.toText(userId));
                    logMessage(logger, "QueueId: " # qId # " assigned to user: " # Principal.toText(userId));
                    return Option.get(state.newContentQueues.get(qId), HashMap.HashMap<Text, ?Text>(1, Text.equal, Text.hash));
                };
            };
        };

        // private func getUserQueueId(userId: Principal) : Text {
        //     switch(state.userId2QueueId.get(userId)) {
        //         case(null) {
        //             Debug.print( "No qId was assigned to user: " # Principal.toText(userId));
        //             logMessage(logger, "No qId was assigned to user: " # Principal.toText(userId));
        //             assignUserIds2QueueId([userId]);
        //             return Option.get(state.userId2QueueId.get(userId), "");
        //         };
        //         case(?qId) {
        //             Debug.print( "QueueId: " # qId # "was already assigned to user: " # Principal.toText(userId));
        //             logMessage(logger, "QueueId: " # qId # "was already assigned to user: " # Principal.toText(userId));
        //             return qId;
        //         };
        //     }
        // };

        public func isContentAssignedToUser(userId: Principal, contentId: Text, logger: Canistergeek.Logger) : Bool {
            let queue = getUserContentQueue(userId, #new);
            switch(queue.get(contentId)) {
                case(null) return false;
                case(_) return true;
            }
        };

        private func submitContentToNewQueue(contentId: Text) {
            let queueList = Helpers.generateRandomList(Params.ASSIGN_CONTENT_QUEUES, state.queueIds.toArray());
            for(qId in queueList.vals()) {
                let _ = do ? {
                    let q = state.newContentQueues.get(qId)!;
                    q.put(contentId, null);
                };
            };
            state.allNewContentQueue.put(contentId, null);
        };

        private func submitContentToApprovedQueue(contentId: Text) {
            removeContentFromNewQueue(contentId);
            state.approvedContentQueue.put(contentId, null);
        };

        private func submitContentToRejectedQueue(contentId: Text) {
            removeContentFromNewQueue(contentId);
            state.rejectedContentQueue.put(contentId, null);
        };

         private func removeContentFromNewQueue(contentId: Text) {
            for((qId, q) in state.newContentQueues.entries()) {
                q.delete(contentId);
            };
            state.allNewContentQueue.delete(contentId);
         };

        public func assignUserIds2QueueId(allUserIds: [Principal]) {
            for(i in Iter.range(0, allUserIds.size() - 1)) {
                // Debug.print("Assiging qId to user: " # Principal.toText(allUserIds.get(i)) 
                //             # " lastUserQueueIndex: " # Int.toText(state.lastUserQueueIndex));
                state.lastUserQueueIndex := (state.lastUserQueueIndex + 1) % Params.TOTAL_QUEUES;
                Debug.print("Assiging qId to user: " # Principal.toText(allUserIds.get(i)) 
                            # " currentUserQueueIndex: " # Int.toText(state.lastUserQueueIndex)
                            # "size: " # Nat.toText(state.queueIds.size()));
                logMessage(logger, "Assiging qId to user: " # Principal.toText(allUserIds.get(i)) 
                            # " currentUserQueueIndex: " # Int.toText(state.lastUserQueueIndex));
                let qId = state.queueIds.get(Int.abs(state.lastUserQueueIndex));
                Debug.print( "QueueId: " # qId # " and state.lastUserQueueIndex: " # Int.toText(state.lastUserQueueIndex));
                state.userId2QueueId.put(allUserIds.get(i), qId);
            };
        };

        public func getQIds() : [Text] {
            state.queueIds.toArray();
        };

        private func createAllQueues() {
            // Emptying the queueIds
            for(i in Iter.range(0, Params.TOTAL_QUEUES - 1)) {
                let qId = "Queue: " # Int.toText(i);
                initializeQueue(qId);
                state.queueIds.add(qId);
            }
        };

        private func assignAllContentToQueues() {
            for(contentId in state.allNewContentQueue.keys()) {
                let queueList = Helpers.generateRandomList(Params.ASSIGN_CONTENT_QUEUES, state.queueIds.toArray());
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

        public func shuffleContent() {
            state.newContentQueues := HashMap.HashMap<Text, HashMap.HashMap<Text, ?Text>>(1, Text.equal, Text.hash);
            // removing all element from queueIds to generate new ones
            while(state.queueIds.removeLast() != null) {};
            createAllQueues();
            assignAllContentToQueues();
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
        public func postupgrade(_stableStateOpt : ?QueueState.QueueStateStable, _logger: Canistergeek.Logger) {
            switch(_stableStateOpt) {
                case(null) ();
                case(?_stableState) {
                    state := QueueState.getState(_stableState);
                };
            };
            logger := ?_logger;
        };

        public func preupgrade() : QueueState.QueueStateStable {
            QueueState.getStableState(state);
        };

        private func logMessage(logger: ?Canistergeek.Logger, message: Text) {
            let _ = do?{
                Helpers.logMessage(logger!, message, #info);
            };     
        };
    };
};