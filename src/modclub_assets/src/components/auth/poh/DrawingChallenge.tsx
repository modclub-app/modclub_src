import * as React from 'react'
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Modal,
  Heading,
  Button,
  Icon,
  Card,
  Columns,
  Content
} from "react-bulma-components";
import { WebcamWrapper } from "./Webcam"
import { b64toBlob, processAndUploadChunk } from "../../../utils/util";
import { MAX_CHUNK_SIZE, MIN_FILE_SIZE } from '../../../utils/config';
import circle from '../../../../assets/shapes/circle.png';
import triangle from '../../../../assets/shapes/triangle.png';
import smiley from '../../../../assets/shapes/smile.png';
import star from '../../../../assets/shapes/star.png';
import square from '../../../../assets/shapes/square.png';


export default function DrawingChallenge({ step, goToNextStep }) {
  // const history = useHistory();
  const inputFile = useRef(null);
  const [file, setFile] = useState({
    type: '',
    size: 0,
    blob: new Blob(),
    data: null
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [newCrop, setNewCrop] = useState<boolean>(false);
  const shapes = step.wordList[0];

  const handleFileChange = (event: React.FormEvent<HTMLInputElement>) => {    
    // @ts-ignore
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      if (reader.result === null) {
        throw new Error('file empty...');
      }
      const data = typeof reader.result == "string" ? reader.result : null;
      let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
      if ((encoded.length % 4) > 0) {
        encoded += '='.repeat(4 - (encoded.length % 4));
      }
      const blob = b64toBlob(encoded, file.type);
      const fileInfo = {
        type: file.type,
        size: file.size,
        blob: blob,
        data: data,
        uploaded: true
      };
      console.log("fileInfo", fileInfo);
      setFile(fileInfo);
    }
  }


  const submit = async () => {
    setSubmitting(true);
    if (file.blob.size <= MIN_FILE_SIZE) {
      alert("File upload could not be completed. File size is too small. Please try again"); 
      setSubmitting(false);
      return;
    };

    let chunk = 1;
    for (let byteStart = 0; byteStart < file.blob.size; byteStart += MAX_CHUNK_SIZE, chunk++ ) {
      await processAndUploadChunk(
        "challenge-drawing",
        MAX_CHUNK_SIZE,
        file.blob,
        byteStart,
        chunk,
        file.size,
        file.type
      )
    }
    setSubmitting(false);
    goToNextStep("challenge-drawing");
  }

  let drawShape = (shape: String) => {
    switch (shape.toLowerCase()) {
      case "circle":
        return (<img src={circle} />);
      case "triangle":
        return (<img src={triangle} />);
      case "smile":
        return (<img src={smiley} />);
      case "square":
        return (<img src={square} />);
      case "star":
        return (<img src={star} />);
    }
  }

  return (
    <>
      {submitting &&
        <Modal show={true} showClose={false}>
          <div className="loader is-loading p-5"></div>
        </Modal>
      }
      <Card className="my-5">
        <Card.Content className="rows is-multiline">
          <Heading subtitle className="mb-3" textAlign="center" style={{ width: "100%" }}>
            Draw the following shapes
          </Heading>
          <Card backgroundColor="dark" className="mt-5 mb-5">
            <Card.Content>
              <Heading subtitle className="mb-3">
                Requirements
              </Heading>
              <ul style={{ listStyle: "disc", paddingLeft: "2rem", color: "#fff" }}>
                <li>Draw the shapes in order from left to right on Paper. Digital drawings will not be accepted.</li>
                <li>Try to make the drawing as close to the image as possible ( it does not have to be perfect )</li>
                <li>Take a photo of the paper</li>
              </ul>
            </Card.Content>
          </Card>
          <div style={{
            display: "flex",flexWrap:"nowrap", backgroundColor: "#fff", marginTop: "50"
          }}>
          {shapes.map((shape, index) => (
            <span id={shape} style={{margin:"auto"}}>
              {drawShape(shape)}
             </span>
          ))}
          </div>
        </Card.Content>
      </Card>

      <WebcamWrapper
        setFile={setFile}
        file={file}
        newCrop={newCrop}
        setNewCrop={setNewCrop}
        mirrored={false}
      />
      {!file.data &&
      <>
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
      </>
    }

      <Button.Group align="right" className="mt-4">
        <Link to="/app/" className="button is-black" disabled={!file.data}>
          Cancel
        </Link>
        <Button color="primary" disabled={!file.data} onClick={submit}>
          Next
        </Button>
      </Button.Group>
    </>
  )
}