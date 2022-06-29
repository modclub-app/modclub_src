import PohTypes "./service/poh/types";
import Principal "mo:base/Principal";
import Canistergeek "./canistergeek/canistergeek";
import Helpers "./helpers";

shared ({caller = deployer}) actor class Provider() = this {

  stable var _canistergeekLoggerUD: ?Canistergeek.LoggerUpgradeData = null;
  private let canistergeekLogger = Canistergeek.Logger();

  public type ModclubActorType = actor {     
    verifyHumanity: (Text) -> async PohTypes.PohVerificationResponsePlus;
    subscribePohCallback: (PohTypes.SubscribePohMessage) -> async ();
  };


  public shared({ caller }) func verifyUserHumanityForProviderForQA(userId: Principal) : async PohTypes.PohVerificationResponsePlus {
      //qa canister id
      let modclubActor = actor "f2xjy-4aaaa-aaaah-qc3eq-cai" : ModclubActorType;
      await modclubActor.verifyHumanity(Principal.toText(userId));
  };

  public shared func registerPohCallbackForModclubForQA() : async () {
    let modclubActor = actor "f2xjy-4aaaa-aaaah-qc3eq-cai" : ModclubActorType;
    await modclubActor.subscribePohCallback({callback = pohCallback});
  };

  public shared({ caller }) func verifyUserHumanityForProviderForDev(userId: Principal) : async PohTypes.PohVerificationResponsePlus {
      //qa canister id
      let modclubActor = actor "olc6u-lqaaa-aaaah-qcooq-cai" : ModclubActorType;
      await modclubActor.verifyHumanity(Principal.toText(userId));
  };

  public shared func registerPohCallbackForModclubForDev() : async () {
    let modclubActor = actor "olc6u-lqaaa-aaaah-qcooq-cai" : ModclubActorType;
    await modclubActor.subscribePohCallback({callback = pohCallback});
  };

  public shared({ caller }) func verifyUserHumanityForProviderForProd(userId: Principal) : async PohTypes.PohVerificationResponsePlus {
      //qa canister id
      let modclubActor = actor "la3yy-gaaaa-aaaah-qaiuq-cai" : ModclubActorType;
      await modclubActor.verifyHumanity(Principal.toText(userId));
  };

  public shared func registerPohCallbackForModclubForProd() : async () {
    let modclubActor = actor "la3yy-gaaaa-aaaah-qaiuq-cai" : ModclubActorType;
    await modclubActor.subscribePohCallback({callback = pohCallback});
  };

  public shared func pohCallback(message : PohTypes.PohVerificationResponsePlus) {
    Helpers.logMessage(canistergeekLogger, "Calling back provider method", #info);
    Helpers.logMessage(canistergeekLogger, "userId sent in callback: " # message.providerUserId, #info);
    if(message.status == #verified) {
      Helpers.logMessage(canistergeekLogger, "status for user: verified ", #info);
    };

    if(message.status == #rejected) {
      Helpers.logMessage(canistergeekLogger, "status for user: rejected ", #info);
    };
  };

  system func preupgrade() {
    _canistergeekLoggerUD := ?canistergeekLogger.preupgrade();
  };

  system func postupgrade() {
    canistergeekLogger.postupgrade(_canistergeekLoggerUD);
    _canistergeekLoggerUD := null;
    canistergeekLogger.setMaxMessagesCount(3000);
  };
};


