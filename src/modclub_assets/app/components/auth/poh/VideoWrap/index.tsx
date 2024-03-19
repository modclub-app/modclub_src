import React from "react";
import { UserVideoInfo } from "../UserVideoInfo";
import classNames from "classnames/bind";
import styles from "./styles.scss";
const cn = classNames.bind(styles);

type VideoWrapProps = {
  message?: string;
  video: React.ReactNode;
  timer?: React.ReactNode;
  actionButton?: React.ReactNode;
  previewButton?: React.ReactNode;
};

export const VideoWrap: React.FC<VideoWrapProps> = ({
  message,
  video,
  timer,
  actionButton,
  previewButton,
}) => (
  <div className={cn("video-wrap")}>
    {message && (
      <div className={cn("video-wrap_info")}>
        <UserVideoInfo message={message} />
      </div>
    )}

    <div className={cn("video-wrap_webcam")}>{video}</div>

    {timer && <div className={cn("video-wrap_timer")}>{timer}</div>}

    {(actionButton || previewButton) && (
      <div className={cn("video-wrap_group")}>
        {actionButton}

        {previewButton && (
          <div className={cn("video-wrap_preview-button")}>{previewButton}</div>
        )}
      </div>
    )}
  </div>
);
