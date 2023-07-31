# Neuron README.md

1. Fresh env, start --clean,nns install, re-deploy canisters, run snsTestFlight.sh with yml file modified to your principal
2. snsTestFlight.sh gives you many devNeuronIds, add them to followNeuron.sh under voteIds.

Helpful commands:
`dfx canister call sns_governance list_proposals '(record {include_reward_status = vec {}; limit = 0; exclude_type = vec {}; include_status = vec {};})'`

How to see main dev neuron, even if you don't launch with it

- run this on the main Devoloper neuron identity:
  `dfx canister call sns_governance list_neurons "(record {of_principal = opt principal \"$(dfx identity get-principal)\"; limit= 5})" | idl2json`
  _ You will need to convert the id from binary or blob depening on idl2json flag
  _ TODO: binary blob conversion (I just used chatgpt to convert it for me)
