import Types "../modclub/types";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Error "mo:base/Error";
import Principal "mo:base/Principal";
import CommonTypes "types";
import Helpers "helpers";
import PohTypes "../modclub/service/poh/types";
import POH "../modclub/service/poh/poh";
import VoteManager "../modclub/service/vote/vote";
import StateV2 "../modclub/statev2";
import QueueManager "../modclub/service/queue/queue";
import Canistergeek "../common/canistergeek/canistergeek";
import ModSecurity "./security/guard";
import VoteTypes "../modclub/service/vote/types";

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
    voteManager : VoteManager.VoteManager,
    canistergeekLogger : Canistergeek.Logger
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

  public func initiateUniquePohProcessing(
    caller : Principal,
    pohDataRequest : PohTypes.PohChallengeSubmissionRequest,
    dataCanisterId : ?Principal,
    pohEngine : POH.PohEngine,
    authGuard : ModSecurity.Guard,
    transform : shared query Types.TransformArgs -> async Types.CanisterHttpResponsePayload,
    canistergeekLogger : Canistergeek.Logger,
    logger: CommonTypes.ModclubLogger
  ) : async () {
    let _ = do ? {
      let contentId = pohEngine.changeChallengeTaskStatus(
        pohDataRequest.challengeId,
        caller,
        #processing
      );

      let hosts : [Text] = authGuard.getSecretVals("POH_LAMBDA_HOST");
      let keyToCallLambdaForPOH = authGuard.getSecretVals("POH_LAMBDA_KEY");
      if (hosts.size() == 0) {
        throw Error.reject("POH Lambda HOST is not provided. Please ask admin to set the POH_LAMBDA_HOST for lambda calls.");
      };
      if (keyToCallLambdaForPOH.size() == 0) {
        throw Error.reject("POH Lambda key is not provided. Please ask admin to set the POH_LAMBDA_KEY for lambda calls.");
      };

      // Initiate lambda trigger to process face
      try {
        await pohEngine.httpCallForProcessing(
          caller,
          dataCanisterId!,
          contentId!,
          keyToCallLambdaForPOH[0],
          hosts[0],
          transform,
          canistergeekLogger
        );
      } catch (e) {
        // Set the status to failed
        logger.logError("initiateUniquePohProcessing - Failure to initiate processing setting task to #failed " # Error.message(e));
        let _ = pohEngine.changeChallengeTaskStatus(
          pohDataRequest.challengeId,
          caller,
          #rejected
        );
        false;
      };
    };
  };

  public func updateVote(vote : VoteTypes.PohVote, newTotalReward : Float, newLockedReward : Float, rsReceived : Float) : VoteTypes.PohVote {
    {
      id = vote.id;
      contentId = vote.contentId;
      userId = vote.userId;
      decision = vote.decision;
      rsBeforeVoting = vote.rsBeforeVoting;
      level = vote.level;
      violatedRules = vote.violatedRules;
      createdAt = vote.createdAt;
      totalReward = ?newTotalReward;
      lockedReward = ?newLockedReward;
      rsReceived = ?rsReceived;
    };
  };
};
