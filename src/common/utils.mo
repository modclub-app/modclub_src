import P "mo:base/Prelude";
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Types "types";

module {
  public func unwrap<T>(x : ?T) : T = switch x {
    case null { P.unreachable() };
    case (?x_) { x_ };
  };

  public func mod_assert(success_test : Bool, message : Text) {
    if (not success_test) {
      Debug.trap(message);
    };
  };
  // auth_canister_id = principal "t6rzw-2iaaa-aaaaa-aaama-cai";
  public func getCanisterId(canisterType : Types.ModclubCanister, env : Types.ENV) : Principal {
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
    };
  };

  // public func sync_future( fn: Func )
};
