import Principal "mo:base/Principal";

module {

  public let DEFAULT_MIN_VOTES = 2;
  // public let DEFAULT_MIN_STAKED = 10;
  public let DEFAULT_TEST_TOKENS = 50.0;

  // public let MIN_STAKE_POH = 100 : Int;
  public let MIN_VOTE_POH = 3 : Int;
  public let STAKE_REWARD_PERCENTAGE = 0.1;
  // Reward is based on a percentage of the min stake

  public let JWT_VALIDITY_MILLI = 86400000;
  // 1 day

  public let TOTAL_QUEUES = 100;
  public let ASSIGN_CONTENT_QUEUES = 70;

  public let WORD_SIZE_FOR_VIDEO = 6;
  public let WORD_SIZE_FOR_AUDIO = 6;
  public let SHAPE_COUNT = 3;
  public let PER_CONTENT_SIZE_EXCEEDED_ERROR = "Per Submission Data limit exceeded.";

  // Moderator reward percentage
  public let GAMMA_M = 0.5;
  // Token burn percentage
  public let GAMMA_B = 0.1;
  // Treasury distribution percentage
  public let GAMMA_T = 0.4;
  // cost per moderator
  public let CS = 3.0;

  public let TREASURY_SA = "TREASURY";
  public let RESERVE_SA = "RESERVE";
  public let MARKETING_SA = "MARKETING";
  public let ADVISORS_SA = "ADVISORS";
  public let PRESEED_SA = "PRESEED";
  public let PUBLICSALE_SA = "PUBLICSALE";
  public let MAIN_SA = "MAIN";
  public let SEED_SA = "SEED";
  public let TEAM_SA = "TEAM";
  public let ACCOUNT_PAYABLE = "AP";
  public let STAKE_SA = "STAKE";
  public let MOD_RELEASE_PER_DAY = 12_577_000_000_000;

  public func getModclubWallet() : Principal {
    return Principal.fromText("kwqat-tqaaa-aaaah-qairq-cai");
  };
};
