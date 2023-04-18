import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Types "../../rs/types";
import CommonTypes "../../common/types"

module {

  public type RSManagerActorType = actor {
    topKUsers : (Nat, Nat) -> async [Types.UserAndRS];
    queryRSAndLevel : () -> async Types.RSAndLevel;
    queryRSAndLevelByPrincipal : (Principal) -> async Types.RSAndLevel;
    updateRSBulk : ([Types.UserAndVote]) -> async [Types.UserAndRS];
    updateRS : (Principal, Bool) -> async Types.UserAndRS;
  };

  public let MODCLUB_WALLET_CANISTER_ID_QA = "vmikw-4aaaa-aaaah-qc7xa-cai";
  public let MODCLUB_WALLET_QA_ACTOR = actor "vmikw-4aaaa-aaaah-qc7xa-cai" : RSManagerActorType;

  public let MODCLUB_WALLET_CANISTER_ID_DEV = "vflbk-kiaaa-aaaah-qc7wq-cai";
  public let MODCLUB_WALLET_DEV_ACTOR = actor "vflbk-kiaaa-aaaah-qc7wq-cai" : RSManagerActorType;

  public let MODCLUB_WALLET_CANISTER_ID_PROD = "la3yy-gaaaa-aaaah-qaiuq-cai";
  public let MODCLUB_WALLET_PROD_ACTOR = actor "la3yy-gaaaa-aaaah-qaiuq-cai" : RSManagerActorType;

  public func getId(environment : Text) : Text {
    if (environment == "prod") {
      return MODCLUB_WALLET_CANISTER_ID_PROD;
    } else {
      return MODCLUB_WALLET_CANISTER_ID_DEV;
    };
  };

  public func getActor(env : CommonTypes.ENV) : RSManagerActorType {

    switch (env) {
      case (#local(value)) {
        return MODCLUB_WALLET_QA_ACTOR;
      };
      case (#prod) {
        return MODCLUB_WALLET_PROD_ACTOR;
      };
      case (#dev) {
        return MODCLUB_WALLET_DEV_ACTOR;
      };
      case (#qa) {
        return MODCLUB_WALLET_QA_ACTOR;
      };
    };
  };

};
