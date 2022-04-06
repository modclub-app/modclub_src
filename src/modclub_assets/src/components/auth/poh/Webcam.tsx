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

export function WebcamWrapper({ setFile, file }) {
  const [loading, setLoading] = useState<boolean>(true);
  const webcamRef = useRef(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  // const [croppedFile, setCroppedFile] = useState(null);

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

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

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
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const clearImage = () => {
    setLoading(true);
    setFile({
      type: '',
      size: 0,
      blob: new Blob(),
      data: null
    });
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
        data: file.data
      };
      console.log("fileInfo", fileInfo);
      setFile(fileInfo);
    });
  }

  return !file.data ? (
    <div className="is-relative has-text-centered" style={{ margin: "auto", boxSizing: "border-box", maxWidth: 640, maxHeight: 480 }}>
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
            margin: "auto"
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
          onClick={doCropImage}
        >
          <span>CROP</span>
        </Button>
      }
    </div>
  )
}