import React, { useEffect } from "react";
import { useConnect } from "@connect2icmodclub/react";
import {
  useAppState,
  useAppStateDispatch,
} from "../../state_mgmt/context/state";

export const useReleaseUnStakedTokens = () => {
  const { isConnected } = useConnect();
  // @ts-ignore
  const { releaseUnStakedLoading } = useAppState();
  const dispatch = useAppStateDispatch();

  useEffect(() => {
    if (isConnected && releaseUnStakedLoading) {
      dispatch({ type: "releaseUnStakedTokens" });
    }
  }, [isConnected, releaseUnStakedLoading]);
};
