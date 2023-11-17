import Principal "mo:base/Principal";
import SerializationGlobalStateUtil "../../serialization/serialization_global_state";
import StateV2 "../../statev2";
import Error "mo:base/Error";
module Archive {

  public class ArchiveManager(
    archive_canister_id : Principal,
    global_state : StateV2.State
  ) {
    public func exportToArchive(stateName : Text, dataName : Text) : async Text {
      // Export the data to "archive" canister.

      let ARCHIVE = actor (Principal.toText(archive_canister_id)) : actor {
        importData : shared (stateName : Text, dataName : Text, dataContent : Text) -> async Text;
      };

      try {
        if (stateName == "global_state") {
          let data = SerializationGlobalStateUtil.serilize(global_state, dataName);

          let result = await ARCHIVE.importData(stateName, dataName, data);
          return result;
        };
      } catch (error) {
        return "Error: Failed to import data: " # Error.message(error);
      };

      return "Error: Invalid state name: " # stateName;
    };
  };
};
