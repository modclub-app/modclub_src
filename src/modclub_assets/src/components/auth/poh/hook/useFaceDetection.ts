import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import {
  DETECTION_X_LEFT,
  DETECTION_X_RIGHT,
  DETECTION_Y_TOP,
  DETECTION_Y_BOTTOM,
  FACE_DETECTION_MIN_SCORE,
  TINY_FACE_DETECTOR_MODEL,
  FACE_LANDMARK_68_MODEL,
  FACE_RECOGNITION_MODEL,
  FACE_SSD_MOBILENETV1_MODEL,
  FACE_DETECTION_INTERVAL,
} from "../../../../utils/constant";

const useFaceDetection = () => {
  const [isOutOfBound, setIsOutOfBound] = useState<boolean>(false);
  const [isDetectionStarted, setIsDetectionStarted] = useState<boolean>(false);
  const webcamRef = useRef(null);
  const intervalId = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load models from face api
  const loadModels = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri(TINY_FACE_DETECTOR_MODEL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(FACE_LANDMARK_68_MODEL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(FACE_RECOGNITION_MODEL);
      await faceapi.nets.ssdMobilenetv1.loadFromUri(FACE_SSD_MOBILENETV1_MODEL);

      faceMyDetect();
    } catch (err) {
      console.error("Error loading face detection models: ", err);
    }
  };

  // Detect a face, control the position of the face,
  // and send an error if the face is outside the face template position;
  const faceMyDetect = () => {
    intervalId.current = setInterval(async () => {
      if (webcamRef.current) {
        const detections = await faceapi
          .detectSingleFace(
            webcamRef.current.video,
            new faceapi.SsdMobilenetv1Options()
          )
          .withFaceLandmarks();

        // Check if detection started
        if (detections && !isDetectionStarted) {
          console.log("Face detection started on webcam video stream.");
          setIsDetectionStarted(true);
        }

        // if something is wrong with the face, we consider
        // that the face is outside the boundaries of the frame
        if (!detections && !isOutOfBound) {
          setIsOutOfBound(true);
        }

        if (detections) {
          const {
            // @ts-ignore
            alignedRect: { _box },
            detection: { _score },
          } = detections;
          // Find face position outside the face template;
          const isOutOfBound =
            _box._x > DETECTION_X_LEFT ||
            _box._x < DETECTION_X_RIGHT ||
            _box._y > DETECTION_Y_BOTTOM ||
            _box._y < DETECTION_Y_TOP ||
            _score < FACE_DETECTION_MIN_SCORE;
          // If the face is outside the face template, we send a boolean variable;
          setIsOutOfBound(isOutOfBound);
          // console.info("Face detection information: ", detections);
        }
      }
    }, FACE_DETECTION_INTERVAL);
  };

  useEffect(() => {
    webcamRef && loadModels();
    return () => {
      if (webcamRef.current && webcamRef.current.srcObject) {
        const tracks = webcamRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
      clearInterval(intervalId.current);
    };
  }, []);

  return { isOutOfBound, webcamRef, isDetectionStarted };
};

export default useFaceDetection;
