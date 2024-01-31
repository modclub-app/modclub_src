const { notify_slack } = require("./slack_util.cjs");

const DEPLOYMENT_NOTIFICATION_PATH = process.env.DEPLOYMENT_NOTIFICATION_PATH;
const DEV_ENV = process.env.DEV_ENV;
let WHATS_NEW_SINCE_LAST_DEP = process.env.WHATS_NEW_SINCE_LAST_DEP;

// https://api.slack.com/methods/chat.postMessage#:~:text=Ideally%2C%20messages%20should%20be%20short,containing%20more%20than%2040%2C000%20characters.
SLACK_MSG_LEN_LIMIT = 2000;
if (WHATS_NEW_SINCE_LAST_DEP.length >= SLACK_MSG_LEN_LIMIT) {
  WHATS_NEW_SINCE_LAST_DEP =
    WHATS_NEW_SINCE_LAST_DEP.substring(0, SLACK_MSG_LEN_LIMIT - 3) + "...";
  // TODO: could use chatgpt api to summarize the content instead of truncate the value
}
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID;
const PR_NUMBER = process.env.PR_NUMBER;
const COMMIT_SHA = process.env.COMMIT_SHA;

const LAST_DEPLOYMENT_TAG = process.env.LAST_DEPLOYMENT_TAG;
const DEPLOYMENT_TAG = process.env.DEPLOYMENT_TAG;
const CANISTER_ONLY = process.env.CANISTER_ONLY || "ALL";

const totalBackups = 2;
let backupsString = "[";
for (let i = 1; i <= totalBackups; i++) {
  // Construct the environment variable names
  const backupIdKey = `BACKUP_ID_${i}`;
  const backupFieldNameKey = `BACKUP_FIELDNAME_${i}`;
  const backupId = process.env[backupIdKey];
  const backupFieldName = process.env[backupFieldNameKey];
  backupsString += `(${backupId} - ${backupFieldName})`;

  if (i < totalBackups) {
    backupsString += ", ";
  }
}
backupsString += "]";

console.log(backupsString);
console.log(WHATS_NEW_SINCE_LAST_DEP)
const template = {
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*[${DEV_ENV}] Deployment (${DEPLOYMENT_TAG}) starts... (Canister:${CANISTER_ONLY})* \n\n Commit: ${COMMIT_SHA}\n<https://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}|Check workflow>\n<https://github.com/${GITHUB_REPOSITORY}/pull/${PR_NUMBER}|View PR #${PR_NUMBER}> \n\n *What's new in the HEAD since last deployment(${LAST_DEPLOYMENT_TAG})* \n ${WHATS_NEW_SINCE_LAST_DEP} \n\n Backups:${backupsString} \n`
      },
    },
  ],
};

console.log(JSON.stringify(template, null, 2));

notify_slack(template, DEPLOYMENT_NOTIFICATION_PATH, (_error) => {
  process.exit(1);
});
