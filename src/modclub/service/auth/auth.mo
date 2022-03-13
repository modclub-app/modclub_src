import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Error "mo:base/Error";
import Result "mo:base/Result";

import GlobalState "../../state";
import Types "../../types";


module AuthModule {
    public func onlyOwner(p: Principal, owner: Principal) : async() {
        if( p != owner) throw Error.reject( "unauthorized" );
    };

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

};