import {
  setLoginPrincipalId,
  fetchUserProfile,
  fetchIsUserAdmin,
  fetchUserProviders,
  systemBalanceLoading,
  fetchUserSystemBalance,
  personalBalanceLoading,
  fetchUserPersonalBalance,
  rsLoading,
  fetchUserRS,
} from "./moderator";

export const getModeratorReducers = (state, icContext, dispatch) => {
  const context = { state, icContext, dispatch };
  return new Map([
    ["setLoginPrincipalId", (payload) => setLoginPrincipalId(context, payload)],
    ["fetchUserProfile", (payload) => fetchUserProfile(context, payload)],
    ["fetchIsUserAdmin", (payload) => fetchIsUserAdmin(context, payload)],
    ["fetchUserProviders", (payload) => fetchUserProviders(context, payload)],
    [
      "systemBalanceLoading",
      (payload) => systemBalanceLoading(context, payload),
    ],
    [
      "fetchUserSystemBalance",
      (payload) => fetchUserSystemBalance(context, payload),
    ],
    [
      "personalBalanceLoading",
      (payload) => personalBalanceLoading(context, payload),
    ],
    [
      "fetchUserPersonalBalance",
      (payload) => fetchUserPersonalBalance(context, payload),
    ],
    ["rsLoading", (payload) => rsLoading(context, payload)],
    ["fetchUserRS", (payload) => fetchUserRS(context, payload)],
  ]);
};
