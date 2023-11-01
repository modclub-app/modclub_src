module {

  public type Decision = {
    #approved;
    #rejected;
  };

  public type Vote = {
    id : Text;
    contentId : Text;
    userId : Principal;
    decision : Decision;
    violatedRules : [PohRulesViolated];
    createdAt : Int;
  };

  public type UserLevel = {
    #novice;
    #junior;
    #senior1;
    #senior2;
    #senior3;
  };

  // TODO: should remove this VoteV2 after upgrade to PohVote
  public type VoteV2 = {
    id : Text;
    contentId : Text;
    userId : Principal;
    decision : Decision;
    rsBeforeVoting : Float;
    level : UserLevel;
    violatedRules : [PohRulesViolated];
    createdAt : Int;
  };

  public type PohRulesViolated = {
    challengeId : Text;
    ruleId : Text;
  };

  // this is VoteV3
  public type PohVote = {
    id : Text;
    contentId : Text;
    userId : Principal;
    decision : Decision;
    rsBeforeVoting : Float;
    level : UserLevel;
    violatedRules : [PohRulesViolated];
    createdAt : Int;
    totalReward : ?Float; // Once voting concludes, the rewards should be issued.
    lockedReward : ?Float;
    rsReceived : ?Float;
  };

  public type VotePlusUser = {
    userModClubId : Principal;
    userUserName : Text;
    userEmailId : Text;
    userVoteDecision : Decision;
    userVoteCreatedAt : Int;
  };

  public type VoteCount = {
    approvedCount : Nat;
    rejectedCount : Nat;
    hasVoted : Bool;
  };

  public type VoteError = {
    #userAlreadyVoted;
    #contentAlreadyReviewed;
  };

  public type POHReservationError = {
    #userAlreadyReserved;
    #mustMakeReservation;
    #reservationExpire;
  };

  public type POHVoteError = VoteError or POHReservationError or {
    #userNotPermitted;
    #notCompletedUser;
    #pohNotConfiguredForProvider;
    #voteAlreadyFinalized;
    #invalidRules;
  };
};
