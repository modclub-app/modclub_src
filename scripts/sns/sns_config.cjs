// sns_config.js
exports.developerNeuronId =
  "7742b10742947a780a29b2a0f1911aa3a5e92733e062f5520554a6b0ff6f004e";
exports.pemFilePath = `~/.config/dfx/identity/$(dfx identity whoami)/identity.pem`;
exports.canisterCommands = [
  "dfx canister id auth",
  "dfx canister id modclub",
  "dfx canister id rs",
  "dfx canister id vesting",
  "dfx canister id modclub_assets",
];
