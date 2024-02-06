import Result "mo:base/Result";
import List "mo:base/List";
import Bool "mo:base/Bool";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Float "mo:base/Float";
import Principal "mo:base/Principal";
import CommonTypes "../../../common/types";

module {
    public type DecideID = Text;
    public type AccountType = {
        #organic;
        #third_party;
    };

    public type AccountState = {
        // Represents the lifecycle stages of an account.

        #onboarding;   // The initial stage where users are prompted to submit their information for account setup.
        #review;       // At this stage, submissions are under review for duplications and verification of authenticity (PoH).
        #approved;     // Indicates the account has passed review and is now fully active and operational.
        #rejected;     // Signifies the account did not meet the necessary criteria during the review and has been denied access.
    };

    public type OnboardingStep = {
        #basic;
        #pohVideo;
    };

    public type Profile = {
        firstName: Text;
        lastName: Text;
        email:?Text;
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

    public type GetAccountResponse = {
        acc: Account;
        profile: Profile;
    }
}