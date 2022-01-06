import { useRef, useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { Heading, Button, Icon } from "react-bulma-components";
import { WebcamWrapper } from "./Webcam"
// import { submitChallengeData } from '../../../utils/api';
import { b64toBlob, processAndUploadChunk } from "../../../utils/util";

const MAX_CHUNK_SIZE = 1024 * 500;


export default function CapturePicture() {
  const [file, setFile] = useState<FileReaderInfo>({
    name: '',
    type: '',
    size: 0,
    blob: new Blob(),
    width: 0,
    file: 0,
    height: 0
  });

  interface FileReaderInfo {
    name: string;
    type: string;
    size: number;
    blob: Blob;
    width: number;
    file: number;
    height: number;
  }

  const handleFileChange = (event: React.FormEvent<HTMLInputElement>) => {
    // @ts-ignore
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      if (reader.result === null) {
        throw new Error('file empty...');
      }
      let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
      if ((encoded.length % 4) > 0) {
        encoded += '='.repeat(4 - (encoded.length % 4));
      }
      const blob = b64toBlob(encoded, file.type);
      const fileInfo: FileReaderInfo = {
        name: file.name,
        type: file.type,
        size: file.size,
        blob: blob,
        file: file,
        width: file.width,
        height: file.height
      };
      console.log("fileInfo", fileInfo);
      setFile(fileInfo);
    };
};




  const history = useHistory();
  const inputFile = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);

  // const handleFileChange = (e) => {
  //   const { files } = e.target;
  //   if (files.length > 0) {
  //     const f = files[0];
  //     const reader = new FileReader();
  //     reader.onload = function (evt) {
  //       console.log("evt", evt)
  //       const data = typeof evt.target.result == "string" ? evt.target.result : null;
  //       setImgSrc(data);
  //     };
  //     reader.readAsDataURL(f);
  //   }
  // };

  // const dataURLtoBlob = (dataurl) => {
  //   var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
  //     bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  //   while(n--){
  //     u8arr[n] = bstr.charCodeAt(n);
  //   }
  //   return new Blob([u8arr], {type:mime});
  // }

  // const submit = async () => {
  //   const blob = dataURLtoBlob(imgSrc)
  //   console.log("submit blob", blob)

  //   const res = await submitChallengeData({
  //     challengeId: "challenge-profile-pic",
  //     // challengeDataBlob: [blob],
  //     challengeDataBlob: [file],
  //     userName: [],
  //     email: [],
  //     fullName: [],
  //     aboutUser: [],
  //     offset: BigInt(1),
  //     numOfChunks: BigInt(1),
  //     mimeType: blob.type,
  //     dataSize: BigInt(blob.size),
  //   });
  //   console.log("res", res);
  //   history.push("/signup2/3")
  // }

  // const processAndUploadChunk = async (
  //   blob: Blob,
  //   byteStart: number,
  //   chunk: number,
  //   fileSize: number,
  //   fileExtension: string
  // ) : Promise<any> => {
  //   const blobSlice = blob.slice(
  //     byteStart,
  //     Math.min(Number(fileSize), byteStart + MAX_CHUNK_SIZE),
  //     blob.type,
  //   );
   
  //   const bsf = await blobSlice.arrayBuffer();
  //   console.log("bsf", bsf);

  //   const res = await submitChallengeData({
  //     challengeId: "challenge-profile-pic",
  //     challengeDataBlob: [encodeArrayBuffer(bsf)],
  //     userName: [],
  //     email: [],
  //     fullName: [],
  //     aboutUser: [],
  //     offset: BigInt(chunk),
  //     numOfChunks: BigInt(Number(Math.ceil(file.size / MAX_CHUNK_SIZE))),
  //     mimeType: fileExtension,
  //     dataSize: BigInt(fileSize),
  //   });

  //   console.log("res", res)
  // }

  const submit = async () => {
    const blob = file.blob;
    const putChunkPromises: Promise<undefined>[] = [];
    let chunk = 1;
    for (let byteStart = 0; byteStart < blob.size; byteStart += MAX_CHUNK_SIZE, chunk++ ) {
      putChunkPromises.push(
        processAndUploadChunk("challenge-profile-pic", blob, byteStart, chunk, file.size, file.type)
      );
    }
    await Promise.all(putChunkPromises);
  }

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