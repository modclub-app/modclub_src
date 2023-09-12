import { createContext, useContext } from "react";

export const StateContext = createContext({});
export const StateDispatchContext = createContext(null);

export function useAppState() {
  return useContext(StateContext);
}

export function useAppStateDispatch() {
  return useContext(StateDispatchContext);
}
