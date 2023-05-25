import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import DownloadUtil "../../downloadUtil";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Option "mo:base/Option";
import StorageState "./storageState";
import StorageTypes "./types";
import Buckets "./buckets";
import Principal "mo:base/Principal";
import RelObj "../../data_structures/RelObj";
import TrieMap "mo:base/TrieMap";

// dataCanisters: HashMap.HashMap<Types.DataCanisterId, Bucket>;
//     contentIdToCanisterId: HashMap.HashMap<Text, Types.DataCanisterId>;
//     moderatorsId : HashMap.HashMap<Principal, Principal>;

module {
  // [Text] is one row of csv here... whole function return is a row of rows
  public func download(
    state : StorageState.DataCanisterState,
    varName : Text,
    start : Int,
    end : Int
  ) : [[Text]] {
    switch (varName) {
      case ("dataCanisters") {
        return serializeDataCanisters(state.dataCanisters);
      };
      case ("contentIdToCanisterId") {
        return serializeContentIdToCanisterId(state.contentIdToCanisterId);
      };
      case ("moderatorsId") {
        return serializeModeratorsId(state.moderatorsId);
      };
      case (_) {
        return [];
      };
    };
  };

  func serializeDataCanisters(
    dataCanisters : HashMap.HashMap<StorageTypes.DataCanisterId, Buckets.Bucket>
  ) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((canId, canister) in dataCanisters.entries()) {
      buff.add(
        [
          Principal.toText(canId),
          Principal.toText(Principal.fromActor(canister))
        ]
      );
    };
    return Buffer.toArray<[Text]>(buff);
  };

  func serializeContentIdToCanisterId(
    contentIdToCanisterId : HashMap.HashMap<Text, StorageTypes.DataCanisterId>
  ) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((contentId, canId) in contentIdToCanisterId.entries()) {
      buff.add(
        [contentId, Principal.toText(canId)]
      );
    };
    return Buffer.toArray<[Text]>(buff);
  };

  func serializeModeratorsId(
    moderatorsId : HashMap.HashMap<Principal, Principal>
  ) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((modId, modId1) in moderatorsId.entries()) {
      buff.add(
        [Principal.toText(modId), Principal.toText(modId1)]
      );
    };
    return Buffer.toArray<[Text]>(buff);
  };

};
