import React from "react";
import classNames from "classnames/bind";
import styles from "./styles.scss";
const cn = classNames.bind(styles);
import { RecentActivityStatBox } from "./RecentActivityStatBox";
import {
  useAppState,
  useAppStateDispatch,
} from "../../state_mgmt/context/state";

export const UserRecentActivityStatBox = ({}) => {
  const dispatch = useAppStateDispatch();
  const appState = useAppState();
  dispatch({ type: "fetchUserActivitySummaries" });

  if (appState.userActivitySummariesLoading) {
    return null;
  }

  return (
    <div className={cn("recent-activity")}>
      <RecentActivityStatBox
        label="User Stat"
        amount={320}
        message="Information message for user"
        typeView="vote"
      />
      <RecentActivityStatBox
        label="User Stat"
        amount={320}
        message="Information message for user"
        typeView="vote"
      />
      <RecentActivityStatBox
        label="User Stat"
        amount={320}
        message="Information message for user"
        typeView="vote"
      />
    </div>
  );
};
