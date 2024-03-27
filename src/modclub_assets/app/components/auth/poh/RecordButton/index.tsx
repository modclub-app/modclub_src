import React from "react";
import classNames from "classnames/bind";
import styles from "./styles.scss";
const cn = classNames.bind(styles);

type RecordButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
};

export const RecordButton: React.FC<RecordButtonProps> = ({
  onClick,
  active = true,
  disabled,
}) => (
  <button
    onClick={onClick}
    className={cn("record-button", {
      __active: active,
      __disabled: disabled,
    })}
  />
);
