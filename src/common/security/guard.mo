import Text "mo:base/Text";
import List "mo:base/List";
import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Timer "mo:base/Timer";
import CommonTypes "../types";
import Utils "../utils";

module ModSecurity {

  public let AccessMode = {
    NotPermitted = "Access denied. No Permissions.";
  };

  public class Guard(env : CommonTypes.ENV, context : Text) {

    var admins : List.List<Principal> = List.nil<Principal>();

    public func subscribe(topic : Text) : () {
      ignore Timer.setTimer(
        #seconds(0),
        func() : async () {
          await getAuthActor().subscribe(topic);
        }
      );
    };

    public func handleSubscription(payload : CommonTypes.ConsumerPayload) : () {
      switch (payload) {
        case (#admins(list)) {
          for (admin in list.vals()) {
            if (not isAdmin(admin)) {
              admins := List.push<Principal>(admin, admins);
            };
          };
        };
        case (_) {};
      };
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
      Blob.equal(Principal.toBlob(caller), Blob.fromArray([0x04]));
    };

    public func isModclubWallet(caller : Principal) : Bool {
      Principal.equal(getCanisterId(#wallet), caller);
    };

    public func isModclubAuth(caller : Principal) : Bool {
      Principal.equal(getCanisterId(#auth), caller);
    };

    public func isModclubRs(caller : Principal) : Bool {
      Principal.equal(getCanisterId(#rs), caller);
    };

    public func isModclubMain(caller : Principal) : Bool {
      Principal.equal(getCanisterId(#modclub), caller);
    };

    public func isOldModclubInstance(caller : Principal) : Bool {
      Principal.equal(getCanisterId(#modclub_old), caller);
    };

    public func isModclubVesting(caller : Principal) : Bool {
      Principal.equal(getCanisterId(#vesting), caller);
    };

    public func isModclubCanister(caller : Principal) : Bool {
      isModclubMain(caller) or isModclubWallet(caller) or isModclubRs(caller) or isModclubVesting(caller);
    };

    public func getVestingActor() : CommonTypes.VestingCanisterActor {
      actor (Principal.toText(getCanisterId(#vesting)));
    };

    public func getAuthActor() : CommonTypes.AuthActorType {
      actor (Principal.toText(getCanisterId(#auth)));
    };

    public func getWalletActor() : CommonTypes.WalletActorType {
      actor (Principal.toText(getCanisterId(#wallet)));
    };

    public func getRSActor() : CommonTypes.RSActorType {
      actor (Principal.toText(getCanisterId(#rs)));
    };

    public func getModclubCanisterActor() : CommonTypes.ModclubCanisterActorType {
      actor (Principal.toText(getCanisterId(#modclub)));
    };

    public func getICRootActor() : CommonTypes.IcRootActorType {
      actor ("aaaaa-aa");
    };

    public func setUpDefaultAdmins(
      ssAdmins : List.List<Principal>,
      initializer : Principal,
      mainActorPrincipal : Principal
    ) : List.List<Principal> {
      if (not isAdmin(initializer)) {
        admins := List.push<Principal>(initializer, admins);
      };
      if (Text.notEqual(Principal.toText(mainActorPrincipal), "aaaaa-aa") and not isAdmin(mainActorPrincipal)) {
        admins := List.push<Principal>(mainActorPrincipal, admins);
      };
      for (admin in List.toArray(ssAdmins).vals()) {
        if (not isAdmin(admin)) {
          admins := List.push<Principal>(admin, admins);
        };
      };
      return admins;
    };

    public func getCanisterId(canisterType : CommonTypes.ModclubCanister) : Principal {
      switch (canisterType) {
        case (#modclub) { env.modclub_canister_id };
        case (#modclub_old) { env.old_modclub_canister_id };
        case (#rs) { env.rs_canister_id };
        case (#wallet) { env.wallet_canister_id };
        case (#auth) { env.auth_canister_id };
        case (#vesting) { env.vesting_canister_id };
      };
    };

    public func getEnvs() : CommonTypes.ENV {
      env;
    };
  };
};
