import { useRef, useState, useCallback } from "react";
import { Image, Button, Icon } from "react-bulma-components";
import Webcam from "react-webcam";

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

export function WebcamWrapper({ setImgSrc, imgSrc }) {
  const [loading, setLoading] = useState<boolean>(true);
  const webcamRef = useRef(null);

  const captureWebcam = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    console.log("imageSrc", imageSrc);
    setImgSrc(imageSrc);
  }, [webcamRef, setImgSrc]);

  const clearImage = () => {
    setLoading(true);
    setImgSrc(null);
  }

  return !imgSrc ? (
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
        src={imgSrc}
        style={{ maxWidth: 640, maxHeight: 480, margin: "auto" }}
      />
      <CaptureButton
        type="danger"
        handleClick={clearImage}
      />
    </div>
  )
}