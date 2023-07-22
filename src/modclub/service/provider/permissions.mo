import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Error "mo:base/Error";
import Result "mo:base/Result";
import List "mo:base/List";

import GlobalState "../../statev2";
import Types "../../types";

module PermissionsModule {
  public let Unauthorized = "Unauthorized";

  public func checkProviderPermission(
    caller : Principal,
    providerId : ?Principal,
    state : GlobalState.State
  ) : Result.Result<(Principal), Types.Error> {
    var authorized = false;
    var isProvider = false;
    var _providerId : Principal = do {
      switch (providerId) {
        case (?result) {
          isProvider := false;
          result;
        };
        case (_) {
          caller;
        };
      };
    };
    // Provider check
    switch (state.providers.get(_providerId)) {
      case (null)();
      // Do nothing check if the caller is an admin for the provider
      case (?result) {
        if (caller == result.id) {
          authorized := true;
          isProvider := true;
        };
      };
    };
    // Check if the caller is an admin of this provider
    if (isProvider == false) {
      switch (checkProviderAdminPermission(_providerId, caller, state)) {
        case (#err(error)) return #err(#Unauthorized);
        case (#ok()) authorized := true;
      };
    };
    if (authorized == false) return #err(#Unauthorized);
    return #ok(_providerId);
  };

  public func checkProfilePermission(
    p : Principal,
    action : Types.Action,
    state : GlobalState.State
  ) : Result.Result<(), Types.Error> {
    var unauthorized = true;

    // Anonymous principal
    if (Principal.toText(p) == "2vxsx-fae") {
      return #err(#Unauthorized);
    };
    switch (state.profiles.get(p)) {
      case (null)();
      case (?result) {
        switch (action) {
          case (#vote) {
            if (result.role == #moderator) unauthorized := false;
          };
          case (#getProfile) {
            if (result.role == #moderator) unauthorized := false;
          };
          case (#getContent) {
            if (result.role == #moderator) unauthorized := false;
          };
          case (#getRules) {
            if (result.role == #moderator) unauthorized := false;
          };
          case (#getActivity) {
            if (result.role == #moderator) unauthorized := false;
          };
          case (_)();
        };
      };
    };
    if (unauthorized) {
      return #err(#Unauthorized);
    };
    #ok();
  };

  public func checkProviderAdminPermission(
    p : Principal,
    admin : Principal,
    state : GlobalState.State
  ) : Types.ProviderResult {
    switch (state.providerAdmins.get(p)) {
      case (null) return #err(#NotFound);
      case (?adminMap) {
        switch (adminMap.get(admin)) {
          case (null) return #err(#Unauthorized);
          case (?_) {
            return #ok();
          };
        };
      };
    };
  };

};
