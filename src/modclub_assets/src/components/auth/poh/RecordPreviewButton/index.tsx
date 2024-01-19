import React from "react";
import { VideoCamIcon } from "../../../../modkit";
import classNames from "classnames/bind";
import styles from "./styles.scss";
const cn = classNames.bind(styles);

type RecordPreviewButtonProps = {
  onClick: () => void;
};

export const RecordPreviewButton: React.FC<RecordPreviewButtonProps> = ({
  onClick,
}) => (
  <button className={cn("videocam-button")} onClick={onClick}>
    Preview
    <VideoCamIcon fill="#0FB36C" />
  </button>
);
