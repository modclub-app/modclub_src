#!/bin/bash

# String of dev neurons
vote_ids="980efa662f01d15cbb45c6cf750f7bd233fc792a0191a447897c0f38cd70ed41,996419d5efdeb7cad9e33cec35068fee16c708757a95763007b670007fa34ae2,c018aac0fb03efd03d818f316213ed6a4f3832ee685c24e17d96dec55222e0a6,2acab68a760aa12a72b4fac152d8c565631f7d83a425c20ab561fc981bb1961a,45644c107610be3b3a166b17e6859aeca750d65e31c8bab1511a8caa3311a9b6,14ae24cad729160ac7fd75606f5101c720c57692af9727b6c338cdba6456329e,c5cad33ad0acaae3b275bf17714265597a83d00a1325bdb3c4fcad5cf359029b,f4e2c8fc187baf9e4abd64ed6ffc40e59ad6203880f26eef8360ac277d0d03e0,fd516c299a57e654693eaead4df3b98b803d0fd412c315707e0ec77899cfb193,fe3037864547b825a53e0fa0e83110809905f8080aeb53cddad9e313d0a1ec6a,3db4fdeafdea314bd224a3dae68444f154ef4950e42f4928303ce70559d65fcc,23380ff6d07f44a1c71729fb1486cb297c60dfd79608e47ee60eee32fc60e6f1,2966426e28e2a03df25061888f629745369dbe5e4fe2e517d9880410db4b3bb2,d16a38f119fbd5d19429cb0186bb89e7f7f26d8dcfc3a92fa318802d932676fa,9c550573093a73b2b8111e49b0eb4b18a10ad651a40d9f8d3f94a12a62eedf40,f21c38dd6d2a1a8c3df949f49e80f0590ec2791957e5e228c2e113ee9d88baeb,6496fda3cc7a4fad7965815b68b5f1e56e093908aaa355c5c36bacdac7c1592c,4e2197ac30e13c5a62ecb492c9da9ebe2bcaa8843b774a77434b2ae6a6cf47bb,d185fc7085a34fef125def0de9e7b3d9db45c2852abf6460ae03f7c2c496d892,f216a8b3d03f32e50d02ac427ef1c333dbfa04a9eeea5b191bc8debcbaff7889,14ed3a88f056bb766a1b2dd2b00cdef734d0c2e04545a64850ff695e32fcc652,833bc99c2a02380d93c444d698eb39abc4e875e5503789f5ef1c0a6465d2cdac,94b01d5532b3d876c26b16a4aad874fcabbaed8ce3296289dda3bd582f606580,4c924c8371efd6b08916bd676c19a8a2a944e745187d76695eefaa6c960f36d7,dcdc8a3025e5510da3c9af8bb005e7bf3502befbd9655fe7265f851978d54e8d,cc7440bab07aa6489c50a1769f6eaf0fa879b07d55e2c350e9c0d1b8b47da453,934a88c565c3888bdab3d32bbad44d07eb7db4d0d3f869295f99bd448e0d3dc0,835f0e1db478b59b4229a95190dd1060749a766be97fd133310ad67e4b6b63ab,c0db4129b7db5ab626e6fb164d66b3e4df87b115de32de48f6948e95dbf3e2db,125ee27d5497dbcac9f4591f727e22473fe0b162755a22798563f4671b37de98,3e0aba1d32c9b18ff84113c2651f780752bcf13edff521099c180fbd80cc6fbf,7685883388abcfba0e118bc8c588f89a88c85253e76074ededc80dc2b74d6264,fb09b39d1cdf87c386ffa54a65084a191641cf2793feb00459102278dddb4a4a,92f7eff8be27342f8eafb755738d30fac5333e817c3b6b937dd826ce350669d9,5331eee315303879cbd535814dfc5d3611f77cfb7228060730b3595f11feaccc,8203fdf82872517cab4068037726c95ea45e73150eb92492e31075365b6ab463"

# Convert string to array
IFS=',' read -r -a dev_neurons <<< "$vote_ids"
export IC_URL="http://localhost:8080/"
# Loop over dev neurons
for neuron in "${dev_neurons[@]}"; do
  # Use the neuron in the command
 quill sns \
  --canister-ids-file ./sns_canister_ids.json \
  --pem-file ../.config/dfx/identity/$(dfx identity whoami)/identity.pem \
  neuron-permission \
  --principal "3v3rk-jx25f-dl43p-osgkw-6dm7b-wguwy-kjcun-lyo3w-lsuev-kcdnp-7qe" \
  --insecure-local-dev-mode \
  --permissions vote,submit-proposal,manage-voting-permission \
  add \
  "$neuron" \
    > msg.json
  quill --insecure-local-dev-mode send --yes msg.json

done
