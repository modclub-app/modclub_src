// sns_config.js
exports.developerNeuronId =
  "194d3f742383afcee2f3fb4a1075aa6f9652f0299bc65cb3da353265206814b0";
exports.pemFilePath = `~/.config/dfx/identity/$(dfx identity whoami)/identity.pem`;
exports.canisterCommands = [
  "dfx canister id auth",
  "dfx canister id modclub",
  "dfx canister id rs",
  "dfx canister id vesting",
  "dfx canister id modclub_assets",
  "dfx canister id neuron_controller",
];
