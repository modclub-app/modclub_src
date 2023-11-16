export function reducers(state, action) {
  switch (action.type) {
    case "setLoginPrincipalId": {
      return { ...state, loginPrincipalId: action.loginPrincipalId };
    }
    case "fetchUserProfile": {
      let userProfile = action.userProfile;
      let requiresSignUp = action.requiresSignUp;

      return { ...state, userProfile, requiresSignUp };
    }
    case "updateUserProfile": {
      let userProfile = action.userProfile;

      return { ...state, userProfile };
    }
    case "fetchIsUserAdmin": {
      let isAdminUser = action.isAdminUser;

      return { ...state, isAdminUser };
    }
    case "fetchUserProviders": {
      let userProviders = action.userProviders;
      let selectedProvider = action.selectedProvider;

      return { ...state, userProviders, selectedProvider };
    }
    case "fetchDecimals": {
      let decimals = action.decimals;

      return { ...state, decimals };
    }
    case "fetchTransactionFee": {
      let transactionFee = action.transactionFee;

      return { ...state, transactionFee: transactionFee };
    }
    case "systemBalanceLoading": {
      return { ...state, systemBalanceLoading: action.systemBalanceLoading };
    }
    case "fetchUserSystemBalance": {
      let systemBalance = action.systemBalance;
      let systemBalanceLoading = action.systemBalanceLoading;

      return { ...state, systemBalance, systemBalanceLoading };
    }
    case "lockedBalanceLoading": {
      return { ...state, lockedBalanceLoading: action.lockedBalanceLoading };
    }
    case "fetchUserLockedBalance": {
      let lockedBalance = action.lockedBalance;
      let lockedBalanceLoading = action.lockedBalanceLoading;

      return { ...state, lockedBalance, lockedBalanceLoading };
    }
    case "personalBalanceLoading": {
      return {
        ...state,
        personalBalanceLoading: action.personalBalanceLoading,
      };
    }
    case "fetchUserPersonalBalance": {
      let personalBalance = action.personalBalance;
      let personalBalanceLoading = action.personalBalanceLoading;

      return { ...state, personalBalance, personalBalanceLoading };
    }
    case "stakeBalanceLoading": {
      return { ...state, stakeBalanceLoading: action.stakeBalanceLoading };
    }
    case "fetchUserStakedBalance": {
      let stakeBalance = action.stakeBalance;
      let stakeBalanceLoading = action.stakeBalanceLoading;

      return { ...state, stakeBalance, stakeBalanceLoading };
    }
    case "unlockStakeLoading": {
      return { ...state, unlockStakeLoading: action.unlockStakeLoading };
    }
    case "fetchUserUnlockedStakeBalance": {
      let unlockStakeBalance = action.unlockStakeBalance;
      let unlockStakeLoading = action.unlockStakeLoading;

      return { ...state, unlockStakeBalance, unlockStakeLoading };
    }
    case "claimedStakeLoading": {
      return { ...state, claimedStakeLoading: action.claimedStakeLoading };
    }
    case "fetchUserClaimedStakedBalance": {
      let claimedStakeBalance = action.claimedStakeBalance;
      let claimedStakeLoading = action.claimedStakeLoading;

      return { ...state, claimedStakeBalance, claimedStakeLoading };
    }
    case "pendingStakeListLoading": {
      return {
        ...state,
        pendingStakeListLoading: action.pendingStakeListLoading,
      };
    }
    case "fetchUserLockBlock": {
      let pendingStakeList = action.pendingStakeList;
      let pendingStakeListLoading = action.pendingStakeListLoading;

      return { ...state, pendingStakeList, pendingStakeListLoading };
    }
    case "providerBalanceLoading": {
      return {
        ...state,
        providerBalanceLoading: action.providerBalanceLoading,
      };
    }
    case "fetchProviderBalance": {
      let providerBalance = action.providerBalance;
      let providerBalanceLoading = action.providerBalanceLoading;

      return { ...state, providerBalance, providerBalanceLoading };
    }
    case "rsLoading": {
      return { ...state, rsLoading: action.rsLoading };
    }
    case "fetchUserRS": {
      let rs = action.rs;
      let rsLoading = action.rsLoading;

      return { ...state, rs, rsLoading };
    }
    case "refetchContentModerationTasks": {
      let contentModerationTasks = action.contentModerationTasks;
      let moderationTasksLoading = action.moderationTasksLoading;

      return {
        ...state,
        moderationTasksLoading,
        contentModerationTasks,
      };
    }
    case "fetchContentCategories": {
      let contentCategories = action.contentCategories;

      return { ...state, contentCategories };
    }
    case "fetchContentProviders": {
      let contentProviders = action.contentProviders;

      return { ...state, contentProviders };
    }
    case "setModerationTasksLoading": {
      return {
        ...state,
        moderationTasksLoading: action.moderationTasksLoading,
      };
      break;
    }
    case "setModerationTasksPage": {
      return {
        ...state,
        moderationTasksLoading: action.moderationTasksLoading,
        moderationTasksPage: action.moderationTasksPage,
        moderationTasksPageStartIndex: action.moderationTasksPageStartIndex,
      };
    }
    case "setProviderId": {
      return {
        ...state,
        providerId: action.providerId,
        providerBalanceLoading: action.providerBalanceLoading,
      };
    }
    case "setPohReservedContent": {
      return { ...state, pohReservedContent: action.pohReservedContent };
    }
    case "setContentReservedTime": {
      return { ...state, contentReservedTime: action.contentReservedTime };
    }
    case "setContentProvidersFilter": {
      let contentCategories = action.contentCategories;
      let contentCategoriesFilter = action.contentCategoriesFilter;
      let contentProvidersFilter = action.contentProvidersFilter;

      return {
        ...state,
        contentProvidersFilter,
        contentCategories,
        contentCategoriesFilter,
      };
    }
    case "setContentCategoriesFilter": {
      return {
        ...state,
        contentCategoriesFilter: action.contentCategoriesFilter,
      };
    }
    case "setReleaseUnStakedLoading": {
      return {
        ...state,
        releaseUnStakedLoading: action.releaseUnStakedLoading,
      };
    }
    case "releaseUnStakedTokens": {
      let unlockStakeBalance = action.unlockStakeBalance;
      let releaseUnStakedLoading = action.releaseUnStakedLoading;
      let systemBalanceLoading = action.systemBalanceLoading;

      return {
        ...state,
        unlockStakeBalance,
        releaseUnStakedLoading,
        systemBalanceLoading,
      };
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}
