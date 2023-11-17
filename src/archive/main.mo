import ModclubStateV2 "../modclub/statev2";
import CommonTypes "../common/types";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
shared ({ caller = deployer }) actor class Archive(env : CommonTypes.ENV) = this {

  stable var global_state_content : Text = "";
  stable var global_state_profiles : Text = "";

  public shared func importData(stateName : Text, dataName : Text, dataContent : Text) : async Text {
    var successful_msg = "ok!";
    if (stateName == "global_state") {
      // Refer to the related serialization implementation details in
      // src/modclub/serialization/serialization_global_state.mo

      switch (dataName) {
        case ("content") {
          global_state_content := dataContent;
          return successful_msg;
        };
        case ("profiles") {
          global_state_profiles := dataContent;
          return successful_msg;
        };
        case (_) {
          return "Error: Invalid data name: " # dataName;
        };
      };
    };
    return "Error: Invalid state name: " # stateName;
  };

  public shared func readData(stateName : Text, dataName : Text) : async Text {
    if (stateName == "global_state") {
      if (dataName == "content") {
        return global_state_content;
      };
      if (dataName == "profiles") {
        return global_state_profiles;
      };
    };
    return "";

  };

};
