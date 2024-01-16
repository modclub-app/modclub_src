quill sns --canister-ids-file ./sns_canister_ids.json --pem-file ~/Modclub/modclub/new_modclub_voting_neuron.pem make-proposal "fd052a2a6648357c984cd8a04edcb9e34a48967a46f44db9264f5156d7e96c61" --proposal '( record { title = "Upgrade SNS to next available version"; url = ""; summary = "A proposal to upgrade the SNS DAO to the next available version on SNS-W"; action = opt variant { UpgradeSnsToNextVersion = record {} }; } )' > message.json && quill send message.json