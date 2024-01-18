import * as React from "react";
import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Modal,
  Heading,
  Button,
  Icon,
  Card,
  Columns,
} from "react-bulma-components";
import MicRecorder from "mic-recorder-to-mp3";
import { format } from "date-fns";
import { MAX_CHUNK_SIZE, MIN_FILE_SIZE } from "../../../utils/config";
import { processAndUploadChunk, useActors } from "../../../utils";
import GTMManager from "../../../utils/gtm";
import { useAppState } from "../../app/state_mgmt/context/state";

const RecordButton = styled.div`
  cursor: pointer;
  border-radius: 50%;
  min-width: 46px;
  height: 46px;
  box-sizing: border-box;
  transition: all 0.2s;
  // position: absolute;
  // left: 0;
  // right: 0;
  // top: 0;
  position: relative;

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
  right: 0;
  left: 0;
  // bottom: 0;
  top: 5px;
  width: 40px;
  margin: auto;
  display: flex;
  z-index: 10;
  justify-content: center;
  align-items: center;
  font-size: 23px;
  background-color: rgba(46, 49, 54, 0.9);
  border-radius: 35px;
  padding: 12px 60px;
  line-height: 1;
  color: white;
`;

export default function UserPhrases({ step, goToNextStep }) {
  const [loading, setLoading] = useState<boolean>(true);
  const phrases = step.wordList[0];
  const appState = useAppState();

  const [capturing, setCapturing] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(0);
  const [audioData, setAudioData] = useState(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const recorder = useRef(null); //Recorder
  const audioPlayer = useRef(null); //Ref for HTML Audio tag

  const [blobURL, setBlobUrl] = useState(null);
  const [play, setPlay] = useState(false);

  const [hasAudioPermission, setHasAudioPermission] = useState<boolean>(true);
  const { modclub } = useActors();

  useEffect(() => {
    const fetch = async () => {
      try {
        //Get user audio permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recorder.current = new MicRecorder({ bitRate: 128 });
      } catch (err) {
        setHasAudioPermission(false);
      }
    };
    fetch();
  }, []);

  const submit = async () => {
    setSubmitting(true);
    const blob = audioData;
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
        "challenge-user-audio",
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

    // GTM: determine the quantity of submitted audio challenge;
    GTMManager.trackEvent(
      "userPohChallenge",
      {
        uId: appState.loginPrincipalId,
        type: "completed_audio",
      },
      ["uId"]
    );

    setSubmitting(false);
    goToNextStep("challenge-user-audio");
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

  const handleStartCaptureClick = () => {
    recorder.current.start().then(() => {
      setCapturing(true);
    });
  };

  const handleStopCaptureClick = () => {
    recorder.current
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const newBlobUrl = URL.createObjectURL(blob);
        setAudioData(blob);
        setBlobUrl(newBlobUrl);
        setCapturing(false);
      })
      .catch((e) => console.log(e));
  };

  const resetAudio = () => {
    const newBlobUrl = URL.createObjectURL(new Blob());
    setBlobUrl(newBlobUrl);
    setSeconds(0);
    setAudioData(null);
  };

  const formattedTime = (val) => {
    const time = new Date(0, 0, 0);
    time.setSeconds(val);
    return format(time, "mm:ss");
  };

  return (
    <>
      {submitting && (
        <Modal show={true} showClose={false}>
          <div className="loader is-loading p-5"></div>
        </Modal>
      )}

      <div
        className="is-relative has-text-centered"
        style={{
          margin: "auto",
          boxSizing: "border-box",
          maxWidth: 640,
          maxHeight: 480,
        }}
      >
        <div
          className="is-flex is-flex-direction-column is-justify-content-flex-end"
          style={{ height: audioData || capturing ? 110 : 100 }}
        >
          {audioData ? (
            <>
              <audio
                id="audio"
                src={blobURL}
                ref={audioPlayer}
                controls
                style={{
                  margin: "0 auto",
                  width: "85%",
                }}
                onEnded={() => setPlay(false)} //event handler when audio has stopped playing
              />
              <Button
                rounded
                style={{
                  margin: "auto",
                  width: "3rem",
                  height: "3rem",
                  background: "rgba(46, 49, 54, 0.6)",
                  border: 0,
                }}
                onClick={resetAudio}
              >
                <Icon color="white">
                  <span className="material-icons">delete</span>
                </Icon>
              </Button>
            </>
          ) : (
            <>
              {!hasAudioPermission && (
                <div className="notification is-danger">
                  Microphone permission not enabled
                </div>
              )}
              {capturing && <Timer>{formattedTime(seconds)}</Timer>}
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
              {!capturing && (
                <p className="mt-5 mb-3">Click to start recording</p>
              )}
            </>
          )}
        </div>
      </div>

      <Card className="my-5">
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
          disabled={!audioData || capturing}
          onClick={submit}
        >
          Next
        </Button>
      </Button.Group>
    </>
  );
}
