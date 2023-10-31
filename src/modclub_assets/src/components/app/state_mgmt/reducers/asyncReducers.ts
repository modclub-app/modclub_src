import { Principal } from "@dfinity/principal";
import { getModeratorLeaderboard } from "../../../../utils/api";
import * as Constants from "../../../../utils/constant";

function timeout(ms, promise) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Request timed out"));
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((reason) => {
        clearTimeout(timer);
        reject(reason);
      });
  });
}

export async function asyncReducers(asyncState, action) {
  const state = await Promise.resolve(asyncState);
  const context = action.context;

  switch (action.type) {
    case "setLoginPrincipalId": {
      return { ...state, loginPrincipalId: action.payload };
    }
    case "fetchUserProfile": {
      let userProfile = state.userProfile;
      let requiresSignUp = state.requiresSignUp;
      try {
        if (context.actors.modclub) {
          const actor = context.actors.modclub.value;
          userProfile = await actor.getProfile();
          requiresSignUp = false;
        }
      } catch (e) {
        console.error("Error fetching UserProfile::", e);
        requiresSignUp = true;
      }
      return { ...state, userProfile, requiresSignUp };
    }
    case "fetchIsUserAdmin": {
      let isAdminUser = state.isAdminUser;
      try {
        if (context.actors.modclub) {
          const actor = context.actors.modclub.value;
          await actor.showAdmins();
          isAdminUser = true;
        }
      } catch (e) {
        console.error("Error fetching showAdmins::", e);
        isAdminUser = false;
      }
      return { ...state, isAdminUser };
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
    case "fetchTransactionFee": {
      let transactionFee = state.transactionFee;
      try {
        if (context.actors.wallet) {
          const actor = context.actors.wallet.value;
          transactionFee = await actor.icrc1_fee();
        }
      } catch (e) {
        console.error("Error fetching TransactionFee::", e);
      }
      return { ...state, transactionFee: transactionFee };
    }
    case "systemBalanceLoading": {
      return { ...state, systemBalanceLoading: action.payload };
    }
    case "fetchUserSystemBalance": {
      let systemBalance = state.systemBalance;
      let systemBalanceLoading = !state.systemBalanceLoading;
      const ap_sub_acc_rec = state.userProfile.subaccounts.find(
        (item) => item[0] === "ACCOUNT_PAYABLE"
      );
      if (!ap_sub_acc_rec) {
        console.error(
          "Error: No ACCOUNT_PAYABLE subaccount found to fetch UserSystemBalance."
        );
        return { ...state, systemBalance, systemBalanceLoading };
      }

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

      return { ...state, systemBalance, systemBalanceLoading };
    }
    case "lockedBalanceLoading": {
      return { ...state, lockedBalanceLoading: action.payload };
    }
    case "fetchUserLockedBalance": {
      let lockedBalance = state.lockedBalance;
      let lockedBalanceLoading = !state.lockedBalanceLoading;
      try {
        if (context.actors.vesting && state.loginPrincipalId) {
          const actor = context.actors.vesting.value;
          lockedBalance = await actor.locked_for({
            owner: Principal.from(state.loginPrincipalId),
            subaccount: [],
          });
        }
      } catch (e) {
        console.error("Error fetching UserLockedBalance::", e);
      }

      return { ...state, lockedBalance, lockedBalanceLoading };
    }
    case "personalBalanceLoading": {
      return { ...state, personalBalanceLoading: action.payload };
    }
    case "fetchUserPersonalBalance": {
      let personalBalance = state.personalBalance;
      try {
        if (context.actors.wallet && state.loginPrincipalId) {
          const actor = context.actors.wallet.value;
          personalBalance = await actor.icrc1_balance_of({
            owner: Principal.from(state.loginPrincipalId),
            subaccount: [],
          });
        }
      } catch (e) {
        console.error("Error fetching UserPersonalBalance::", e);
      }
      let personalBalanceLoading = !state.personalBalanceLoading;
      return { ...state, personalBalance, personalBalanceLoading };
    }
    case "stakeBalanceLoading": {
      return { ...state, stakeBalanceLoading: action.payload };
    }
    case "fetchUserStakedBalance": {
      let stakeBalance = state.stakeBalance;
      let stakeBalanceLoading = !state.stakeBalanceLoading;
      try {
        if (context.actors.vesting && state.loginPrincipalId) {
          const actor = context.actors.vesting.value;
          stakeBalance = await actor.staked_for({
            owner: Principal.from(state.loginPrincipalId),
            subaccount: [],
          });
        }
      } catch (e) {
        console.error("Error fetching User stakeBalance::", e);
      }
      return { ...state, stakeBalance, stakeBalanceLoading };
    }
    case "unlockStakeLoading": {
      return { ...state, unlockStakeLoading: action.payload };
    }
    case "fetchUserUnlockedStakedBalance": {
      let unlockStakeBalance = state.unlockStakeBalance;
      let unlockStakeLoading = !state.unlockStakeLoading;
      try {
        if (context.actors.vesting && state.loginPrincipalId) {
          const actor = context.actors.vesting.value;
          unlockStakeBalance = await actor.unlocked_stakes_for({
            owner: Principal.from(state.loginPrincipalId),
            subaccount: [],
          });
        }
      } catch (e) {
        console.error("Error fetching User unlockStakeBalance::", e);
      }
      return { ...state, unlockStakeBalance, unlockStakeLoading };
    }
    case "claimedStakeLoading": {
      return { ...state, claimedStakeLoading: action.payload };
    }
    case "fetchUserClaimedStakedBalance": {
      let claimedStakeBalance = state.claimedStakeBalance;
      let claimedStakeLoading = !state.claimedStakeLoading;
      try {
        if (context.actors.vesting && state.loginPrincipalId) {
          const actor = context.actors.vesting.value;
          let claimedStake = await actor.pending_stakes_for({
            owner: Principal.from(state.loginPrincipalId),
            subaccount: [],
          });
          if (claimedStake.length) {
            claimedStakeBalance = 0;
            claimedStake.forEach((cs) => {
              claimedStakeBalance = claimedStakeBalance + parseInt(cs.amount);
            });
          }
        }
      } catch (e) {
        console.error("Error fetching User claimedStakeBalance::", e);
      }
      return { ...state, claimedStakeBalance, claimedStakeLoading };
    }
    case "providerBalanceLoading": {
      return { ...state, providerBalanceLoading: action.payload };
    }
    case "fetchProviderBalance": {
      let providerBalance = state.providerBalance;
      let providerBalanceLoading = !state.providerBalanceLoading;
      try {
        if (context.actors.modclub && state.userProfile) {
          const actor = context.actors.modclub.value;
          providerBalance = await actor.providerSaBalance("RESERVE", [
            state.providerId,
          ]);
        }
      } catch (e) {
        console.error("Error fetching Provider Balance::", e);
      }
      return { ...state, providerBalance, providerBalanceLoading };
    }
    case "rsLoading": {
      return { ...state, rsLoading: action.payload };
    }
    case "fetchUserRS": {
      let rs = state.rs;
      try {
        if (context.actors.rs && state.loginPrincipalId) {
          const actor = context.actors.rs.value;
          console.log("Fetching RS::", state.loginPrincipalId);
          rs = await timeout(
            5000,
            actor.queryRSAndLevelByPrincipal(
              Principal.from(state.loginPrincipalId)
            )
          );
        }
      } catch (e) {
        console.error("Error fetching RS::", e);
      }
      let rsLoading = !state.rsLoading;
      return { ...state, rs, rsLoading };
    }
    case "fetchContentModerationTasks": {
      let newTasks = [];
      try {
        if (context.actors.modclub) {
          const actor = context.actors.modclub.value;
          newTasks = await actor.getTasks(
            state.moderationTasksPageStartIndex as unknown as bigint,
            (state.moderationTasksPageStartIndex +
              state.moderationTasksPageSize) as unknown as bigint,
            action.payload // FILTER_VOTES
          );
          newTasks = newTasks.filter(
            (newTask) =>
              state.contentModerationTasks.find((t) => t.id == newTask.id) ==
              undefined
          );
        }
      } catch (e) {
        console.error("Error fetching ContentModerationTasks::", e);
      }
      return {
        ...state,
        moderationTasksLoading: false,
        contentModerationTasks: [...newTasks],
      };
    }
    case "refetchContentModerationTasks": {
      let contentModerationTasks = state.contentModerationTasks;
      try {
        if (context.actors.modclub) {
          const actor = context.actors.modclub.value;
          contentModerationTasks = await actor.getTasks(
            state.moderationTasksPageStartIndex as unknown as bigint,
            (state.moderationTasksPageStartIndex +
              state.moderationTasksPageSize) as unknown as bigint,
            action.payload // FILTER_VOTES
          );
        }
      } catch (e) {
        console.error("Error fetching ContentModerationTasks::", e);
      }
      return {
        ...state,
        moderationTasksLoading: false,
        contentModerationTasks,
      };
    }
    case "setModerationTasksLoading": {
      return { ...state, moderationTasksLoading: action.payload.status };
    }
    case "setModerationTasksPage": {
      return {
        ...state,
        moderationTasksLoading: true,
        moderationTasksPage: action.payload.page,
        moderationTasksPageStartIndex: action.payload.startIndex,
      };
    }
    case "setProviderId": {
      return {
        ...state,
        providerId: action.payload,
        providerBalanceLoading: true,
      };
    }
    case "setPohReservedContent": {
      return { ...state, pohReservedContent: action.payload };
    }

    case "setContentReservedTime": {
      return { ...state, contentReservedTime: action.payload };
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}
