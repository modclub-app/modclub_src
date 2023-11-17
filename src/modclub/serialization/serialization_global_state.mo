import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import ToStringUtil "./to_string";
import GlobalState "../statev2";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Bool "mo:base/Bool";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import RelObj "../data_structures/RelObj";
import TrieMap "mo:base/TrieMap";
import Types "../types";
import { JSON; Candid } "mo:serde";
module {
  public func serilize(
    state : GlobalState.State,
    varName : Text
  ) : Text {
    switch (varName) {
      case ("profiles") {
        return serializeProfiles(state.profiles);
      };
      case ("content") {
        return serializeContent(state.content);
      };
      case (_) {
        return "";
      };
    };
  };

  func _blobToText(blob : Blob, keys : [Text]) : Text {
    let json_result = JSON.toText(blob, keys, null);
    switch (json_result) {
      case (#ok(okValue)) {
        return okValue;
      };
      case (#err(errValue)) {
        return errValue;
      };
    };
    return "";
  };

  func serializeProfiles(profiles : HashMap.HashMap<Principal, Types.Profile>) : Text {
    type ProfileJson = {
      id : Text;
      userName : Text;
      email : Text;
      role : Text;
      createdAt : Int;
      updatedAt : Int;
    };
    let Keys = ["id", "userName", "email", "role", "createdAt", "updatedAt"];

    let buff = Buffer.Buffer<ProfileJson>(1);
    for (obj in profiles.vals()) {
      let json : ProfileJson = {
        id = Principal.toText(obj.id);
        userName = obj.userName;
        email = obj.email;
        role = ToStringUtil.roleToString(obj.role);
        createdAt = obj.createdAt;
        updatedAt = obj.updatedAt;
      };
      buff.add(json);
    };

    let arr = Buffer.toArray(buff);
    let blob = to_candid (arr);
    _blobToText(blob, Keys);
  };

  func serializeContent(contents : HashMap.HashMap<Text, Types.Content>) : Text {
    type ContentJson = {
      id : Text;
      providerId : Text;
      sourceId : Text;
      title : Text;
      contentType : Text;
      contentStatus : Text;
      receipt : Types.Receipt;
      reservedList : [Types.Reserved];
      voteParameters : Types.VoteParameters;
      createdAt : Int;
      updatedAt : Int;
    };
    let Keys = [
      "sourceId",
      "id",
      "title",
      "providerId",
      "contentType",
      "contentStatus",
      "receipt",
      "cost", // keys for receipt
      "createdAt", // keys for receipt
      "reservedList",
      "profileId", // keys for reservedList
      //"createdAt", // keys for reservedList
      "updatedAt", // keys for reservedList
      "reservedExpiryTime", // keys for reservedList
      "voteParameters",
      "requiredVotes", // keys for voteParameters
      //createdAt : // keys for voteParameters
      // updatedAt : // keys for voteParameters
      "complexity", // keys for voteParameters
      "level", // keys for complexity
      "expiryTime" // keys for complexity
    ];

    let buff = Buffer.Buffer<ContentJson>(1);
    let content_iter = contents.vals();
    for (cont in content_iter) {
      let content_json : ContentJson = {
        id = cont.id;
        providerId = Principal.toText(cont.providerId);
        sourceId = cont.sourceId;
        title = switch (cont.title) {
          case (null) { "" };
          case (?actualTitle) { actualTitle };
        };
        contentType = ToStringUtil.toString_ContentType(cont.contentType);
        contentStatus = ToStringUtil.toString_ContentStatus(cont.status);
        receipt = cont.receipt;
        reservedList = cont.reservedList;
        voteParameters = cont.voteParameters;
        createdAt = cont.createdAt;
        updatedAt = cont.updatedAt;
      };
      buff.add(content_json);
    };

    let arr = Buffer.toArray(buff);
    let blob = to_candid (arr);
    _blobToText(blob, Keys);
  };

};
