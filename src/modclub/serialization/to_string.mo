import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Option "mo:base/Option";
import Types "../types";
import PohTypes "../service/poh/types";
import VoteTypes "../service/vote/types";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Utils "../../common/serialization_utils";
import { JSON; Candid } "mo:serde";

module {

  public func joinArrOpt(array : ?[Text]) : Text {
    switch (array) {
      case (null)();
      case (?arr) {
        return joinArr(arr);
      };
    };
    return "";
  };

  public func joinArr(arr : [Text]) : Text {
    return Text.join(",", arr.vals());
  };

  public func roleToString(role : Types.Role) : Text {
    switch (role) {
      case (#moderator) { "Moderator" };
      case (#admin) { "Admin" };
      case (#owner) { "Owner" };
    };
  };

  public func toString_ContentStatus(status : Types.ContentStatus) : Text {
    switch (status) {
      case (#new) {
        "new";
      };
      case (#approved) {
        "approved";
      };
      case (#rejected) {
        "rejected";
      };
    };
  };

  public func toString_ContentType(status : Types.ContentType) : Text {
    switch (status) {
      case (#text) {
        "text";
      };
      case (#multiText) {
        "multiText";
      };
      case (#imageUrl) {
        "imageUrl";
      };
      case (#imageBlob) {
        "imageBlob";
      };
      case (#htmlContent) {
        "htmlContent";
      };
      case (#media) {
        "media";
      };
    };
  };

  public func toString_PohChallengeRequiredField(
    rField : PohTypes.PohChallengeRequiredField
  ) : Text {
    switch (rField) {
      case (#textBlob) "textBlob";
      case (#imageBlob) "imageBlob";
      case (#videoBlob) "videoBlob";
      case (#profileFieldBlobs) "profileFieldBlobs";
    };
  };

  public func toString_PohChallengeType(
    pct : PohTypes.PohChallengeType
  ) : Text {
    switch (pct) {
      case (#ssn) "ssn";
      case (#dl) "dl";
      case (#selfPic) "selfPic";
      case (#selfVideo) "selfVideo";
      case (#fullName) "fullName";
      case (#userName) "userName";
      case (#email) "email";
      case (#uniquePohVideo) "uniquePohVideo";
    };
  };

  public func toString_Decision(decision : VoteTypes.Decision) : Text {
    switch (decision) {
      case (#approved) {
        "approved";
      };
      case (#rejected) {
        "rejected";
      };
    };
  };

  public func toString_Role(role : Types.Role) : Text {
    switch (role) {
      case (#moderator) {
        "moderator";
      };
      case (#admin) {
        "admin";
      };
      case (#owner) {
        "owner";
      };
    };
  };

  public func toString_PohChallengeStatus(
    status : PohTypes.PohChallengeStatus
  ) : Text {
    switch (status) {
      case (#notSubmitted) {
        "notSubmitted";
      };
      case (#pending) {
        "pending";
      };
      case (#verified) {
        "verified";
      };
      case (#rejected) {
        "rejected";
      };
      case (#expired) {
        "expired";
      };
      case (#processing) {
        "processing";
      };
      case (#rejectedDuplicate) {
        "processingDuplicate";
      };
    };
  };
};
