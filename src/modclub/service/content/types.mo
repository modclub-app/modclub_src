import Principal "mo:base/Principal";
import Types "../../types";

module {
  public type ReservedArg = {
    caller : Principal;
    profileId : Text;
    now : ?Types.Timestamp;
    reservedExpiryTime : ?Types.Timestamp;
  };

  public type ContentObjArg = {
    sourceId : Text;
    caller : Principal;
    _contentType : Types.ContentType;
    title : ?Text;
    _voteParam : Types.VoteParameters;
  };
  
};
