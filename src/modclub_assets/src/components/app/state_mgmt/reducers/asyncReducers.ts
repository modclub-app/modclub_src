import { Principal } from "@dfinity/principal";
import { getEnvironmentSpecificValues } from "../../../../utils/api";

export async function asyncReducers(asyncState, action) {
  const state = await Promise.resolve(asyncState);
  const context = action.context;

  switch (action.type) {
    case "fetchUserProfile": {
      let userProfile = state.userProfile;
      try {
        if (context.actors.modclub) {
          const actor = context.actors.modclub.value;
          userProfile = await actor.getProfile();
        }
      } catch (e) {
        console.error("Error fetching UserProfile::", e);
      }
      return { ...state, userProfile };
    }
    case "fetchDecimals": {
      let decimals = state.decimals;
      try {
        if (context.actors.wallet) {
          const actor = context.actors.wallet.value;
          decimals = await actor.icrc1_decimals();
        }
      } catch (e) {
        console.error("Error fetching Decimals::", e);
      }
      return { ...state, decimals };
    }
    case "fetchUserSystemBalance": {
      let systemBalance = state.systemBalance;
      const ap_sub_acc_rec = state.userProfile.subaccounts.find(
        (item) => item[0] === "ACCOUNT_PAYABLE"
      );

      try {
        if (context.actors.wallet) {
          const actor = context.actors.wallet.value;
          systemBalance = await actor.icrc1_balance_of({
            owner: Principal.from(context.canisters.modclub.canisterId),
            subaccount: [ap_sub_acc_rec[1]],
          });
        }
      } catch (e) {
        console.error("Error fetching UserSystemBalance::", e);
      }

      return { ...state, systemBalance };
    }
    case "fetchUserLockedBalance": {
      let lockedBalance = state.lockedBalance;

      try {
        if (context.actors.vesting && state.userProfile) {
          const actor = context.actors.vesting.value;
          lockedBalance = await actor.locked_for({
            owner: state.userProfile.id,
            subaccount: [],
          });
        }
      } catch (e) {
        console.error("Error fetching UserLockedBalance::", e);
      }

      return { ...state, lockedBalance };
    }
    case "fetchUserPersonalBalance": {
      let personalBalance = state.personalBalance;
      try {
        if (context.actors.wallet && state.userProfile) {
          const actor = context.actors.wallet.value;
          personalBalance = await actor.icrc1_balance_of({
            owner: state.userProfile.id,
            subaccount: [],
          });
        }
      } catch (e) {
        console.error("Error fetching UserPersonalBalance::", e);
      }

      return { ...state, personalBalance };
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}
