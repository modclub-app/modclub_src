
usage() {
 echo "Usage: $0 [OPTIONS]"
 echo "Options:"
 echo " -h, --help        Display this help message"
 echo ""
 echo "Usage Example:  $0 topSenior"
 echo ""
}


# Function to handle options and arguments
run_with_options() {
	local USER_CATEGORY=senior3
	local USER_CATEGORY_LABEL=topSeniors

  while [ $# -gt 0 ]; do
    case $1 in
      -h | --help)
        usage
        exit 0
        ;;
      novice*)
        USER_CATEGORY=novice
				USER_CATEGORY_LABEL=Novices

        ;;
      junior*)
				USER_CATEGORY=junior
				USER_CATEGORY_LABEL=Juniors

        ;;
      senior*)
        USER_CATEGORY=senior1
				USER_CATEGORY_LABEL=Seniors

        shift
        ;;
      topSenior*)
        USER_CATEGORY=senior3
				USER_CATEGORY_LABEL=topSeniors

        shift
        ;;
      *)
        echo "Invalid option: $1" >&2
        usage
        exit 1
        ;;
    esac
    shift
  done

	AIRDROP_PAYLOAD=$(dfx canister call modclub_qa getImportedUsersStatsByLevel '(variant { '$USER_CATEGORY' })')
	empty=""
	two_spaces="  "
	echo "${AIRDROP_PAYLOAD//[\",\(,\),${two_spaces}]/${empty}}" >> airdropStats_${USER_CATEGORY_LABEL}.csv

}

run_with_options "$@"
