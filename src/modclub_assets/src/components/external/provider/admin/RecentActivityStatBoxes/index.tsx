import React from "react";
import classNames from "classnames/bind";
import styles from "./styles.scss";
const cn = classNames.bind(styles);
import { StatBox } from "./StatBox";
import { RECENT_ACTIVITY_STATUS_BOXES_INFO } from "../../../../../utils/constant";
import useGetProviderSummaries from "../hooks/useGetProviderSummaries";

export const RecentActivityStatBoxes = () => {
  const { providerSummaries } = useGetProviderSummaries();
  return (
    <div className={cn("recent-activity")}>
      {RECENT_ACTIVITY_STATUS_BOXES_INFO.map((item) => {
        return (
          <StatBox
            key={item.type}
            loading={!providerSummaries}
            label={item.label}
            amount={providerSummaries && providerSummaries[item.type]}
            message={item.message}
          />
        );
      })}
    </div>
  );
};
