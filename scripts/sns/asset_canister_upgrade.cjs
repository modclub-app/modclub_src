const readline = require("readline");
const { spawn } = require("child_process");
const { developerNeuronId, pemFilePath } = require("./sns_config.cjs");
const path = require("path");

async function prompt(question, defaultValue = "") {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer || defaultValue);
      rl.close();
    });
  });
}

function execShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    const command = spawn(cmd, { shell: true, stdio: "pipe" });
    let result = "";

    command.stdout.on("data", (data) => {
      result += data.toString();
    });

    command.on("error", (error) => reject(error));
    command.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Command exited with code ${code}`));
      } else {
        resolve(result);
      }
    });
  });
}

const snsCanisterIdsFile = "./sns_canister_ids.json";

(async function executeFunction() {
  console.log("🚀 Function Execution Script...");
  const network = await prompt(
    '🌐 Do you want to execute function on local or ic? (Enter "local" or "ic"): '
  );
  const functionId = (
    await prompt(
      "🔖 Enter the commit_batch Function ID (from function proposal): "
    )
  ).trim();
  const batch_id = (await prompt("🔖 Enter the batch id: ")).trim();
  const evidence = (await prompt("🔖 Enter the evidence: ")).trim();
  const url = await prompt(
    "🔖 Enter a URL or hit enter for https://modclub.ai: ",
    "https://modclub.ai"
  );

  // Prepare evidence and batch_id
  const formattedEvidence = `blob "\\${evidence.match(/.{1,2}/g).join("\\")}"`;
  const argument = `(record {batch_id=${batch_id}:nat; evidence= ${formattedEvidence}})`;

  const argumentEncoded = await execShellCommand(
    `didc encode '(${argument})' --format blob`
  );

  try {
    console.log("🚀 Preparing function execution proposal...");
    const payload = argumentEncoded;

    const proposalStr = `(record { title="Execute function with ID ${functionId}."; url="${url}"; summary="This proposal executes function with ID ${functionId}, to upgrade the assets canister."; action=opt variant {ExecuteGenericNervousSystemFunction = record {function_id=${functionId}:nat64; payload=${payload}}}})`;
    const escapedProposalStr = proposalStr.replace(/"/g, '\\"');

    const executeCommand = `quill sns --canister-ids-file ${snsCanisterIdsFile} --pem-file ${pemFilePath} make-proposal --proposal "${escapedProposalStr}" ${developerNeuronId} > execute-function-${functionId}.json`;
    await execShellCommand(executeCommand);
    console.log(
      `✅ Execution proposal prepared and saved to execute-function-${functionId}.json \n`
    );
    const sendExecuteCommand = `quill send -y execute-function-${functionId}.json ${
      network == "ic" ? "" : "--insecure-local-dev-mode"
    }`;
    console.log(
      "Use this command to send proposal: " + "\n" + "\x1b[36m%s\x1b[0m",
      sendExecuteCommand + "\n"
    );
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();
