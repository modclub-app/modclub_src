import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Result "mo:base/Result";
import List "mo:base/List";
import Types "../../wallet/types";
import CommonTypes "../../common/types"

module {

  public type AuthActorType = actor {
    subscribe : (Text) -> async ();
    getAdmins : () -> async Result.Result<[Principal], Text>;
    isAdmin : (Principal) -> async Bool;
    registerAdmin : (Principal) -> async Result.Result<List.List<Principal>, Text>;
    unregisterAdmin : (Principal) -> async Result.Result<List.List<Principal>, Text>;
  };

  public let AUTH_CANISTER_ID_QA = "tqtu6-byaaa-aaaaa-aaana-cai";
  public let AUTH_QA_ACTOR = actor "tqtu6-byaaa-aaaaa-aaana-cai" : AuthActorType;

  public let AUTH_CANISTER_ID_DEV = "tzq7c-xqaaa-aaaaa-aaamq-cai";
  public let AUTH_DEV_ACTOR = actor "tzq7c-xqaaa-aaaaa-aaamq-cai" : AuthActorType;

  public let AUTH_CANISTER_ID_PROD = "t6rzw-2iaaa-aaaaa-aaama-cai";
  public let AUTH_PROD_ACTOR = actor "t6rzw-2iaaa-aaaaa-aaama-cai" : AuthActorType;

  public func getId(env : CommonTypes.ENV) : Text {
    switch (env) {
      case (#local(value)) {
        return Principal.toText(value.auth_canister_id);
      };
      case (#prod) {
        return AUTH_CANISTER_ID_PROD;
      };
      case (#dev) {
        return AUTH_CANISTER_ID_DEV;
      };
      case (#qa) {
        return AUTH_CANISTER_ID_QA;
      };
    };
  };

  public func getActor(env : CommonTypes.ENV) : AuthActorType {
    return actor (getId(env));
  };

};
