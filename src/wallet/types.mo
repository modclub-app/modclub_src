import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import ICRCTypes "ICRC/types";
import CommonTypes "../common/types";

module {

  public type UserAndAmount = {
    fromSA : ?Text;
    toOwner : Principal;
    toSA : ?Text;
    amount : Float;
  };

  public type SubAccount = Text;

  public type TransferToProviderArgs = {
    from : ICRCTypes.Account;
    to : ICRCTypes.Account;
    amount : ICRCTypes.Tokens;
  };

  public type WalletCanisterMethods = {
    #icrc1_balance_of : () -> ICRCTypes.Account;
    #icrc1_decimals : () -> ();
    #icrc1_fee : () -> ();
    #icrc1_metadata : () -> ();
    #icrc1_minting_account : () -> ();
    #icrc1_name : () -> ();
    #icrc1_supported_standards : () -> ();
    #icrc1_symbol : () -> ();
    #icrc1_total_supply : () -> ();
    #icrc1_transfer : () -> {
      amount : ICRCTypes.Tokens;
      created_at_time : ?ICRCTypes.Timestamp;
      fee : ?ICRCTypes.Tokens;
      from_subaccount : ?ICRCTypes.Subaccount;
      memo : ?ICRCTypes.Memo;
      to : ICRCTypes.Account;
    };
    #icrc2_approve : () -> ICRCTypes.ApproveArgs;
    #icrc2_transfer_from : () -> ICRCTypes.TransferFromArgs;
    #icrc2_allowance : () -> ICRCTypes.AllowanceArgs;
    #ledger_account : () -> ();
    #handleSubscription : () -> CommonTypes.ConsumerPayload;
    #burn : () -> (?ICRCTypes.Subaccount, Nat);
    #getAdmins : () -> ();
    #isUserAdmin : () -> ();
    #queryBalance : () -> ?SubAccount;
    #queryBalancePr : () -> (Principal, ?SubAccount);
    #stakeTokens : () -> ICRCTypes.Tokens;
    #unstakeTokens : () -> ICRCTypes.Tokens;
    #tge : () -> ();
    #transfer : () -> (?SubAccount, Principal, ?SubAccount, Float);
    #transferBulk : () -> [UserAndAmount];
    #transferToProvider : () -> TransferToProviderArgs;
  };

};
