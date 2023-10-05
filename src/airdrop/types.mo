import CommonTypes "../common/types";
import ModSecurity "../common/security/guard";
import ICRCTypes "../common/ICRCTypes";
import ExtCore "../common/extNft/ext/Core";
import ExtCommon "../common/extNft/ext/Common";
import Time "mo:base/Time";
import Types "../common/types";

module types = {

  public type AccountId = ExtCore.AccountIdentifier; //text
  public type Subaccount = ICRCTypes.Subaccount;
  public type Account = ICRCTypes.Account;
  public type TokenId = Nat;
  public type Token = { id : TokenId; tier : Tier; claimed : Bool };
  public type Tokens = [Token];
  public type MetadataLegacy = ExtCommon.Metadata;
  public type TokenIndex = ExtCore.TokenIndex;
  public type Time = Time.Time;
  public type CommonError = ExtCore.CommonError;
  public type Tier = { #bronze; #silver; #gold; #none };
  public type ClaimStatus = { #available; #timeLocked; #notRegistered };
  public type Claim = { timeStamp : Time; claimStatus : ClaimStatus };
  public type NFT = {
    tokenIndex : TokenIndex;
    lastClaim : Claim;
    tier : Tier;
    dissolveDelay : Nat;
    claimCount : Nat;
  };
  public type Listing = {
    seller : Principal;
    price : Nat64;
    locked : ?Time;
  };

};
