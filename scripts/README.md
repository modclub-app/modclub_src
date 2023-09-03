# Script Documentation

This folder contains all of the scripts to run different processes

## Environments

### Mainnet (ONLY)

1. deploy_to_env.sh -> to deploy into **MAINNET** either for Dev, Qa or Prod Environment
2. add_controller.sh -> for adding controller into mainnet environment
3. SNS folder-> This is the collection of scripts for running the SNS process
4. upgrade-bucket -> for upgrade bucket id either in mainnet or local
5. pre_yarn_start.sh -> setup Export environment

### Local (For development)

1. Infra folder -> This is the collection of local deployments such as up_infra and shutdown_infra
   1.up_infra.sh -> Use for deploying all canisters into the local environment
   2.shutdown_infra.sh -> Use to stop and shut down all canisters in the local environment
2. Test folder -> This is a collection of test case scenarios for features
   1. deposit_withdraw_test.sh -> testing deposit and withdraw functionalities
   2. e2e_test.sh -> testing basic E2E flow such as registering, submitting contents, voting, reservation
   3. reserve_test.sh -> testing multiple cases for content reservation feature
   4. rsp_test.sh -> testing reputation score point system\
   5. security_test.sh -> test security canister (AUTH)
   6. stake_unstake.sh -> testing stake and unstake features
   7. vesting_canister_test -> testing vesting canister
   8. test.sh -> Run basic testing as follows
      1. security_test.sh
      2. ledger_tests.sh
      3. vesting_canister_tests.sh
      4. e2e_test.sh
