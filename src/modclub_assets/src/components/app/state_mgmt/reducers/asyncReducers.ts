import { Principal } from "@dfinity/principal";
import { getModeratorLeaderboard } from "../../../../utils/api";
import * as Constants from "../../../../utils/constant";

export async function asyncReducers(asyncState, action) {
  const state = await Promise.resolve(asyncState);
  const context = action.context;

  switch (action.type) {
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

      return { ...state, lockedBalance, lockedBalanceLoading };
    }
    case "personalBalanceLoading": {
      return { ...state, personalBalanceLoading: action.payload };
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
        if (context.actors.vesting && state.userProfile) {
          const actor = context.actors.vesting.value;
          stakeBalance = await actor.staked_for({
            owner: state.userProfile.id,
            subaccount: [],
          });
        }
      } catch (e) {
        console.error("Error fetching UserStakeBalance::", e);
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
        if (context.actors.vesting && state.userProfile) {
          const actor = context.actors.vesting.value;
          unlockStakeBalance = await actor.unlocked_stakes_for({
            owner: state.userProfile.id,
            subaccount: [],
          });
        }
      } catch (e) {
        console.error("Error fetching UserStakeBalance::", e);
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
        if (context.actors.vesting && state.userProfile) {
          const actor = context.actors.vesting.value;
          claimedStakeBalance = await actor.unlocked_stakes_for({
            owner: state.userProfile.id,
            subaccount: [],
          });
        }
      } catch (e) {
        console.error("Error fetching UserStakeBalance::", e);
      }
      return { ...state, claimedStakeBalance, claimedStakeLoading };
    }
    
    case "fetchUserRS": {
      let rs = state.rs;
      try {
        if (context.actors.rs && state.userProfile) {
          const actor = context.actors.rs.value;
          rs = await actor.queryRSAndLevelByPrincipal(state.userProfile.id);
        }
      } catch (e) {
        console.error("Error fetching RS::", e);
      }
      return { ...state, rs };
    }
    case "fetchLeaderBoard": {
      let leaderboardContent = state.leaderboardContent;
      try {
        if (context.actors.modclub && state.userProfile) {
          const actor = context.actors.modclub.value;
          const newProfile = await getModeratorLeaderboard(
            actor,
            Constants.LB_PAGE_SIZE,
            action.payload.page
          );
          leaderboardContent = [...leaderboardContent, ...newProfile];
        }
      } catch (e) {
        console.error("Error fetching RS::", e);
      }
      return { ...state, leaderboardContent };
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
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}
