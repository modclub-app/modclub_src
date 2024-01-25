import { Principal } from "@dfinity/principal";

export async function setLoginPrincipalId(context, payload) {
  context.dispatch({
    type: "setLoginPrincipalId",
    loginPrincipalId: payload,
  });
}

export async function fetchUserProfile(context, payload) {
  let { userProfile, requiresSignUp } = context.state;

  try {
    const actor = context.icContext.actors.modclub?.value;
    if (actor) {
      userProfile = await actor.getProfile();
      requiresSignUp = false;
    }
  } catch (e) {
    console.error("Error fetching UserProfile::", e);
    requiresSignUp = true;
  }
  context.dispatch({ type: "fetchUserProfile", userProfile, requiresSignUp });
}

export async function updateUserEmail(context, payload) {
  let userProfile = context.state.userProfile;
  try {
    const actor = context.icContext.actors.modclub?.value;
    if (actor) {
      userProfile = await actor.updateEmail(payload);
    }
  } catch (e) {
    console.error("Error occurs on UserProfile upgrade ", e);
  }
  context.dispatch({ type: "updateUserProfile", userProfile });
}

export async function fetchIsUserAdmin(context, payload) {
  let isAdminUser = context.state.isAdminUser;
  try {
    const actor = context.icContext.actors.modclub?.value;
    if (actor) {
      await actor.showAdmins();
      isAdminUser = true;
    }
  } catch (e) {
    isAdminUser = false;
  }
  context.dispatch({ type: "fetchIsUserAdmin", isAdminUser });
}

export async function fetchUserProviders(context, payload) {
  let userProviders = context.state.userProviders;
  let selectedProvider = context.state.selectedProvider;
  try {
    const actor = context.icContext.actors.modclub?.value;
    if (actor) {
      userProviders = await actor.getAdminProviderIDs();
      if (userProviders[0]) {
        selectedProvider = await actor.getProvider(userProviders[0]);
      }
    }
  } catch (e) {
    console.error("Error fetchUserProviders::", e);
  }
  context.dispatch({
    type: "fetchUserProviders",
    userProviders,
    selectedProvider,
  });
}

export async function systemBalanceLoading(context, payload) {
  context.dispatch({
    type: "systemBalanceLoading",
    systemBalanceLoading: payload,
  });
}

export async function fetchUserSystemBalance(context, payload) {
  let state = context.state;
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
      context.dispatch({
        type: "fetchUserSystemBalance",
        systemBalance,
        systemBalanceLoading,
      });
      return;
    }
    const actor = context.icContext.actors.wallet?.value;
    if (actor) {
      systemBalance = await actor.icrc1_balance_of({
        owner: Principal.from(context.icContext.canisters.modclub.canisterId),
        subaccount: [ap_sub_acc_rec[1]],
      });
    }
  } catch (e) {
    console.error("Error fetching UserSystemBalance::", e);
  }

  context.dispatch({
    type: "fetchUserSystemBalance",
    systemBalance,
    systemBalanceLoading,
  });
}

export async function personalBalanceLoading(context, payload) {
  context.dispatch({
    type: "personalBalanceLoading",
    personalBalanceLoading: payload,
  });
}

export async function fetchUserPersonalBalance(context, payload) {
  let personalBalance = context.state.personalBalance;
  try {
    const actor = context.icContext.actors.wallet?.value;
    if (actor && context.state.loginPrincipalId) {
      personalBalance = await actor.icrc1_balance_of({
        owner: Principal.from(context.state.loginPrincipalId),
        subaccount: [],
      });
    }
  } catch (e) {
    console.error("Error fetching UserPersonalBalance::", e);
  }
  let personalBalanceLoading = !context.state.personalBalanceLoading;
  context.dispatch({
    type: "fetchUserPersonalBalance",
    personalBalance,
    personalBalanceLoading,
  });
}

export async function rsLoading(context, payload) {
  context.dispatch({ type: "rsLoading", rsLoading: payload });
}

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

export async function fetchUserRS(context, payload) {
  let state = context.state;
  let rs = state.rs;
  try {
    const actor = context.icContext.actors.rs?.value;
    if (actor && state.loginPrincipalId) {
      console.log("Fetching RS::", state.loginPrincipalId);
      rs = await timeout(
        5000,
        actor.queryRSAndLevelByPrincipal(Principal.from(state.loginPrincipalId))
      );
    }
  } catch (e) {
    console.error("Error fetching RS::", e);
  }
  let rsLoading = !state.rsLoading;
  context.dispatch({ type: "fetchUserRS", rs, rsLoading });
}
