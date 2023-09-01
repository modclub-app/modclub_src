const path = require("path");
const readline = require("readline");
const { spawn } = require("child_process");
const { developerNeuronId, pemFilePath } = require("./sns_config.cjs");
const canisterIds = require(path.join(
  process.cwd(),
  "./.dfx/local/canister_ids.json"
));
const canisterIdsProd = require(path.join(
  process.cwd(),
  "./canister_ids.json"
));

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

const snsCanisterIdsFile = "./sns_canister_ids.json";

(async function registerFunction() {
  console.log("🚀 Function Registration Script...");

  const functionName = await prompt("🔖 Enter the Function Name: ");
  const network = await prompt(
    '🌐 Do you want to deploy to the local or ic? (Enter "local" or "ic"): '
  );

  const functionId = Date.now(); // using current timestamp as a unique numeric identifier, make sure it's greater than 1000
  // const canisterName = await prompt("🔖 Enter the Canister Name: ");
  // const validateFunction = await prompt(
  //   "🔖 Is this a generic validate function? (Press enter if yes, or type the custom validation function name for non-generic): ",
  //   "yes"
  // );

  // const canisterId =
  //   network === "ic"
  //     ? canisterIdsProd[canisterName].ic
  //     : canisterIds[canisterName].local;

  try {
    console.log("🚀 Preparing function registration proposal...");
    const proposalStr = `(record { title="Register icrc1_transfer function."; url="https://modclub.ai/"; summary="This proposal registers icrc1_transfer function."; action=opt variant {AddGenericNervousSystemFunction = record {id=${functionId}:nat64; name="icrc1_transfer"; description=null; function_type=opt variant {GenericNervousSystemFunction=record{validator_canister_id=opt principal"gwuzc-waaaa-aaaah-qdboa-cai"; target_canister_id=opt principal"xsi2v-cyaaa-aaaaq-aabfq-cai"; validator_method_name=opt"${"validate"
      }"; target_method_name=opt"icrc1_transfer"}}}}})`;
    const escapedProposalStr = JSON.stringify(proposalStr);
    const registerCommand = `quill sns --canister-ids-file ${snsCanisterIdsFile} --pem-file ${pemFilePath} make-proposal --proposal ${escapedProposalStr} ${developerNeuronId} > register-${functionName}.json`;
    await execShellCommand(registerCommand);
    console.log(
      "✅ Registration proposal prepared, Please send with the following command: "
    );
    const sendRegisterCommand = `quill send -y register-${functionName}.json ${network == "ic" ? "" : "--insecure-local-dev-mode"
      }`;
    console.log("\x1b[36m%s\x1b[0m", sendRegisterCommand);
  } catch (err) {
    console.error("❌ Error:", err);
    console.log("debugging proposal: " + registerCommand);
  }
})();
