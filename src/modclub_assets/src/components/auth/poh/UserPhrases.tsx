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
import AudioReactRecorder, { RecordState } from 'audio-react-recorder'
import { processAndUploadChunk } from "../../../utils/util";
import { format, formatDuration } from "date-fns";
import { MAX_CHUNK_SIZE, MIN_FILE_SIZE } from '../../../utils/config';


const RecordButton = styled.div`
  cursor: pointer;
  border-radius: 50%;
  min-width: 46px;
  height: 46px;
  box-sizing: border-box;
  transition: all .2s;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;

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

const Timer = styled.div`
  position:absolute;
  right: 0;
  left: 0;
  top: 60px;
  width: 40px;
  margin: auto;
  display: flex;
  z-index: 10;
  justify-content: center;
  align-items: center;
  font-size: 11px;
  background-color: rgba(46,49,54,.9);
  border-radius: 35px;
  padding: 4px 7px;
  line-height: 1;
  color: white;
`;

export default function UserPhrases({ steps }) {

  
  console.log("UserPhrases steps", steps);


  const history = useHistory();
  const [loading, setLoading] = useState<boolean>(true);
  const [phrases, setPhrases] = useState([]);

  const [capturing, setCapturing] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(0);
  const [recordState, setRecordState] = useState(null);
  const [audioData, setAudioData] = useState(null);


  const [submitting, setSubmitting] = useState<boolean>(false);


  const submit = async () => {
    setSubmitting(true);
    const blob = audioData.blob;
    if (blob.size <= MIN_FILE_SIZE) {
      alert("File upload could not be completed. File size is too small. Please try again"); 
      setSubmitting(false);
      return;
    }
    
    let chunk = 1;
    for (let byteStart = 0; byteStart < blob.size; byteStart += MAX_CHUNK_SIZE, chunk++ ) {
      await processAndUploadChunk(
        "challenge-user-audio",
        MAX_CHUNK_SIZE,
        blob,
        byteStart,
        chunk,
        blob.size,
        blob.type
      );
    }
    
    setSubmitting(false);
    history.push("/new-poh-profile/confirm");
  }

  const formatPhrases = () => {
    // const { wordList } = steps.find(step => step.wordList[0].length)
    // setPhrases(wordList[0])
    setPhrases(['Jolt', 'Live', 'Crop', 'Dead', 'Till', 'Blue'])
  }


  useEffect(() => {
    steps && steps.length && formatPhrases();
  }, [steps]);

  useEffect(() => {
    let interval = null;
    if (capturing) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (!capturing && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [capturing, seconds]);

  const handleStartCaptureClick = () => {
    setCapturing(true);
    setRecordState(RecordState.START);
  };

  // const handlePauseCaptureClick = () => {
  //   setCapturing(false);
  //   setRecordState(RecordState.PAUSE);
  //   // setRecordState(RecordState.STOP);
  // };

  const handleStopCaptureClick = () => {
    setCapturing(false);
    setRecordState(RecordState.STOP);
  };

  const onStop = (data) => {
    setAudioData(data);
    console.log('onStop: audio data', data)
  };

  const resetAudio = () => {
    setAudioData(null);
  };

  const formattedTime = (val) => {
    const time = new Date(0, 0, 0);
    time.setSeconds(val);
    return format(time, 'mm:ss');
  }

  return (
    <>
      {submitting &&
        <Modal show={true} showClose={false}>
          <div className="loader is-loading p-5"></div>
        </Modal>
      }

      
      <div className="is-relative has-text-centered" style={{ margin: "auto", boxSizing: "border-box", maxWidth: 640, maxHeight: 480 }}>
        <div style={{ paddingBottom: "35%" }}>
          {audioData ? (
            <>
            <audio
              id="audio"
              controls
              src={audioData ? audioData.url : null}
              style={{
                position: "absolute",
                margin: "auto",
                left: 0,
                right: 0,
                width: "85%"
              }}
            ></audio>
            <Button
              rounded
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                left: 0,
                margin: "auto",
                width: "3rem",
                height: "3rem",
                background: "rgba(46, 49, 54, 0.6)",
                border: 0
              }}
              onClick={resetAudio}
            >
              <Icon color="white">
                <span className="material-icons">
                  delete
                </span>
              </Icon>
            </Button>
            </>
          ) : (
            <>
              <p>Click to start recording</p>
              <AudioReactRecorder
                state={recordState}
                onStop={onStop}
                backgroundColor="#eee"
                borderRadius="1rem"
                canvasHeight="100"
              />

            {capturing &&
              <Timer>
                {formattedTime(seconds)}
              </Timer>
            }
              <RecordButton
                capturing={capturing}
                onClick={capturing ? handleStopCaptureClick : handleStartCaptureClick}
              >
                <svg width="46" height="46" className="btn-record-timer">
                  <defs> <mask id="cirleMask"> <rect height="46" width="46" fill="white"></rect> <circle r="18" cx="23" cy="23" fill="black"></circle> </mask> </defs> <circle r="23" cx="23" cy="23" fill="#64686B" mask="url(#cirleMask)"></circle> <path id="timerArc" fill="#ffffff" strokeWidth="0" mask="url(#cirleMask)" d="M 23 23 L 22.999999999999996 0 A 23 23 0 0 0 22.999999999999996 0 L 23 23"></path>
                </svg>
                <i />
              </RecordButton>
            </>
          )}
        </div>
      </div>

      <Card className="my-5">
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
        <Button color="primary" disabled={!audioData || capturing} onClick={submit}>
          Next
        </Button>
      </Button.Group>
    </>
  );
};
