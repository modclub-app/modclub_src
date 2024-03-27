import { dropNotification, dropError, appendError } from "./internalEvents";
import {
  fetchDecimals,
  fetchTransactionFee,
  accountDepositAction,
  accountWithdrawAction,
  depositToBalance,
  withdrawModeratorReward,
} from "./tokenLedger";
import {
  setModerationTasksLoading,
  setModerationTasksPage,
  setContentReservedTime,
  setPohReservedContent,
  refetchContentModerationTasks,
} from "./moderationTasks";
import {
  setContentProvidersFilter,
  setContentCategoriesFilter,
  fetchContentCategories,
} from "./contentFilters";
import { claimRewardsAction, claimRewards } from "./rewards";

export const getCommonReducers = (state, icContext, dispatch) => {
  const context = { state, icContext, dispatch };
  return new Map([
    ["fetchDecimals", (payload) => fetchDecimals(context, payload)],
    ["fetchTransactionFee", (payload) => fetchTransactionFee(context, payload)],
    [
      "setModerationTasksLoading",
      (payload) => setModerationTasksLoading(context, payload),
    ],
    [
      "setModerationTasksPage",
      (payload) => setModerationTasksPage(context, payload),
    ],
    [
      "setContentReservedTime",
      (payload) => setContentReservedTime(context, payload),
    ],
    [
      "setPohReservedContent",
      (payload) => setPohReservedContent(context, payload),
    ],
    [
      "refetchContentModerationTasks",
      (payload) => refetchContentModerationTasks(context, payload),
    ],
    [
      "setContentProvidersFilter",
      (payload) => setContentProvidersFilter(context, payload),
    ],
    [
      "setContentCategoriesFilter",
      (payload) => setContentCategoriesFilter(context, payload),
    ],
    [
      "fetchContentCategories",
      (payload) => fetchContentCategories(context, payload),
    ],
    [
      "accountDepositAction",
      (payload) => accountDepositAction(context, payload),
    ],
    ["depositToBalance", (payload) => depositToBalance(context, payload)],
    [
      "withdrawModeratorReward",
      (payload) => withdrawModeratorReward(context, payload),
    ],
    [
      "accountWithdrawAction",
      (payload) => accountWithdrawAction(context, payload),
    ],
    ["claimRewardsAction", (payload) => claimRewardsAction(context, payload)],
    ["claimRewards", (payload) => claimRewards(context, payload)],
    ["dropNotification", (payload) => dropNotification(context, payload)],
    ["appendError", (payload) => appendError(context, payload)],
    ["dropError", (payload) => dropError(context, payload)],
  ]);
};
