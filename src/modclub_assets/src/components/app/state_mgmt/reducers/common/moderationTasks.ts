import { Principal } from "@dfinity/principal";

export async function setModerationTasksLoading(context, payload) {
  context.dispatch({
    type: "setModerationTasksLoading",
    moderationTasksLoading: payload.status,
  });
}

export async function setModerationTasksPage(context, payload) {
  context.dispatch({
    type: "setModerationTasksPage",
    moderationTasksLoading: true,
    moderationTasksPage: payload.page,
    moderationTasksPageStartIndex: payload.startIndex,
  });
}

export async function setContentReservedTime(context, payload) {
  context.dispatch({
    type: "setContentReservedTime",
    contentReservedTime: payload,
  });
}

export async function setPohReservedContent(context, payload) {
  context.dispatch({
    type: "setPohReservedContent",
    pohReservedContent: payload,
  });
}

export async function refetchContentModerationTasks(context, payload) {
  let state = context.state;
  let contentModerationTasks = state.contentModerationTasks;
  let tasks = [];
  try {
    const actor = context.icContext.actors.modclub?.value;
    if (actor) {
      const startIndex =
        state.moderationTasksPageStartIndex as unknown as bigint;
      const endIndex = (state.moderationTasksPageStartIndex +
        state.moderationTasksPageSize) as unknown as bigint;

      tasks = await actor.getTasks(
        startIndex,
        endIndex,
        payload.FILTER_VOTES,
        {
          providers: Boolean(state.contentProvidersFilter)
            ? [[Principal.from(state.contentProvidersFilter)]]
            : [],
          categories: Boolean(state.contentCategoriesFilter)
            ? [[state.contentCategoriesFilter]]
            : [],
        } // filtering
      );
      !tasks.lenght &&
        console.log(
          "TASK_FILTERING_PARAMS::",
          state.contentProvidersFilter,
          state.contentCategoriesFilter
        );
      console.log("FETCHED_TASKS::", tasks);
    }
  } catch (e) {
    console.error("Error fetching ContentModerationTasks::", e);
  }
  context.dispatch({
    type: "refetchContentModerationTasks",
    moderationTasksLoading: false,
    contentModerationTasks: [...tasks],
  });
}
