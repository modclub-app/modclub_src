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
import LFSR "mo:rand/LFSR";
import Time "mo:base/Time";
import Nat8 "mo:base/Nat8";
import Types "../../types";
import DownloadSupport "./downloadSupport";

module QueueManager {

  public class QueueManager() {

    var state : QueueState.QueueState = QueueState.emptyState();
    var logger : ?Canistergeek.Logger = null;

    public func changeContentStatus(
      contentId : Text,
      contentStatus : Types.ContentStatus,
    ) {
      switch (contentStatus) {
        case (#new) {
          submitContentToNewQueue(contentId);
        };
        case (#approved) {
          submitContentToApprovedQueue(contentId);
        };
        case (#rejected) {
          submitContentToRejectedQueue(contentId);
        };
      };
    };
    // This function returns a queue for reading purpose
    // Don't modify/remove any element of the queue while calling this method
    // Call addContent method with arguments if you want to remove
    public func getUserContentQueue(
      userId : Principal,
      status : Types.ContentStatus,
      randomizationEnabled : Bool,
    ) : HashMap.HashMap<Text, ?Text> {
      switch (status) {
        case (#approved) {
          return state.approvedContentQueue;
        };
        case (#rejected) {
          return state.rejectedContentQueue;
        };
        case (#new) {
          if (not randomizationEnabled) {
            return state.allNewContentQueue;
          };
          // there will always be queue assigned to user
          let qId = Option.get(state.userId2QueueId.get(userId), "");
          return Option.get(
            state.newContentQueues.get(qId),
            HashMap.HashMap<Text, ?Text>(1, Text.equal, Text.hash),
          );
        };
      };
    };

    public func getContentStatus(contentId : Text) : Types.ContentStatus {
      switch (state.allNewContentQueue.get(contentId)) {
        case (null)();
        case (?v) {
          return #new;
        };
      };

      switch (state.approvedContentQueue.get(contentId)) {
        case (null)();
        case (?v) {
          return #approved;
        };
      };

      switch (state.rejectedContentQueue.get(contentId)) {
        case (null)();
        case (?v) {
          return #rejected;
        };
      };

      return #new;
    };

    public func getContentIds(
      userId : Principal,
      status : Types.ContentStatus,
      randomizationEnabled : Bool,
    ) : [Text] {
      var sourceBuffer = getUserContentQueue(
        userId,
        status,
        randomizationEnabled,
      );

      let buf = Buffer.Buffer<Text>(1);
      var i = 0;
      for (cId in sourceBuffer.keys()) {
        buf.add(cId);
      };
      return buf.toArray();
    };

    public func getContentQueueByStatus(status : Types.ContentStatus) : HashMap.HashMap<Text, ?Text> {
      switch (status) {
        case (#approved) {
          return state.approvedContentQueue;
        };
        case (#rejected) {
          return state.rejectedContentQueue;
        };
        case (#new) {
          return state.allNewContentQueue;
        };
      };
    };

