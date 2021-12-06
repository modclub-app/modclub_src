import { useRef, useState, useCallback } from "react";
import { Button } from "react-bulma-components";
import Webcam from "react-webcam";

export default function CaptureVideo() {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const phrases = ["Theta", "Gama", "Zaba", "Unicorn", "Santa", "Moon", "Chalk", "Pillow"]

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
      {phrases.map(phrase => (
        <Button key={phrase} color="black" className="mr-4 mb-4" style={{ width: "30%" }}>
          {phrase}
        </Button>
      ))}
      <div className="is-relative">
        <Webcam
          audio={true}
          ref={webcamRef}
        />
          <Button
            color={capturing ? "danger" : "success"}
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
            onClick={capturing ? handleStopCaptureClick : handleStartCaptureClick}
          />
      </div>
      {recordedChunks.length > 0 && (
        <Button
          color="primary"
          fullwidth
          className="mt-4"
          onClick={handleDownload}
        >
          Download
        </Button>
      )}
    </>
  );
};
