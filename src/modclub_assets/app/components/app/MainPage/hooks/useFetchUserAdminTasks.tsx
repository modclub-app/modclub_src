import React, { useEffect } from "react";
import { useConnect } from "@connect2icmodclub/react";
import { useActors } from "../../../../hooks/actors";
import { useAppStateDispatch } from "../../state_mgmt/context/state";

export const useFetchUserAdminTasks = () => {
  const dispatch = useAppStateDispatch();
  const actors = useActors();
  const { isConnected } = useConnect();
  const { modclub } = actors;

  const FILTER_ALREADY_VOTED = true;

  useEffect(() => {
    if (isConnected && modclub) {
      dispatch({ type: "fetchUserProfile" });
      dispatch({ type: "fetchIsUserAdmin" });
      dispatch({
        type: "refetchContentModerationTasks",
        payload: { FILTER_ALREADY_VOTED: FILTER_ALREADY_VOTED },
      });
    }
  }, [isConnected, modclub]);
};
