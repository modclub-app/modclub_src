// sns_config.js
exports.developerNeuronId =
  "7b0c6b20c990a0176142d106d7443cb7f4489c0c8cdaca08c9fe58cca305ebf9";
exports.pemFilePath = `~/.config/dfx/identity/$(dfx identity whoami)/identity.pem`;
exports.canisterCommands = [
  "dfx canister id auth",
  "dfx canister id modclub",
  "dfx canister id rs",
  "dfx canister id vesting",
  "dfx canister id modclub_assets",
];
