import Buffer "mo:base/Buffer";
import Option "mo:base/Option";
import QueueTypes "./types";
import QueueState "./state";
import Types "../../types";

module QueueManager {

    public class QueueManager() {

        var state : QueueState.QueueState = QueueState.emptyState();


        public func getUserContentQueue(userId: Principal, status: Types.ContentStatus) : Buffer.Buffer<Text> {
            switch(status) {
                case(#approved) {
                    return state.approvedContentQueue;
                };
                case(#rejected) {
                    return state.rejectedContentQueue;
                };
                case(_) {
                    let qId = getUserQueueId(userId);
                    return Option.get(state.newContentQueues.get(qId), Buffer.Buffer<Text>(1));
                };
            };
        };

        private func getUserQueueId(userId: Principal) : Text {
            switch(state.userId2QueueId.get(userId)) {
                case(null) "";
                case(?qId) {
                    return qId;
                }
            }
        };


        public func postupgrade(_stableStateOpt : ?QueueState.QueueStateStable) {
            switch(_stableStateOpt) {
                case(null){
                    state := QueueState.emptyState();
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