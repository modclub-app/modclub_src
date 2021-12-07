import { useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Heading, Image, Button, Icon, Level } from "react-bulma-components";
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
      <Heading subtitle textAlign="center">
        Submit a photo of yourself. It should be well lit and head on.
      </Heading>
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
              color="success"
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
          
          <Button.Group align="center">
            <Button color="black" onClick={() => inputFile.current.click()}>
              <Icon size="small" className="has-text-white mr-2">
                <span className="material-icons">file_upload</span>
              </Icon>
              <span>Upload Photo</span>
            </Button>
          </Button.Group>
        </>
      ) : (
        <>
          <Image src={imgSrc} />
          <Button.Group align="center">
            <Button color="danger" className="mt-4" onClick={clearImage}>
              Retake
            </Button>
          </Button.Group>
        </>
      )}

      <Button.Group align="right" className="mt-4">
        <Link to="/app/" className="button is-black" disabled={!imgSrc}>
          Cancel
        </Link>
        <Link to="/signup2/3" className="button is-primary" disabled={!imgSrc}>
          Next
        </Link>
      </Button.Group>
    </>
  )
}