import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Heading, Button, Icon } from "react-bulma-components";
import { WebcamWrapper } from "./Webcam"

export default function CapturePicture() {
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

  return (
    <>
      <Heading subtitle textAlign="center">
        Submit a photo of yourself. It should be well lit and head on.
      </Heading>

      <WebcamWrapper
        setImgSrc={setImgSrc}
        imgSrc={imgSrc}
      />

      <div className="is-divider" data-content="OR"></div>
      
      <Button.Group align="center">
        <Button color="black" onClick={() => inputFile.current.click()}>
          <Icon size="small" className="has-text-white">
            <span className="material-icons">file_upload</span>
          </Icon>
          <span>Upload Photo</span>
        </Button>
      </Button.Group>
      <input
        style={{ display: "none" }}
        ref={inputFile}
        onChange={handleFileChange}
        accept="image/*"
        type="file"
      />

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