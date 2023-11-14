import { Principal } from "@dfinity/principal";

export async function lockedBalanceLoading(context, payload) {
  context.dispatch({
    type: "lockedBalanceLoading",
    lockedBalanceLoading: payload,
  });
}

export async function fetchUserLockedBalance(context, payload) {
  let lockedBalance = context.state.lockedBalance;
  let lockedBalanceLoading = !context.state.lockedBalanceLoading;
  try {
    const actor = context.icContext.actors.vesting?.value;
    if (actor && context.state.loginPrincipalId) {
      lockedBalance = await actor.locked_for({
        owner: Principal.from(context.state.loginPrincipalId),
        subaccount: [],
      });
    }
  } catch (e) {
    console.error("Error fetching UserLockedBalance::", e);
  }

  context.dispatch({
    type: "fetchUserLockedBalance",
    lockedBalance,
    lockedBalanceLoading,
  });
}

export async function stakeBalanceLoading(context, payload) {
  context.dispatch({
    type: "stakeBalanceLoading",
    stakeBalanceLoading: payload,
  });
}

export async function fetchUserStakedBalance(context, payload) {
  let stakeBalance = context.state.stakeBalance;
  let stakeBalanceLoading = !context.state.stakeBalanceLoading;
  try {
    const actor = context.icContext.actors.vesting?.value;
    if (actor && context.state.loginPrincipalId) {
      stakeBalance = await actor.staked_for({
        owner: Principal.from(context.state.loginPrincipalId),
        subaccount: [],
      });
    }
  } catch (e) {
    console.error("Error fetching User stakeBalance::", e);
  }
  context.dispatch({
    type: "fetchUserStakedBalance",
    stakeBalance,
    stakeBalanceLoading,
  });
}

export async function unlockStakeLoading(context, payload) {
  context.dispatch({
    type: "unlockStakeLoading",
    unlockStakeLoading: payload,
  });
}

export async function fetchUserUnlockedStakeBalance(context, payload) {
  let unlockStakeBalance = context.state.unlockStakeBalance;
  let unlockStakeLoading = !context.state.unlockStakeLoading;
  try {
    const actor = context.icContext.actors.vesting?.value;
    if (actor && context.state.loginPrincipalId) {
      unlockStakeBalance = await actor.unlocked_stakes_for({
        owner: Principal.from(context.state.loginPrincipalId),
        subaccount: [],
      });
    }
  } catch (e) {
    console.error("Error fetching User unlockStakeBalance::", e);
  }
  context.dispatch({
    type: "fetchUserUnlockedStakeBalance",
    unlockStakeBalance,
    unlockStakeLoading,
  });
}

export async function claimedStakeLoading(context, payload) {
  context.dispatch({
    type: "claimedStakeLoading",
    claimedStakeLoading: payload,
  });
}

export async function fetchUserClaimedStakedBalance(context, payload) {
  let claimedStakeBalance = context.state.claimedStakeBalance;
  let claimedStakeLoading = !context.state.claimedStakeLoading;
  try {
    const actor = context.icContext.actors.vesting?.value;
    if (actor && context.state.loginPrincipalId) {
      let claimedStake = await actor.pending_stakes_for({
        owner: Principal.from(context.state.loginPrincipalId),
        subaccount: [],
      });
      if (claimedStake.length) {
        claimedStakeBalance = 0;
        claimedStake.forEach((cs) => {
          claimedStakeBalance = claimedStakeBalance + parseInt(cs.amount);
        });
      }
    }
  } catch (e) {
    console.error("Error fetching User claimedStakeBalance::", e);
  }
  context.dispatch({
    type: "fetchUserClaimedStakedBalance",
    claimedStakeBalance,
    claimedStakeLoading,
  });
}
