import { Principal } from "@dfinity/principal";
import { getModeratorLeaderboard } from "../../../../utils/api";
import * as Constants from "../../../../utils/constant";
import { reducersFactory } from "./infra/factory";

export async function asyncLayer(state, action, dispatch) {
  const context = action.context;

  const handler = reducersFactory(state, context, dispatch);
  handler.handle(action.type, action.payload);
}
