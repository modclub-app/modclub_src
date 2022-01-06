import { useRef, useState, useCallback } from "react";
import { useHistory, Link } from "react-router-dom";
import { Heading, Button, Card, Columns } from "react-bulma-components";
import Webcam from "react-webcam";
import { CaptureButton } from "./Webcam"
import { processAndUploadChunk } from "../../../utils/util";
const MAX_CHUNK_SIZE = 1024 * 500;

export default function CaptureVideo() {
  const history = useHistory();
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const phrases = ["Theta", "Gama", "Zaba", "Unicorn", "Santa", "Moon", "Chalk", "Pillow"];

  const handleStartCaptureClick = useCallback(() => {
    setCapturing(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm"
    });
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );
    mediaRecorderRef.current.start();
  }, [webcamRef, setCapturing, mediaRecorderRef]);

  const handleDataAvailable = useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStopCaptureClick = useCallback(() => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
  }, [mediaRecorderRef, webcamRef, setCapturing]);

  const submit = async () => {
    const blob = new Blob(recordedChunks, {
      type: "video/webm"
    });

    const putChunkPromises: Promise<undefined>[] = [];
    let chunk = 1;
    for (let byteStart = 0; byteStart < blob.size; byteStart += MAX_CHUNK_SIZE, chunk++ ) {
      putChunkPromises.push(
        processAndUploadChunk("challenge-user-video", MAX_CHUNK_SIZE, blob, byteStart, chunk, blob.size, blob.type)
      );
    }
    
    await Promise.all(putChunkPromises);
    history.push("/signup2/confirm");
  }

  return (
    <>
      <Heading subtitle textAlign="center">
        Record yourself saying the following words:
      </Heading>

      <Card className="mb-4">
        <Card.Content className="columns is-multiline">
          {phrases.map(phrase => (
            <Columns.Column key={phrase} size={4}>
              <Button color="black" fullwidth>
                {phrase}
              </Button>
            </Columns.Column>
          ))}
        </Card.Content>
      </Card>

      <div className="is-relative has-text-centered">
        <Webcam
          audio={true}
          ref={webcamRef}
        />
        <CaptureButton
          type={capturing ? "danger" : "success"}
          handleClick={capturing ? handleStopCaptureClick : handleStartCaptureClick}
        />
      </div>

      <Button.Group align="right" className="mt-4">
        <Link to="/app/" className="button is-black">
          Cancel
        </Link>
        <Button color="primary" disabled={!recordedChunks.length} onClick={submit}>
          Next
        </Button>
      </Button.Group>
    </>
  );
};
