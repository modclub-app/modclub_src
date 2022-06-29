import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import DownloadUtil "../../downloadUtil";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Option "mo:base/Option";
import QueueState "./state";
import Principal "mo:base/Principal";
import RelObj "../../data_structures/RelObj";
import TrieMap "mo:base/TrieMap";

module {
    // [Text] is one row of csv here... whole function return is a row of rows
    public func download(state: QueueState.QueueState, varName: Text, start: Int, end: Int): [[Text]] {
        switch(varName) {
            case("newContentQueues") {
                return serializeNewContentQueues(state.newContentQueues);
            };
            case("allNewContentQueue") {
                return serializeQueue(state.allNewContentQueue);
            };
            case("approvedContentQueue") {
                return serializeQueue(state.approvedContentQueue);
            };
            case("rejectedContentQueue") {
                return serializeQueue(state.rejectedContentQueue);
            };
            case("queueIds") {
                return serializeQueueIds(state.queueIds);
            };
            case("userId2QueueId") {
                return serializeUserId2QueueId(state.userId2QueueId);
            };
            case("lastUserQueueIndex") {
                return [[Int.toText(state.lastUserQueueIndex)]];
            };
            case(_) {
                return [];
            };
        };
    };

    func serializeNewContentQueues(newContentQueues : HashMap.HashMap<Text, HashMap.HashMap<Text, ?Text>>) : [[Text]] {
        let buff = Buffer.Buffer<[Text]>(1);
        for((qId, contentIdMap) in newContentQueues.entries()) {
            for(cId in contentIdMap.keys()) {
                buff.add(
                    [qId, cId]
                );
            }
        };
        return buff.toArray();
    };

    func serializeQueue(qeueue : HashMap.HashMap<Text, ?Text>) : [[Text]] {
        let buff = Buffer.Buffer<[Text]>(1);
        for(cId in qeueue.keys()) {
            buff.add([cId]);
        };
        return buff.toArray();
    };

    func serializeQueueIds(queueIds :  Buffer.Buffer<Text>) : [[Text]] {
        let buff = Buffer.Buffer<[Text]>(1);
        for(qId in queueIds.vals()) {
            buff.add([qId]);
        };
        return buff.toArray();
    };

    func serializeUserId2QueueId(userId2QueueId :  HashMap.HashMap<Principal, Text>) : [[Text]] {
        let buff = Buffer.Buffer<[Text]>(1);
        for((uId, qId) in userId2QueueId.entries()) {
            buff.add([Principal.toText(uId), qId]);
        };
        return buff.toArray();
    };
}