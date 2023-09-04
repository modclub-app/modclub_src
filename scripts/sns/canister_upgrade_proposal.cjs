const path = require("path");
const readline = require("readline");
const { spawn, execSync } = require("child_process");
const {
  developerNeuronId,
  pemFilePath,
  canisterCommands,
} = require("./sns_config.cjs");
const canisterIds = require(path.join(
  process.cwd(),
  ".dfx/local/canister_ids.json"
));
const canisterIdsProd = require(path.join(
  process.cwd(),
  "./canister_ids.json"
));

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
    const command = spawn(cmd, { shell: true, stdio: "inherit" });

    command.on("error", (error) => reject(error));
    command.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Command exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

(async () => {
  console.log("🚀 Canister Upgrade Script...");

  const canisterName = await prompt(
    "🔖 Enter the canister Name (ex. auth_qa): "
  );
  const network = await prompt(
    '🌐 Do you want to deploy to the local or ic? (Enter "local" or "ic"): '
  );
  const snsCanisterIdsFile = "./sns_canister_ids.json";
  const canisterId =
    network === "local"
      ? canisterIds[canisterName].local
      : canisterIdsProd[canisterName].ic;

  //proposal
  const title = await prompt("🔖 Enter proposal title: ");
  const url = await prompt("🔖 Enter the url: ");
  const summary = await prompt("🔖 Enter proposal summary: ");

  var wasmPath = path.join(
    process.cwd(),
    ".dfx",
    network,
    "canisters",
    canisterName,
    `${canisterName}.wasm`
  );

  const execSync = require("child_process").execSync;
  const environment = await prompt(
    "🌐 Enter the environment (qa, dev, or prod): "
  );

  function getCanisterId(canisterName) {
    // Append the environment to the canister name, unless the environment is 'none'
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
    //await execShellCommand(sendCommand);

    console.log("✅ Proposal ready to be sent.");
    console.log("\n");
    console.log("Run the following command to send the proposal: \n");
    console.log("\x1b[36m%s\x1b[0m", sendCommand);
    console.log("\n");
  } catch (err) {
    console.log(" upgradeArg: " + upgradeArg);
    console.error("❌ Error:", err);
    console.log("debugging proposal: " + makeProposalCommand);
  }
})();
