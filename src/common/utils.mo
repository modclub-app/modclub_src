import P "mo:base/Prelude";
import Types "../modclub/types";
import Array "mo:base/Array";
import Option "mo:base/Option";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Float "mo:base/Float";
import Text "mo:base/Text";
import Bool "mo:base/Bool";
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import CommonTypes "types";
import Constants "constants";
import Helpers "../modclub/helpers";

module {
  public type Timestamp = Int;
  public func unwrap<T>(x : ?T) : T = switch x {
    case null { P.unreachable() };
    case (?x_) { x_ };
  };

  public func isReserved(profileId : Text, reservedList : [Types.Reserved]) : Bool {
    let now = Helpers.timeNow();
    let reservation = Array.filter<Types.Reserved>(reservedList, func x = x.profileId == profileId and x.reservedExpiryTime > now);
    return reservation.size() > 0;
  };

  public func getNonExpiredList(reservedList : [Types.Reserved], now : Timestamp) : [Types.Reserved] {
    return Array.filter<Types.Reserved>(reservedList, func x = x.reservedExpiryTime > now);
  };

  public func getUserReservationList(reservedList : [Types.Reserved], userId : Text) : [Types.Reserved] {
    return Array.filter<Types.Reserved>(reservedList, func x = x.profileId == userId);
  };

  public func mod_assert(success_test : Bool, message : Text) {
    if (not success_test) {
      Debug.trap(message);
    };
  };

  // auth_canister_id = principal "t6rzw-2iaaa-aaaaa-aaama-cai";
  public func getCanisterId(canisterType : CommonTypes.ModclubCanister, env : CommonTypes.ENV) : Principal {
    switch (canisterType) {
      case (#modclub) {
        switch (env) {
          case (#local(value)) { value.modclub_canister_id };
          case (#prod) { Principal.fromText("la3yy-gaaaa-aaaah-qaiuq-cai") };
          case (#dev) { Principal.fromText("olc6u-lqaaa-aaaah-qcooq-cai") };
          case (#qa) { Principal.fromText("f2xjy-4aaaa-aaaah-qc3eq-cai") };
        };
      };
      case (#rs) {
        switch (env) {
          case (#local(value)) { value.rs_canister_id };
          case (#prod) { Principal.fromText("la3yy-gaaaa-aaaah-qaiuq-cai") };
          case (#dev) { Principal.fromText("olc6u-lqaaa-aaaah-qcooq-cai") };
          case (#qa) { Principal.fromText("f2xjy-4aaaa-aaaah-qc3eq-cai") };
        };
      };
      case (#wallet) {
        switch (env) {
          case (#local(value)) { value.wallet_canister_id };
          case (#prod) { Principal.fromText("la3yy-gaaaa-aaaah-qaiuq-cai") };
          case (#dev) { Principal.fromText("olc6u-lqaaa-aaaah-qcooq-cai") };
          case (#qa) { Principal.fromText("f2xjy-4aaaa-aaaah-qc3eq-cai") };
        };
      };
      case (#auth) {
        switch (env) {
          case (#local(value)) { value.auth_canister_id };
          case (#prod) { Principal.fromText("t6rzw-2iaaa-aaaaa-aaama-cai") };
          case (#dev) { Principal.fromText("tzq7c-xqaaa-aaaaa-aaamq-cai") };
          case (#qa) { Principal.fromText("tqtu6-byaaa-aaaaa-aaana-cai") };
        };
      };
      case (#vesting) {
        switch (env) {
          case (#local(value)) { value.vesting_canister_id };
          case (#prod) { Principal.fromText("t6rzw-2iaaa-aaaaa-aaama-cai") };
          case (#dev) { Principal.fromText("tzq7c-xqaaa-aaaaa-aaamq-cai") };
          case (#qa) { Principal.fromText("tqtu6-byaaa-aaaaa-aaana-cai") };
        };
      };
    };
  };

  public func blobToText(b : Blob) : Text {
    var res = "";
    for (byte : Nat8 in b.vals()) {
      // iterator over the Blob
      res := res # Nat8.toText(byte);
    };
    res;
  };

  public func floatToTokens(f : Float) : Nat {
    switch (Nat.fromText(Int.toText(Float.toInt(Float.abs(f * Constants.TOKENS_DECIMAL))))) {
      case (?n) n;
      case (_) { 0 };
    };
  };

  public func getStakingAmountForRewardWithdraw(rs : Nat) : Nat {
    Option.get(
      Nat.fromText(
        Int.toText(Constants.SENIOR_STAKING_MULTIPLYER * Int.pow(rs, Constants.SENIOR_STAKING_EXPONENT))
      ),
      0
    );
  };

};
