import { useContext, useReducer, useState, useCallback, useMemo } from "react";
import { useActors } from "../../../hooks/actors";
import { StateContext, StateDispatchContext } from "./context/state";
import { asyncLayer } from "./reducers";
import { reducers } from "./reducers/infra/reducers";
import { initialState } from "./state";
import { Connect2ICContext } from "@connect2icmodclub/react";

export function StateProvider({ children }) {
  const { client } = useContext(Connect2ICContext);

  const [state, dispatch] = useReducer(reducers, initialState);
  const asyncDispatch = useCallback(
    (payload) =>
      asyncLayer(
        state,
        {
          ...payload,
          context: { ...(client._service?._state?.context || {}) },
        },
        dispatch
      ),
    [state, dispatch, client._service?._state]
  );

  return (
    <StateContext.Provider value={state}>
      <StateDispatchContext.Provider value={asyncDispatch}>
        {children}
      </StateDispatchContext.Provider>
    </StateContext.Provider>
  );
}
