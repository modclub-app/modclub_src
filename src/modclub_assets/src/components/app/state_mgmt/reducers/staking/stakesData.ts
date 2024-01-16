import { Principal } from "@dfinity/principal";
import { convert_to_mod, convert_from_mod } from "../../../../../utils/util";

export async function pendingStakeListLoading(context, payload) {
  context.dispatch({
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
    const modclubActor = context.icContext.actors.modclub?.value;
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

export async function stakeTokensAction(context, payload) {
  context.dispatch({ type: "stakeTokensAction", payload });
}

export async function stakeTokens(context, payload) {
  try {
    const actor = context.icContext.actors.modclub?.value;
    if (actor) {
      const amountMOD = context.state.stakeTokensAction.amount;
      let res = await actor.stakeTokens(
        convert_from_mod(amountMOD, context.state.decimals)
      );

      context.dispatch({ type: "stakeTokensAction", payload: null });
      if (res.Ok) {
        context.dispatch({
          type: "appendNotification",
          payload: `You have successfully Staked ${amountMOD} MOD.`,
        });
        context.dispatch({
          type: "systemBalanceLoading",
          systemBalanceLoading: true,
        });
        context.dispatch({
          type: "stakeBalanceLoading",
          stakeBalanceLoading: true,
        });
      } else {
        context.dispatch({
          type: "appendError",
          payload: `Failed to Stake ${amountMOD} MOD. ERROR: ${res.err || ""}`,
        });
      }
    } else {
      throw Error("modclub-agent is not initialized.");
    }
  } catch (e) {
    console.error("Error occurs during Stake:", e);
    context.dispatch({
      type: "appendError",
      payload: `Failed to Stake. ERROR: ${e.message || ""}`,
    });
  }
}

export async function unstakeTokensAction(context, payload) {
  context.dispatch({ type: "unstakeTokensAction", payload });
}

export async function unstakeTokens(context, payload) {
  try {
    const actor = context.icContext.actors.modclub?.value;
    if (actor) {
      const amountMOD = context.state.unstakeTokensAction.amount;
      let res = await actor.claimStakedTokens(
        convert_from_mod(amountMOD, context.state.decimals)
      );

      context.dispatch({ type: "unstakeTokensAction", payload: null });
      if (res.ok) {
        context.dispatch({
          type: "appendNotification",
          payload: `You have successfully claimed Unstake for ${amountMOD} MOD.`,
        });
        context.dispatch({
          type: "stakeBalanceLoading",
          stakeBalanceLoading: true,
        });
        context.dispatch({
          type: "pendingStakeListLoading",
          pendingStakeListLoading: true,
        });
      } else {
        context.dispatch({
          type: "appendError",
          payload: `Failed to Unstake ${amountMOD} MOD. ERROR: ${
            res.err || ""
          }`,
        });
      }
    } else {
      throw Error("modclub-agent is not initialized.");
    }
  } catch (e) {
    console.error("Error occurs during Unstake:", e);
    context.dispatch({
      type: "appendError",
      payload: `Failed to Unstake. ERROR: ${e.message || ""}`,
    });
  }
}
