const { exec } = require("child_process");
const readline = require("readline");
const {
  developerNeuronId,
  pemFilePath,
  canisterCommands,
} = require("./sns_config.cjs");

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
      rl.close();
    });
  });
}

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error}`);
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

prompt("Choose network: local or ic? ").then((network) => {
  if (network === "local" || network === "ic") {
    Promise.all(
      canisterCommands.map((cmd) => {
        return executeCommand(cmd + ` --network=${network}`).then(
          (canisterId) => {
            return executeCommand(
              `dfx canister --network=${network} update-settings --add-controller $(dfx canister --network=${network} id sns_root) ${canisterId}`
            ).then((output) => {
              console.log(`${output}`);
              return canisterId;
            });
          }
        );
      })
    )
      .then((canisterIds) => {
        const idsString = canisterIds
          .map((id) => `principal\\"${id}\\"`)
          .join("; ");

        // Create proposal
        const quillCommand = `quill sns --canister-ids-file ./sns_canister_ids.json --pem-file ${pemFilePath} make-proposal --proposal "(record { title=\\"Register dapp's canisters with SNS.\\"; url=\\"https://modclub.ai/\\";
          summary=\\"This proposal registers dapp's canisters with SNS.\\";
          action=opt variant {RegisterDappCanisters = record {canister_ids=vec {${idsString}}}}})" ${developerNeuronId} > register.json`;

        // Execute proposal command
        executeCommand(quillCommand).then(() => {
          console.log("\n" + "✅ Proposal created and saved to register.json");
          console.log("\n" + `Run this command to send:  `);
          console.log(
            `\x1b[36m%s\x1b[0m`,
            `quill send -y register.json  ${
              network === "local" ? "--insecure-local-dev-mode" : ""
            }` + "\n"
          );
        });
      })
      .catch((error) => {
        console.error(`An error occurred: ${error}`);
        console.log("debugging proposal: " + quillCommand);
      });
  } else {
    console.log('Invalid network. Choose "local" or "ic".');
  }
});
