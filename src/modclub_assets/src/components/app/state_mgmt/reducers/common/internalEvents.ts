export async function dropNotification(context, payload) {
  const filtered = context.state.notifications.filter((n) => n != payload);
  context.dispatch({
    type: "setNotifications",
    payload: filtered,
  });
}

export async function appendError(context, payload) {
  context.dispatch({
    type: "appendError",
    payload: `Failed to Unstake ${amountMOD} MOD. ERROR: ${res.err || ""}`,
  });
}

export async function dropError(context, payload) {
  const filtered = context.state.errors.filter((n) => n != payload);
  context.dispatch({
    type: "setErrors",
    payload: filtered,
  });
}
