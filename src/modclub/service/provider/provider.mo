import Error "mo:base/Error";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import Bool "mo:base/Bool";
import List "mo:base/List";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Text "mo:base/Text";

import GlobalState "../../statev2";
import QueueManager "../queue/queue";
import Types "../../types";
import ProviderTypes "types";
import Helpers "../../helpers";
import ModClubParams "../parameters/params";
import PermissionsModule "./permissions";
import Canistergeek "../../canistergeek/canistergeek";
import ModClubParam "../parameters/params";
import CommonTypes "../../../common/types";
import Utils "../../../common/utils";
import ModSecurity "../../../common/security/guard";

module ProviderModule {

  public func registerProvider(
    arg : ProviderTypes.ProviderArg
  ) : Text {
    let state = arg.state;
    switch (state.providers.get(arg.providerId)) {
      case (null) {
        let now = Helpers.timeNow();
        state.providers.put(
          arg.providerId,
          {
            id = arg.providerId;
            name = arg.name;
            description = arg.description;
            image = arg.image;
            createdAt = now;
            updatedAt = now;
            settings = {
              requiredVotes = ModClubParams.DEFAULT_MIN_VOTES;
              // At least 2 votes required to finalize a decision
              minStaked = 0;
              // Default amount staked, change when tokens are released
            };
            subaccounts = arg.subaccounts;
          }
        );
        Helpers.logMessage(
          arg.logger,
          "registerProvider - Provider " # Principal.toText(arg.providerId) # " Registration successful ",
          #info
        );
        return "Registration successful";
      };
      case (?result) {
        Helpers.logMessage(
          arg.logger,
          "registerProvider - Provider " # Principal.toText(arg.providerId) # " already registered ",
          #info
        );
        return "Provider already registered";
      };
    };
  };