    public func isContentAssignedToUser(
      userId : Principal,
      contentId : Text,
      logger : Canistergeek.Logger,
      randomizationEnabled : Bool,
    ) : Bool {
      let queue = getUserContentQueue(userId, #new, randomizationEnabled);
      switch (queue.get(contentId)) {
        case (null) return false;
        case (_) return true;
      };
    };

    private func submitContentToNewQueue(contentId : Text) {
      let queueList = Helpers.generateRandomList(
        Params.ASSIGN_CONTENT_QUEUES,
        state.queueIds.toArray(),
        Helpers.getRandomFeedGenerator(),
      );
      for (qId in queueList.vals()) {
        let _ = do ? {
          let q = state.newContentQueues.get(qId)!;
          q.put(contentId, null);
        };
      };
      state.allNewContentQueue.put(contentId, null);
    };

    private func submitContentToApprovedQueue(contentId : Text) {
      removeContentFromNewQueue(contentId);
      state.approvedContentQueue.put(contentId, null);
    };

    private func submitContentToRejectedQueue(contentId : Text) {
      removeContentFromNewQueue(contentId);
      state.rejectedContentQueue.put(contentId, null);
    };

    private func removeContentFromNewQueue(contentId : Text) {
      for ((qId, q) in state.newContentQueues.entries()) {
        q.delete(contentId);
      };
      state.allNewContentQueue.delete(contentId);
    };

    public func assignUserIds2QueueId(allUserIds : [Principal]) {
      for (i in Iter.range(0, allUserIds.size() - 1)) {
        state.lastUserQueueIndex := (state.lastUserQueueIndex + 1) % Params.TOTAL_QUEUES;
        logMessage(
          logger,
          "Assiging qId to user: " # Principal.toText(allUserIds.get(i)) # " currentUserQueueIndex: " # Int.toText(
            state.lastUserQueueIndex,
          ),
        );
        let qId = state.queueIds.get(Int.abs(state.lastUserQueueIndex));
        Debug.print(
          "QueueId: " # qId # " and state.lastUserQueueIndex: " # Int.toText(
            state.lastUserQueueIndex,
          ),
        );
        state.userId2QueueId.put(allUserIds.get(i), qId);
      };
    };

    public func getQIds() : [Text] {
      state.queueIds.toArray();
    };

    private func createAllQueues() {
      // Emptying the queueIds
      for (i in Iter.range(0, Params.TOTAL_QUEUES - 1)) {
        let qId = "Queue: " # Int.toText(i);
        initializeQueue(qId);
        state.queueIds.add(qId);
      };
    };

    private func assignAllContentToQueues() {
      let randomFeedGenerator = Helpers.getRandomFeedGenerator();
      for (contentId in state.allNewContentQueue.keys()) {
        let queueList = Helpers.generateRandomList(
          Params.ASSIGN_CONTENT_QUEUES,
          state.queueIds.toArray(),
          randomFeedGenerator,
        );
        for (qId in queueList.vals()) {
          initializeQueue(qId);
          let _ = do ? {
            let q = state.newContentQueues.get(qId)!;
            q.put(contentId, null);
          };
        };
      };
    };

    private func initializeQueue(qId : Text) {
      switch (state.newContentQueues.get(qId)) {
        case (null) {
          state.newContentQueues.put(
            qId,
            HashMap.HashMap<Text, ?Text>(1, Text.equal, Text.hash),
          );
        };
        case (_)();
      };
    };

    public func shuffleContent() {
      state.newContentQueues := HashMap.HashMap<Text, HashMap.HashMap<Text, ?Text>>(
        1,
        Text.equal,
        Text.hash,
      );
      // removing all element from queueIds to generate new ones
      while (state.queueIds.removeLast() != null) {};
      createAllQueues();
      assignAllContentToQueues();
    };

    public func moveContentIds(
      allNewContentIds : [Text],
      approvedContentIds : [Text],
      rejectedContentIds : [Text],
    ) {
      for (id in allNewContentIds.vals()) {
        state.allNewContentQueue.put(id, null);
      };
      for (id in approvedContentIds.vals()) {
        state.approvedContentQueue.put(id, null);
      };
      for (id in rejectedContentIds.vals()) {
        state.rejectedContentQueue.put(id, null);
      };
    };

    public func downloadSupport(varName : Text, start : Nat, end : Nat) : [
      [Text]
    ] {
      DownloadSupport.download(state, varName, start, end);
    };

    // It assumes that all contentIds are already moved into this class
    public func postupgrade(
      _stableStateOpt : ?QueueState.QueueStateStable,
      _logger : Canistergeek.Logger,
    ) {
      switch (_stableStateOpt) {
        case (null)();
        case (?_stableState) {
          state := QueueState.getState(_stableState);
        };
      };
      logger := ?_logger;
    };

    public func preupgrade() : QueueState.QueueStateStable {
      QueueState.getStableState(state);
    };

    private func logMessage(logger : ?Canistergeek.Logger, message : Text) {
      let _ = do ? {
        Helpers.logMessage(logger!, message, #info);
      };
    };
  };
};
