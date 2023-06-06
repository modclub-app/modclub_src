import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import CommonTypes "../../../common/types";
import Types "../../types";
import GlobalState "../../statev2";
import Canistergeek "../../canistergeek/canistergeek";

module ProviderTypes {
  public type ProviderArg = {
    providerId : Principal;
    name : Text;
    description : Text;
    image : ?Types.Image;
    state : GlobalState.State;
    logger : Canistergeek.Logger;
  };

  public type ProviderMetaArg = {
    providerId : Principal;
    updatedProviderVal : Types.ProviderMeta;
    callerPrincipalId : Principal;
    state : GlobalState.State;
    logger : Canistergeek.Logger;
  };

  public type ProviderLogoArg = {
    providerId : Principal;
    logoToUpload : [Nat8];
    logoType : Text;
    callerPrincipalId : Principal;
    state : GlobalState.State;
    logger : Canistergeek.Logger;
  };

  public type ProviderAdminArg = {
    providerId : Principal;
    providerAdminPrincipalId : Principal;
    callerPrincipalId : Principal;
    state : GlobalState.State;
    isModclubAdmin : Bool;
  };

  public type ProviderRegAdminArg = {
    userId : Principal;
    username : Text;
    caller : Principal;
    providerId : ?Principal;
    state : GlobalState.State;
    isModclubAdmin : Bool;
    logger : Canistergeek.Logger;
  };
};
