export const NOVICE_LEVEL_UPGRADE_MESSAGE =
  "Reach 20 scores to level up to Junior moderator";
export const JUNIOR_LEVEL_UPGRADE_MESSAGE =
  "Reach 50 scores to level up to Senior moderator";
export const SENIOR_MODERATOR_MESSAGE =
  "Keep your senior moderator status with more than 50 scores";
export const DEFAULT_MESSAGE = "...";
export const NOVICE_CLAIM_LIMIT_MESSAGE =
  "Upgrade to Junior moderator to start claiming your rewards";
export const JUNIOR_CLAIM_LIMIT_MESSAGE = "as junior you can claim only 50%";
export const FULL_CLAIM_MESSAGE = "You can fully claim your rewards";
export const NOVICE_MSG_CONFIRM_VOTE =
  "I understand I need 10 success votes to get to Junior level";
export const JUNIOR_MSG_CONFIRM_VOTE =
  "I understand I need 100 success votes to get to Senior level";
export const VOTE_INCORRECT_MSG =
  "I understand I will lose some of my reputation score If I vote incorrectly";
export const VOTE_POH_RULE_CONFIRM_MSG = "I confirm that this is a real person";
export const VOTE_RULE_CONFIRM_MSG =
  "I confirm that this content does not break any rules above";
export const SENIOR_MSG_CONFIRM_VOTE = "";
export const CLAIM_LIMIT_MSG = (value: number) =>
  `Stake ${value} MOD to unlock reward`;
export const DEFAULT_DATE_FORMAT = "dd MMM yyyy";
export const LB_PAGE_SIZE = 30;
export const RS_FACTOR = 100;
export const ACTIVE_BALANCE_MSG =
  "You can use your active balance to stake in order to receive your rewards";
export const STAKE_BALANCE_MSG =
  "Stake function is available to unlock your pending rewards. Please be aware unstake will impact your levelling as a moderator";
export const PENDING_REWARDS_MSG =
  "The amount of rewards you earned through unstaking";
export const TIMER = "05:00";
export const TIMER_SECOND = 300;
export const UNSTAKE_WARN_MSG = (value: number) =>
  `*Read before your unstake: The unstake process takes 7 days to complete, and if you unstake more than ${value} Mod, your levelling will be negatively affected.`;
export const MICROSECONDS_IN_SECOND = 1000000;
export const DATA_REMOVE_MSG =
  "Data has been removed due to Modclub's data policy";
export const MESSAGE_FOR_USER_VIDEO_RECORD =
  "During the recording, it's crucial that your face remains within the outlined oval. If you happen to move out of the oval's boundaries while recording, the process will automatically stop, and you'll need to start over. Please make sure to keep your face inside the oval to ensure the best quality of your video.";
export const VIDEO_WIDTH = 667;
export const VIDEO_HEIGHT = 500;
export const VIDEO_SUPPORT_MESSAGE =
  "Your browser does not support the video tag.";
export const VIDEO_POSITION_TEXT = "Please position your face at the center";
export const VIDEO_MODELS_LOADING = "Please wait, the video is loading";

// Desktop detection coords for FaceAPI
export const DETECTION_X_RIGHT = 155;
export const DETECTION_X_LEFT = 290;
export const DETECTION_Y_BOTTOM = 240;
export const DETECTION_Y_TOP = 80;

// Mobile detection coords for FaceAPI
export const DETECTION_X_RIGHT_MOBILE = 110;
export const DETECTION_X_LEFT_MOBILE = 260;
export const DETECTION_Y_BOTTOM_MOBILE = 305;
export const DETECTION_Y_TOP_MOBILE = 80;

// Detection settings for FaceAPI
export const FACE_DETECTION_INTERVAL = 300;
export const FACE_DETECTION_MIN_SCORE = 0.7;

// Face API models urls
export const MODEL_BASE_URL =
  "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/";
export const TINY_FACE_DETECTOR_MODEL = `${MODEL_BASE_URL}tiny_face_detector_model-weights_manifest.json`;
export const FACE_LANDMARK_68_MODEL = `${MODEL_BASE_URL}face_landmark_68_model-weights_manifest.json`;
export const FACE_RECOGNITION_MODEL = `${MODEL_BASE_URL}face_recognition_model-weights_manifest.json`;
export const FACE_SSD_MOBILENETV1_MODEL = `${MODEL_BASE_URL}ssd_mobilenetv1_model-weights_manifest.json`;

export const RECENT_ACTIVITY_STATUS_BOXES_INFO = [
  {
    label: "Total Approved",
    type: "totalApproved",
  },
  {
    label: "Total Rejected",
    type: "totalRejected",
  },
  {
    label: "Total Cost",
    type: "totalCost",
  },
];
