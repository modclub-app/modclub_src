module {

  public type UserLevel = {
    #novice; #junior; #senior1; #senior2; #senior3;
  };

  public type RSAndLevel = {
    score: Float;
    level: UserLevel;
  };

  public type UserAndVote = {
    userId: Principal;
    votedCorrect: Bool;
  };

  public type UserAndRS = {
    userId: Principal;
    score: Float;
  };
  
};