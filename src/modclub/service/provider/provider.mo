import Error "mo:base/Error";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import Bool "mo:base/Bool";
import List "mo:base/List";
import Float "mo:base/Float";

import GlobalState "../../statev2";
import QueueManager "../queue/queue";
import Types "../../types";
import Helpers "../../helpers";
import ModClubParams "../parameters/params";
import AuthManager "../auth/auth";
import Canistergeek "../../canistergeek/canistergeek";
import ModClubParam "../parameters/params";
import ModWallet "../../remote_canisters/ModWallet";


module ProviderModule {

  public func registerProvider(
    providerId : Principal,
    name : Text,
    description : Text,
    image : ?Types.Image,
    state : GlobalState.State,
    logger : Canistergeek.Logger,
  ) : Text {
    // Todo remove this after airdrop
    // await onlyOwner(caller);
    switch (state.providers.get(providerId)) {
      case (null) {
        let now = Helpers.timeNow();
        state.providers.put(
          providerId,
          {
            id = providerId;
            name = name;
            description = description;
            image = image;
            createdAt = now;
            updatedAt = now;
            settings = {
              minVotes = ModClubParams.DEFAULT_MIN_VOTES;
              // At least 2 votes required to finalize a decision
              minStaked = 0;
              // Default amount staked, change when tokens are released
            };
          },
        );
        Helpers.logMessage(
          logger,
          "registerProvider - Provider " # Principal.toText(providerId) # " Registration successful ",
          #info,
        );
        return "Registration successful";
      };
      case (?result) {
        Helpers.logMessage(
          logger,
          "registerProvider - Provider " # Principal.toText(providerId) # " already registered ",
          #info,
        );
        return "Provider already registered";
      };
    };
  };

