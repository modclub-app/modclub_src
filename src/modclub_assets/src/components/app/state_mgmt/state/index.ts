export const initialState = {
  decimals: 0,
  userProfile: null,
  requiresSignUp: false,
  isAdminUser: false,
  systemBalance: 0,
  personalBalance: 0,
  systemBalanceLoading: true,
  personalBalanceLoading: true,
  stakeBalanceLoading: true,
  lockedBalance: 0,
  canClaimRewards: false,
  claimRewardAmount: 0,
  claimRewardPrice: 0,
  stakeBalance: 0,
  rs: { level: "", score: 0 },
  leaderboardContent: [],
  contentModerationTasks: [],
  moderationTasksLoading: false,
  moderationTasksPage: 1,
  moderationTasksPageStartIndex: 0,
  moderationTasksPageSize: 20,
};
