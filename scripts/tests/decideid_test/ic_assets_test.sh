set -e
# https://github.com/dfinity/sdk/blame/e149ce7a7a9355d4ef4c001661fbf7814431fb31/e2e/tests-dfx/frontend.bash
ID=$(dfx canister id decideid_qa_assets)
PORT=8000

check_contains() {
    local string="$1"
    local substring="$2"

    if echo "$string" | grep -q "$substring"; then
        return 0 # True, substring found
    else
        echo "Cannot find $substring"
        return 1 # False, substring not found
    fi
}

output=$(curl -vv http://localhost:"$PORT"/?canisterId="$ID" 2>&1)
check_contains "$output" "x-key: x-value"

output=$(curl -vv http://localhost:"$PORT"/index.js?canisterId="$ID" 2>&1)
check_contains "$output" "x-key: x-value"
