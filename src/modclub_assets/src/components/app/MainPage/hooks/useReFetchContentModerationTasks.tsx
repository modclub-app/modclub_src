import React, { useEffect } from "react";
import { useConnect } from "@connect2icmodclub/react";
import {
  useAppState,
  useAppStateDispatch,
} from "../../state_mgmt/context/state";

export const useReFetchContentModerationTasks = () => {
  const { isConnected } = useConnect();
  const dispatch = useAppStateDispatch();
  // @ts-ignore
  const { moderationTasksLoading } = useAppState();

  const FILTER_ALREADY_VOTED = true;

  useEffect(() => {
    if (isConnected && moderationTasksLoading)
      dispatch({
        type: "refetchContentModerationTasks",
        payload: { FILTER_ALREADY_VOTED: FILTER_ALREADY_VOTED },
      });
  }, [isConnected, moderationTasksLoading]);
};
