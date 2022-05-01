import Error "mo:base/Error";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Debug "mo:base/Debug";

import GlobalState "../../state";
import Types "../../types";
import Helpers "../../helpers";
import ModClubParams "../parameters/params";
import AuthManager "../auth/auth";


module ProviderModule {

    public func registerProvider(providerId: Principal, name: Text, description: Text,
                                    image: ?Types.Image, state: GlobalState.State) : Text {
    // Todo remove this after airdrop
    // await onlyOwner(caller);
    switch(state.providers.get(providerId)){
      case (null) {
        let now = Helpers.timeNow();
        state.providers.put(providerId, {
          id = providerId;
          name = name;
          description = description;
          image = image;
          createdAt = now;
          updatedAt = now;
          settings = {
            minVotes = ModClubParams.DEFAULT_MIN_VOTES; // At least 2 votes required to finalize a decision
            minStaked = ModClubParams.DEFAULT_MIN_STAKED; // Default amount staked, change when tokens are released
          };
        });
        return "Registration successful";
      };
       case (?result) return "Provider already registered";
    };
  };

  public func deregisterProvider(providerId : Principal, state : GlobalState.State) : Text {
    switch(state.providers.get(providerId)){
      case (null) {
        return "Provider does not exist";
      };
       case (?result) {
         state.providers.delete(providerId);
         return "Provider deregistered";
       };
    };
  };

