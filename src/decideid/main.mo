import CommonTypes "../common/types";
import Security "../common/security/guard";
import List "mo:base/List";
import Error "mo:base/Error";
import Principal "mo:base/Principal";
import Canistergeek "../common/canistergeek/canistergeek";
import LoggerTypesModule "../common/canistergeek/logger/typesModule";
import Helpers "../common/helpers";
import ModSecurity "../common/security/guard";
import InspectTypes "inspectTypes";
import Types "./types";
import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Account "service/account/account";
shared ({ caller = deployer }) actor class DecideID(env : CommonTypes.ENV) = this {
    
    stable var admins : List.List<Principal> = List.nil<Principal>();

    private var authGuard = ModSecurity.Guard(env, "DECIDEID_CANISTER");

    private let canistergeekMonitor = Canistergeek.Monitor();
    stable var _canistergeekMonitorUD : ?Canistergeek.UpgradeData = null;
    stable var _canistergeekLoggerUD : ?Canistergeek.LoggerUpgradeData = null;
    private let canistergeekLogger = Canistergeek.Logger();

    
    // -----------  Account  ----------
    
    // main account map, pk: decideid
    stable var accountsStable : [(Types.DecideID, Types.Account)] = []; 
    var accounts = Map.fromIter<Types.DecideID,Types.Account>(
        accountsStable.vals(), 10, Text.equal, Text.hash);

    // index: user's principal --> decideid
    stable var principal2decideidStable : [(Principal, Types.DecideID)] = []; 
    var principal2decideid = Map.fromIter<Principal,Types.DecideID>(
        principal2decideidStable.vals(), 10, Principal.equal, Principal.hash);

    // TODO: add extra associations, e.g. email --> decideid, other_id --> decideid
    var accountManager = Account.AccountManager(
        accounts,
        principal2decideid
    );

    func _init_guard(): () {
        authGuard.subscribe("admins");
        admins := authGuard.setUpDefaultAdmins(
            admins,
            deployer,
            Principal.fromText("aaaaa-aa"), // Just because its impossible to use this here.
        );
        authGuard.subscribe("secrets");
    };
    _init_guard();

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


    public shared ({ caller }) func registerAccount(  
      firstName: Text,
      lastName: Text, 
      email: Text
    ) : async Result.Result<Types.DecideID, Text> {
        await accountManager.register(
            caller,
            caller,
            firstName,
            lastName,
            email
        );
    };

    // TODO: registerFromThirdParty()


    public shared ({ caller }) func getAccount(
        decideid: Types.DecideID
    ) : async Result.Result<Types.Account, Text> {
        await accountManager.get(decideid);
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
        accountsStable := Iter.toArray(accounts.entries());
        principal2decideidStable := Iter.toArray(principal2decideid.entries());
    };

    system func postupgrade() {
        _init_guard();

        canistergeekMonitor.postupgrade(_canistergeekMonitorUD);
        _canistergeekMonitorUD := null;
        canistergeekLogger.postupgrade(_canistergeekLoggerUD);
        _canistergeekLoggerUD := null;
        canistergeekLogger.setMaxMessagesCount(3000);

        accounts := Map.fromIter<Types.DecideID,Types.Account>(accountsStable.vals(), 10, Text.equal, Text.hash);
        principal2decideid := Map.fromIter<Principal,Types.DecideID>(principal2decideidStable.vals(), 10, Principal.equal, Principal.hash);
        accountManager := Account.AccountManager(
            accounts,
            principal2decideid
        );
    };

};