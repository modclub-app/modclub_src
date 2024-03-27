import React, { useEffect } from "react";
import { useConnect } from "@connect2icmodclub/react";
import { useAppStateDispatch } from "../../state_mgmt/context/state";

export const useSetLoginPrincipalId = () => {
  const { isConnected, principal } = useConnect();
  const dispatch = useAppStateDispatch();

  useEffect(() => {
    if (isConnected && principal)
      dispatch({ type: "setLoginPrincipalId", payload: principal });
  }, [isConnected, principal]);
};
