import { fetchDecimals, fetchTransactionFee } from "./tokenLedger";
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
  ]);
};
