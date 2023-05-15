import CommonTypes "../common/types";
import Security "../common/security/guard";
import Utils "../common/utils";
import List "mo:base/List";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Timer "mo:base/Timer";
import AuthTypes "./types";

shared ({ caller = deployer }) actor class ModclubAuth(env : CommonTypes.ENV) = this {
  let Unauthorized = "Unauthorized";
  let NotPermitted = "Access denied. No Permissions.";

  stable var admins : AuthTypes.AdminsList = List.nil<Principal>();
  stable var subscriptions = List.nil<AuthTypes.Subscriber>();

  var guard = Security.Guard(env, "AUTH_CANISTER");

  private func publish(topic : Text) : async () {
    Debug.print("PUBLISHING [" # topic # "] topic");
    for (subscriber in List.toArray(subscriptions).vals()) {
      if (subscriber.topic == topic) {
        await subscriber._actor.handleSubscription(getPublicationPayload(topic));
      };
    };
  };

  private func getPublicationPayload(topic : Text) : AuthTypes.ConsumerPayload {
    switch (topic) {
      case ("admins") { #admins(List.toArray<Principal>(admins)) };
      case _ { Debug.trap("Unknown(malformed) subscriptin Topic.") };
    };
  };

  public shared ({ caller }) func subscribe(_topic : Text) : async () {
    Debug.print("CANISTER [" # Principal.toText(caller) # "] wants to subscribe on ADMINS");
    Utils.mod_assert(guard.isModclubCanister(caller), NotPermitted);

    let exists = List.some<AuthTypes.Subscriber>(
      subscriptions,
      func(sub : AuthTypes.Subscriber) {
        Principal.equal(sub.consumer, caller) and sub.topic == _topic
      }
    );
    if (not exists) {
      subscriptions := List.push<AuthTypes.Subscriber>(
        {
          topic = _topic;
          consumer = caller;
          _actor = actor (Principal.toText(caller));
        },
        subscriptions
      );
    };
    Debug.print("CANISTER [" # Principal.toText(caller) # "] subscribed on ADMINS");

    ignore Timer.setTimer(
      #seconds(0),
      func() : async () { await publish("admins") }
    );

  };

  public shared query ({ caller }) func getAdmins() : async Result.Result<[Principal], Text> {
    Utils.mod_assert(guard.isModclubCanister(caller) or _isAdmin(caller), NotPermitted);

    #ok(List.toArray(admins));
  };

  public shared query ({ caller }) func getSubscriptions() : async Result.Result<[AuthTypes.Subscriber], Text> {
    Utils.mod_assert(guard.isModclubCanister(caller) or _isAdmin(caller), NotPermitted);

    #ok(List.toArray(subscriptions));
  };

  public shared query ({ caller }) func isAdmin(id : Principal) : async Bool {
    Utils.mod_assert(guard.isModclubCanister(caller) or _isAdmin(caller), NotPermitted);
    _isAdmin(id);
  };

  func _isAdmin(p : Principal) : Bool {
    let exists = List.find<Principal>(
      admins,
      func(val : Principal) : Bool { Principal.equal(val, p) }
    );
    exists != null or Principal.equal(p, deployer);
  };

  public shared ({ caller }) func registerAdmin(id : Principal) : async Result.Result<AuthTypes.AdminsList, Text> {
    // Utils.mod_assert(_isAdmin(caller), NotPermitted);

    var adminList = admins;
    if (
      not List.some<Principal>(
        adminList,
        func(val : Principal) : Bool { Principal.equal(val, id) }
      )
    ) {
      adminList := List.push<Principal>(id, adminList);
    };

    admins := adminList;
    await publish("admins");
    #ok(adminList);
  };

  public shared ({ caller }) func unregisterAdmin(id : Text) : async Result.Result<AuthTypes.AdminsList, Text> {
    // Utils.mod_assert(_isAdmin(caller), NotPermitted);
    var adminList = admins;
    adminList := List.filter<Principal>(
      adminList,
      func(val : Principal) : Bool { not Principal.equal(val, caller) }
    );
    admins := adminList;
    await publish("admins");
    #ok(adminList);
  };

  system func inspect({
    arg : Blob;
    caller : Principal;
    msg : AuthTypes.AuthCanisterMethods;
  }) : Bool {
    switch (msg) {
      case (#registerAdmin _) { _isAdmin(caller) };
      case (#unregisterAdmin _) { _isAdmin(caller) };
      case (#getSubscriptions _) { _isAdmin(caller) };
      case _ { not Principal.isAnonymous(caller) };
    };
  };

  system func postupgrade() {};
  system func preupgrade() {};
};
