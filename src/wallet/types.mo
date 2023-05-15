import Principal "mo:base/Principal";
import CommonTypes "../common/types";

module {

  public type UserAndAmount = {
    fromSA : ?Text;
    toOwner : Principal;
    toSA : ?Text;
    amount : Float;
  };

  public type SubAccount = Text;

  public type WalletCanisterMethods = {
    #handleSubscription : () -> CommonTypes.ConsumerPayload;
    #burn : () -> (?SubAccount, Float);
    #getAdmins : () -> ();
    #isUserAdmin : () -> ();
    #queryBalance : () -> ?SubAccount;
    #queryBalancePr : () -> (Principal, ?SubAccount);
    #stakeTokens : () -> Float;
    #tge : () -> ();
    #transfer : () -> (?SubAccount, Principal, ?SubAccount, Float);
    #transferBulk : () -> [UserAndAmount];
    #transferToProvider : () -> (Principal, ?SubAccount, Principal, ?SubAccount, Float);
  };
};
