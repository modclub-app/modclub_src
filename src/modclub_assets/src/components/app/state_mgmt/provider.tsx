import { useContext, useReducer, useState, useCallback } from "react";
import { useActors } from "../../../hooks/actors";
import { StateContext, StateDispatchContext } from "./context/state";
import { asyncReducers } from "./reducers/asyncReducers";
import { initialState } from "./state";
import { Connect2ICContext } from "@connect2icmodclub/react";

export function StateProvider({ children }) {
  const [asyncState, dispatch] = useReducer(asyncReducers, initialState);
  const actors = useActors();
  let [state, setState] = useState(initialState);
  Promise.resolve(asyncState).then((newState) => {
    setState(newState);
  });
  const { client } = useContext(Connect2ICContext);

  let asyncDispatch = useCallback(
    (payload) => {
      dispatch({
        ...payload,
        context: (client._service && client._service._state.context) || {},
      });
    },
    [actors, client._state]
  );

  return (
    <StateContext.Provider value={state}>
      <StateDispatchContext.Provider value={asyncDispatch}>
        {children}
      </StateDispatchContext.Provider>
    </StateContext.Provider>
  );
}
