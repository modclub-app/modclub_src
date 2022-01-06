import { useRef, useState, useCallback } from "react";
import { Image, Button, Icon } from "react-bulma-components";
import Webcam from "react-webcam";
import { b64toBlob } from "../../../utils/util";

export function CaptureButton({ type, handleClick}) {
  return (
    <Button
      color={type}
      rounded
      style={{
        position: "absolute",
        bottom: "1rem",
        left: 0,
        right: 0,
        margin: "auto",
        width: "4rem",
        height: "4rem"
      }}
      onClick={handleClick}
    >
      <Icon color="white">
        <span className="material-icons">
          {type === "success" ? "photo_camera" : "clear"}
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
    setFile(null);
  }

  return !file.data ? (
    <div className="is-relative has-text-centered">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        onUserMedia={() => setLoading(false)}
        style={{ display: loading ? "none" : "inline" }}
      />
      {loading ? (
        <div className="loader is-loading"></div>
      ) : (
        <CaptureButton
          type="success"
          handleClick={captureWebcam}
        />
      )}
    </div>
  ) : (
    <div className="is-relative has-text-centered">
      <Image
        src={file.data}
        style={{ maxWidth: 640, maxHeight: 480, margin: "auto" }}
      />
      <CaptureButton
        type="danger"
        handleClick={clearImage}
      />
    </div>
  )
}