import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Result "mo:base/Result";
import List "mo:base/List";
import Types "../../wallet/types";
import CommonTypes "../../common/types"

module {

  public type MCActorType = actor {
    getModeratorEmailsForPOHAndSendEmail : (Text) -> async ();
  };

  public let MC_CANISTER_ID_QA = "f2xjy-4aaaa-aaaah-qc3eq-cai";
  public let MC_QA_ACTOR = actor "f2xjy-4aaaa-aaaah-qc3eq-cai" : MCActorType;

  public let MC_CANISTER_ID_DEV = "olc6u-lqaaa-aaaah-qcooq-cai";
  public let MC_DEV_ACTOR = actor "olc6u-lqaaa-aaaah-qcooq-cai" : MCActorType;

  public let MC_CANISTER_ID_PROD = "la3yy-gaaaa-aaaah-qaiuq-cai";
  public let MC_PROD_ACTOR = actor "la3yy-gaaaa-aaaah-qaiuq-cai" : MCActorType;

  public func getId(env : CommonTypes.ENV) : Text {
    switch (env) {
      case (#local(value)) {
        return Principal.toText(value.auth_canister_id);
      };
      case (#prod) {
        return MC_CANISTER_ID_PROD;
      };
      case (#dev) {
        return MC_CANISTER_ID_DEV;
      };
      case (#qa) {
        return MC_CANISTER_ID_QA;
      };
    };
  };

  public func getActor(env : CommonTypes.ENV) : MCActorType {
    return actor (getId(env));
  };

};
