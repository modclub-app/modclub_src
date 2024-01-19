import React from "react";
import classNames from "classnames/bind";
import styles from "./styles.scss";
import { InfoIcon } from "../../../../modkit";
const cn = classNames.bind(styles);

type UserVideoInfoProps = {
  message: string;
};

export const UserVideoInfo: React.FC<UserVideoInfoProps> = ({ message }) => (
  <div className={cn("info")}>
    <InfoIcon fill="#fff" />
    <div className={cn("info_message")}>{message}</div>
  </div>
);
