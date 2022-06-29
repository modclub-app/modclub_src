import * as React from 'react'
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Modal,
  Heading,
  Button,
  Icon
} from "react-bulma-components";
import { WebcamWrapper } from "./Webcam"
import { b64toBlob, processAndUploadChunk } from "../../../utils/util";
import { MAX_CHUNK_SIZE, MIN_FILE_SIZE } from '../../../utils/config';

export default function ProfilePic({ goToNextStep }) {
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
        "challenge-profile-pic",
        MAX_CHUNK_SIZE,
        file.blob,
        byteStart,
        chunk,
        file.size,
        file.type
      )
    }
    setSubmitting(false);
    // history.push("/new-poh-profile/challenge-user-video");
    goToNextStep("challenge-profile-pic");
  }

  return (
    <>
      {submitting &&
        <Modal show={true} showClose={false}>
          <div className="loader is-loading p-5"></div>
        </Modal>
      }
      <Heading subtitle textAlign="center">
        Submit a photo of yourself. It should be well lit and head on.
      </Heading>

      <WebcamWrapper
        setFile={setFile}
        file={file}
        newCrop={newCrop}
        setNewCrop={setNewCrop}
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
        <Button color="primary" disabled={!file.data || newCrop} onClick={submit}>
          Next
        </Button>
      </Button.Group>
    </>
  )
}