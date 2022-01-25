import * as React from 'react'
import { useRef, useState, useCallback } from "react";
import { Image, Button, Icon } from "react-bulma-components";
import Webcam from "react-webcam";
import { b64toBlob, getFileExtension } from "../../../utils/util";

export function CaptureButton({
  icon,
  handleClick,
} : {
  icon: string,
  handleClick: React.MouseEventHandler<HTMLButtonElement>,
}) {
  return (

  //   .video-recorder .bottom-menu .btn-photo:hover {
  //     background-color: #2e3136;
  // }
  // .video-recorder .bottom-menu .btn-photo:hover #cameraIcon {
  //     transform: scale(1.03, 1.03);
  // }

    <Button
      rounded
      style={{
        position: "absolute",
        bottom: "1rem",
        left: 0,
        right: 0,
        margin: "auto",
        width: "3rem",
        height: "3rem",
        background: "rgba(46, 49, 54, 0.6)",
        border: 0
      }}
      onClick={handleClick}
    >
      <Icon color="white">
        <span className="material-icons">
          {icon}
        </span>
      </Icon>
    </Button>
  )
}

export function SaveButton({ file }) {
  const downloadUrl = URL.createObjectURL(file.blob);
  const type = getFileExtension(file.type);

  return (
    <Button
      renderAs="a"
      href={downloadUrl}
      download={`${file.size}.${type}`}
      target="_blank"
      rounded
      size="large"
      color="light"
      style={{
        position: "absolute",
        bottom: "1rem",
        right: "calc(50% + 2.5rem)",
        height: "3rem"
      }}
    >
      <span>Save</span>
      <Icon color="success">
        <span className="material-icons">
          get_app
        </span>
      </Icon>
    </Button>
  )
}

export function WebcamWrapper({ setFile, file }) {
  const [loading, setLoading] = useState<boolean>(true);
  const webcamRef = useRef(null);

  const captureWebcam = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    console.log("imageSrc", imageSrc);

    let encoded = imageSrc.toString().replace(/^data:(.*,)?/, '');
    if ((encoded.length % 4) > 0) {
      encoded += '='.repeat(4 - (encoded.length % 4));
    }
    const blob = b64toBlob(encoded, "image/jpeg");

    const fileInfo = {
      type: blob.type,
      size: blob.size,
      blob: blob,
      data: imageSrc
    };
    console.log("fileInfo", fileInfo);
    setFile(fileInfo);
  }, [webcamRef, setFile]);

  const clearImage = () => {
    setLoading(true);
    setFile({
      type: '',
      size: 0,
      blob: new Blob(),
      data: null
    });
  }

  return !file.data ? (
    <div className="is-relative has-text-centered has-background-grey" style={{ margin: "auto", boxSizing: "border-box", maxWidth: 640, maxHeight: 480 }}>
      <div style={{ paddingBottom: "75%" }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          mirrored={true}
          screenshotFormat="image/jpeg"
          onUserMedia={() => setLoading(false)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            height: "100%",
            objectFit: "fill",
          }}
          forceScreenshotSourceSize
          videoConstraints={{
            width: 640,
            height: 480
          }}
        />
        {!loading &&
          <CaptureButton
            icon="photo_camera"
            handleClick={captureWebcam}
          />
        }
      </div>
    </div>
  ) : (
    <div className="is-relative has-text-centered">
      <Image
        src={file.data}
        style={{ maxWidth: 640, maxHeight: 480, margin: "auto" }}
      />
      <SaveButton file={file} />
      <CaptureButton
        icon="delete"
        handleClick={clearImage}
      />
    </div>
  )
}