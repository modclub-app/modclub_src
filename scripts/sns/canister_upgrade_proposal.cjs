const path = require("path");
const readline = require("readline");
const { spawn, execSync } = require("child_process");
const {
  developerNeuronId,
  pemFilePath,
  canisterCommands,
} = require("./sns_config.cjs");

const https = require("https");

// Function to send a message to Slack via webhook
function sendToSlack(message) {
  const webhookUrl = new URL(process.env.PROPOSAL_NOTIFICATION_SLACK_HOOK);
  const postData = JSON.stringify({
    text: message,
  });

  const options = {
    hostname: webhookUrl.hostname,
    port: 443,
    path: webhookUrl.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": postData.length,
    },
  };

  const req = https.request(options, (res) => {
    res.on("data", (d) => {
      process.stdout.write(d);
    });
  });

  req.on("error", (e) => {
    console.error(`Error sending to Slack: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

// Function to get input either from arguments, environment variables, or prompt
function getInput(index, envVar, question) {
  return process.argv[index] || process.env[envVar] || prompt(question);
}

// Function to send a message to Slack via webhook
function sendToSlack(message) {
  const webhookUrl = new URL(process.env.PROPOSAL_NOTIFICATION_SLACK_HOOK);
  const postData = JSON.stringify({
    text: message,
  });

  const options = {
    hostname: webhookUrl.hostname,
    port: 443,
    path: webhookUrl.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": postData.length,
    },
  };

  const req = https.request(options, (res) => {
    res.on("data", (d) => {
      process.stdout.write(d);
    });
  });

  req.on("error", (e) => {
    console.error(`Error sending to Slack: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

// Function to get input either from arguments, environment variables, or prompt
function getInput(index, envVar, question) {
  return process.argv[index] || process.env[envVar] || prompt(question);
}

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("SIGINT", () => {
    rl.close();
    process.exit(0);
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
      rl.close();
    });
  });
}

function execShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    let output = "";
    const command = spawn(cmd, {
      shell: true,
      stdio: ["inherit", "pipe", "pipe"],
    });

    command.stdout.on("data", (data) => {
      output += data.toString();
    });

    command.stderr.on("data", (data) => {
      output += data.toString();
    });

    command.on("error", (error) => reject(error));
    command.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Command exited with code ${code}: ${output}`));
      } else {
        resolve(output);
      }
    });
  });
}

(async () => {
  console.log("🚀 Canister Upgrade Script...");

  const canisterName = await getInput(
    2,
    "CANISTER",
    "🔖 Enter the canister Name (ex. auth_qa): "
  );
  const network = await getInput(
    3,
    "NETWORK",
    '🌐 Do you want to deploy to the local or ic? (Enter "local" or "ic"): '
  );
  const title = await getInput(4, "TITLE", "🔖 Enter proposal title: ");
  const url = await getInput(5, "URL", "🔖 Enter the url: ");
  const summary = await getInput(6, "SUMMARY", "🔖 Enter proposal summary: ");
  const environment = await getInput(
    7,
    "ENVIRONMENT",
    "🌐 Enter the environment (qa, dev, or prod): "
  );

  const snsCanisterIdsFile = "./sns_canister_ids.json";
  const canisterIdsPath =
    network === "local"
      ? path.join(process.cwd(), ".dfx/local/canister_ids.json")
      : path.join(process.cwd(), "./canister_ids.json");

  const canisterIds = require(canisterIdsPath);

  const canisterId =
    network === "local"
      ? canisterIds[canisterName].local
      : canisterIds[canisterName].ic;

  var wasmPath = path.join(
    process.cwd(),
    ".dfx",
    network,
    "canisters",
    canisterName,
    `${canisterName}.wasm`
  );

  function getCanisterId(canisterName) {
    const fullCanisterName =
      environment === "prod" ? canisterName : `${canisterName}_${environment}`;
    return execSync(
      environment === "prod"
        ? `dfx canister id ${fullCanisterName} --network=ic`
        : `dfx canister id ${fullCanisterName}`,
      {
        encoding: "utf8",
      }
    ).trim();
  }

  const modclubCanisterId = getCanisterId("modclub");
  const rsCanisterId = getCanisterId("rs");
  const walletCanisterId = getCanisterId("wallet");
  const authCanisterId = getCanisterId("auth");
  const vestingCanisterId = getCanisterId("vesting");

  const upgradeArg = `record { modclub_canister_id = principal \\"${modclubCanisterId}\\"; old_modclub_canister_id = principal \\"la3yy-gaaaa-aaaah-qaiuq-cai\\"; rs_canister_id = principal \\"${rsCanisterId}\\"; wallet_canister_id = principal \\"${walletCanisterId}\\"; auth_canister_id = principal \\"${authCanisterId}\\"; vesting_canister_id = principal \\"${vestingCanisterId}\\"; }`;

  try {
    console.log("🚀 Preparing upgrade proposal...");
    const makeProposalCommand = `quill sns --canister-ids-file ${snsCanisterIdsFile} --pem-file ${pemFilePath} make-upgrade-canister-proposal  --summary "${summary}" --title "${title}" --url "${url}" --target-canister-id ${canisterId} --wasm-path "${wasmPath}" --canister-upgrade-arg "(${upgradeArg})" ${developerNeuronId} > upgrade.json`;
    await execShellCommand(makeProposalCommand);

    console.log("✅ Preparing proposal...");
    const sendCommand = `quill send upgrade.json ${
      network == "ic" ? "" : "--insecure-local-dev-mode"
    } -y | grep -v "^ *new_canister_wasm"`;

    console.log("🚀 Sending proposal...");
    const commandOutput = await execShellCommand(sendCommand);
    console.log(commandOutput);
    sendToSlack(`✅ Proposal submitted successfully!`);
    sendToSlack(`✅ Proposal Command Output: ${commandOutput}`);
  } catch (err) {
    console.log(" upgradeArg: " + upgradeArg);
    console.error("❌ Error:", err);
    sendToSlack(`❌ Error while sending proposal: ${err.message}`);
    sendToSlack(`upgradeArg: ${upgradeArg}`);
    console.log("debugging proposal: " + makeProposalCommand);
  }
})();
