import Types "../../types";

module {

    public type Decision = {
        #approved;
        #rejected;
    };

    public type Vote = {
        id: Text;
        contentId: Text;
        userId: Principal;
        decision: Decision;
        violatedRules: [Types.PohRulesViolated];  
        createdAt: Int;
    };

    public type VoteCount = {
        approvedCount: Nat;
        rejectedCount: Nat;
        hasVoted: Bool;
    };

    public type VoteError = {
        #userAlreadyVoted;
        #contentAlreadyReviewed;
    };

};