// snsConfig.js
exports.developerNeuronId =
  "fe3037864547b825a53e0fa0e83110809905f8080aeb53cddad9e313d0a1ec6a";
exports.pemFilePath = `../.config/dfx/identity/$(dfx identity whoami)/identity.pem`;
exports.canisterCommands = [
  "dfx canister id auth_qa",
  "dfx canister id modclub_qa",
  "dfx canister id rs_qa",
  "dfx canister id vesting_qa",
  "dfx canister id modclub_qa_assets",
];
