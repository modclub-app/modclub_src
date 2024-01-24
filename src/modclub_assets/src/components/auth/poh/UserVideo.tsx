import * as React from "react";
import { useCallback, useEffect, useRef, useState, useContext } from "react";
import { Link } from "react-router-dom";
import useFaceDetection from "./hook/useFaceDetection";
import WebcamInterface from "./WebcamInterface";
import { Phrases } from "./Phrases";
import { VideoWrap } from "./VideoWrap";
import { RecordPreviewButton } from "./RecordPreviewButton";
import { RecordButton } from "./RecordButton";
import { Timer } from "./Timer";
import { Button, Modal } from "react-bulma-components";
import { CaptureButton } from "./Webcam";
import { MAX_CHUNK_SIZE, MIN_FILE_SIZE } from "../../../utils/config";
import { POH_VIDEO_CHALLENGE_CONTEXT } from "../../../utils/constant";

import {
  get_aes_256_gcm_key,
  aes_gcm_encrypt,
} from "../../../utils/crypto_api";
import { Connect2ICContext } from "@connect2icmodclub/react";

import { formattedTime } from "../../../utils/util";
import { processAndUploadChunk, useActors } from "../../../utils";
import {
  MESSAGE_FOR_USER_VIDEO_RECORD,
  VIDEO_SUPPORT_MESSAGE,
} from "../../../utils/constant";
import { GTMEvent, GTMManager } from "../../../utils/gtm";
import { useAppState } from "../../app/state_mgmt/context/state";

export default function UserVideo({ step, goToNextStep }) {
  const [loading, setLoading] = useState<boolean>(true);
  const mediaRecorderRef = useRef(null);
  const { isOutOfBound, webcamRef, isDetectionStarted } = useFaceDetection();
  const [capturing, setCapturing] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(0);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const phrases = step.wordList[0];
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const supportsWebm = MediaRecorder.isTypeSupported("video/webm");
  const mimeType = supportsWebm ? "video/webm" : "video/mp4";
  const { modclub } = useActors();
  const appState = useAppState();

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
    resetVideo();
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

    const key = await get_aes_256_gcm_key(
      POH_VIDEO_CHALLENGE_CONTEXT,
      modclub,
      appState.loginPrincipalId
    );

    const blob = new Blob(recordedChunks, {
      type: mimeType,
    });
    console.log("STARTING_ENCRYPTION...");
    const ciphertext = await aes_gcm_encrypt(blob, key);
    const encryptedBlob = new Blob([ciphertext], {
      type: `encrypted/vetkd;original=${blob.type}`,
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
      byteStart < encryptedBlob.size;
      byteStart += MAX_CHUNK_SIZE, chunk++
    ) {
      let res = await processAndUploadChunk(
        modclub,
        "challenge-user-video",
        MAX_CHUNK_SIZE,
        encryptedBlob,
        byteStart,
        chunk,
        encryptedBlob.size,
        encryptedBlob.type
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

    // GTM: determine the quantity of submitted video challenge;
    GTMManager.trackEvent(
      GTMEvent.UserPohChallenge,
      {
        uId: appState.loginPrincipalId,
        type: "completed_video",
      },
      ["uId"]
    );

    setSubmitting(false);
    goToNextStep("challenge-user-video");
  };

  useEffect(() => {
    if (isOutOfBound && !recordedChunks.length) {
      mediaRecorderRef.current && mediaRecorderRef.current.stop();
      setCapturing(false);
      resetVideo();
    }
  }, [isOutOfBound, recordedChunks]);

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
        <VideoWrap
          message={MESSAGE_FOR_USER_VIDEO_RECORD}
          video={
            <WebcamInterface
              ref={webcamRef}
              isError={isOutOfBound}
              isDetectionStarted={!isDetectionStarted}
              onUserMedia={() => setLoading(false)}
            />
          }
          timer={<Timer time={formattedTime(seconds)} />}
          actionButton={
            !loading && (
              <RecordButton
                active={capturing}
                disabled={isOutOfBound || !isDetectionStarted}
                onClick={
                  capturing ? handleStopCaptureClick : handleStartCaptureClick
                }
              />
            )
          }
          previewButton={
            recordedChunks.length > 0 && (
              <RecordPreviewButton onClick={saveVideo} />
            )
          }
        />
      ) : (
        <VideoWrap
          video={
            <video
              width="100%"
              height="auto"
              autoPlay
              style={{ transform: "scaleX(-1)" }}
            >
              <source src={videoUrl} />
              {VIDEO_SUPPORT_MESSAGE}
            </video>
          }
          actionButton={
            <CaptureButton icon="delete" handleClick={resetVideo} />
          }
        />
      )}

      <Phrases phrases={phrases} />

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
