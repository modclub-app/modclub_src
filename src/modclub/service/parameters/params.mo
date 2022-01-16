import Int "mo:base/Int";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";

import Types "../../types";

module {
    public let MIN_STAKE_POH = 100:Int;
    public let MIN_VOTE_POH = 100 :Int;
    public let STAKE_REWARD_PERCENTAGE = 0.1; // Reward is based on a percentage of the min stake
};