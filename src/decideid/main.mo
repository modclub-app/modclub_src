import CommonTypes "../common/types";
import Security "../common/security/guard";
import List "mo:base/List";
import Error "mo:base/Error";
import Principal "mo:base/Principal";
import Canistergeek "../common/canistergeek/canistergeek";
import LoggerTypesModule "../common/canistergeek/logger/typesModule";
import Helpers "../common/helpers";
import ModSecurity "../common/security/guard";
import InspectTypes "inspectTypes"

shared ({ caller = deployer }) actor class DecideID(env : CommonTypes.ENV) = this {
    
    private var authGuard = ModSecurity.Guard(env, "DECIDEID_CANISTER");

    stable var admins : List.List<Principal> = List.nil<Principal>();
    authGuard.subscribe("admins");
    admins := authGuard.setUpDefaultAdmins(
        admins,
        deployer,
        Principal.fromText("aaaaa-aa"), // Just because its impossible to use this here.
    );
    authGuard.subscribe("secrets");

    private let canistergeekMonitor = Canistergeek.Monitor();
    stable var _canistergeekMonitorUD : ?Canistergeek.UpgradeData = null;
    stable var _canistergeekLoggerUD : ?Canistergeek.LoggerUpgradeData = null;
    private let canistergeekLogger = Canistergeek.Logger();

    // dummy method
    public shared query ({ caller }) func hello() : async Text {
        "Hello";
    };

    public query ({ caller }) func getCanisterMetrics(
        parameters : Canistergeek.GetMetricsParameters
    ) : async ?Canistergeek.CanisterMetrics {
        if (not authGuard.allowedCanistergeekCaller(caller)) {
        throw Error.reject("Unauthorized");
        };
        canistergeekMonitor.getMetrics(parameters);
    };

    public shared ({ caller }) func collectCanisterMetrics() : async () {
        if (not authGuard.allowedCanistergeekCaller(caller)) {
        throw Error.reject("Unauthorized");
        };
        canistergeekMonitor.collectMetrics();
    };

    public query ({ caller }) func getCanisterLog(
        request : ?LoggerTypesModule.CanisterLogRequest
    ) : async ?LoggerTypesModule.CanisterLogResponse {
        if (not authGuard.allowedCanistergeekCaller(caller)) {
        throw Error.reject("Unauthorized");
        };
        canistergeekLogger.getLog(request);
    };

    public shared ({ caller }) func handleSubscription(payload : CommonTypes.ConsumerPayload) : async () {
        authGuard.handleSubscription(payload);
    };

    system func inspect({
        arg : Blob;
        caller : Principal;
        msg : InspectTypes.DecideIdCanisterMethods;
    }) : Bool {
        switch (msg) {
        case (#hello _) { authGuard.isAdmin(caller) };
        case (#handleSubscription _) { authGuard.isModclubAuth(caller) };
        case (#collectCanisterMetrics _) { true };
        case (#getCanisterLog _) { true };
        case (#getCanisterMetrics _) { true };
        case _ { not Principal.isAnonymous(caller) };
        };
    };

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

        authGuard.subscribe("admins");
        admins := authGuard.setUpDefaultAdmins(
            admins,
            deployer,
            Principal.fromText("aaaaa-aa"), // Just because its impossible to use this here.
        );
        authGuard.subscribe("secrets");

    };

};