  public func updateProviderMetaData(
    providerId : Principal,
    updatedProviderVal : Types.ProviderMeta,
    callerPrincipalId : Principal,
    state : GlobalState.State,
    logger : Canistergeek.Logger,
  ) : async Types.ProviderMetaResult {
    //Check if user is authorized to perform the action
    var authorized = false;
    Debug.print(
      "Authenticating the caller: " # Principal.toText(callerPrincipalId),
    );
    switch (
      AuthManager.checkProviderAdminPermission(
        providerId,
        callerPrincipalId,
        state,
      ),
    ) {
      case (#err(error)) {
        Helpers.logMessage(
          logger,
          "updateProviderMetaData - Provider " # Principal.toText(providerId) # " permission check failed ",
          #info,
        );
        return #err(error);
      };
      case (#ok()) authorized := true;
    };
    if (authorized == false) {
      Helpers.logMessage(
        logger,
        "updateProviderMetaData - Provider " # Principal.toText(providerId) # " unauthorized ",
        #info,
      );
      return #err(#Unauthorized);
    };

    var existingProvider = state.providers.get(providerId);
    switch (existingProvider) {
      case (?result) {
        let now = Helpers.timeNow();
        state.providers.put(
          providerId,
          {
            id = providerId;
            name = updatedProviderVal.name;
            description = updatedProviderVal.description;
            image = result.image;
            createdAt = result.createdAt;
            updatedAt = now;
            settings = result.settings;
          },
        );
        Helpers.logMessage(
          logger,
          "updateProviderMetaData - Provider " # Principal.toText(providerId) # " Provider metadata updated successfully ",
          #info,
        );
        return #ok(updatedProviderVal);
      };
      case (null) {
        throw Error.reject("Provider does not exist");
      };
    };
  };

  public func updateProviderLogo(
    providerId : Principal,
    logoToUpload : [Nat8],
    logoType : Text,
    callerPrincipalId : Principal,
    state : GlobalState.State,
    logger : Canistergeek.Logger,
  ) : async Text {
    var existingProvider = state.providers.get(providerId);
    switch (existingProvider) {
      case (?result) {
        let now = Helpers.timeNow();
        state.providers.put(
          providerId,
          {
            id = providerId;
            name = result.name;
            description = result.description;
            image = ?{
              data = logoToUpload;
              imageType = logoType;
            };
            createdAt = result.createdAt;
            updatedAt = now;
            settings = result.settings;
          },
        );
        Helpers.logMessage(
          logger,
          "updateProviderMetaData - Provider " # Principal.toText(providerId) # " Provider metadata updated successfully ",
          #info,
        );
        return "Uploaded";
      };
      case (null) {
        throw Error.reject("Provider does not exist");
      };
    };
  };

  public func deregisterProvider(
    providerId : Principal,
    state : GlobalState.State,
    logger : Canistergeek.Logger,
  ) : Text {
    switch (state.providers.get(providerId)) {
      case (null) {
        Helpers.logMessage(
          logger,
          "deregisterProvider - Provider " # Principal.toText(providerId) # " does not exist",
          #info,
        );
        return "Provider does not exist";
      };
      case (?result) {
        state.providers.delete(providerId);
        Helpers.logMessage(
          logger,
          "deregisterProvider - Provider " # Principal.toText(providerId) # " deregistered",
          #info,
        );
        return "Provider deregistered";
      };
    };
  };

  public func updateProviderSettings(
    providerId : Principal,
    updatedSettings : Types.ProviderSettings,
    callerPrincipalId : Principal,
    state : GlobalState.State,
    logger : Canistergeek.Logger,
  ) : async Types.ProviderSettingResult {
    var authorized = false;
    Debug.print(
      "Authenticating the caller: " # Principal.toText(callerPrincipalId),
    );
    switch (
      AuthManager.checkProviderAdminPermission(
        providerId,
        callerPrincipalId,
        state,
      ),
    ) {
      case (#err(error)) {
        Helpers.logMessage(
          logger,
          "updateProviderSettings - Provider " # Principal.toText(providerId) # " permission check failed ",
          #info,
        );
        return #err(error);
      };
      case (#ok()) authorized := true;
    };
    if (authorized == false) {
      Helpers.logMessage(
        logger,
        "updateProviderSettings - Provider " # Principal.toText(providerId) # " unauthorized ",
        #info,
      );
      return #err(#Unauthorized);
    };

    var provider = state.providers.get(providerId);
    switch (provider) {
      case (?result) {
        let now = Helpers.timeNow();
        // Update the providers settings
        state.providers.put(
          providerId,
          {
            id = providerId;
            name = result.name;
            description = result.description;
            image = result.image;
            createdAt = result.createdAt;
            updatedAt = now;
            settings = updatedSettings;
          },
        );
        Helpers.logMessage(
          logger,
          "updateProviderSettings - Provider " # Principal.toText(providerId) # " updated successfully ",
          #info,
        );
        return #ok(updatedSettings);
      };
      case (null) return #err(#NotFound);
    };
    // todo: Re-evaluate all new content with votes to determine if a potential decision can be made
  };

  public func getProvider(providerId : Principal, state : GlobalState.State) : async Types.ProviderPlus {
    switch (state.providers.get(providerId)) {
      case (?provider) {
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
          activeCount = getNewContentCount(
            provider.id,
            state : GlobalState.State,
          );
          rewardsSpent = 5000;
          // Todo calculate rewards spent
        };
        return result;
      };
      case (null) {
        throw Error.reject("Provider does not exist");
      };
    };
  };

  public func addRules(
    providerId : Principal,
    rules : [Text],
    state : GlobalState.State,
    logger : Canistergeek.Logger,
  ) {
    for (rule in rules.vals()) {
      var ruleId = Helpers.generateId(providerId, "rule", state);
      Helpers.logMessage(
        logger,
        "addRules - Provider " # Principal.toText(providerId) # "adding rule, ruleId:  " # ruleId # " text: " # rule,
        #info,
      );
      state.rules.put(
        ruleId,
        {
          id = ruleId;
          description = rule;
        },
      );
      state.provider2rules.put(providerId, ruleId);
    };
  };

  public func removeRules(
    providerId : Principal,
    ruleIds : [Types.RuleId],
    state : GlobalState.State,
    logger : Canistergeek.Logger,
  ) {
    for (ruleId in ruleIds.vals()) {
      Helpers.logMessage(
        logger,
        "removeRules - Provider " # Principal.toText(providerId) # "removing rule, ruleId:  " # ruleId,
        #info,
      );
      state.rules.delete(ruleId);
      state.provider2rules.delete(providerId, ruleId);
    };
  };

  public func updateRules(
    providerId : Principal,
    rulesList : [Types.Rule],
    state : GlobalState.State,
  ) {
    for (rule in rulesList.vals()) {
      state.rules.put(rule.id, rule);
    };
  };

  // Subscribe function for providers to register their callback after a vote decision has been made
  public func subscribe(
    providerId : Principal,
    sub : Types.SubscribeMessage,
    state : GlobalState.State,
    logger : Canistergeek.Logger,
  ) : () {
    Helpers.logMessage(
      logger,
      "subscribe - Provider " # Principal.toText(providerId) # " subscribing",
      #info,
    );
    state.providerSubs.put(providerId, sub);
  };

  public func getProviderRules(
    providerId : Principal,
    state : GlobalState.State,
  ) : [Types.Rule] {
    let buf = Buffer.Buffer<Types.Rule>(0);
    for (ruleId in state.provider2rules.get0(providerId).vals()) {
      switch (state.rules.get(ruleId)) {
        case (?rule) {
          buf.add(rule);
        };
        case (_)();
      };
    };
    buf.toArray();
  };

  public func addProviderAdmin(
    userId : Principal,
    username : Text,
    caller : Principal,
    providerId : ?Principal,
    state : GlobalState.State,
    modClubAmins : List.List<Principal>,
    logger : Canistergeek.Logger,
  ) : async Types.ProviderResult {
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

    Helpers.logMessage(
      logger,
      "addProviderAdmin - Provider " # Principal.toText(_providerId) # " caller " # Principal.toText(
        caller,
      ) # " new admin principal ID " # Principal.toText(userId),
      #info,
    );

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

    Helpers.logMessage(
      logger,
      "addProviderAdmin - Is caller provider:  " # Bool.toText(isProvider),
      #info,
    );

    // Allow Modclub Admins
    if (authorized == false) {
      authorized := AuthManager.isAdmin(caller, modClubAmins);
    };

    // Check if the caller is an admin of this provider
    if (authorized == false) {
      switch (
        AuthManager.checkProviderAdminPermission(_providerId, caller, state),
      ) {
        case (#err(error)) return #err(error);
        case (#ok()) authorized := true;
      };
    };

    if (authorized == false) return #err(#Unauthorized);

    // Add the user to the provider admin list
    let now = Helpers.timeNow();

    let adminProfile : Types.Profile = {
      id = userId;
      userName = username;
      // Todo accept username as a paramater
      email = "";
      pic = null;
      role = #moderator;
      createdAt = now;
      updatedAt = now;
    };

    if (Option.isNull(state.profiles.get(userId))) {
      state.profiles.put(userId, adminProfile);
    };

    state.profiles.put(userId, adminProfile);
    // TODO: Consider adding to username map to preserve uniqueness
    var IsUserAlreadyAdminOfProvider = false;
    switch (state.providerAdmins.get(_providerId)) {
      case (null) {
        let adminMap = HashMap.HashMap<Types.UserId, ()>(
          1,
          Principal.equal,
          Principal.hash,
        );
        adminMap.put(userId, ());
        state.providerAdmins.put(_providerId, adminMap);
        state.admin2Provider.put(userId, _providerId);
      };
      case (?adminMap) {
        if (Option.isSome(adminMap.get(userId))) {
          IsUserAlreadyAdminOfProvider := true;
        } else {
          adminMap.put(userId, ());
          state.admin2Provider.put(userId, _providerId);
        };
      };
    };

    if (IsUserAlreadyAdminOfProvider == true) {
      Helpers.logMessage(
        logger,
        "addProviderAdmin - FAILED:  Provider " # Principal.toText(_providerId) # " caller " # Principal.toText(
          caller,
        ) # " admin principal ID is already exist" # Principal.toText(userId),
        #info,
      );
      #err(#ProviderAdminIsAlreadyRegistered);
    } else {
      Helpers.logMessage(
        logger,
        "addProviderAdmin - SUCCESS:  Provider " # Principal.toText(_providerId) # " caller " # Principal.toText(
          caller,
        ) # " new admin principal ID " # Principal.toText(userId),
        #info,
      );
      #ok();
    };

  };

