import Map "mo:base/HashMap";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Utils "../../utils";
import Helpers "../../../common/helpers";
import Types "./types";

module Account {

  public class AccountManager(
    accounts : Map.HashMap<Types.DecideID, Types.Account>,
    principal2decide : Map.HashMap<Principal, Types.DecideID>,
    profiles : Map.HashMap<Types.DecideID, Types.Profile>
  ) {
    public func register(
      caller : Principal,
      accUserPrincipal : Principal,
      firstName : Text,
      lastName : Text,
      email : Text
    ) : async Result.Result<Types.DecideID, Text> {
      // Check if the user has already registered
      switch (principal2decide.get(accUserPrincipal)) {
        case (null) {
          // User not registered, proceed with registration

          let newDecideID = await Utils.generateUUID();

          // Add the new account
          let newAcc : Types.Account = {
            id = newDecideID;
            principal = accUserPrincipal;
            acc_type = #organic;
            state = #onboarding;
            onboardingCompletedSteps = [#basic];
            createdAt = Helpers.timeNow();
            updatedAt = Helpers.timeNow();
            createdBy = caller;
          };
          accounts.put(newDecideID, newAcc);
          principal2decide.put(accUserPrincipal, newDecideID);
          profiles.put(
            newDecideID,
            {
              firstName = firstName;
              lastName = lastName;
              email = ?email;
            }
          );
          return #ok(newDecideID);

        };
        case (_) {
          // User already registered
          return #err("Pricipal " # Principal.toText(accUserPrincipal) # "already registered.");
        };
      };
    };

    public func get(
      decideid : Types.DecideID
    ) : async Result.Result<Types.GetAccountResponse, Text> {
      switch (accounts.get(decideid)) {
        case (null) {
          return #err("Cannot find account");
        };
        case (?account) {
          switch (profiles.get(decideid)) {
            case (null) {
              return #err("Cannot find profile");
            };
            case (?profile) {
              return #ok({
                acc = account;
                profile = profile;
              });
            };
          };
        };
      };
    };

  };

};
