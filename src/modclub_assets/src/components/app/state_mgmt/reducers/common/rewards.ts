import { Principal } from "@dfinity/principal";
import { convert_to_mod, convert_from_mod } from "../../../../../utils/util";

export async function claimRewardsAction(context, payload) {
  context.dispatch({ type: "claimRewardsAction", payload });
}

export async function claimRewards(context, payload) {
  try {
    const actor = context.icContext.actors.modclub?.value;
    if (actor) {
      const amountMOD = context.state.claimRewardsAction.amount;
      let res = await actor.claimLockedReward(
        convert_from_mod(amountMOD, context.state.decimals),
        []
      );

      context.dispatch({ type: "claimRewardsAction", payload: null });
      if (res.ok) {
        context.dispatch({
          type: "appendNotification",
          payload: `You have successfully claimed ${amountMOD} MOD.`,
        });
        context.dispatch({
          type: "systemBalanceLoading",
          systemBalanceLoading: true,
        });
        context.dispatch({
          type: "fetchUserLockedBalance",
          lockedBalanceLoading: true,
        });
      } else {
        context.dispatch({
          type: "appendError",
          payload: `Failed to Claim ${amountMOD} MOD. ERROR: ${res.err || ""}`,
        });
      }
    } else {
      throw Error("modclub-agent is not initialized.");
    }
  } catch (e) {
    console.error("Error occurs during Reward Claim:", e);
    context.dispatch({
      type: "appendError",
      payload: `Failed to Claim Rewards. ERROR: ${e.message || ""}`,
    });
  }
}
