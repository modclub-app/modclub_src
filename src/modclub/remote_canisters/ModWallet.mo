import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Types "../../wallet/types";
import CommonTypes "../../common/types"

module {

  public type ModWalletActorType = actor {
    queryBalance : (?Text) -> async Float;
    transfer : (?Text, Principal, ?Text, Float) -> async ();
    transferBulk : ([Types.UserAndAmount]) -> async ();
    burn : (?Text, Float) -> async ();
  };

  public let MODCLUB_WALLET_CANISTER_ID_QA = "r7inp-6aaaa-aaaaa-aaabq-cai";
  public let MODCLUB_WALLET_QA_ACTOR = actor "r7inp-6aaaa-aaaaa-aaabq-cai" : ModWalletActorType;

  public let MODCLUB_WALLET_CANISTER_ID_DEV = "vxnwt-gyaaa-aaaah-qc7vq-cai";
  public let MODCLUB_WALLET_DEV_ACTOR = actor "vxnwt-gyaaa-aaaah-qc7vq-cai" : ModWalletActorType;

  public let MODCLUB_WALLET_CANISTER_ID_PROD = "la3yy-gaaaa-aaaah-qaiuq-cai";
  public let MODCLUB_WALLET_PROD_ACTOR = actor "la3yy-gaaaa-aaaah-qaiuq-cai" : ModWalletActorType;

  public func getId(env : CommonTypes.ENV) : Text {
    switch (env) {
      case (#local(value)) {
        return Principal.toText(value.wallet_canister_id);
      };
      case (#prod) {
        return MODCLUB_WALLET_CANISTER_ID_PROD;
      };
      case (#dev) {
        return MODCLUB_WALLET_CANISTER_ID_DEV;
      };
      case (#qa) {
        return MODCLUB_WALLET_CANISTER_ID_QA;
      };
    };
  };

  public func getActor(env : CommonTypes.ENV) : ModWalletActorType {
    return actor (getId(env));
  };

};
