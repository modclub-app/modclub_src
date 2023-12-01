import * as React from "react";
import styled from "styled-components";
import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Modal,
  Heading,
  Button,
  Icon,
  Card,
  Columns,
} from "react-bulma-components";
import Webcam from "react-webcam";
import { CaptureButton } from "./Webcam";
import { format } from "date-fns";
import { MAX_CHUNK_SIZE, MIN_FILE_SIZE } from "../../../utils/config";
import { processAndUploadChunk, useActors } from "../../../utils";

const RecordButton = styled.div`
  cursor: pointer;
  border-radius: 50%;
  min-width: 46px;
  height: 46px;
  box-sizing: border-box;
  transition: all 0.2s;
  position: absolute;
  bottom: 1rem;
  left: 0;
  right: 0;

  i {
    font-size: 0;
    display: block;
    padding: 0;
    background-color: #f03;
    box-sizing: border-box;
    transition: all 0.2s;
    transform-origin: center center;
    transform: translate(-50%, -50%);
    position: absolute;
    top: 50%;
    left: 50%;
    box-shadow: 0 2px 4px 0 rgb(0 0 0 / 20%);
    border-radius: ${({ capturing }) => (capturing ? "5px" : "50%")};
    width: ${({ capturing }) => (capturing ? "20px" : "28px")};
    height: ${({ capturing }) => (capturing ? "20px" : "28px")};

    &: hover {
      transform: translate(-50%, -50%) scale(1.2, 1.2);
    }
  }
`;

const Timer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 11px;
  width: 40px;
  margin: auto;
  display: flex;
  z-index: 10;
  justify-content: center;
  align-items: center;
  font-size: 11px;
  background-color: rgba(46, 49, 54, 0.9);
  border-radius: 35px;
  padding: 4px 7px;
  line-height: 1;
  color: white;
`;

export default function UniquePoh({ step, goToNextStep }) {
  const [loading, setLoading] = useState<boolean>(true);
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(0);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const phrases = step.wordList[0];
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const supportsWebm = MediaRecorder.isTypeSupported("video/webm");
  const mimeType = supportsWebm ? "video/webm" : "video/mp4";
  const { modclub } = useActors();

  const handleStartCaptureClick = useCallback(() => {
    if (!webcamRef.current || !webcamRef.current.stream) return;
    setCapturing(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: mimeType,
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
    setRecordedChunks([]);
  }, [mediaRecorderRef, webcamRef, setCapturing]);

  const saveVideo = useCallback(() => {
    if (!recordedChunks.length) return;
    const blob = new Blob(recordedChunks, {
      type: mimeType,
    });
    const url = URL.createObjectURL(blob);
    setVideoUrl(url);
  }, [recordedChunks]);

  const resetVideo = () => {
    setSeconds(0);
    setRecordedChunks([]);
    setVideoUrl(null);
  };

  const submit = async () => {
    setSubmitting(true);
    const blob = new Blob(recordedChunks, {
      type: mimeType,
    });
    if (blob.size <= MIN_FILE_SIZE) {
      alert(
        "File upload could not be completed. File size is too small. Please try again"
      );
      setSubmitting(false);
      return;
    }

    let chunk = 1;
    for (
      let byteStart = 0;
      byteStart < blob.size;
      byteStart += MAX_CHUNK_SIZE, chunk++
    ) {
      let res = await processAndUploadChunk(
        modclub,
        "challenge-unique-poh",
        MAX_CHUNK_SIZE,
        blob,
        byteStart,
        chunk,
        blob.size,
        blob.type
      );
      if (res != null) {
        alert(
          "Error: " +
            res +
            " File upload could not be completed. Please try again"
        );
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    goToNextStep("challenge-unique-poh");
  };

  const formattedTime = (val) => {
    const time = new Date(0, 0, 0);
    time.setSeconds(val);
    return format(time, "mm:ss");
  };

  useEffect(() => {
    let interval = null;
    if (capturing) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds + 1);
      }, 1000);
    } else if (!capturing && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [capturing, seconds]);

  return (
    <>
      {submitting && (
        <Modal show={true} showClose={false}>
          <div className="loader is-loading p-5"></div>
        </Modal>
      )}

      {!videoUrl ? (
        <div
          className="is-relative has-text-centered"
          style={{
            margin: "auto",
            boxSizing: "border-box",
            maxWidth: 640,
            maxHeight: 480,
          }}
        >
          <div style={{ paddingBottom: "75%" }}>
            <Webcam
              audio={true}
              muted={true}
              mirrored={true}
              ref={webcamRef}
              onUserMedia={() => setLoading(false)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                height: "100%",
                objectFit: "fill",
                margin: "auto",
              }}
              forceScreenshotSourceSize
              videoConstraints={{
                width: 640,
                height: 480,
              }}
            />

            <Timer>{formattedTime(seconds)}</Timer>

            {!loading && (
              <RecordButton
                capturing={capturing}
                onClick={
                  capturing ? handleStopCaptureClick : handleStartCaptureClick
                }
              >
                <svg width="46" height="46" className="btn-record-timer">
                  <defs>
                    {" "}
                    <mask id="cirleMask">
                      {" "}
                      <rect height="46" width="46" fill="white"></rect>{" "}
                      <circle r="18" cx="23" cy="23" fill="black"></circle>{" "}
                    </mask>{" "}
                  </defs>{" "}
                  <circle
                    r="23"
                    cx="23"
                    cy="23"
                    fill="#64686B"
                    mask="url(#cirleMask)"
                  ></circle>{" "}
                  <path
                    id="timerArc"
                    fill="#ffffff"
                    strokeWidth="0"
                    mask="url(#cirleMask)"
                    d="M 23 23 L 22.999999999999996 0 A 23 23 0 0 0 22.999999999999996 0 L 23 23"
                  ></path>
                </svg>
                <i />
              </RecordButton>
            )}

            {recordedChunks.length && (
              <Button
                rounded
                size="large"
                color="light"
                style={{
                  position: "absolute",
                  bottom: "1rem",
                  right: "calc(50% + 2.5rem)",
                  height: "3rem",
                }}
                onClick={saveVideo}
              >
                <span>Preview</span>
                <Icon color="success">
                  <span className="material-icons">videocam</span>
                </Icon>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          className="is-relative has-text-centered has-background-grey"
          style={{
            margin: "auto",
            boxSizing: "border-box",
            maxWidth: 640,
            maxHeight: 480,
          }}
        >
          <div style={{ paddingBottom: "75%" }}>
            <video
              width="100%"
              height="auto"
              autoPlay
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
            >
              <source src={videoUrl} />
              Your browser does not support the video tag.
            </video>
            <CaptureButton icon="delete" handleClick={resetVideo} />
          </div>
        </div>
      )}

      <Card className="mt-6 mb-5">
        <Card.Content className="columns is-multiline">
          <Heading
            subtitle
            className="mb-3"
            textAlign="center"
            style={{ width: "100%" }}
          >
            Record yourself saying the following
            <br /> words in order:
          </Heading>
          {phrases.map((phrase, index) => (
            <Columns.Column key={phrase} size={4}>
              <Button fullwidth isStatic>
                {index + 1}
                <span className="ml-2" style={{ width: 40 }}>
                  {phrase}
                </span>
              </Button>
            </Columns.Column>
          ))}
        </Card.Content>
      </Card>

      <Button.Group align="right">
        <Link to="/app/" className="button is-black">
          Cancel
        </Link>
        <Button
          color="primary"
          disabled={!recordedChunks.length || capturing}
          onClick={submit}
        >
          Next
        </Button>
      </Button.Group>
    </>
  );
}
