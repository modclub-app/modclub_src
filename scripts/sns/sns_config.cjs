// sns_config.js
exports.developerNeuronId =
  "fd052a2a6648357c984cd8a04edcb9e34a48967a46f44db9264f5156d7e96c61";
exports.pemFilePath = `~/.config/dfx/identity/$(dfx identity whoami)/identity.pem`;
exports.canisterCommands = [
  "dfx canister id auth",
  "dfx canister id modclub",
  "dfx canister id rs",
  "dfx canister id vesting",
  "dfx canister id modclub_assets",
];
