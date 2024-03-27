import React, { useEffect } from "react";
import { useConnect } from "@connect2icmodclub/react";
import {
  useAppState,
  useAppStateDispatch,
} from "../../state_mgmt/context/state";
import { useActors } from "../../../../hooks/actors";

export const useFetchUserLockBlock = () => {
  const { isConnected } = useConnect();
  const { vesting } = useActors();
  const dispatch = useAppStateDispatch();
  // @ts-ignore
  const { loginPrincipalId, pendingStakeListLoading } = useAppState();

  useEffect(() => {
    if (isConnected && vesting && loginPrincipalId)
      pendingStakeListLoading && dispatch({ type: "fetchUserLockBlock" });
  }, [isConnected, vesting, loginPrincipalId, pendingStakeListLoading]);
};
