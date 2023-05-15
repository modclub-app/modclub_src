import Text "mo:base/Text";
import List "mo:base/List";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import AuthCanister "./AuthCanister";
import CommonTypes "../types";
import Utils "../utils";

module ModSecurity {

  public let AccessMode = {
    NotPermitted = "Access denied. No Permissions.";
  };

  public class Guard(env : CommonTypes.ENV, context : Text) {

    var admins : List.List<Principal> = List.nil<Principal>();

    public func subscribe(topic : Text) : async () {
      await AuthCanister.getActor(env).subscribe(topic);
    };

    public func handleSubscription(payload : CommonTypes.ConsumerPayload) : () {
      switch (payload) {
        case (#admins(list)) {
          Debug.print("[" # context # "] [GUARD] ==> GOT ADMINS LIST");
          for (admin in list.vals()) {
            if (not isAdmin(admin)) {
              Debug.print("[" # context # "] [GUARD] ==> PRINCIPAL " # Principal.toText(admin) # " is NEW");
              admins := List.push<Principal>(admin, admins);
            };
          };
        };
        case (_) {
          Debug.print("[WARNING][AuthGuard] Unknown subscription payload type!");
        };
      };
      Debug.print("[" # context # "] [GUARD] ==> Payload Processed");
    };

    public func getAdmins() : [Principal] {
      List.toArray(admins);
    };

    public func isAdmin(caller : Principal) : Bool {
      List.some<Principal>(
        admins,
        func(val : Principal) : Bool { Principal.equal(val, caller) }
      );
    };

    public func isAnonymous(caller : Principal) : Bool {
      Principal.toText(caller) == "2vxsx-fae";
    };

    public func isModclubWallet(caller : Principal) : Bool {
      Principal.equal(Utils.getCanisterId(#wallet, env), caller);
    };

    public func isModclubAuth(caller : Principal) : Bool {
      Principal.equal(Utils.getCanisterId(#auth, env), caller);
    };

    public func isModclubRs(caller : Principal) : Bool {
      Principal.equal(Utils.getCanisterId(#rs, env), caller);
    };

    public func isModclubMain(caller : Principal) : Bool {
      Principal.equal(Utils.getCanisterId(#modclub, env), caller);
    };

    public func isModclubCanister(caller : Principal) : Bool {
      isModclubMain(caller) or isModclubWallet(caller) or isModclubRs(caller);
    };

    public func getCanisterId(canisterType : CommonTypes.ModclubCanister) : Principal {
      Utils.getCanisterId(canisterType, env);
    };

    public func setUpDefaultAdmins(
      ssAdmins : List.List<Principal>,
      initializer : Principal,
      mainActorPrincipal : Principal
    ) : List.List<Principal> {
      if (not isAdmin(initializer)) {
        admins := List.push<Principal>(initializer, admins);
      };
      if (not isAdmin(mainActorPrincipal)) {
        admins := List.push<Principal>(mainActorPrincipal, admins);
      };
      for (admin in List.toArray(ssAdmins).vals()) {
        if (not isAdmin(admin)) {
          admins := List.push<Principal>(admin, admins);
        };
      };
      return admins;
    };

  };
};
