# this lib file contains utils to generate contents

function create_text_content() {
    log_step "Submitting contents... (see seeds/mock_content.json) "
    local env=$1
    local provider_identity=$2

    dfx identity use default
    dfx canister call $modclub setRandomization '(false)'

    dfx identity use ${provider_identity}
    local modclub=$(get_canister_name_by_env "$env" "modclub")

    node "${ROOT_DIR}/scripts/seeds/parse_json_content.cjs" "${ROOT_DIR}/scripts/seeds/mock_content.json" | while IFS='|' read -r sourceId title text
    do
        echo ">>> Submit Content >>>"
        echo "   -- sourceId: $sourceId"
        echo "   -- Title: $title"
        echo "   -- Text: $text"
        dfx canister call modclub_qa submitText "(\"${sourceId}\",\"${text}\", opt \"${title}\",opt variant {simple})"
    done

    log_step "Content submitted. "
}

function create_html_content() {
    log_step "Submitting html contents... (see seeds/mock_content.json) "
    local env=$1
    local provider_identity=$2

    dfx identity use ${provider_identity}
    local modclub=$(get_canister_name_by_env "$env" "modclub")

    node "${ROOT_DIR}/scripts/seeds/parse_json_content.cjs" "${ROOT_DIR}/scripts/seeds/mock_html_content.json" | while IFS='|' read -r sourceId title htmlContent complexity
    do
        echo ">>> Submit Content >>>"
        echo "   -- sourceId: $sourceId"
        echo "   -- Title: $title"
        echo "   -- htmlContent: $htmlContent"
        echo "   -- complexity: $complexity"
        
        dfx canister call $modclub submitHtmlContent "(\"${sourceId}\",\"${htmlContent//\"/\\\"}\", opt \"${title}\",opt variant {${complexity}})"
    done

    
    log_step "Done create_html_content. "
}