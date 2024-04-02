import { Principal } from "@dfinity/principal";

export async function setContentProvidersFilter(context, payload) {
  let contentCategories = context.state.contentCategories;
  try {
    const actor = context.icContext.actors.modclub?.value;
    if (actor) {
      const providerFilter = payload ? [Principal.from(payload)] : [];
      contentCategories = await actor.getContentCategories(providerFilter);
    }
  } catch (e) {
    console.error("Error fetching ContentCategories::", e);
  }

  context.dispatch({
    type: "setContentProvidersFilter",
    contentProvidersFilter: payload,
    contentCategories,
    contentCategoriesFilter: null,
  });
}

export async function setContentCategoriesFilter(context, payload) {
  context.dispatch({
    type: "setContentCategoriesFilter",
    contentCategoriesFilter: payload,
  });
}

export async function fetchContentCategories(context, payload) {
  let state = context.state;
  let contentCategories = state.contentCategories;
  try {
    const actor = context.icContext.actors.modclub?.value;
    if (actor) {
      const providerFilter = state.contentProvidersFilter
        ? [Principal.from(state.contentProvidersFilter)]
        : [];
      contentCategories = await actor.getContentCategories(providerFilter);
    }
  } catch (e) {
    console.error("Error fetching ContentCategories::", e);
  }
  context.dispatch({ type: "fetchContentCategories", contentCategories });
}
