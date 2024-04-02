import {
  lockedBalanceLoading,
  fetchUserLockedBalance,
  stakeBalanceLoading,
  fetchUserStakedBalance,
  unlockStakeLoading,
  fetchUserUnlockedStakeBalance,
  claimedStakeLoading,
  fetchUserClaimedStakedBalance,
} from "./balances";
import {
  pendingStakeListLoading,
  fetchUserLockBlock,
  setReleaseUnStakedLoading,
  releaseUnStakedTokens,
  stakeTokensAction,
  stakeTokens,
  unstakeTokensAction,
  unstakeTokens,
} from "./stakesData";

export const getStakingReducers = (state, icContext, dispatch) => {
  const context = { state, icContext, dispatch };
  return new Map([
    [
      "lockedBalanceLoading",
      (payload) => lockedBalanceLoading(context, payload),
    ],
    [
      "fetchUserLockedBalance",
      (payload) => fetchUserLockedBalance(context, payload),
    ],
    ["stakeBalanceLoading", (payload) => stakeBalanceLoading(context, payload)],
    [
      "fetchUserStakedBalance",
      (payload) => fetchUserStakedBalance(context, payload),
    ],
    ["unlockStakeLoading", (payload) => unlockStakeLoading(context, payload)],
    [
      "fetchUserUnlockedStakeBalance",
      (payload) => fetchUserUnlockedStakeBalance(context, payload),
    ],
    ["claimedStakeLoading", (payload) => claimedStakeLoading(context, payload)],
    [
      "fetchUserClaimedStakedBalance",
      (payload) => fetchUserClaimedStakedBalance(context, payload),
    ],
    [
      "pendingStakeListLoading",
      (payload) => pendingStakeListLoading(context, payload),
    ],
    ["fetchUserLockBlock", (payload) => fetchUserLockBlock(context, payload)],
    [
      "setReleaseUnStakedLoading",
      (payload) => setReleaseUnStakedLoading(context, payload),
    ],
    [
      "releaseUnStakedTokens",
      (payload) => releaseUnStakedTokens(context, payload),
    ],
    ["stakeTokensAction", (payload) => stakeTokensAction(context, payload)],
    ["stakeTokens", (payload) => stakeTokens(context, payload)],
    ["unstakeTokensAction", (payload) => unstakeTokensAction(context, payload)],
    ["unstakeTokens", (payload) => unstakeTokens(context, payload)],
  ]);
};