  public func updateProviderMetaData(
    arg : ProviderTypes.ProviderMetaArg
  ) : async Types.ProviderMetaResult {
    //Check if user is authorized to perform the action
    var authorized = false;
    let state = arg.state;

    switch (
      PermissionsModule.checkProviderAdminPermission(
        arg.providerId,
        arg.callerPrincipalId,
        state
      )
    ) {
      case (#err(error)) {
        Helpers.logMessage(
          arg.logger,
          "updateProviderMetaData - Provider " # Principal.toText(arg.providerId) # " permission check failed ",
          #info
        );
        return #err(error);
      };
      case (#ok()) authorized := true;
    };
    if (authorized == false) {
      Helpers.logMessage(
        arg.logger,
        "updateProviderMetaData - Provider " # Principal.toText(arg.providerId) # " unauthorized ",
        #info
      );
      return #err(#Unauthorized);
    };

    var existingProvider = state.providers.get(arg.providerId);
    switch (existingProvider) {
      case (?result) {
        let now = Helpers.timeNow();
        state.providers.put(
          arg.providerId,
          {
            id = arg.providerId;
            name = arg.updatedProviderVal.name;
            description = arg.updatedProviderVal.description;
            image = result.image;
            createdAt = result.createdAt;
            updatedAt = now;
            settings = result.settings;
            subaccounts = result.subaccounts;
          }
        );
        Helpers.logMessage(
          arg.logger,
          "updateProviderMetaData - Provider " # Principal.toText(arg.providerId) # " Provider metadata updated successfully ",
          #info
        );
        return #ok(arg.updatedProviderVal);
      };
      case (null) {
        throw Error.reject("Provider does not exist");
      };
    };
  };

  public func updateProviderLogo(
    arg : ProviderTypes.ProviderLogoArg
  ) : async Text {
    let state = arg.state;
    var existingProvider = state.providers.get(arg.providerId);
    switch (existingProvider) {
      case (?result) {
        let now = Helpers.timeNow();
        state.providers.put(
          arg.providerId,
          {
            id = arg.providerId;
            name = result.name;
            description = result.description;
            image = ?{
              data = arg.logoToUpload;
              imageType = arg.logoType;
            };
            createdAt = result.createdAt;
            updatedAt = now;
            settings = result.settings;
            subaccounts = result.subaccounts;
          }
        );
        Helpers.logMessage(
          arg.logger,
          "updateProviderMetaData - Provider " # Principal.toText(arg.providerId) # " Provider metadata updated successfully ",
          #info
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
    logger : Canistergeek.Logger
  ) : Text {
    switch (state.providers.get(providerId)) {
      case (null) {
        Helpers.logMessage(
          logger,
          "deregisterProvider - Provider " # Principal.toText(providerId) # " does not exist",
          #info
        );
        return "Provider does not exist";
      };
      case (?result) {
        state.providers.delete(providerId);
        Helpers.logMessage(
          logger,
          "deregisterProvider - Provider " # Principal.toText(providerId) # " deregistered",
          #info
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
    logger : Canistergeek.Logger
  ) : async Types.ProviderSettingResult {
    var authorized = false;
    switch (
      PermissionsModule.checkProviderAdminPermission(
        providerId,
        callerPrincipalId,
        state
      )
    ) {
      case (#err(error)) {
        Helpers.logMessage(
          logger,
          "updateProviderSettings - Provider " # Principal.toText(providerId) # " permission check failed ",
          #info
        );
        return #err(error);
      };
      case (#ok()) authorized := true;
    };
    if (authorized == false) {
      Helpers.logMessage(
        logger,
        "updateProviderSettings - Provider " # Principal.toText(providerId) # " unauthorized ",
        #info
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
            subaccounts = result.subaccounts;
          }
        );
        Helpers.logMessage(
          logger,
          "updateProviderSettings - Provider " # Principal.toText(providerId) # " updated successfully ",
          #info
        );
        return #ok(updatedSettings);
      };
      case (null) return #err(#NotFound);
    };
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
            state : GlobalState.State
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

  public func getSaBalance(env : CommonTypes.ENV, mcCanister : Principal, providerSA : Blob) : async Nat {
    let ledger = ModSecurity.Guard(env, "PROVIDER_SERVICE").getWalletActor();
    await ledger.icrc1_balance_of({
      owner = mcCanister;
      subaccount = ?providerSA;
    });
  };

  public func addRules(
    providerId : Principal,
    rules : [Text],
    state : GlobalState.State,
    logger : Canistergeek.Logger
  ) {
    for (rule in rules.vals()) {
      var ruleId = Helpers.generateId(providerId, "rule", state);
      Helpers.logMessage(
        logger,
        "addRules - Provider " # Principal.toText(providerId) # "adding rule, ruleId:  " # ruleId # " text: " # rule,
        #info
      );
      state.rules.put(
        ruleId,
        {
          id = ruleId;
          description = rule;
        }
      );
      state.provider2rules.put(providerId, ruleId);
    };
  };

  public func removeRules(
    providerId : Principal,
    ruleIds : [Types.RuleId],
    state : GlobalState.State,
    logger : Canistergeek.Logger
  ) {
    for (ruleId in ruleIds.vals()) {
      Helpers.logMessage(
        logger,
        "removeRules - Provider " # Principal.toText(providerId) # "removing rule, ruleId:  " # ruleId,
        #info
      );
      state.rules.delete(ruleId);
      state.provider2rules.delete(providerId, ruleId);
    };
  };

  public func updateRules(
    providerId : Principal,
    rulesList : [Types.Rule],
    state : GlobalState.State
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
    logger : Canistergeek.Logger
  ) : () {
    Helpers.logMessage(
      logger,
      "subscribe - Provider " # Principal.toText(providerId) # " subscribing",
      #info
    );
    state.providerSubs.put(providerId, sub);
  };

  public func getProviderRules(
    providerId : Principal,
    state : GlobalState.State
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
    Buffer.toArray<Types.Rule>(buf);
  };

  public func addProviderAdmin(
    arg : ProviderTypes.ProviderRegAdminArg
  ) : async Types.ProviderResult {
    let state = arg.state;
    var authorized = false;
    var isProvider = false;
    var _providerId : Principal = do {
      switch (arg.providerId) {
        case (?result) {
          isProvider := false;
          result;
        };
        case (_) {
          arg.caller;
        };
      };
    };

    Helpers.logMessage(
      arg.logger,
      "addProviderAdmin - Provider " # Principal.toText(_providerId) # " caller " # Principal.toText(
        arg.caller
      ) # " new admin principal ID " # Principal.toText(arg.userId),
      #info
    );

    // Provider check
    switch (state.providers.get(_providerId)) {
      case (null)();
      // Do nothing check if the caller is an admin for the provider
      case (?result) {
        if (arg.caller == result.id) {
          authorized := true;
          isProvider := true;
        };
      };
    };

    Helpers.logMessage(
      arg.logger,
      "addProviderAdmin - Is caller provider:  " # Bool.toText(isProvider),
      #info
    );

    // Allow Modclub Admins. REFACTOR.
    if (authorized == false and arg.isModclubAdmin) {
      authorized := true;
    };

    // Check if the caller is an admin of this provider
    if (authorized == false) {
      switch (
        PermissionsModule.checkProviderAdminPermission(_providerId, arg.caller, state)
      ) {
        case (#err(error)) return #err(error);
        case (#ok()) authorized := true;
      };
    };

    if (authorized == false) return #err(#Unauthorized);

    // Add the user to the provider admin list
    let now = Helpers.timeNow();

    let adminProfile : Types.Profile = {
      id = arg.userId;
      userName = arg.username;
      email = "";
      pic = null;
      subaccounts = HashMap.HashMap<Text, Blob>(2, Text.equal, Text.hash);
      role = #moderator;
      createdAt = now;
      updatedAt = now;
    };

    if (Option.isNull(state.profiles.get(arg.userId))) {
      state.profiles.put(arg.userId, adminProfile);
    };

    var IsUserAlreadyAdminOfProvider = false;
    switch (state.providerAdmins.get(_providerId)) {
      case (null) {
        let adminMap = HashMap.HashMap<Types.UserId, ()>(
          1,
          Principal.equal,
          Principal.hash
        );
        adminMap.put(arg.userId, ());
        state.providerAdmins.put(_providerId, adminMap);
        state.admin2Provider.put(arg.userId, _providerId);
      };
      case (?adminMap) {
        if (Option.isSome(adminMap.get(arg.userId))) {
          IsUserAlreadyAdminOfProvider := true;
        } else {
          adminMap.put(arg.userId, ());
          state.admin2Provider.put(arg.userId, _providerId);
        };
      };
    };

    if (IsUserAlreadyAdminOfProvider == true) {
      Helpers.logMessage(
        arg.logger,
        "addProviderAdmin - FAILED:  Provider " # Principal.toText(_providerId) # " caller " # Principal.toText(
          arg.caller
        ) # " admin principal ID is already exist" # Principal.toText(arg.userId),
        #info
      );
      #err(#ProviderAdminIsAlreadyRegistered);
    } else {
      Helpers.logMessage(
        arg.logger,
        "addProviderAdmin - SUCCESS:  Provider " # Principal.toText(_providerId) # " caller " # Principal.toText(
          arg.caller
        ) # " new admin principal ID " # Principal.toText(arg.userId),
        #info
      );
      #ok();
    };

  };

  public func getAdminProviderIDs(
    caller : Principal,
    state : GlobalState.State,
    logger : Canistergeek.Logger
  ) : [Principal] {
    return state.admin2Provider.get0(caller);
  };

  public func getProviderAdmins(
    providerId : Principal,
    state : GlobalState.State
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
    Buffer.toArray<Types.Profile>(buf);
  };

  public func removeProviderAdmin(
    arg : ProviderTypes.ProviderAdminArg,
    logger : Canistergeek.Logger
  ) : async Types.ProviderResult {
    let state = arg.state;
    var authorized = arg.isModclubAdmin;
    if (authorized == false) {
      switch (
        PermissionsModule.checkProviderAdminPermission(
          arg.providerId,
          arg.callerPrincipalId,
          state
        )
      ) {
        case (#err(error)) return #err(error);
        case (#ok()) authorized := true;
      };
    };
    if (authorized == false) {
      return #err(#Unauthorized);
    };

    switch (state.providerAdmins.get(arg.providerId)) {
      case (null) return #err(#NotFound);
      case (?adminMap) {
        adminMap.delete(arg.providerAdminPrincipalId);
        state.profiles.delete(arg.providerAdminPrincipalId);
        return #ok();
      };
    };
  };

  public func editProviderAdmin(
    arg : ProviderTypes.ProviderAdminArg,
    newUserName : Text
  ) : async Types.ProviderResult {
    var authorized = arg.isModclubAdmin;
    let state = arg.state;

    if (authorized == false) {
      switch (
        PermissionsModule.checkProviderAdminPermission(
          arg.providerId,
          arg.callerPrincipalId,
          state
        )
      ) {
        case (#err(error)) return #err(error);
        case (#ok()) authorized := true;
      };
    };

    if (authorized == false) {
      return #err(#Unauthorized);
    };

    let editProviderAdminStatus = do ? {
      state.providerAdmins.get(arg.providerId)!.get(
        arg.providerAdminPrincipalId
      )!;
      let currentAdminProfile = state.profiles.get(
        arg.providerAdminPrincipalId
      )!;
      state.profiles.put(
        arg.providerAdminPrincipalId,
        {
          id = currentAdminProfile.id;
          userName = newUserName;
          email = currentAdminProfile.email;
          pic = null;
          role = currentAdminProfile.role;
          subaccounts = currentAdminProfile.subaccounts;
          createdAt = currentAdminProfile.createdAt;
          updatedAt = Helpers.timeNow();
        }
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
    logger : Canistergeek.Logger
  ) : async () {
    switch (state.providersWhitelist.get(providerId)) {
      case (?result) {
        Helpers.logMessage(
          logger,
          "addToAllowList - Provider " # Principal.toText(providerId) # " already added to allow list ",
          #info
        );
        throw Error.reject("Provider already added to allow list");
        return;
      };
      case (_) {
        Helpers.logMessage(
          logger,
          "addToAllowList - Provider " # Principal.toText(providerId) # "added to allow list ",
          #info
        );
        state.providersWhitelist.put(providerId, true);
      };
    };
  };

  public func checkAndTopUpProviderBalance(provider : Types.Provider, env : CommonTypes.ENV, principal : Principal, amount : Float) : async () {
    await hasEnoughReservedBalance(provider, env, principal, amount);
    await topUpProviderSAPayable(provider, env, principal, amount);
  };

  public func hasEnoughReservedBalance(
    provider : Types.Provider,
    env : CommonTypes.ENV,
    modclubCanisterPrincipal : Principal,
    amount : Float
  ) : async () {
    let ledger = ModSecurity.Guard(env, "PROVIDER_SERVICE").getWalletActor();
    let account = {
      owner = modclubCanisterPrincipal;
      subaccount = provider.subaccounts.get("RESERVE");
    };
    let providerBalance = await ledger.icrc1_balance_of(account);
    let tokens = Utils.floatToTokens(amount);
    if (providerBalance < tokens) {
      return throw Error.reject("Not enough balance in provider reserves to submit task.");
    };
  };

  public func getTaskFee(p : Types.Provider) : Float {
    ModClubParam.CS * Float.fromInt(p.settings.requiredVotes);
  };

  public func topUpProviderSAPayable(
    provider : Types.Provider,
    env : CommonTypes.ENV,
    modclubCanisterPrincipal : Principal,
    amount : Float
  ) : async () {
    let tokens = Utils.floatToTokens(amount);
    let ledger = ModSecurity.Guard(env, "PROVIDER_SERVICE").getWalletActor();
    let res = await ledger.icrc1_transfer({
      from_subaccount = provider.subaccounts.get("RESERVE");
      to = {
        owner = modclubCanisterPrincipal;
        subaccount = provider.subaccounts.get("ACCOUNT_PAYABLE");
      };
      amount = tokens;
      created_at_time = null;
      fee = null;
      memo = null;
    });
  };

  public func providerExists(
    providerId : Principal,
    state : GlobalState.State
  ) : Bool {
    switch (state.providers.get(providerId)) {
      case (null) {
        return false;
      };
      case (?p) {
        return true;
      };
    };
  };

  public func isProviderAdmin(
    providerId : Principal,
    state : GlobalState.State
  ) : Bool {
    switch (state.providersWhitelist.get(providerId)) {
      case (null) {
        return false;
      };
      case (?p) {
        return true;
      };
    };
  };

  public func topUpProviderReserve(env : CommonTypes.ENV, mcCanister : Principal, provider : Types.Provider, tokens : Nat) : async () {
    let ledger = ModSecurity.Guard(env, "PROVIDER_SERVICE").getWalletActor();
    let res = await ledger.icrc2_transfer_from({
      from = {
        owner = provider.id;
        subaccount = null;
      };
      to = {
        owner = mcCanister; // ledger_account.owner;
        subaccount = provider.subaccounts.get("RESERVE");
      };
      amount = tokens;
      created_at_time = null;
      fee = null;
      memo = null;
    });
  };

  private func getNewContentCount(
    providerId : Principal,
    state : GlobalState.State
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
