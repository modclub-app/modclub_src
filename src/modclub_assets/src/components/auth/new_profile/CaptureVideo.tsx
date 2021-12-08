import { useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Heading, Button, Card, Columns } from "react-bulma-components";
import Webcam from "react-webcam";
import { CaptureButton } from "./Webcam"

export default function CaptureVideo() {
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

  const handleDownload = useCallback(() => {
    console.log("recordedChunks", recordedChunks);
    return

    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      // a.style = "display: none";
      a.href = url;
      a.download = "react-webcam-stream-capture.webm";
      a.click();
      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

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
        <Button disabled={!recordedChunks.length} onClick={handleDownload}>
          Download
        </Button>
        <Link to="/app/" className="button is-black">
          Cancel
        </Link>
        <Link
          to="/signup2/4"
          className="button is-primary"
          disabled={!recordedChunks.length}
        >
          Next
        </Link>
      </Button.Group>
    </>
  );
};
