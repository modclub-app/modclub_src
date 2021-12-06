import { useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Image as BulmaImage, Button, Icon } from "react-bulma-components";
import Webcam from "react-webcam";

export default function CapturePicture() {
  const webcamRef = useRef(null);
  const inputFile = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);

  const handleFileChange = (e) => {
    const { files } = e.target;
    if (files.length > 0) {
      const f = files[0];
      const reader = new FileReader();
      reader.onload = function (evt) {
        console.log(evt.target.result);
        const metadata = `name: ${f.name}, type: ${f.type}, size: ${f.size}, contents:`;
        console.log(metadata);
        const data =
          typeof evt.target.result == "string" ? evt.target.result : null;
        setImgSrc(data);
        // setPicType(f.type);
      };
      reader.readAsDataURL(f);
    }
  };

  const captureWebcam = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    console.log("imageSrc", imageSrc);
    setImgSrc(imageSrc);
  }, [webcamRef, setImgSrc]);

  const clearImage = () => {
    setImgSrc(null);
  }

  return (
    <>
      <input
        style={{ display: "none" }}
        ref={inputFile}
        onChange={handleFileChange}
        accept="image/*"
        type="file"
      />
      {!imgSrc ? (
        <>
          <div className="is-relative">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
            />
            <Button
              color="gradient"
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
              onClick={captureWebcam}
            />
          </div>

          <div className="is-divider" data-content="OR"></div>
          
          <Button color="primary" fullwidth onClick={() => inputFile.current.click()}>
            <Icon size="small" className="has-text-white mr-2">
              <span className="material-icons">file_upload</span>
            </Icon>
            <span>Upload Photo</span>
          </Button>
        </>
      ) : (
        <>
          <BulmaImage
            src={imgSrc}
          />
          <Button color="danger" className="mt-4" fullwidth onClick={clearImage}>
            Retake
          </Button>
        </>
      )}

      <Link to="/signup2/3" className="button is-primary is-fullwidth mt-4" disabled={!imgSrc}>
        Next
      </Link>
    </>
  )
}