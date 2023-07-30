# SNS scripts:

CheckVersions.js - Displays recommended vs current version of required CLI tools in case of version incompatibility

snsConfig.js - environment specific variables for creating proposals

controllerProposal.js - Creates a proposal to allow the SNS as a controller of all canisters listed in snsConfig.js

CanisterUpgradeProposal.js - Allows you to change a canister, then submit a proposal with the new change to update specific canisters

functionProposal.js - Creates a proposal to execute a function with a unique id (based on timestamp)

executeFunctionProposal.js - Creates a proposal to execute a function proposal, the function will automatically encode arguments from plain text to blob.

Steps:

# ENV setup:

1. set `export IC_URL="http://localhost:8080/"` or 8000 depending on your replica port
   - Be sure to `unset IC_URL` when you go to mainnet!
2. run `sudo bash scripts/sns/install/snsTestFlight.sh` optionally run with --network=ic flag for mainnet for a fresh install
3. Within scripts/sns/snsConfig.js:
   - Replace the developerNeuronId with the one you've just recorded from the output of snsTestFlight.sh.
   - Replace the pemFilePath with your specific path to your pem file.
   * You can add canisters explicity by canister id like this: `dfx canister id aaaa-aa`

# Controller proposal:

1. run `sudo node scripts/sns/controllerProposal.cjs` to create a proposal to make the SNS a controller of all canisters listed in snsConfig.js
   - send proposal with the resulting send command
2. run `dfx canister call sns_root list_sns_canisters '(record {})'` you will see canister ids listed under dapps if done correctly

Canister upgrade proposal:

1. Make a change to a canister, then run `dfx build <canister name>`
2. run `sudo node scripts/sns/CanisterUpgradeProposal.cjs` to create a proposal to upgrade a canister
   - send proposal with the resulting send command
3. Check that your change has been updated, (give it a few extra seconds, on mainnet)

# Function proposal:

1. run `sudo node scripts/sns/functionProposal.cjs` to create a proposal to execute a function with a unique id (based on timestamp)

   - send proposal with the resulting send command

   * record the proposal id from the output of the send command:
     ````AddGenericNervousSystemFunction = record {
     id = 1_690_240_202_766 : nat64; <--- proposal id is 1_690_240_202_766
     name = "addAdmin";
     description = null;```
     ````

   ![Record ID for execute proposal](<Screen Shot 2023-07-24 at 7.10.56 PM.png>)

2. Execute function w/ Proposal
   - run `sudo node scripts/sns/executeFunctionProposal.cjs` to create a proposal to execute a function proposal
   - paste in the function id from the previous step
   - The argument field will be similar to CLI dfx args, so you will include quotes, for example if the function expects text you will just provide `"hello world"`rather than `dfx canister call Test greet "hello world"`
   - send proposal with the resulting send command

# Upgrade Assets canister:

1. Ensure your SNS governance has commit permissions on the asset canister:

`dfx canister call --network local modclub_qa_assets grant_permission '(record {permission= variant {Commit}; to_principal= principal "<governance canister id>" })'`

2. Verify with:

`dfx canister call --network local modclub_qa_assets list_permitted '(record {permission = variant {Commit}})'`

3. Add yourself with prepare permissions to the asset canister, alternatively this can be done via SNS proposal if desired:

`dfx canister call --network local modclub_qa_assets grant_permission '(record {permission= variant {Prepare}; to_principal= principal "'$(dfx identity get-principal)'" })'`

4. Submit a generic function to allow commiting assets
   Run `sudo node scripts/sns/functionProposal.cjs` and follow the CLI prompts:

   - The first function name will be `commit_proposed_batch`
   - The canister will be `modclub_qa_assets`
   - The validate function will be `validate_commit_proposed_batch`
   - Remember to record the function id for later use. (see function proposal section if you can't find function id)

5. Save a change to the frontend and then deploy assets by proposal
   `dfx deploy modclub_qa_assets --by-proposal --network local`

6. Save the following line from the output of your deploy:

```
Proposed commit of batch 2 with evidence e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

7. Execute your proposed assets:

   - `sudo node scripts/sns/assetCanisterUpgrade.cjs`

   - Use the function id from the end of step 3
   - Your batch Id and evidence will be the items you saved from deploy --by-proposal

Notes:

- There is a generic validate method in each canister. This method ensures that any function desired can be called via function proposal, however if there is a function in that absolutely cannot risk rollback you should add a specific validate function.

  - In the example addAdmin, if it were absolutely critical that the function executed on proposal, you can type check the arguments with validate_addAdmin, and you will include this validate function in the function proposal.
  - The alternative is to add a custom validation for every function.

- The generic validate method still needs a bit of work to keep tight security with the system inspect pattern. I propose we use isTrusted canister or isSNSCanister, right now it defaults to true until a design decision is made.

Mainnet tips:

- `unset IC_URL`
- assuming prior environment setup run `sudo sns-cli deploy-testflight --network=ic` otherwise run `sudo bash scripts/sns/install/snsTestFlight.sh --network=ic`
- if your script hangs for more than a minute or so, you may need to setup your principal as a controller of the SNS canisters:

```
   dfx canister update-settings --network ic --wallet "$(dfx identity --network ic get-wallet)" sns_governance --add-controller "$(dfx identity get-principal)"

   dfx canister update-settings --network ic --wallet "$(dfx identity --network ic get-wallet)" sns_index --add-controller "$(dfx identity get-principal)"

   dfx canister update-settings --network ic --wallet "$(dfx identity --network ic get-wallet)" sns_ledger  --add-controller "$(dfx identity get-principal)"

   dfx canister update-settings --network ic --wallet "$(dfx identity --network ic get-wallet)" sns_root  --add-controller "$(dfx identity get-principal)"

   dfx canister update-settings --network ic --wallet "$(dfx identity --network ic get-wallet)" sns_swap  --add-controller "$(dfx identity get-principal)"
```

- re-run `sudo sns-cli deploy-testflight --network=ic`
