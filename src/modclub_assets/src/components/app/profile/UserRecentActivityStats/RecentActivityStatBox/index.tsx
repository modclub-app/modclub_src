import React from "react";
import classNames from "classnames/bind";
import styles from "./styles.scss";
const cn = classNames.bind(styles);
import InfoButton from "../../../../common/infobutton/InfoButton";

type RecentActivityStatBoxTypes = {
  label: string;
  amount: number;
  typeView: string;
  message?: string;
};

export const RecentActivityStatBox: React.FC<RecentActivityStatBoxTypes> = ({
  label,
  amount,
  message,
  typeView,
}) => (
  <div className={cn("stat-box")}>
    <span className={cn("stat-box_label")}>{label}</span>
    <h4 className={cn("stat-box_title")}>{amount}</h4>
    {message && (
      <div className={cn("stat-box_message")}>
        <InfoButton message={message} />
      </div>
    )}
  </div>
);