  public func getAdminProviderIDs(
    caller : Principal,
    state : GlobalState.State,
    logger : Canistergeek.Logger,
  ) : [Principal] {
    return state.admin2Provider.get0(caller);
  };

  public func getProviderAdmins(
    providerId : Principal,
    state : GlobalState.State,
  ) : [Types.Profile] {
    let buf = Buffer.Buffer<Types.Profile>(0);
    switch (state.providerAdmins.get(providerId)) {
      case (null)();
      case (?adminMap) {
        for (adminId in adminMap.keys()) {
          switch (state.profiles.get(adminId)) {
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

  public func removeProviderAdmin(
    providerId : Principal,
    providerAdminPrincipalIdToBeRemoved : Principal,
    callerPrincipalId : Principal,
    state : GlobalState.State,
    modClubAmins : List.List<Principal>,
    logger : Canistergeek.Logger,
  ) : async Types.ProviderResult {

    Debug.print(
      "Authenticating the caller: " # Principal.toText(callerPrincipalId),
    );
    // Allow Modclub Admins
    var authorized = AuthManager.isAdmin(callerPrincipalId, modClubAmins);
    if (authorized == false) {
      switch (
        AuthManager.checkProviderAdminPermission(
          providerId,
          callerPrincipalId,
          state,
        ),
      ) {
        case (#err(error)) return #err(error);
        case (#ok()) authorized := true;
      };
    };
    if (authorized == false) {
      return #err(#Unauthorized);
    };

    switch (state.providerAdmins.get(providerId)) {
      case (null) return #err(#NotFound);
      case (?adminMap) {
        adminMap.delete(providerAdminPrincipalIdToBeRemoved);
        state.profiles.delete(providerAdminPrincipalIdToBeRemoved);
        return #ok();
      };
    };
  };

  public func editProviderAdmin(
    providerId : Principal,
    providerAdminPrincipalIdToBeEdited : Principal,
    newUserName : Text,
    callerPrincipalId : Principal,
    modClubAmins : List.List<Principal>,
    state : GlobalState.State,
  ) : async Types.ProviderResult {

    var authorized = AuthManager.isAdmin(callerPrincipalId, modClubAmins);
    Debug.print(
      "Authenticating the caller: " # Principal.toText(callerPrincipalId),
    );

    if (authorized == false) {
      switch (
        AuthManager.checkProviderAdminPermission(
          providerId,
          callerPrincipalId,
          state,
        ),
      ) {
        case (#err(error)) return #err(error);
        case (#ok()) authorized := true;
      };
    };

    if (authorized == false) {
      return #err(#Unauthorized);
    };

    let editProviderAdminStatus = do ? {
      state.providerAdmins.get(providerId)!.get(
        providerAdminPrincipalIdToBeEdited,
      )!;
      let currentAdminProfile = state.profiles.get(
        providerAdminPrincipalIdToBeEdited,
      )!;
      state.profiles.put(
        providerAdminPrincipalIdToBeEdited,
        {
          id = currentAdminProfile.id;
          userName = newUserName;
          email = currentAdminProfile.email;
          pic = null;
          role = currentAdminProfile.role;
          createdAt = currentAdminProfile.createdAt;
          updatedAt = Helpers.timeNow();
        },
      );
    };
    if (Option.isNull(editProviderAdminStatus)) {
      return #err(#NotFound);
    };
    return #ok();
  };

  public func addToAllowList(
    providerId : Principal,
    state : GlobalState.State,
    logger : Canistergeek.Logger,
  ) : async () {
    switch (state.providersWhitelist.get(providerId)) {
      case (?result) {
        Helpers.logMessage(
          logger,
          "addToAllowList - Provider " # Principal.toText(providerId) # " already added to allow list ",
          #info,
        );
        throw Error.reject("Provider already added to allow list");
        return;
      };
      case (_) {
        Helpers.logMessage(
          logger,
          "addToAllowList - Provider " # Principal.toText(providerId) # "added to allow list ",
          #info,
        );
        state.providersWhitelist.put(providerId, true);
      };
    };
  };


  public func checkIfProviderHasEnoughBalance(
    providerId : Principal,
    env: Text,
    modclubCanisterPrincipal: Principal,
    state : GlobalState.State,
    logger : Canistergeek.Logger,
  ) : async () {
    var minVotes = 0;
    switch(state.providers.get(providerId)) {
      case(null) {
        return throw Error.reject("Unauthorized");
      };
      case(?p) {
        minVotes := p.settings.minVotes;
      };
    };
    let feeForTask = ModClubParam.CS * Float.fromInt(minVotes);
    let providerBalance = await ModWallet.getActor(env).queryBalance(?(Principal.toText(providerId) # ModClubParam.RESERVE_SA));
    if(providerBalance < feeForTask) {
      return throw Error.reject("Not enough balance in provider reserves to submit task.");
    };
    let _ = await ModWallet.getActor(env).transfer(?(Principal.toText(providerId) # ModClubParam.RESERVE_SA), modclubCanisterPrincipal, ?(Principal.toText(providerId) # ModClubParam.ACCOUNT_PAYABLE), feeForTask);
  };

  private func getNewContentCount(
    providerId : Principal,
    state : GlobalState.State,
  ) : Nat {
    var count = 0;
    for (cid in state.provider2content.get0(providerId).vals()) {
      switch (state.content.get(cid)) {
        case (null)();
        case (?content) {
          if (content.status == #new) {
            count := count + 1;
          };
        };
      };
    };
    return count;
  };

};
