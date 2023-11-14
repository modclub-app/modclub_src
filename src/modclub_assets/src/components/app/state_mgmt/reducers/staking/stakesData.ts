import { Principal } from "@dfinity/principal";

export async function pendingStakeListLoading(context, payload) {
  dispatch({
    type: "pendingStakeListLoading",
    pendingStakeListLoading: payload,
  });
}

export async function fetchUserLockBlock(context, payload) {
  let pendingStakeList = context.state.pendingStakeList;
  let pendingStakeListLoading = !context.state.pendingStakeListLoading;
  try {
    const actor = context.icContext.actors.vesting?.value;
    if (actor && context.state.loginPrincipalId) {
      pendingStakeList = await actor.pending_stakes_for({
        owner: Principal.from(context.state.loginPrincipalId),
        subaccount: [],
      });
    }
  } catch (e) {
    console.error("Error fetching User pendingStakeList::", e);
  }
  context.dispatch({
    type: "fetchUserLockBlock",
    pendingStakeList,
    pendingStakeListLoading,
  });
}

export async function setReleaseUnStakedLoading(context, payload) {
  context.dispatch({
    type: "setReleaseUnStakedLoading",
    releaseUnStakedLoading: payload,
  });
}

export async function releaseUnStakedTokens(context, payload) {
  let unlockStakeBalance = context.state.unlockStakeBalance;
  try {
    const modclubActor = context.icContext.actors.vesting?.value;
    const vestingActor = context.icContext.actors.vesting?.value;
    if (modclubActor && vestingActor && context.state.loginPrincipalId) {
      const releaseResp = await modclubActor.releaseTokens(unlockStakeBalance);
      if (releaseResp.Ok) {
        unlockStakeBalance = await vestingActor.unlocked_stakes_for({
          owner: Principal.from(context.state.loginPrincipalId),
          subaccount: [],
        });
      }
    }
  } catch (e) {
    console.error("Error occurs with releaseUnStakedTokens::", e);
  }

  context.dispatch({
    type: "releaseUnStakedTokens",
    unlockStakeBalance,
    releaseUnStakedLoading: false,
    systemBalanceLoading: true,
  });
}
