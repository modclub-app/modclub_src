import * as React from 'react'
import { useRef, useState, useCallback } from "react";
import { Button, Icon } from "react-bulma-components";
import Webcam from "react-webcam";
import { b64toBlob, getFileExtension } from "../../../utils/util";
import Cropper from "react-easy-crop";

export function CaptureButton({
  icon,
  handleClick,
} : {
  icon: string,
  handleClick: React.MouseEventHandler<HTMLButtonElement>,
}) {
  return (
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

export function WebcamWrapper({ setFile, file, newCrop, setNewCrop, mirrored = true }) {
  const [loading, setLoading] = useState<boolean>(true);
  const webcamRef = useRef(null);
  const [showCrop, setShowCrop] = useState<boolean>(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [facingMode, setFacingMode] = useState<string>("user");

  const toggleFacingMode = () => {
    if (facingMode === "user") {
      setFacingMode("environment");
    } else {
      setFacingMode("user");
    }
  }

  const captureWebcam = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
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

  const cropImage = (imgUri, width = 400, height = 300, xstart = 0, ystart = 0, callback) => {
    try {
      let resize_canvas = document.createElement('canvas');
      let orig_src = new Image();
      orig_src.src = imgUri;
      orig_src.onload = function () {
        resize_canvas.width = width;
        resize_canvas.height = height;
        let cnv = resize_canvas.getContext('2d');
        cnv.drawImage(orig_src, xstart, ystart, width, height, 0, 0, width, height);
        let newimgUri = resize_canvas.toDataURL("image/jpeg").toString();
        callback(newimgUri);
      }
    }
    catch (e) {
      console.log("Couldn't crop image due to", e);
      callback(imgUri);
    }
  }

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setNewCrop(true);
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const clearImage = () => {
    setLoading(true);
    setFile({
      type: '',
      size: 0,
      blob: new Blob(),
      data: null,
      cropped: null
    });
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setShowCrop(false);
    setCroppedAreaPixels(null);
  }

  const doCropImage = () => {
    if (!croppedAreaPixels) return
    cropImage(file.data, croppedAreaPixels.width, croppedAreaPixels.height, croppedAreaPixels.x, croppedAreaPixels.y, (imgUri) => {
      let encoded = imgUri.toString().replace(/^data:(.*,)?/, '');
      if ((encoded.length % 4) > 0) {
        encoded += '='.repeat(4 - (encoded.length % 4));
      }
      const blob = b64toBlob(encoded, "image/jpeg");
      const fileInfo = {
        type: blob.type,
        size: blob.size,
        blob: blob,
        data: imgUri,
        cropped: true
      };
      console.log("fileInfo", fileInfo);
      setFile(fileInfo);
      setNewCrop(false);
    });
  }

  return !file.data ? (
    <div className="is-relative has-text-centered" style={{ margin: "auto", boxSizing: "border-box", maxWidth: 640, maxHeight: 480 }}>
      <div style={{ paddingBottom: "75%" }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          mirrored={mirrored}
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
            margin: "auto"
          }}
          forceScreenshotSourceSize
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: "user"
          }}
        />
        {!loading && (
          <>
            <CaptureButton
              icon="photo_camera"
              handleClick={captureWebcam}
            />
            <Button
              renderAs="a"
              rounded
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                height: "2.65rem",
                background: "rgba(46, 49, 54, 0.6)",
                color: "white",
                border: 0
              }}
              className="is-hidden-desktop"
              onClick={toggleFacingMode}
            >
              <Icon color="white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{ fill: "white" }}>
                  <path d="M464 96h-88l-12.38-32.88C356.6 44.38 338.8 32 318.8 32h-125.5c-20 0-38 12.38-45 31.12L136 96H48C21.5 96 0 117.5 0 144v288C0 458.5 21.5 480 48 480h416c26.5 0 48-21.5 48-48v-288C512 117.5 490.5 96 464 96zM356.9 366.8C332.4 398.1 295.7 416 256 416c-31.78 0-61.37-11.94-84.58-32.61l-19.28 19.29C143.2 411.6 128 405.3 128 392.7V316.3c0-5.453 4.359-9.838 9.775-9.99h76.98c12.35 .3027 18.47 15.27 9.654 24.09l-19.27 19.28C219.3 361.4 237.1 368 256 368c24.8 0 47.78-11.22 63.08-30.78c8.172-10.44 23.25-12.28 33.69-4.125S365.1 356.3 356.9 366.8zM384 259.7c0 5.453-4.359 9.838-9.775 9.99h-76.98c-12.35-.3027-18.47-15.27-9.654-24.09l19.27-19.28C292.7 214.6 274.9 208 256 208c-24.8 0-47.78 11.22-63.08 30.78C184.8 249.2 169.7 251.1 159.2 242.9C148.8 234.8 146.9 219.7 155.1 209.2C179.6 177.9 216.3 160 256 160c31.78 0 61.37 11.94 84.58 32.61l19.28-19.29C368.8 164.4 384 170.7 384 183.3V259.7z"/>
                </svg>
              </Icon>
            </Button>
          </>
        )}
      </div>
    </div>
  ) : (
    <div className="is-relative has-text-centered">
      {file.cropped || !showCrop ? (
        <div style={{ maxWidth: 640, maxHeight: 480, margin: "auto", background: `url(${file.data}) no-repeat center`, backgroundSize: "contain" }}>
          <div style={{ paddingBottom: "75%" }} />
          {!file.cropped &&
          <Button
            renderAs="a"
            rounded
            style={{
              position: "absolute",
              bottom: "1rem",
              left: "calc(50% + 2.5rem)",
              height: "3rem",
              background: "rgba(46, 49, 54, 0.6)",
              color: "white",
              border: 0
            }}
            onClick={() => setShowCrop(true)}
          >
            <span>CROP IMAGE</span>
          </Button>
          }
        </div>
      ) : (
        <div style={{ maxWidth: 640, maxHeight: 480, margin: "auto" }}>
          <div style={{ paddingBottom: "75%" }}>
            <Cropper
              image={file.data}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
        </div>
      )}

      {!file.uploaded &&
        <SaveButton file={file} />
      }
      <CaptureButton
        icon="delete"
        handleClick={clearImage}
      />
      {croppedAreaPixels &&
        <Button
          renderAs="a"
          rounded
          style={{
            position: "absolute",
            bottom: "1rem",
            left: "calc(50% + 2.5rem)",
            height: "3rem",
            background: "rgba(46, 49, 54, 0.6)",
            color: "white",
            border: 0
          }}
          disabled={!newCrop}
          onClick={doCropImage}
        >
          <span>CROP</span>
        </Button>
      }
    </div>
  )
}