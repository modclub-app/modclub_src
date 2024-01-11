import React from "react";
import classNames from "classnames/bind";
import styles from "./styles.scss";
const cn = classNames.bind(styles);

type TimerProps = {
  time: string;
};

export const Timer: React.FC<TimerProps> = ({ time }) => (
  <div className={cn("timer")}>{time}</div>
);
