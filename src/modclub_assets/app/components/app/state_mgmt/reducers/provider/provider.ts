export async function providerBalanceLoading(context, payload) {
  context.dispatch({
    type: "providerBalanceLoading",
    providerBalanceLoading: payload,
  });
}

export async function fetchProviderBalance(context, payload) {
  let state = context.state;
  let providerBalance = state.providerBalance;
  let providerBalanceLoading = false;
  try {
    const actor = context.icContext.actors.modclub?.value;
    if (actor) {
      providerBalance = await actor.providerSaBalance("RESERVE", [
        state.selectedProvider.id,
      ]);
    }
  } catch (e) {
    console.error("Error fetching Provider Balance::", e);
  }
  context.dispatch({
    type: "fetchProviderBalance",
    providerBalance,
    providerBalanceLoading,
  });
}

export async function providerBufferBalanceLoading(context, payload) {
  context.dispatch({
    type: "providerBufferBalanceLoading",
    providerBufferBalanceLoading: payload,
  });
}

export async function fetchProviderBufferBalance(context, payload) {
  let state = context.state;
  let providerBufferBalance = state.providerBufferBalance;
  let providerBufferBalanceLoading = false;
  try {
    const actor = context.icContext.actors.modclub?.value;
    if (actor) {
      providerBufferBalance = await actor.providerSaBalance("ACCOUNT_PAYABLE", [
        state.selectedProvider.id,
      ]);
    }
  } catch (e) {
    console.error("Error fetching Provider Balance::", e);
  }
  context.dispatch({
    type: "fetchProviderBufferBalance",
    providerBufferBalance,
    providerBufferBalanceLoading,
  });
}

export async function fetchContentProviders(context, payload) {
  let providers = context.state.contentProviders;
  try {
    const actor = context.icContext.actors.modclub?.value;
    if (actor) {
      providers = await actor.getContentProviders();
    }
  } catch (e) {
    console.error("Error fetching ContentProviders::", e);
  }
  context.dispatch({
    type: "fetchContentProviders",
    contentProviders: providers.map((p) => ({
      id: p[0].toText(),
      name: p[1].name,
    })),
  });
}

export async function setProviderId(context, payload) {
  context.dispatch({
    type: "setProviderId",
    providerId: payload,
    providerBalanceLoading: true,
    providerBufferBalanceLoading: true,
  });
}
