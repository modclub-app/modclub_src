#!/bin/bash
#remove --insecure-local-dev from all commands for mainnet, also be sure to remove ic_url
# convert vote_ids string to array
mainDevNeuron="fd052a2a6648357c984cd8a04edcb9e34a48967a46f44db9264f5156d7e96c61"
vote_ids="61bf46aa2bbd5731d36928d80e0560b5579d5fdbdfaaf5145daf7552a40c66a9, 412e76a7c799e730d985ff461f9f9d64cefafd77a1c6e8180fcded0ff2294a7b, 017b059ecfc1c31ab3cc802a20f601e32030784e7b3a7c77fffcb510f1c93e0d, 23d3858a497dc4970837fbd0ccef9526ae9dc9d58a88d6bce967a3ce256660e2, b6d618a36a6a877fc974c739f7027e1da1cf32c749e6e8b93837174d2ad6ccb5, b5f966c0f94bcf2332cfdb3624c9ad5e9a4b0fde336bb5274890067a44ed2201, 46bf858ab0c4a39aa08402d0f662f166cd081a73e5b31c4e37feffcd06cc2c03, 62a17bfd75e88d1300ef5ab4f0d3bc1030b29c1891a3a38c770344f127616987, 112170fe68514d8b10a720ff7c88b50fa915e8c09fa07c8cd69ae3fb4559a7ec, b43d1078f3a68a874772837eeaba3a43ba5a54fc2a8643d5df502ceb78c26e9f, baa9a6ee981768b7f26b5c1b9ba84733f4b089f53b30ab8f19448c09a799fcc5, 19241a8ede00e9b8e21a66f0d84c6c6415a065977a38448a5c5a0f5ee80c942a, 70eb6a93846b1bf025fe2713ecc036b34a36df273ab31717409fa21dd1a048ed, a6c86bdf150815bf3563aced7507bc8b4108d7bffb6fdddd23b171484b320fa1, f17065dcc48ac3a7a18ce6201559769d5dddb22030eae7b29d4d765ef0a51d63, 58ef4c518aafb7233a30a8bf6209d246ba92700626847d12820a929b587d6b32, f7c3fee6cd3f88efbdc351ccd30a81d0287c8730c587becf682434b73f0ebd01, 66fd102a977063969126dc61de576a0a454eec44b705abd9296b7f817a0d83fb, 8db1bc1c68b6212b7adb181697d9b142e5fa9ebdce0259d3af36e95b0d08ce51, c4e864efdce43e2fc089c386a0087a0f7c68c2a351bb5e3030c49c66e387af68, c2284037c696040f921feccade40b29d7a73f98452667976626d7e01d4836c87, ba109277cf02f2134d744a2efd29be12be1f0882d5fb5485c617969c9b53be6c, 2d6776846f92daed1a2f0197013c809c46528a8b37b8d82624659164c5b231c3, 2fcfc3dec7fd8be7a759f4d5a4e864919e57217f50b84fab013a4a1c209e64c9, aa0ce4415c3af15bf5a42165be82e8ee7114630270490d65fb7836a3d4ba6ca9, 8b2448953445912a531e3cb77d964c6436e3add39fcf4428f68eaa8275da4ab5, 0389be2c5fe867b8b150bfc52d9812f2c5587044fe13c5ae4b4acc4b3693243f, 481a2440553fb099205283056f7587df4ea8f52b7191644bbbb4dc29f3acd9e1, b111cc116e200d60b8dedfe36ced9137a8a16d5f850d01e0c98cecc4b9beb363, 122161221b3fbfde583951716e9f8d34ab08608791f5b70400153f34ab227868, 02e300491a19179d40ef37f6f4f39eadd53f6c3f47bf5adb6504d0711dcf1381, 4c3c5a2f35a2b46a5ebcd9316c3dffe2ad1e30adf5556a2dd533db0161f8fc81, bb63ce31eb4f3c526613d708c44807aae9d235ec04f8725548a64e1a05bb7888, 4c97cbcb53c65787baecabc70476d42dada185cd5e5c27d6a85466c0150b5fb3,db535f76e46e4eb1181c26217b225798d94ab09f452cde5ab0e54ddc2556498d"
IFS=',' read -r -a vote_ids_array <<< "$vote_ids"
# export IC_URL="http://localhost:8080/"

# the type you want to follow
type="all" # [possible values: all, motion, manage-nervous-system-parameters, upgrade-sns-controlled-canister, add-generic-nervous-system-function, remove-generic-nervous-system-function, upgrade-sns-to-next-version, manage-sns-metadata, transfer-sns-treasury-funds, register-dapp-canisters, deregister-dapp-canisters]

# run quill follow-neuron for each vote id
for vote_id in "${vote_ids_array[@]}"; do
  vote_id_trimmed=$(echo $vote_id | xargs) # removes leading/trailing white spaces
  
  # prepare neuron follow request
  quill sns follow-neuron "$vote_id_trimmed" --type "$type"  --followees "$mainDevNeuron" --canister-ids-file ./sns_canister_ids.json --pem-file ~/.config/dfx/identity/$(dfx identity whoami)/identity.pem > neuron_request.json
  echo "quill sns follow-neuron $vote_id_trimmed --type $type --followees $mainDevNeuron --canister-ids-file ./sns_canister_ids.json --pem-file ~/.config/dfx/identity/$(dfx identity whoami)/identity.pem > neuron_request.json"
  # send prepared request
  quill send neuron_request.json --yes --pem-file ~/.config/dfx/identity/$(dfx identity whoami)/identity.pem
done