  public func updateProviderSettings(providerId : Principal, 
                                    updatedSettings: Types.ProviderSettings,
                                    callerPrincipalId: Principal, 
                                    state : GlobalState.State) 
                                    : async Types.ProviderSettingResult {
    // Todo remove this after airdrop
    // await onlyOwner(caller);
    var authorized = false;
    Debug.print("Authenticating the caller: " # Principal.toText(callerPrincipalId));
    switch(await AuthManager.checkProviderAdminPermission(providerId, callerPrincipalId, state)) {
      case (#err(error)) return #err(error);
      case (#ok()) authorized := true;
    };
    if(authorized == false) {
      return #err(#Unauthorized);
    };

    var provider = state.providers.get(providerId);
    switch(provider) {
      case (?result) {
        let now = Helpers.timeNow();
        // Update the providers settings
        state.providers.put(providerId, {
              id = providerId;
              name = result.name;
              description = result.description;
              image = result.image;
              createdAt = result.createdAt;
              updatedAt = now;
              settings = updatedSettings;
        });
       return #ok(updatedSettings);
      };
      case(null) return #err(#NotFound);
    };
    // todo: Re-evaluate all new content with votes to determine if a potential decision can be made
  };

  public func getProvider(providerId: Principal, state: GlobalState.State) : async Types.ProviderPlus {
    switch(state.providers.get(providerId)) {
      case(?provider) {
        let result : Types.ProviderPlus = {
            id = provider.id;
            name = provider.name;
            description = provider.description;
            image = provider.image;
            createdAt = provider.createdAt;
            updatedAt = provider.updatedAt;
            settings = provider.settings;
            rules = getProviderRules(providerId, state);
            contentCount = state.provider2content.get0Size(provider.id);
            activeCount = 100; // Todo calculate active content count
            rewardsSpent = 5000; // Todo calculate rewards spent
        };
        return result;
      };
      case(null) {
        throw Error.reject( "Provider does not exist" );
      };
    };
  };

  public func addRules(providerId: Principal, rules: [Text], state: GlobalState.State) {
    for(rule in rules.vals()) {
      var ruleId = Helpers.generateId(providerId, "rule", state);
      state.rules.put(ruleId, {
        id = ruleId;
        description = rule;
      });
      state.provider2rules.put(providerId, ruleId);
    };
  };

  public func removeRules(providerId: Principal, ruleIds: [Types.RuleId], state: GlobalState.State) {
    for(ruleId in ruleIds.vals()) {
      state.provider2rules.delete(providerId, ruleId);
    };
  };

  // Subscribe function for providers to register their callback after a vote decision has been made
  public func subscribe(providerId: Principal, sub: Types.SubscribeMessage, state: GlobalState.State) : () {
    state.providerSubs.put(providerId, sub);
  };


  public func getProviderRules(providerId: Principal, state: GlobalState.State) : [Types.Rule] {
      let buf = Buffer.Buffer<Types.Rule>(0);
      for(ruleId in state.provider2rules.get0(providerId).vals()){
        switch(state.rules.get(ruleId)){
          case(?rule){
            buf.add(rule);
          };
          case(_)();
        };
      };
      buf.toArray();
  };

    public func addProviderAdmin(
      userId: Principal,
      username: Text,
      caller: Principal,
      providerId: ?Principal,
      state: GlobalState.State
      ) : async Types.ProviderResult {
      var authorized = false;
      var isProvider = false;
      var _providerId : Principal = do {
          switch(providerId) {
            case(?result) {
              isProvider := false;
              result;
            };
            case(_) {
              caller;
            };
          };
      };

      // Provider check
      switch(state.providers.get(_providerId)) {
        case (null) (); // Do nothing check if the caller is an admin for the provider
        case (?result) {
          if(caller == result.id) {
            authorized := true;
            isProvider := true;
          };
        };
      };

      // Check if the caller is an admin of this provider
      if(isProvider == false) {
          switch(await AuthManager.checkProviderAdminPermission(_providerId, caller, state)) {
            case (#err(error)) return #err(error);
            case (#ok()) authorized := true;
          };
        };

      if(authorized == false) return #err(#Unauthorized);

      // Add the user to the provider admin list
      let now = Helpers.timeNow();

      let adminProfile : Types.Profile = {
        id = userId;
        userName = username; // Todo accept username as a paramater
        email = "";
        pic = null;
        role = #admin;
        createdAt = now;
        updatedAt = now;
      };

      let IsUserIdAlreadyExist = do? {
        let currentUserId = state.profiles.get(userId)!;
      };
      if(Option.isSome(IsUserIdAlreadyExist)) {
        return #err(#ProviderAdminIsAlreadyRegistered)
      };
      state.profiles.put(userId, adminProfile);
      // TODO: Consider adding to username map to preserve uniqueness
      switch(state.providerAdmins.get(_providerId)) {
        case (null) {
          let adminMap = HashMap.HashMap<Types.UserId, ()>(1, Principal.equal, Principal.hash);
          adminMap.put(userId, ());
          state.providerAdmins.put(_providerId, adminMap);
          state.admin2Provider.put(userId,_providerId);
          };
        case (?adminMap) {
          adminMap.put(userId, ());
        };
      };
      #ok();
  };

    public func getAdminProviderIDs(
      caller: Principal,
      state: GlobalState.State): [Principal] {
        return state.admin2Provider.get0(caller);
    };

    public func getProviderAdmins(
      providerId: Principal,
      state: GlobalState.State): [Types.Profile] {
      let buf = Buffer.Buffer<Types.Profile>(0);
      switch(state.providerAdmins.get(providerId)) {
        case (null) ();
        case (?adminMap) {
          for(adminId in adminMap.keys()) {
            switch(state.profiles.get(adminId)) {
              case (?profile) {
                buf.add(profile);
              };
              case (_)();
            };
          };
        };
      };
      buf.toArray();
    };

    public func removeProviderAdmin(providerId: Principal, 
                                    providerAdminPrincipalIdToBeRemoved: Principal, 
                                    callerPrincipalId: Principal, 
                                    state: GlobalState.State) : async Types.ProviderResult {

      var authorized = false;
      Debug.print("Authenticating the caller: " # Principal.toText(callerPrincipalId));
      switch(await AuthManager.checkProviderAdminPermission(providerId, callerPrincipalId, state)) {
        case (#err(error)) return #err(error);
        case (#ok()) authorized := true;
      };
      if(authorized == false) {
        return #err(#Unauthorized);
      };
      
      switch(state.providerAdmins.get(providerId)) {
        case (null) return #err(#NotFound);
        case (?adminMap) {
          adminMap.delete(providerAdminPrincipalIdToBeRemoved);
          state.profiles.delete(providerAdminPrincipalIdToBeRemoved);
          return #ok();
        };
      };
    };

    public func editProviderAdmin(providerId: Principal,
                                  providerAdminPrincipalIdToBeEdited: Principal,
                                  newUserName: Text,
                                  callerPrincipalId: Principal,
                                  state: GlobalState.State) 
                                  : async Types.ProviderResult {

      var authorized = false;
      Debug.print("Authenticating the caller: " # Principal.toText(callerPrincipalId));
      switch(await AuthManager.checkProviderAdminPermission(providerId, callerPrincipalId, state)) {
        case (#err(error)) return #err(error);
        case (#ok()) authorized := true;
      };
      if(authorized == false) {
        return #err(#Unauthorized);
      };

      let editProviderAdminStatus = do? {
        state.providerAdmins.get(providerId)!.get(providerAdminPrincipalIdToBeEdited)!;
        let currentAdminProfile = state.profiles.get(providerAdminPrincipalIdToBeEdited)!;
        state.profiles.put(providerAdminPrincipalIdToBeEdited, {
          id = currentAdminProfile.id;
          userName = newUserName;
          email = currentAdminProfile.email;
          pic = null;
          role = currentAdminProfile.role;
          createdAt = currentAdminProfile.createdAt;
          updatedAt = Helpers.timeNow();
        });
      };
      if(Option.isNull(editProviderAdminStatus)) {
        return #err(#NotFound);
      };
      return #ok();
    };
};