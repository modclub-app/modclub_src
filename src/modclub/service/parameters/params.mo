import Principal "mo:base/Principal";

module {
    
    public let DEFAULT_MIN_VOTES = 2;
    public let DEFAULT_MIN_STAKED = 10;
    public let DEFAULT_TEST_TOKENS = 50;

    public let MIN_STAKE_POH = 100:Int;
    public let MIN_VOTE_POH = 2:Int;
    public let STAKE_REWARD_PERCENTAGE = 0.1; // Reward is based on a percentage of the min stake

    public let JWT_VALIDITY_MILLI = 86400000; // 1 day

    public let TOTAL_QUEUES = 100;
    public let ASSIGN_CONTENT_QUEUES = 70;

    public let WORD_SIZE_FOR_VIDEO = 6;
    public let WORD_SIZE_FOR_AUDIO = 6;
    public let SHAPE_COUNT = 3;
    public let PER_CONTENT_SIZE_EXCEEDED_ERROR = "Per Submission Data limit exceeded.";

    public func getModclubWallet() : Principal {
        return Principal.fromText("kwqat-tqaaa-aaaah-qairq-cai")
    };
};