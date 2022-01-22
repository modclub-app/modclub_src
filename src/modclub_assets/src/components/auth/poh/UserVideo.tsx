import * as React from 'react'
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

export default function UserVideo({ steps }) {
  const history = useHistory();
  const [loading, setLoading] = useState<boolean>(true);
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [phrases, setPhrases] = useState([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [video, setVideo] = useState(null);

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
    mediaRecorderRef.current.stop();
    setCapturing(false);

    const blob = new Blob(recordedChunks, {
      type: "video/webm"
    });

    const url = URL.createObjectURL(blob);
    console.log("webcamRef", webcamRef);

    console.log("recordedChunks", recordedChunks);
    console.log("blob", blob);
    console.log("url", url);

    setVideo(blob)

  }, [mediaRecorderRef, webcamRef, setCapturing]);




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

      {!video ? (
        <div className="is-relative has-text-centered has-background-grey" style={{ maxWidth: 640, maxHeight: 480, paddingBottom: "75%" }}>
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
          {!loading && !capturing &&
            <div
              style={{
                borderRadius: "3rem",
                position: "absolute",
                bottom: "1rem",
                left: 0,
                right: 0,
                margin: "auto",
                width: "2.75rem",
                height: "2.75rem",
                background: "#f03",
                padding: 3,
                border: "3px solid #64686B",
                backgroundClip: "content-box",
                cursor: "pointer"
              }}
              onClick={handleStartCaptureClick}
            />
          }
          {!loading && capturing && (
            <>
            <CaptureButton
              icon="pause"
              handleClick={handleStopCaptureClick}
            />
            <div
              style={{
                borderRadius: "3rem",
                position: "absolute",
                bottom: "1rem",
                right: "calc(50% + 2.5rem)",
                margin: "auto",
                width: "2.75rem",
                height: "2.75rem",
                padding: 3,
                border: "3px solid #64686B",
                backgroundClip: "content-box",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onClick={saveVideo}
            >
              <div
                style={{
                  borderRadius: 4,
                  background: "#f03",
                  width: "1.5rem",
                  height: "1.5rem"
                }}
              />
            </div>
            </>
          )}
        </div>
      ) : (
        <div className="is-relative has-text-centered has-background-grey" style={{ maxWidth: 640, maxHeight: 480, paddingBottom: "75%" }}>
          hellllo
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
