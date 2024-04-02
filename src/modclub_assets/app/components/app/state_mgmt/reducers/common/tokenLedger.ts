import { Principal } from "@dfinity/principal";
import { convert_to_mod, convert_from_mod } from "../../../../../utils/util";

export async function fetchDecimals(context, payload) {
  let decimals = context.state.decimals;
  try {
    const actor = context.icContext.actors.wallet?.value;
    if (actor) {
      decimals = await actor.icrc1_decimals();
    }
  } catch (e) {
    console.error("Error fetching Decimals::", e);
  }
  context.dispatch({ type: "fetchDecimals", decimals });
}

export async function fetchTransactionFee(context, payload) {
  let transactionFee = context.state.transactionFee;
  try {
    const actor = context.icContext.actors.wallet?.value;
    if (actor) {
      transactionFee = await actor.icrc1_fee();
      context.dispatch({ type: "fetchTransactionFee", transactionFee });
    }
  } catch (e) {
    console.error("Error fetching TransactionFee::", e);
  }
}

export async function accountDepositAction(context, payload) {
  context.dispatch({ type: "accountDepositAction", payload });
}

export async function depositToBalance(context, payload) {
  try {
    const actor = context.icContext.actors.wallet?.value;
    if (actor) {
      const targetAcc = {
        owner: Principal.from(context.icContext.canisters.modclub.canisterId),
        subaccount: [context.state.accountDepositAction.subAcc],
      };
      const params: any = {
        to: targetAcc,
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        amount: context.state.accountDepositAction.amount,
      };
      const amountMOD = convert_to_mod(
        context.state.accountDepositAction.amount,
        context.state.decimals
      );
      const res = await actor.icrc1_transfer(params);

      context.dispatch({ type: "accountDepositAction", payload: null });
      if (res.Ok) {
        context.dispatch({
          type: "appendNotification",
          payload: `You have successfully deposit ${amountMOD} MOD into your Modclub wallet. Time to start your journey with Modclub.`,
        });
        context.dispatch({
          type: "personalBalanceLoading",
          personalBalanceLoading: true,
        });
        context.dispatch({
          type: "systemBalanceLoading",
          systemBalanceLoading: true,
        });
        if (context.state.selectedProvider?.id) {
          context.dispatch({
            type: "providerBalanceLoading",
            providerBalanceLoading: true,
          });
        }
      } else {
        const transferError = Object.keys(res.Err)[0];
        context.dispatch({
          type: "appendError",
          payload: `Failed to deposit ${amountMOD} MOD. ERROR: ${
            transferError || ""
          }`,
        });
      }
    } else {
      throw Error("wallet is not initialized.");
    }
  } catch (e) {
    console.error("Error depositToBalance:", e);
    context.dispatch({
      type: "appendError",
      payload: `Failed to deposit. ERROR: ${e.message || ""}`,
    });
  }
}

export async function accountWithdrawAction(context, payload) {
  context.dispatch({ type: "accountWithdrawAction", payload });
}

export async function withdrawModeratorReward(context, payload) {
  try {
    const actor = context.icContext.actors.modclub?.value;
    if (actor) {
      const amountMOD = context.state.accountWithdrawAction.amount;
      // Convert amount to the lowest denomination and ensure it's an integer
      const amountInLowestDenom = Math.round(
        convert_from_mod(amountMOD, context.state.decimals)
      );

      const targetPrincipal = context.state.accountWithdrawAction.target;

      let res = await actor.withdrawModeratorReward(
        amountInLowestDenom,
        targetPrincipal ? [Principal.fromText(targetPrincipal)] : []
      );

      context.dispatch({ type: "accountWithdrawAction", payload: null });
      if (res.ok) {
        context.dispatch({
          type: "appendNotification",
          payload: `You have successfully withdraw ${amountMOD} MOD back into your own wallet.`,
        });
        context.dispatch({
          type: "personalBalanceLoading",
          personalBalanceLoading: true,
        });
        context.dispatch({
          type: "systemBalanceLoading",
          systemBalanceLoading: true,
        });
      } else {
        context.dispatch({
          type: "appendError",
          payload: `Failed to withdraw ${amountMOD} MOD. ERROR: ${
            res.err || ""
          }`,
        });
      }
    } else {
      throw Error("modclub-agent is not initialized.");
    }
  } catch (e) {
    console.error("Error Withdraw:", e);
    context.dispatch({
      type: "appendError",
      payload: `Failed to withdraw. ERROR: ${e.message || ""}`,
    });
  }
}
