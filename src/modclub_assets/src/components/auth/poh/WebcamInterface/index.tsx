import React, { forwardRef, ForwardRefRenderFunction } from "react";
import classNames from "classnames/bind";
import styles from "./styles.scss";
import Webcam from "react-webcam";
import {
  VIDEO_WIDTH,
  VIDEO_HEIGHT,
  VIDEO_POSITION_TEXT,
  VIDEO_MODELS_LOADING,
} from "../../../../utils/constant";
import face_pattern_error from "../../../../../assets/face_pattern_oval_error.png";
import face_pattern from "../../../../../assets/face_pattern_oval.png";
const cn = classNames.bind(styles);

type WebcamProps = {
  isDetectionStarted: boolean;
  onUserMedia: () => void;
  isError: boolean;
};

type WebcamRef = HTMLVideoElement;

const WebcamInterface: ForwardRefRenderFunction<WebcamRef, WebcamProps> = (
  { onUserMedia, isError, isDetectionStarted },
  ref
) => (
  <div className={cn("webcam-interface")}>
    <div
      className={cn("webcam-interface_fade-text", {
        _active: isError || isDetectionStarted,
      })}
    >
      {isError
        ? VIDEO_POSITION_TEXT
        : isDetectionStarted
        ? VIDEO_MODELS_LOADING
        : ""}
    </div>

    <img
      src={isError ? face_pattern_error : face_pattern}
      className={cn("webcam-interface_pattern")}
      alt=""
    />

    <Webcam
      audio
      muted
      mirrored
      ref={ref}
      onUserMedia={onUserMedia}
      forceScreenshotSourceSize
      videoConstraints={{
        width: VIDEO_WIDTH,
        height: VIDEO_HEIGHT,
      }}
    />
  </div>
);

export default forwardRef(WebcamInterface);