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
    }
  } catch (e) {
    console.error("Error fetching TransactionFee::", e);
  }
  context.dispatch({
    type: "fetchTransactionFee",
    transactionFee: transactionFee,
  });
}
