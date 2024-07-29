import {
  providerBalanceLoading,
  fetchProviderBalance,
  providerBufferBalanceLoading,
  fetchProviderBufferBalance,
  fetchContentProviders,
  setProviderId,
} from "./provider";

export const getProviderReducers = (state, icContext, dispatch) => {
  const context = { state, icContext, dispatch };
  return new Map([
    [
      "providerBalanceLoading",
      (payload) => providerBalanceLoading(context, payload),
    ],
    [
      "fetchProviderBalance",
      (payload) => fetchProviderBalance(context, payload),
    ],
    [
      "providerBufferBalanceLoading",
      (payload) => providerBufferBalanceLoading(context, payload),
    ],
    [
      "fetchProviderBufferBalance",
      (payload) => fetchProviderBufferBalance(context, payload),
    ],
    [
      "fetchContentProviders",
      (payload) => fetchContentProviders(context, payload),
    ],
    ["setProviderId", (payload) => setProviderId(context, payload)],
  ]);
};
