import React, { useEffect } from "react";
import { useConnect } from "@connect2icmodclub/react";
import {
  useAppState,
  useAppStateDispatch,
} from "../../state_mgmt/context/state";

export const useFetchProviderBalance = () => {
  const { isConnected } = useConnect();
  // @ts-ignore
  const { providerBalanceLoading } = useAppState();
  const dispatch = useAppStateDispatch();

  useEffect(() => {
    if (isConnected && providerBalanceLoading)
      dispatch({ type: "fetchProviderBalance" });
  }, [isConnected, providerBalanceLoading]);
};
