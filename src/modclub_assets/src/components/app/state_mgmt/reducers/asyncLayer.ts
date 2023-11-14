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

export async function asyncLayer(state, action, dispatch) {
  const context = action.context;

  switch (action.type) {
    case "setLoginPrincipalId": {
      dispatch({
        type: "setLoginPrincipalId",
        loginPrincipalId: action.payload,
      });
      break;
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
      dispatch({ type: "fetchUserProfile", userProfile, requiresSignUp });
      break;
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
        isAdminUser = false;
      }
      dispatch({ type: "fetchIsUserAdmin", isAdminUser });
      break;
    }
    case "fetchUserProviders": {
      let userProviders = state.userProviders;
      let selectedProvider = state.selectedProvider;
      try {
        if (context.actors.modclub) {
          const actor = context.actors.modclub.value;
          userProviders = await actor.getAdminProviderIDs();
          if (userProviders[0]) {
            selectedProvider = await actor.getProvider(userProviders[0]);
          }
        }
      } catch (e) {
        console.error("Error fetchUserProviders::", e);
      }
      dispatch({ type: "fetchUserProviders", userProviders, selectedProvider });
      break;
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
      dispatch({ type: "fetchDecimals", decimals });
      break;
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
      dispatch({ type: "fetchTransactionFee", transactionFee: transactionFee });
      break;
    }
    case "systemBalanceLoading": {
      dispatch({
        type: "systemBalanceLoading",
        systemBalanceLoading: action.payload,
      });
      break;
    }
    case "fetchUserSystemBalance": {
      let systemBalance = state.systemBalance;
      let systemBalanceLoading = !state.systemBalanceLoading;
      const ap_sub_acc_rec = state.userProfile.subaccounts.find(
        (item) => item[0] === "ACCOUNT_PAYABLE"
      );

      try {
        if (!ap_sub_acc_rec) {
          console.error(
            "Error: No ACCOUNT_PAYABLE subaccount found to fetch UserSystemBalance."
          );
          dispatch({
            type: "fetchUserSystemBalance",
            systemBalance,
            systemBalanceLoading,
          });
          break;
        }
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

      dispatch({
        type: "fetchUserSystemBalance",
        systemBalance,
        systemBalanceLoading,
      });
      break;
    }
    case "lockedBalanceLoading": {
      dispatch({
        type: "lockedBalanceLoading",
        lockedBalanceLoading: action.payload,
      });
      break;
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

      dispatch({
        type: "fetchUserLockedBalance",
        lockedBalance,
        lockedBalanceLoading,
      });
      break;
    }
    case "personalBalanceLoading": {
      dispatch({
        type: "personalBalanceLoading",
        personalBalanceLoading: action.payload,
      });
      break;
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
      dispatch({
        type: "fetchUserPersonalBalance",
        personalBalance,
        personalBalanceLoading,
      });
      break;
    }
    case "stakeBalanceLoading": {
      dispatch({
        type: "stakeBalanceLoading",
        stakeBalanceLoading: action.payload,
      });
      break;
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
      dispatch({
        type: "fetchUserStakedBalance",
        stakeBalance,
        stakeBalanceLoading,
      });
      break;
    }
    case "unlockStakeLoading": {
      dispatch({
        type: "unlockStakeLoading",
        unlockStakeLoading: action.payload,
      });
      break;
    }
    case "fetchUserUnlockedStakeBalance": {
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
      dispatch({
        type: "fetchUserUnlockedStakeBalance",
        unlockStakeBalance,
        unlockStakeLoading,
      });
      break;
    }
    case "claimedStakeLoading": {
      dispatch({
        type: "claimedStakeLoading",
        claimedStakeLoading: action.payload,
      });
      break;
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
      dispatch({
        type: "fetchUserClaimedStakedBalance",
        claimedStakeBalance,
        claimedStakeLoading,
      });
      break;
    }
    case "pendingStakeListLoading": {
      dispatch({
        type: "pendingStakeListLoading",
        pendingStakeListLoading: action.payload,
      });
      break;
    }
    case "fetchUserLockBlock": {
      let pendingStakeList = state.pendingStakeList;
      let pendingStakeListLoading = !state.pendingStakeListLoading;
      try {
        if (context.actors.vesting && state.loginPrincipalId) {
          const actor = context.actors.vesting.value;
          pendingStakeList = await actor.pending_stakes_for({
            owner: Principal.from(state.loginPrincipalId),
            subaccount: [],
          });
        }
      } catch (e) {
        console.error("Error fetching User pendingStakeList::", e);
      }
      dispatch({
        type: "fetchUserLockBlock",
        pendingStakeList,
        pendingStakeListLoading,
      });
      break;
    }
    case "providerBalanceLoading": {
      dispatch({
        type: "providerBalanceLoading",
        providerBalanceLoading: action.payload,
      });
      break;
    }
    case "fetchProviderBalance": {
      let providerBalance = state.providerBalance;
      let providerBalanceLoading = false;
      try {
        if (context.actors.modclub && state.selectedProvider.id) {
          const actor = context.actors.modclub.value;
          providerBalance = await actor.providerSaBalance("RESERVE", [
            state.selectedProvider.id,
          ]);
        }
      } catch (e) {
        console.error("Error fetching Provider Balance::", e);
      }
      dispatch({
        type: "fetchProviderBalance",
        providerBalance,
        providerBalanceLoading,
      });
      break;
    }
    case "rsLoading": {
      dispatch({ type: "rsLoading", rsLoading: action.payload });
      break;
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
      dispatch({ type: "fetchUserRS", rs, rsLoading });
      break;
    }
    case "refetchContentModerationTasks": {
      let contentModerationTasks = state.contentModerationTasks;
      let tasks = [];
      try {
        if (context.actors.modclub) {
          const actor = context.actors.modclub.value;
          const startIndex =
            state.moderationTasksPageStartIndex as unknown as bigint;
          const endIndex = (state.moderationTasksPageStartIndex +
            state.moderationTasksPageSize) as unknown as bigint;
          tasks = await actor.getTasks(
            startIndex,
            endIndex,
            action.payload.FILTER_VOTES,
            {
              providers: Boolean(state.contentProvidersFilter)
                ? [[Principal.from(state.contentProvidersFilter)]]
                : [],
              categories: Boolean(state.contentCategoriesFilter)
                ? [[state.contentCategoriesFilter]]
                : [],
            } // filtering
          );
          console.log("FETCHED_TASKS::", tasks);
        }
      } catch (e) {
        console.error("Error fetching ContentModerationTasks::", e);
      }
      dispatch({
        type: "refetchContentModerationTasks",
        moderationTasksLoading: false,
        contentModerationTasks: [...tasks],
      });
      break;
    }
    case "fetchContentCategories": {
      let contentCategories = state.contentCategories;
      try {
        if (context.actors.modclub) {
          const actor = context.actors.modclub.value;
          const providerFilter = state.contentProvidersFilter
            ? [Principal.from(state.contentProvidersFilter)]
            : [];
          contentCategories = await actor.getContentCategories(providerFilter);
        }
      } catch (e) {
        console.error("Error fetching ContentCategories::", e);
      }
      dispatch({ type: "fetchContentCategories", contentCategories });
      break;
    }
    case "fetchContentProviders": {
      let providers = state.contentProviders;
      try {
        if (context.actors.modclub) {
          const actor = context.actors.modclub.value;
          providers = await actor.getContentProviders();
        }
      } catch (e) {
        console.error("Error fetching ContentProviders::", e);
      }
      dispatch({
        type: "fetchContentProviders",
        contentProviders: providers.map((p) => ({
          id: p[0].toText(),
          name: p[1].name,
        })),
      });
      break;
    }
    case "setModerationTasksLoading": {
      dispatch({
        type: "setModerationTasksLoading",
        moderationTasksLoading: action.payload.status,
      });
      break;
    }
    case "setModerationTasksPage": {
      dispatch({
        type: "setModerationTasksPage",
        moderationTasksLoading: true,
        moderationTasksPage: action.payload.page,
        moderationTasksPageStartIndex: action.payload.startIndex,
      });
      break;
    }
    case "setProviderId": {
      dispatch({
        type: "setProviderId",
        providerId: action.payload,
        providerBalanceLoading: true,
      });
      break;
    }
    case "setPohReservedContent": {
      dispatch({
        type: "setPohReservedContent",
        pohReservedContent: action.payload,
      });
      break;
    }
    case "setContentReservedTime": {
      dispatch({
        type: "setContentReservedTime",
        contentReservedTime: action.payload,
      });
      break;
    }
    case "setContentProvidersFilter": {
      let contentCategories = state.contentCategories;
      try {
        if (context.actors.modclub) {
          const actor = context.actors.modclub.value;
          const providerFilter = action.payload
            ? [Principal.from(action.payload)]
            : [];
          contentCategories = await actor.getContentCategories(providerFilter);
        }
      } catch (e) {
        console.error("Error fetching ContentCategories::", e);
      }

      dispatch({
        type: "setContentProvidersFilter",
        contentProvidersFilter: action.payload,
        contentCategories,
        contentCategoriesFilter: null,
      });
      break;
    }
    case "setContentCategoriesFilter": {
      dispatch({
        type: "setContentCategoriesFilter",
        contentCategoriesFilter: action.payload,
      });
      break;
    }
    case "setReleaseUnStakedLoading": {
      dispatch({
        type: "setReleaseUnStakedLoading",
        releaseUnStakedLoading: action.payload,
      });
      break;
    }
    case "releaseUnStakedTokens": {
      let unlockStakeBalance = state.unlockStakeBalance;
      try {
        if (context.actors.modclub && context.actors.vesting) {
          const modclubActor = context.actors.modclub.value;
          const vestingActor = context.actors.vesting.value;

          const releaseResp = await modclubActor.releaseTokens(
            unlockStakeBalance
          );
          if (releaseResp.Ok) {
            unlockStakeBalance = await vestingActor.unlocked_stakes_for({
              owner: Principal.from(state.loginPrincipalId),
              subaccount: [],
            });
          }
        }
      } catch (e) {
        console.error("Error occurs with releaseUnStakedTokens::", e);
      }

      dispatch({
        type: "releaseUnStakedTokens",
        unlockStakeBalance,
        releaseUnStakedLoading: false,
        systemBalanceLoading: true,
      });
      break;
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}
