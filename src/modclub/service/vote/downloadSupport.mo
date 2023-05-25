import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import DownloadUtil "../../downloadUtil";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import RelObj "../../data_structures/RelObj";
import TrieMap "mo:base/TrieMap";
import Types "../../types";
import VoteState "./statev2";
import VoteTypes "./types";

module {

  // package2Status : HashMap.HashMap<Text, Types.ContentStatus>;
  // [Text] is one row of csv here... whole function return is a row of rows
  public func download(
    state : VoteState.PohVoteState,
    varName : Text,
    start : Int,
    end : Int
  ) : [[Text]] {
    switch (varName) {
      case ("newPohPackages") {
        return serializeNewPohPackages(state.newPohPackages);
      };
      case ("approvedPohPackages") {
        return serializeNewPohPackages(state.approvedPohPackages);
      };
      case ("rejectedPohPackages") {
        return serializeNewPohPackages(state.rejectedPohPackages);
      };
      case ("package2Status") {
        return serializePackage2Status(state.package2Status);
      };
      case ("pohVotes") {
        return serializePohVotes(state.pohVotes);
      };
      case ("pohContent2votes") {
        return serializePohContent2votes(state.pohContent2votes);
      };
      case ("mods2Pohvotes") {
        return serializeMods2Pohvotes(state.mods2Pohvotes);
      };
      case ("autoApprovePOHUserIds") {
        return serializeAutoApprovePOHUserIds(state.autoApprovePOHUserIds);
      };
      case (_) {
        return [];
      };
    };
  };

  func serializePackage2Status(
    package2Status : HashMap.HashMap<Text, Types.ContentStatus>
  ) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((pId, status) in package2Status.entries()) {
      buff.add(
        [
          pId,
          DownloadUtil.joinArr(DownloadUtil.toString_ContentStatus([status]))
        ]
      );
    };
    return Buffer.toArray<[Text]>(buff);
  };

  func serializePohVotes(pohVotes : HashMap.HashMap<Text, VoteTypes.VoteV2>) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((vId, vote) in pohVotes.entries()) {
      buff.add(
        [vId, DownloadUtil.joinArr(DownloadUtil.toString_PohVote([vote]))]
      );
    };
    return Buffer.toArray<[Text]>(buff);
  };

  func serializePohContent2votes(pohContent2votes : RelObj.RelObj<Text, Text>) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for (cId in pohContent2votes.getKeys().vals()) {
      for (vId in pohContent2votes.get0(cId).vals()) {
        buff.add(
          [cId, vId]
        );
      };
    };
    return Buffer.toArray<[Text]>(buff);
  };

  func serializeMods2Pohvotes(mods2Pohvotes : RelObj.RelObj<Principal, Text>) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for (uId in mods2Pohvotes.getKeys().vals()) {
      for (vId in mods2Pohvotes.get0(uId).vals()) {
        buff.add(
          [Principal.toText(uId), vId]
        );
      };
    };
    return Buffer.toArray<[Text]>(buff);
  };

  func serializeAutoApprovePOHUserIds(
    autoApprovePOHUserIds : HashMap.HashMap<Principal, Principal>
  ) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((uId, uId1) in autoApprovePOHUserIds.entries()) {
      buff.add([Principal.toText(uId), Principal.toText(uId1)]);
    };
    return Buffer.toArray<[Text]>(buff);
  };

  func serializeNewPohPackages(newPohPackages : Buffer.Buffer<Text>) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for (word in newPohPackages.vals()) {
      buff.add([word]);
    };
    return Buffer.toArray<[Text]>(buff);
  };
};
