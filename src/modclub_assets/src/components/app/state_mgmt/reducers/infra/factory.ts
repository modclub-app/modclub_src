import { getCommonReducers } from "../common";
import { getStakingReducers } from "../staking";
import { getProviderReducers } from "../provider";
import { getModeratorReducers } from "../moderator";

export const reducersFactory = (state, icContext, dispatch) => {
  let reducers = null;
  if (!reducers) {
    reducers = new Map([
      ...getCommonReducers(state, icContext, dispatch),
      ...getStakingReducers(state, icContext, dispatch),
      ...getProviderReducers(state, icContext, dispatch),
      ...getModeratorReducers(state, icContext, dispatch),
    ]);
  }

  return {
    handle: (type, payload) => {
      const handler = reducers.get(type);
      if (!handler) {
        // throw Error("Unknown action: " + action.type);
        console.log("NO reducer found for ", type);
      } else {
        console.log("[DEBUG] Running handler for Action: ", type);
        handler(payload);
      }
    },
  };
};
