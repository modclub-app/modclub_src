module Constants {
  public let EXPIRE_VOTE_TIME = 300000;
  public let VESTING_DISSOLVE_DELAY_SECONDS = 604800;
  public let STAKING_UNLOCK_HANDLER_INTERVAL_SECONDS = 300;
  public let TOKENS_DECIMAL = 8.0;
  public let ONE_MIN_NANO_SECS = 60000000000;
  public let FIVE_MIN_NANO_SECS = 300000000000;
  public let TWENTY_FOUR_HOUR_NANO_SECS = 86400000000000;
  public let ONE_HOUR_NANO_SECS = 3600000000000;
  public let ONE_YEAR_NANO_SECS = 31556952000000000;
  public let REWARD_DEVIATION = 0.5;
  public let SENIOR_STAKING_MULTIPLYER = 5;
  public let SENIOR_STAKING_EXPONENT = 2;
  public let CONTENT_CHUNK_LIMIT = 2097152; // 2Mb = 2 * 1024 * 1024
  public let DATA_TYPE_PLAIN_TEXT = "text/plain";
  public let RESERVE_EXPIRE_TIME = 300000;

  public let ICRC_RESERVE_SA = "-------------------------RESERVE" : Blob;
  public let ICRC_ACCOUNT_PAYABLE_SA = "-----------------ACCOUNT_PAYABLE" : Blob;
  public let ICRC_POH_REWARDS_SA = "---------------------POH_REWARDS" : Blob;
  public let ICRC_AIRDROP_SA = "-------------------------AIRDROP" : Blob;
  public let ICRC_MARKETING_SA = "-----------------------MARKETING" : Blob;
  public let ICRC_ADVISORS_SA = "------------------------ADVISORS" : Blob;
  public let ICRC_PRESEED_SA = "-------------------------PRESEED" : Blob;
  public let ICRC_PUBLICSALE_SA = "----------------------PUBLICSALE" : Blob;
  public let ICRC_SEED_SA = "----------------------------SEED" : Blob;
  public let ICRC_TEAM_SA = "----------------------------TEAM" : Blob;
  public let ICRC_TREASURY_SA = "------------------------TREASURY" : Blob;
  public let ICRC_STAKING_SA = "-------------------------STAKING" : Blob;
  public let ICRC_VESTING_SA = "-------------------------VESTING" : Blob;

  public let TOP_SENIOR_TRANSLATE_THRESHOLD = 40000;
  public let SENIOR_TRANSLATE_THRESHOLD = 15000;
  public let JUNIOR_TRANSLATE_THRESHOLD = 1000;

  // Event bus topics
  // --- Moderator seniority transitions ---
  public let TOPIC_MODERATOR_PROMOTED_TO_SENIOR = "moderator_became_senior" : Text;

  // --- Email Notification types ---
  public let EMAIL_NOTIFICATION_NEW_POH = "new_poh_notification" : Text;
  public let EMAIL_NOTIFICATION_NEW_CONTENT = "new_content_notification" : Text;
  public let EMAIL_NOTIFICATION_USER_VERIFICATION = "user_verification_notification" : Text;

  public let ACCOUNT_PAYABLE_FIELD = "ACCOUNT_PAYABLE";

  // --- HTTP Outcall Costs ---
  public let HTTPS_OUTCALL_COST_PER_CALL : Nat = 171_360_000;
  public let HTTPS_OUTCALL_COST_PER_REQUEST_BYTE : Nat = 13_600;
  public let HTTPS_OUTCALL_COST_PER_RESPONSE_BYTE : Nat = 27_200;
};
