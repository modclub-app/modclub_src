import Result "mo:base/Result";
import List "mo:base/List";
import Bool "mo:base/Bool";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Float "mo:base/Float";
import Principal "mo:base/Principal";
import CommonTypes "../common/types";

module {
  public type DecideID = Text;

  public type AccountType = {
    #organic;  
    #third_party;
  };

  public type AccountState = {
    // represents the lifecycle of an account
    #onboarding;   // during onboarding, asking users to submit different information
    #review;       // during review, we will check dup and humananity 
    #approved;     // finall
    #rejected;
  };

   public type OnboardingStep = {
     #basic;
     #pohVideo;
   };

  public type Account = {
    id: Text;                // decide id
    principal: Principal;    // user's principal

    acc_type: AccountType;
    state: AccountState;

    onboardingCompletedSteps: [OnboardingStep];

    createdAt: CommonTypes.Timestamp;
    updatedAt: CommonTypes.Timestamp;
    createdBy: Principal;
  };

};
