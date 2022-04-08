import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Error "mo:base/Error";
import Result "mo:base/Result";
import List "mo:base/List";

import GlobalState "../../state";
import Types "../../types";


module AuthModule {
    public let Unauthorized = "Unauthorized";

    public func checkProviderPermission(p: Principal, state: GlobalState.State) : async () {
        switch(state.providers.get(p)){
        case (null) throw Error.reject("unauthorized");
        case(_) ();
        };
    };

    public func checkProfilePermission(p: Principal, action: Types.Action, state: GlobalState.State) : Result.Result<(), Types.Error>{
        var unauthorized = true;

        // Anonymous principal 
        if(Principal.toText(p) == "2vxsx-fae") {
            Debug.print("Anonymous principal");
        return #err(#Unauthorized);
        };
        switch(state.profiles.get(p)){
        case (null) ();
        case(?result) {
            switch(action) {
            case(#vote) {
                if(result.role == #moderator) unauthorized := false;
            };
            case(#getProfile) {
                if(result.role == #moderator) unauthorized := false;
            };
            case(#getContent) {
                if(result.role == #moderator) unauthorized := false;
            };
            case(#getRules) {
                if(result.role == #moderator) unauthorized := false;
            };
            case(#getActivity) {
                if(result.role == #moderator) unauthorized := false;
            };         
            case(_) ();
            };
        };
        };
        if(unauthorized) {
            return #err(#Unauthorized);
        };
        #ok();
  }; 

    public func checkProviderAdminPermission(p: Principal, admin: Principal, state: GlobalState.State) : async Types.ProviderResult {
        switch(state.providerAdmins.get(p)) {
            case (null) return #err(#NotFound);
            case (?adminMap) {
                switch(adminMap.get(admin)) {
                    case (null) return #err(#Unauthorized);
                    case(?_) {
                        return #ok();
                    };
                };
            };
        };
    };

    public func setUpDefaultAdmins(admins: List.List<Principal>, initializer: Principal, mainActorPrincipal: Principal) : List.List<Principal> {
        var adminList = admins;
        if (not List.some<Principal>(admins, func(val: Principal) : Bool { Principal.equal(val, initializer) })) {
            adminList := List.push<Principal>(initializer, adminList);
        };
        if (not List.some<Principal>(admins, func(val: Principal) : Bool { Principal.equal(val, mainActorPrincipal) })) {
            adminList := List.push<Principal>(mainActorPrincipal, adminList);
        };
        return adminList;
    };

    public func isAdmin(caller : Principal, admins: List.List<Principal>) : Bool {
        var c = Principal.toText(caller);
        var exists = List.find<Principal>(admins, func(val: Principal) : Bool { Principal.equal(val, caller) });
        exists != null;
    };

    public func getAdmins(caller : Principal, admins: List.List<Principal>) : Result.Result<[Principal], Text> {
        if (not isAdmin(caller, admins)) {
            return #err(Unauthorized);
        };
        #ok(List.toArray(admins));
    };

    public func registerAdmin(caller : Principal, admins: List.List<Principal>, id : Principal) : Result.Result<List.List<Principal>, Text> {
        if (List.size<Principal>(admins) > 0 and not isAdmin(caller, admins)) {
            return #err(Unauthorized);
        };

        var adminList = admins;
        if (not List.some<Principal>(adminList, func(val: Principal) : Bool { Principal.equal(val, id) })) {
            adminList := List.push<Principal>(id, adminList);
        };

        #ok(adminList);
    };

    public func unregisterAdmin(caller : Principal, admins: List.List<Principal>, id : Text) : Result.Result<List.List<Principal>, Text> {
        if (not isAdmin(caller, admins)) {
            return #err(Unauthorized);
        };
        var adminList = admins;
        adminList := List.filter<Principal>(adminList, func(val: Principal) : Bool { not Principal.equal(val, caller) });
        #ok(adminList);
    };

};