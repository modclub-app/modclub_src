import CommonTypes "../common/types";
import Security "../common/security/guard";
import Utils "../common/utils";
import List "mo:base/List";
import Error "mo:base/Error";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Timer "mo:base/Timer";
import AuthTypes "./types";
import GlobalConstants "../common/constants";
import Canistergeek "../common/canistergeek/canistergeek";
import LoggerTypesModule "../common/canistergeek/logger/typesModule";
import Helpers "../common/helpers";
import ModSecurity "../common/security/guard";
import Text "mo:base/Text";

shared ({ caller = deployer }) actor class ModclubAuth(env : CommonTypes.ENV) = this {
  let Unauthorized = "Unauthorized";
  let NotPermitted = "Access denied. No Permissions.";

  stable var admins : AuthTypes.AdminsList = List.nil<Principal>();
  stable var secrets : AuthTypes.SecretList = List.nil<CommonTypes.Secret>();

  stable var subscriptions = List.nil<AuthTypes.Subscriber>();
  stable var modclubBuckets = List.nil<Principal>();

  stable var _canistergeekMonitorUD : ?Canistergeek.UpgradeData = null;
  private let canistergeekMonitor = Canistergeek.Monitor();

  stable var _canistergeekLoggerUD : ?Canistergeek.LoggerUpgradeData = null;
  private let canistergeekLogger = Canistergeek.Logger();

  var authGuard = Security.Guard(env, "AUTH_CANISTER");

  private func publish(topic : Text) : async () {
    for (subscriber in List.toArray(subscriptions).vals()) {
      if (subscriber.topic == topic) {
        await subscriber._actor.handleSubscription(await getPublicationPayload(topic));
      };
    };
  };

  private func getPublicationPayload(topic : Text) : async AuthTypes.ConsumerPayload {
    switch (topic) {
      case ("admins") { #admins(List.toArray<Principal>(admins)) };
      case ("secrets") { #secrets(List.toArray<CommonTypes.Secret>(secrets)) };
      case _ { throw Error.reject("Unknown(malformed) subscriptin Topic.") };
    };
  };

  public shared ({ caller }) func subscribe(_topic : Text) : async () {
    Utils.mod_assert(authGuard.isModclubCanister(caller) or isModclubBucket(caller), NotPermitted);

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

    ignore Timer.setTimer(
      #seconds(0),
      func() : async () {
        await publish("admins");
        await publish("secrets");
      }
    );

  };

  public shared query ({ caller }) func getSecrets() : async Result.Result<[CommonTypes.Secret], Text> {
    Utils.mod_assert(authGuard.isModclubCanister(caller) or _isAdmin(caller), NotPermitted);
    #ok(List.toArray(secrets));
  };

  public shared ({ caller }) func addSecret(secret : CommonTypes.Secret) : async Result.Result<AuthTypes.SecretList, Text> {
    // Copy the list to a new variable for modification
    var secretList = secrets;

    // Check if a secret with the same name already exists
    let existingSecretOpt = List.find<CommonTypes.Secret>(
      secretList,
      func(val : CommonTypes.Secret) : Bool { secret.name == val.name }
    );

    switch (existingSecretOpt) {
        // If secret exists, update its value
        case (?existingSecret) {
            secretList := List.map<CommonTypes.Secret, CommonTypes.Secret>(
                secretList, 
                func(val : CommonTypes.Secret) : CommonTypes.Secret {
                    if (val.name == secret.name) {
                        { name = val.name; value = val.value # Text.fromChar(GlobalConstants.SECRET_VALUE_DELIMITER) # secret.value }
                    } else {
                        val
                    }
                }
            );
        };
        // If secret does not exist, add it to the list
        case null {
            secretList := List.push<CommonTypes.Secret>(secret, secretList);
        };
    };

    // Update the original secrets list
    secrets := secretList;
    await publish("secrets");
    return #ok(secretList);
  };

  public shared ({ caller }) func removeSecret(name : Text) : async Result.Result<AuthTypes.SecretList, Text> {
    var secretList = secrets;
    secretList := List.filter<CommonTypes.Secret>(
      secretList,
      func(val : CommonTypes.Secret) : Bool { val.name != name }
    );
    secrets := secretList;
    await publish("secrets");
    #ok(secretList);
  };

  public shared query ({ caller }) func getAdmins() : async Result.Result<[Principal], Text> {
    Utils.mod_assert(authGuard.isModclubCanister(caller) or _isAdmin(caller), NotPermitted);

    #ok(List.toArray(admins));
  };

  public shared query ({ caller }) func getSubscriptions() : async Result.Result<[AuthTypes.Subscriber], Text> {
    Utils.mod_assert(authGuard.isModclubCanister(caller) or _isAdmin(caller), NotPermitted);

    #ok(List.toArray(subscriptions));
  };

  public shared query ({ caller }) func isAdmin(id : Principal) : async Bool {
    Utils.mod_assert(authGuard.isModclubCanister(caller) or _isAdmin(caller), NotPermitted);
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
    var adminList = admins;
    adminList := List.filter<Principal>(
      adminList,
      func(val : Principal) : Bool { not Principal.equal(val, caller) }
    );
    admins := adminList;
    await publish("admins");
    #ok(adminList);
  };

  public query ({ caller }) func getCanisterMetrics(
    parameters : Canistergeek.GetMetricsParameters
  ) : async ?Canistergeek.CanisterMetrics {
    if (not ModSecurity.allowedCanistergeekCaller(caller, authGuard)) {
      throw Error.reject("Unauthorized");
    };
    canistergeekMonitor.getMetrics(parameters);
  };

  public shared ({ caller }) func collectCanisterMetrics() : async () {
    if (not ModSecurity.allowedCanistergeekCaller(caller, authGuard)) {
      throw Error.reject("Unauthorized");
    };
    canistergeekMonitor.collectMetrics();
  };

  public query ({ caller }) func getCanisterLog(
    request : ?LoggerTypesModule.CanisterLogRequest
  ) : async ?LoggerTypesModule.CanisterLogResponse {
    if (not ModSecurity.allowedCanistergeekCaller(caller, authGuard)) {
      throw Error.reject("Unauthorized");
    };
    canistergeekLogger.getLog(request);
  };

  public shared ({ caller }) func setModclubBuckets(buckets : [Principal]) : () {
    for (bid in buckets.vals()) {
      if (not isModclubBucket(bid)) {
        modclubBuckets := List.push<Principal>(
          bid,
          modclubBuckets
        );
      };
    };
  };

  private func isModclubBucket(bid : Principal) : Bool {
    List.some<Principal>(
      modclubBuckets,
      func(ebid : Principal) {
        Principal.equal(ebid, bid);
      }
    );
  };

  //SNS generic validate function
  public shared ({ caller }) func validate(input : Any) : async CommonTypes.Validate {
    return #Ok("success");
  };

  system func inspect({
    arg : Blob;
    caller : Principal;
    msg : AuthTypes.AuthCanisterMethods;
  }) : Bool {
    switch (msg) {
      case (#registerAdmin _) { _isAdmin(caller) };
      case (#unregisterAdmin _) { _isAdmin(caller) };
      case (#addSecret _) { _isAdmin(caller) };
      case (#removeSecret _) { _isAdmin(caller) };
      case (#getSubscriptions _) { _isAdmin(caller) };
      case (#setModclubBuckets _) {
        authGuard.isModclubCanister(caller) or _isAdmin(caller);
      };
      case (#validate _) { _isAdmin(caller) };
      case _ { not Principal.isAnonymous(caller) };
    };
  };

  ignore Timer.setTimer(
    #seconds 0,
    func() : async () {
      canistergeekMonitor.collectMetrics();
      ignore Timer.recurringTimer(
        #nanoseconds(GlobalConstants.FIVE_MIN_NANO_SECS),
        func() : async () { canistergeekMonitor.collectMetrics() }
      );
    }
  );

  system func preupgrade() {
    _canistergeekMonitorUD := ?canistergeekMonitor.preupgrade();
    _canistergeekLoggerUD := ?canistergeekLogger.preupgrade();
  };

  system func postupgrade() {
    canistergeekMonitor.postupgrade(_canistergeekMonitorUD);
    _canistergeekMonitorUD := null;
    canistergeekLogger.postupgrade(_canistergeekLoggerUD);
    _canistergeekLoggerUD := null;
    canistergeekLogger.setMaxMessagesCount(3000);
  };
};
