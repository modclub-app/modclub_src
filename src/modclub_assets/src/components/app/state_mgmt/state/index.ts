export const initialState = {
  decimals: 1, // impossible to divide by zero
  transactionFee: 0,
  loginPrincipalId: null,
  userProfile: null,
  requiresSignUp: false,
  isAdminUser: false,
  systemBalance: 0,
  personalBalance: 0,
  systemBalanceLoading: true,
  personalBalanceLoading: true,
  stakeBalanceLoading: true,
  lockedBalance: 0,
  lockedBalanceLoading: true,
  canClaimRewards: false,
  claimRewardAmount: 0,
  claimRewardPrice: 0,
  stakeBalance: 0,
  rs: { level: "", score: 0 },
  rsLoading:false,
  leaderboardContent: [],
  contentModerationTasks: [],
  moderationTasksLoading: false,
  moderationTasksPage: 1,
  moderationTasksPageStartIndex: 0,
  moderationTasksPageSize: 20,
  unlockStakeBalance: 0,
  unlockStakeLoading: true,
  claimedStakeBalance: 0,
  claimedStakeLoading: true,
  pendingStakeBalance: 0,
  pendingStakeLoading: true,
  providerBalance: 0,
  providerBalanceLoading: true,
  providerId: null,
  pohReservedContent: null,
  contentReservedTime: 0,
};
