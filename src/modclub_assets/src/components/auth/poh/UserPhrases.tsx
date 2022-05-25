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

export default function UserPhrases({ steps }) {

  
  console.log("UserPhrases steps", steps);


  const history = useHistory();
  const [loading, setLoading] = useState<boolean>(true);
  const [phrases, setPhrases] = useState([]);

  const [capturing, setCapturing] = useState<boolean>(false);
  const [recordState, setRecordState] = useState(null);
  const [audioData, setAudioData] = useState(null);


  const [submitting, setSubmitting] = useState<boolean>(false);


  const submit = async () => {
    // setSubmitting(true);
    // const blob = new Blob(recordedChunks, {
    //   type: mimeType
    // });
    // if (blob.size <= MIN_FILE_SIZE) {
    //   alert("File upload could not be completed. File size is too small. Please try again"); 
    //   setSubmitting(false);
    //   return;
    // }
    
    // let chunk = 1;
    // for (let byteStart = 0; byteStart < blob.size; byteStart += MAX_CHUNK_SIZE, chunk++ ) {
    //   await processAndUploadChunk(
    //     "challenge-user-video",
    //     MAX_CHUNK_SIZE,
    //     blob,
    //     byteStart,
    //     chunk,
    //     blob.size,
    //     blob.type
    //   );
    // }
    
    // setSubmitting(false);
    // history.push("/new-poh-profile/confirm");
  }

  const formatPhrases = () => {
    // const { wordList } = steps.find(step => step.wordList[0].length)
    // setPhrases(wordList[0])
    setPhrases(['Jolt', 'Live', 'Crop', 'Dead', 'Till', 'Blue'])
  }


  useEffect(() => {
    steps && steps.length && formatPhrases();
  }, [steps]);

  // useEffect(() => {
  //   let interval = null;
  //   if (capturing) {
  //     interval = setInterval(() => {
  //       setSeconds(seconds => seconds + 1);
  //     }, 1000);
  //   } else if (!capturing && seconds !== 0) {
  //     clearInterval(interval);
  //   }
  //   return () => clearInterval(interval);
  // }, [capturing, seconds]);

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
                bottom: "35%",
                left: 0,
                width: "85%"
              }}
            ></audio>
            <Button
              rounded
              style={{
                position: "absolute",
                bottom: "42%",
                right: 0,
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
            <AudioReactRecorder
              state={recordState}
              onStop={onStop}
              backgroundColor="rgb(33, 33, 33)"
              canvasHeight="100"
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
            </>
          )}
        </div>
      </div>

      <Card className="mt-6 mb-5">
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
