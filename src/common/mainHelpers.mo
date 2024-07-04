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
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Char "mo:base/Char";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import CommonTypes "types";
import Constants "constants";
import Helpers "helpers";
import PohTypes "../modclub/service/poh/types";
import POH "../modclub/service/poh/poh";
import VoteManager "../modclub/service/vote/vote";
import StateV2 "../modclub/statev2";
import QueueManager "../modclub/service/queue/queue";
import Canistergeek "../common/canistergeek/canistergeek";

module MainHelpers {
  public func pohVerificationRequestHelper(
    providerUserId : Text,
    providerId : Principal,
    pohEngine : POH.PohEngine,
    voteManager : VoteManager.VoteManager,
    stateV2 : StateV2.State,
    pohContentQueueManager : QueueManager.QueueManager,
    principalActor : Principal
  ) : Result.Result<PohTypes.PohVerificationResponsePlus, PohTypes.PohError> {
    if (
      Principal.equal(providerId, principalActor) and voteManager.isAutoApprovedPOHUser(
        Principal.fromText(providerUserId)
      )
    ) {
      return #ok({
        providerUserId = providerUserId;
        providerId = providerId;
        status = #verified;
        challenges = [];
        requestedAt = null;
        submittedAt = null;
        completedAt = null;
        token = null;
        rejectionReasons = [];
        isFirstAssociation = true;
      });
    };
    let pohVerificationRequest : PohTypes.PohVerificationRequestV1 = {
      requestId = Helpers.generateId(providerId, "pohRequest", stateV2);
      providerUserId = providerUserId;
      providerId = providerId;
    };
    switch (pohEngine.getPohCallback(providerId)) {
      case (#err(er)) {
        return #err(er);
      };
      case (_) ();
    };
    // validity and rules needs to come from admin dashboard here
    switch (pohEngine.getProviderPohConfiguration(providerId, stateV2)) {
      case (#ok(providerPohConfig)) {
        let verificationResponse = pohEngine.pohVerificationRequest(
          pohVerificationRequest,
          providerPohConfig.expiry,
          providerPohConfig.challengeIds,
          voteManager.getAllUniqueViolatedRules,
          pohContentQueueManager.getContentStatus
        );
        #ok(verificationResponse);
      };
      case (#err(er)) {
        return #err(er);
      };
    };
  };

  public func handlePackageCreation(
    caller : Principal,
    challengeId : Text,
    pohEngine : POH.PohEngine,
    stateV2 : StateV2.State,
    pohContentQueueManager : QueueManager.QueueManager,
    voteManager: VoteManager.VoteManager,
    canistergeekLogger: Canistergeek.Logger
  ) : async () {
    let _ = pohEngine.changeChallengeTaskStatus(
      challengeId,
      caller,
      #pending
    );

    //TODO: We may have to move the updateDataCanisterId back here, if POH is failing

    // Create challenge packages for voting if applicable
    let challengePackages = pohEngine.createChallengePackageForVoting(
      caller,
      pohContentQueueManager.getContentStatus,
      stateV2,
      canistergeekLogger
    );

    // Process each created package: update content status and issue callbacks to providers
    for (package in challengePackages.vals()) {
      pohContentQueueManager.changeContentStatus(package.id, #new);
      switch (pohEngine.getPohChallengePackage(package.id)) {
        case (null) ();
        case (?package) {
          await pohEngine.issueCallbackToProviders(
            package.userId,
            stateV2,
            voteManager.getAllUniqueViolatedRules,
            pohContentQueueManager.getContentStatus,
            canistergeekLogger
          );
        };
      };
    };
  };
};
