import Types "../../types";

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
    violatedRules : [Types.PohRulesViolated];
    createdAt : Int;
  };

  public type UserLevel = {
    #novice; #junior; #senior1; #senior2; #senior3;
  };

  public type VoteV2 = {
    id : Text;
    contentId : Text;
    userId : Principal;
    decision : Decision;
    rsBeforeVoting: Float;
    level: UserLevel;
    violatedRules : [Types.PohRulesViolated];
    createdAt : Int;
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

};
