const path = require("path");
const {
  developerNeuronId,
  pemFilePath,
  canisterCommands,
} = require("./sns_config.cjs");
const { notifyToSlack, shellExec, getPrompt } = require("./utils.cjs");

// Function to get input either from arguments, environment variables, or prompt
function getInput(index, envVar, question) {
  return (
    process.argv[index] || process.env[envVar] || getPrompt(process)(question)
  );
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

  let wasmPath = path.join(
    process.cwd(),
    ".dfx",
    network,
    "canisters",
    canisterName,
    `${canisterName}.wasm.gz`
  );

  let upgradeArg;
  let makeProposalCommand;

  try {
    console.log("🚀 Preparing upgrade proposal...");
    const upgradeArgRaw = await shellExec(
      `${path.join(
        process.cwd(),
        "./scripts/deployment/get_env_arguments.sh"
      )} ${environment} ${network}`
    );

    // Function to extract a clean record
    const extractCleanRecord = (input) => {
      const records = input.match(/record \{[^}]+\}/g);
      return records ? records[0] : null;
    };

    // Extract the first clean record
    upgradeArg = extractCleanRecord(upgradeArgRaw);

    if (!upgradeArg) {
      throw new Error(
        "No valid record found in the arguments for canister deploy."
      );
    }

    console.log("upgradeArg:", upgradeArg); // For debugging

    makeProposalCommand = `quill sns --canister-ids-file ${snsCanisterIdsFile} --pem-file ${pemFilePath} make-upgrade-canister-proposal  --summary "${summary}" --title "${title}" --url "${url}" --target-canister-id ${canisterId} --wasm-path "${wasmPath}" --canister-upgrade-arg '(${upgradeArg})' ${developerNeuronId} > upgrade.json`;
    await shellExec(makeProposalCommand);

    console.log("✅ Preparing proposal...");
    const sendCommand = `quill send upgrade.json ${
      network == "ic" ? "" : "--insecure-local-dev-mode"
    } -y | grep -v "^ *new_canister_wasm"`;

    console.log("🚀 Sending proposal...");
    const commandOutput = await shellExec(sendCommand);
    console.log(commandOutput);
    notifyToSlack(`✅ Proposal submitted successfully!`);
    notifyToSlack(`✅ Proposal Command Output: ${commandOutput}`);
  } catch (err) {
    console.log(" upgradeArg: " + upgradeArg);
    console.error("❌ Error:", err);
    notifyToSlack(`❌ Error while sending proposal: ${err.message}`);
    notifyToSlack(`upgradeArg: ${upgradeArg}`);
    console.log("debugging proposal: " + makeProposalCommand);
  }
})();
