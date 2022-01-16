import { useRef, useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { Heading, Button, Icon } from "react-bulma-components";
import { WebcamWrapper } from "./Webcam"
import { b64toBlob, processAndUploadChunk } from "../../../utils/util";
const MAX_CHUNK_SIZE = 1024 * 500;

export default function CapturePicture() {
  const history = useHistory();
  const inputFile = useRef(null);
  const [file, setFile] = useState({
    type: '',
    size: 0,
    blob: new Blob(),
    data: null
  });

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
        data: data
      };
      console.log("fileInfo", fileInfo);
      setFile(fileInfo);
    }
  }

  const submit = async () => {
    const putChunkPromises: Promise<undefined>[] = [];
    let chunk = 1;
    for (let byteStart = 0; byteStart < file.blob.size; byteStart += MAX_CHUNK_SIZE, chunk++ ) {
      putChunkPromises.push(
        processAndUploadChunk("challenge-profile-pic", MAX_CHUNK_SIZE, file.blob, byteStart, chunk, file.size, file.type)
      );
    }
    await Promise.all(putChunkPromises);
    history.push("/signup2/challenge-user-video");
  }

  return (
    <>
      <Heading subtitle textAlign="center">
        Submit a photo of yourself. It should be well lit and head on.
      </Heading>

      <WebcamWrapper
        setFile={setFile}
        file={file}
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
        <Link to="/app/" className="button is-black" disabled={!file}>
          Cancel
        </Link>
        <Button color="primary" disabled={!file} onClick={submit}>
          Next
        </Button>
      </Button.Group>
    </>
  )
}