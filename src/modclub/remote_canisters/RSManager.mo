import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Types "../../rs/types";
import CommonTypes "../../common/types";
import Debug "mo:base/Debug";

module {

  public type RSManagerActorType = actor {
    topUsers : (Nat, Nat) -> async [Types.UserAndRS];
    queryRSAndLevel : () -> async Types.RSAndLevel;
    queryRSAndLevelByPrincipal : (Principal) -> async Types.RSAndLevel;
    updateRSBulk : ([Types.UserAndVote]) -> async [Types.UserAndRS];
    updateRS : (Principal, Bool) -> async Types.UserAndRS;
  };

  public let MODCLUB_RS_CANISTER_ID_QA = "rkp4c-7iaaa-aaaaa-aaaca-cai";
  public let MODCLUB_RS_QA_ACTOR = actor "rkp4c-7iaaa-aaaaa-aaaca-cai" : RSManagerActorType;

  public let MODCLUB_RS_CANISTER_ID_DEV = "vflbk-kiaaa-aaaah-qc7wq-cai";
  public let MODCLUB_RS_DEV_ACTOR = actor "vflbk-kiaaa-aaaah-qc7wq-cai" : RSManagerActorType;

  public let MODCLUB_RS_CANISTER_ID_PROD = "la3yy-gaaaa-aaaah-qaiuq-cai";
  public let MODCLUB_RS_PROD_ACTOR = actor "la3yy-gaaaa-aaaah-qaiuq-cai" : RSManagerActorType;

  public func getId(env : CommonTypes.ENV) : Text {
    switch (env) {
      case (#local(value)) {
        return Principal.toText(value.rs_canister_id);
      };
      case (#prod) {
        return MODCLUB_RS_CANISTER_ID_PROD;
      };
      case (#dev) {
        return MODCLUB_RS_CANISTER_ID_DEV;
      };
      case (#qa) {
        return MODCLUB_RS_CANISTER_ID_QA;
      };
    };
  };

  public func getActor(env : CommonTypes.ENV) : RSManagerActorType {
    return actor (getId(env));
  };

};
