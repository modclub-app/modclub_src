module {
  public type UserLevel = {
    #novice;
    #junior;
    #senior1;
    #senior2;
    #senior3;
  };

  public type RSAndLevel = {
    score : Int;
    level : UserLevel;
  };

  public type Decision = {
    #approved;
    #rejected;
  };

  public type UserAndVote = {
    userId : Principal;
    votedCorrect : Bool;
    decision : Decision;
  };

  public type UserAndRS = {
    userId : Principal;
    score : Int;
  };
};
