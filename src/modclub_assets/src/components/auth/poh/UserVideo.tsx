import * as React from 'react'
import styled from "styled-components";
import { useEffect, useRef, useState, useCallback } from "react";
import { useHistory, Link } from "react-router-dom";
import {
  Modal,
  Heading,
  Button,
  Icon,
  Card,
  Columns
} from "react-bulma-components";
import Webcam from "react-webcam";
import { CaptureButton } from "./Webcam"
import { processAndUploadChunk } from "../../../utils/util";
const MAX_CHUNK_SIZE = 1024 * 500;

const RecordButton = styled.div`
  cursor: pointer;
  border-radius: 50%;
  min-width: 46px;
  height: 46px;
  box-sizing: border-box;
  transition: all .2s;
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
    transition: all .2s;
    transform-origin: center center;
    transform: translate(-50%,-50%);
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

export default function UserVideo({ steps }) {
  const history = useHistory();
  const [loading, setLoading] = useState<boolean>(true);
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [phrases, setPhrases] = useState([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState(null);

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

  const saveVideo = useCallback(() => {
    if (!recordedChunks.length) return
    const blob = new Blob(recordedChunks, {
      type: "video/webm"
    });
    const url = URL.createObjectURL(blob);
    setVideoUrl(url);
  }, [recordedChunks]);

  const resetVideo = () => {
    setRecordedChunks([]);
    setVideoUrl(null);
  }

  const submit = async () => {
    setSubmitting(true);
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
    setSubmitting(false);
    history.push("/new-poh-profile/confirm");
  }

  const formatPhrases = () => {
    const { wordList } = steps.find(step => step.wordList[0].length)
    setPhrases(wordList[0])
  }

  useEffect(() => {
    steps && steps.length && formatPhrases();
  }, [steps]);

  return (
    <>
      {submitting &&
        <Modal show={true} showClose={false}>
          <div className="loader is-loading p-5"></div>
        </Modal>
      }

      {!videoUrl ? (
        <div className="is-relative has-text-centered has-background-grey" style={{ maxWidth: 640, maxHeight: 480, paddingBottom: "75%", margin: "auto" }}>
          <Webcam
            audio={true}
            muted={true}
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
            }}
          />

          <RecordButton
            capturing={capturing}
            onClick={capturing ? handleStopCaptureClick : handleStartCaptureClick}
          >
            <svg width="46" height="46" className="btn-record-timer">
              <defs> <mask id="cirleMask"> <rect height="46" width="46" fill="white"></rect> <circle r="18" cx="23" cy="23" fill="black"></circle> </mask> </defs> <circle r="23" cx="23" cy="23" fill="#64686B" mask="url(#cirleMask)"></circle> <path id="timerArc" fill="#ffffff" strokeWidth="0" mask="url(#cirleMask)" d="M 23 23 L 22.999999999999996 0 A 23 23 0 0 0 22.999999999999996 0 L 23 23"></path>
            </svg>
            <i />
          </RecordButton>

          {recordedChunks.length && 
            <Button
              rounded
              size="large"
              color="light"
              style={{
                position: "absolute",
                bottom: "1rem",
                right: "calc(50% + 2.5rem)",
                height: "3rem"
              }}
              onClick={saveVideo}
            >
              <span>Preview</span>
              <Icon color="success">
                <span className="material-icons">
                  videocam
                </span>
              </Icon>
            </Button>
          }
        </div>
      ) : (
        <div className="is-relative has-text-centered has-background-grey" style={{ maxWidth: 640, maxHeight: 480, paddingBottom: "75%", margin: "auto" }}>
          <video width="100%" height="auto" autoPlay style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}>
            <source src={videoUrl} />
            Your browser does not support the video tag.
          </video>
          <CaptureButton
              icon="delete"
              handleClick={resetVideo}
            />
        </div>
      )}

      <Card className="mt-4 mb-5">
        <Card.Content className="columns is-multiline">
          <Heading subtitle className="mb-3" textAlign="center" style={{ width: "100%" }}>
            Record yourself saying the following<br /> words in order:
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
        <Button color="primary" disabled={!recordedChunks.length} onClick={submit}>
          Next
        </Button>
      </Button.Group>
    </>
  );
};
