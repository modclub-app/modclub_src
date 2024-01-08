backup_modclub() {
    set -x
    local data_label=$1
    local tag=$2
    local network=$3

    backupOutput=$(dfx canister call modclub_qa backup "(\"$data_label\", \"$tag\")" --network=$network)
    
    pattern='^\([0-9]+ : nat\)$'    
    if [[ $backupOutput =~ $pattern ]]; then
        backupId=$(echo $backupOutput | sed -n 's/.*(\([0-9]*\) : nat).*/\1/p')
        echo $backupId
    else
        echo "Error: The backupOutput does NOT match the expected pattern." >&2
        exit 1
    fi
}