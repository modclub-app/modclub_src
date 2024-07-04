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

module MainHelpers {
  public func pohVerificationRequestHelper(
    providerUserId : Text,
    providerId : Principal,
    pohEngine : POH.PohEngine,
    voteManager : VoteManager.VoteManager,
    stateV2 : StateV2.State,
    pohContentQueueManager: QueueManager.QueueManager
  ) : Result.Result<PohTypes.PohVerificationResponsePlus, PohTypes.PohError> {
    if (
      Principal.equal(providerId, Principal.fromActor(this)) and voteManager.isAutoApprovedPOHUser(
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

  public func getVoteCount(
    contentId : Types.ContentId,
    providerId : Principal,
    caller : ?Principal,
    stateV2 : StateV2.State,
  ) : Types.VoteCount {
    var voteApproved : Nat = 0;
    var voteRejected : Nat = 0;
    var hasVoted : Bool = false;
    let violatedRulesCount = HashMap.HashMap<Types.RuleId, Nat>(
      1,
      Text.equal,
      Text.hash
    );
    for (vid in stateV2.content2votes.get0(contentId).vals()) {
      switch (stateV2.votes.get(vid)) {
        case (?v) {
          if (v.level != #novice) {
            if (v.decision == #approved) {
              voteApproved += 1;
            } else {
              voteRejected += 1;
            };
          };
          // if caller is null, consider it as modclub calling it so that operation evaluates to false
          // simplifies switch braches
          if (not hasVoted) {
            hasVoted := Principal.equal(
              Option.get(caller, providerId),
              v.userId
            );
          };
          for (vRuleId in Option.get(v.violatedRules, []).vals()) {
            violatedRulesCount.put(
              vRuleId,
              Option.get(violatedRulesCount.get(vRuleId), 0) + 1
            );
          };
        };
        case (_) ();
      };
    };

    return {
      approvedCount = voteApproved;
      rejectedCount = voteRejected;
      hasVoted = hasVoted;
      violatedRulesCount = violatedRulesCount;
    };
  };
};
