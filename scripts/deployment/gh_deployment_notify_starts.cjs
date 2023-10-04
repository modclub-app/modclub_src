const { notify_slack } = require("./slack_util.cjs");

const DEPLOYMENT_NOTIFICATION_PATH = process.env.DEPLOYMENT_NOTIFICATION_PATH;
const DEV_ENV = process.env.DEV_ENV;

const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID;
const PR_NUMBER = process.env.PR_NUMBER;
const COMMIT_SHA = process.env.COMMIT_SHA;

const template = {
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*[${DEV_ENV} env] Deployment starts.* \n\n Commit: ${COMMIT_SHA}\n<https://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}|Check workflow>\n<https://github.com/${GITHUB_REPOSITORY}/pull/${PR_NUMBER}|View PR #${PR_NUMBER}>`,
      },
    },
  ],
};

console.log(JSON.stringify(template, null, 2));

notify_slack(template, DEPLOYMENT_NOTIFICATION_PATH, (_error) => {
  process.exit(1);
});
