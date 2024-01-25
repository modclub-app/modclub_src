import React from "react";
import classNames from "classnames/bind";
import styles from "./styles.scss";
const cn = classNames.bind(styles);
import InfoButton from "../../../../../common/infobutton/InfoButton";

type StatBoxTypes = {
  label: string;
  amount: bigint;
  message?: string;
  loading?: boolean;
};

export const StatBox: React.FC<StatBoxTypes> = ({
  label,
  amount,
  message,
  loading,
}) => (
  <div className={cn("stat-box")}>
    <span className={cn("stat-box_label")}>{label}</span>
    {loading ? (
      <div className="loader is-loading"></div>
    ) : (
      <h4 className={cn("stat-box_title")}>{`${amount}`}</h4>
    )}
    {message && (
      <div className={cn("stat-box_message")}>
        <InfoButton message={message} />
      </div>
    )}
  </div>
);
