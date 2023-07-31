import Int "mo:base/Int";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Float "mo:base/Float";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import ContentTypes "types";
import GlobalState "../../statev2";
import ContentState "state";
import Helpers "../../../common/helpers";
import Types "../../types";
import ModClubParam "../parameters/params";
import Canistergeek "../../../common/canistergeek/canistergeek";
import QueueManager "../queue/queue";
import RSTypes "../../../rs/types";
import RSConstants "../../../rs/constants";
import ICRCTypes "../../../common/ICRCTypes";
import Utils "../../../common/utils";
import CommonTypes "../../../common/types";
import Constants "../../../common/constants";
import ModSecurity "../../../common/security/guard";

module ContentVotingModule {
  public type ContentVoteError = { #contentNotFound; #voteNotFound };

  public func getContentResult(
    contentId : Types.ContentId,
    sourceId : Text,
    status : Types.ContentStatus,
    voteCount : Types.VoteCount
  ) : Types.ContentResult {
    let contentResult : Types.ContentResult = {
      sourceId = sourceId;
      approvedCount = voteCount.approvedCount;
      rejectedCount = voteCount.rejectedCount;
      status = status;
      violatedRules = getViolatedRuleCount(voteCount.violatedRulesCount);
    };
    return contentResult;
  };

  public func getVotePerformance(caller : Principal, state : GlobalState.State) : Result.Result<Float, ContentVoteError> {
    var correctVoteCount : Int = 0;
    var completedVoteCount : Int = 0;
    for (vid in state.mods2votes.get0(caller).vals()) {
      switch (state.votes.get(vid)) {
        case (?vote) {
          switch (state.content.get(vote.contentId)) {
            case (?content) {
              if (content.status != #new) {
                completedVoteCount := completedVoteCount + 1;
                if (vote.decision == content.status) {
                  correctVoteCount := correctVoteCount + 1;
                };
              };
            };
            case (_) return #err(#contentNotFound);
            // throw Error.reject("Content does not exist");
          };
        };
        case (_) return #err(#voteNotFound);
        // throw Error.reject("Vote does not exist");
      };
    };
    var performance : Float = 0;
    if (completedVoteCount != 0) {
      performance := Float.fromInt(correctVoteCount) / Float.fromInt(
        completedVoteCount
      );
    };
    return #ok(performance);
  };

  public func vote(
    arg : ContentTypes.VoteArg
  ) : async Text {
    let guard = ModSecurity.Guard(arg.env, "VOTE_SERVICE");
    if (
      not arg.contentQueueManager.isContentAssignedToUser(
        arg.userId,
        arg.contentId,
        arg.logger,
        arg.randomizationEnabled
      )
    ) {
      throw Error.reject("User voted on Unauthorized Content.");
    };
    let state = arg.state;
    let voteId = "vote-" # Principal.toText(arg.userId) # arg.contentId;
    switch (state.votes.get(voteId)) {
      case (?v) {
        throw Error.reject("User already voted");
      };
      case (_)();
    };
    let userRSAndLevel = await guard.getRSActor().queryRSAndLevelByPrincipal(arg.userId);
    switch (state.content.get(arg.contentId)) {
      case (?content) {
        if (content.status != #new) throw Error.reject(
          "Content has already been reviewed"
        );

        let isReserved = Utils.isReserved(Principal.toText(arg.userId), content.reservedList);
        if (isReserved == false and userRSAndLevel.level != #novice) throw Error.reject(
          "Must take Reservations before voting"
        );
      };
      case (_)(throw Error.reject("Content does not exist"));
    };

    var voteApproved : Nat = 0;
    var voteRejected : Nat = 0;
    voteApproved := voteApproved + arg.voteCount.approvedCount;
    voteRejected := voteRejected + arg.voteCount.rejectedCount;

    // Check if the rules provided are valid
    if (arg.decision == #rejected) {
      switch (arg.violatedRules) {
        case (?result) {
          if (validateRules(arg.contentId, result, state) != true) {
            throw Error.reject("The violated rules provided are incorrect");
          };
          for (vRuleId in result.vals()) {
            arg.voteCount.violatedRulesCount.put(vRuleId, Option.get(arg.voteCount.violatedRulesCount.get(vRuleId), 0) + 1);
          };
        };
        case (_) throw Error.reject("Must provide rules that were violated");
      };
    };

    let vote : Types.VoteV2 = {
      id = voteId;
      contentId = arg.contentId;
      userId = arg.userId;
      decision = arg.decision;
      violatedRules = arg.violatedRules;
      rsBeforeVoting = userRSAndLevel.score;
      level = userRSAndLevel.level;
      createdAt = Helpers.timeNow();
    };

    if (userRSAndLevel.level != #novice) {
      switch (arg.decision) {
        case (#approved) {
          voteApproved += 1;
        };
        case (#rejected) {
          voteRejected += 1;
        };
      };
    };

    // Update relations
    state.content2votes.put(arg.contentId, vote.id);
    state.mods2votes.put(arg.userId, vote.id);
    state.votes.put(vote.id, vote);

    // Evaluate and send notification to provider
    switch (state.content.get(arg.contentId)) {
      case (?content) {
        await evaluateVotes({
          content;
          env = arg.env;
          aCount = voteApproved;
          rCount = voteRejected;
          modclubCanisterId = arg.modclubCanisterId;
          violatedRulesCount = arg.voteCount.violatedRulesCount;
          state;
          logger = arg.logger;
          contentQueueManager = arg.contentQueueManager;
        });
      };
      case (_)(throw Error.reject("Content does not exist"));
    };

    return "Vote successful";
  };

  private func validateRules(
    contentId : Types.ContentId,
    violatedRules : [Types.RuleId],
    state : GlobalState.State
  ) : Bool {
    if (violatedRules.size() == 0) {
      return false;
    };

    switch (state.content.get(contentId)) {
      case (?content) {
        for (rule in violatedRules.vals()) {
          let isMember : Bool = state.provider2rules.isMember(
            content.providerId,
            rule
          );
          if (isMember != true) {
            return false;
          };
        };
      };
      case (_) {
        return false;
      };
    };
    return true;
  };

  private func evaluateVotes(
    arg : ContentTypes.EvaluateVoteArg
  ) : async () {
    var finishedVote = false;
    var status : Types.ContentStatus = #new;
    var decision : Types.Decision = #approved;
    let state = arg.state;
    let provider = switch (state.providers.get(arg.content.providerId)) {
      case (?p) p;
      case (_)(throw Error.reject("Provider does not exist"));
    };

    var requiredVotes = Int.abs(arg.content.voteParameters.requiredVotes);

    if (arg.aCount >= requiredVotes) {
      // Approved
      finishedVote := true;
      status := #approved;
      decision := #approved;
      arg.contentQueueManager.changeContentStatus(arg.content.id, #approved);
    } else if (arg.rCount >= requiredVotes) {
      // Rejected
      status := #rejected;
      decision := #rejected;
      finishedVote := true;
      arg.contentQueueManager.changeContentStatus(arg.content.id, #rejected);
    } else {
      return;
    };

    if (finishedVote) {
      await _rewardCalculation({
        content = arg.content;
        env = arg.env;
        state;
        logger = arg.logger;
        modclubCanisterId = arg.modclubCanisterId;
        decision;
        requiredVotes;
      });
    };

    // Update content status
    state.content.put(
      arg.content.id,
      {
        id = arg.content.id;
        providerId = arg.content.providerId;
        contentType = arg.content.contentType;
        status = status;
        sourceId = arg.content.sourceId;
        title = arg.content.title;
        createdAt = arg.content.createdAt;
        updatedAt = Helpers.timeNow();
        voteParameters = arg.content.voteParameters;
        receipt = arg.content.receipt;
        reservedList = arg.content.reservedList;
      }
    );

    // Call the providers callback
    switch (state.providerSubs.get(arg.content.providerId)) {
      case (?result) {
        result.callback(
          {
            id = arg.content.id;
            sourceId = arg.content.sourceId;
            approvedCount = arg.aCount;
            rejectedCount = arg.rCount;
            status = status;
            violatedRules = getViolatedRuleCount(arg.violatedRulesCount);
          }
        );
        Helpers.logMessage(
          arg.logger,
          "Called callback for provider " # Principal.toText(
            arg.content.providerId
          ),
          #info
        );
      };
      case (_) {
        Helpers.logMessage(
          arg.logger,
          "Provider " # Principal.toText(arg.content.providerId) # " has not subscribed a callback",
          #info
        );
      };
    };
  };
  private func _rewardCalculation(
    arg : ContentTypes.RewardCalculationArg
  ) : async () {
    let guard = ModSecurity.Guard(arg.env, "VOTE_SERVICE");
    let ledger = guard.getWalletActor();
    let rs = guard.getRSActor();
    let vesting = guard.getVestingActor();
    let state = arg.state;
    let provider = switch (state.providers.get(arg.content.providerId)) {
      case (?p) p;
      case (_)(throw Error.reject("Provider does not exist"));
    };

    // Reward / Slash voters ;
    let rewardingVotes = Buffer.Buffer<Types.VoteV2>(1);
    let usersToRewardRS = Buffer.Buffer<RSTypes.UserAndVote>(1);
    for (voteId in state.content2votes.get0(arg.content.id).vals()) {
      switch (state.votes.get(voteId)) {
        case (null)();
        case (?vote) {
          var votedCorrect = false;
          if (vote.decision == arg.decision) {
            if (vote.level != #novice) {
              rewardingVotes.add(vote);
            };
            votedCorrect := true;
          } else {
            votedCorrect := false;
          };
          usersToRewardRS.add({
            userId = vote.userId;
            votedCorrect = votedCorrect;
            decision = vote.decision;
          });
        };
      };
    };
    var sumRS : Int = 0;
    for (userVote in rewardingVotes.vals()) {
      sumRS := sumRS + userVote.rsBeforeVoting;
    };

    //TODO: Needs to be updated to handle junior case where they only receive half the rewards and the remaining is locked. until they become senior
    let CT : Float = ModClubParam.CS * Float.fromInt(arg.requiredVotes);
    // moderator dist
    for (userVote in rewardingVotes.vals()) {
      let moderator = switch (state.profiles.get(userVote.userId)) {
        case (?p) p;
        case (_)(throw Error.reject("Moderator does not exist"));
      };
      let moderatorAcc = { owner = moderator.id; subaccount = null };
      let moderatorSystemAcc = {
        owner = arg.modclubCanisterId;
        subaccount = moderator.subaccounts.get("ACCOUNT_PAYABLE");
      };
      let fullReward = (Float.fromInt(userVote.rsBeforeVoting) * ModClubParam.GAMMA_M * CT) / Float.fromInt(sumRS);
      let isSenior = switch (await rs.queryRSAndLevelByPrincipal(userVote.userId)) {
        case (stat) { stat.score >= RSConstants.JUNIOR_THRESHOLD };
        case (_) { false };
      };
      let modDistTokens = Utils.floatToTokens(fullReward * Constants.REWARD_DEVIATION);
      // Dist of free part of rewarded tokens
      let _ = await ledger.icrc1_transfer({
        from_subaccount = provider.subaccounts.get("ACCOUNT_PAYABLE");
        to = moderatorSystemAcc;
        amount = modDistTokens;
        fee = null;
        memo = null;
        created_at_time = null;
      });

      // Dist of locked part of rewarded tokens
      let lockedReward = Utils.floatToTokens(fullReward - (fullReward * Constants.REWARD_DEVIATION));
      let lockRes = await vesting.stage_vesting_block(moderatorAcc, lockedReward);
      switch (lockRes) {
        case (#ok(lockLen)) {
          let _ = await ledger.icrc1_transfer({
            from_subaccount = provider.subaccounts.get("ACCOUNT_PAYABLE");
            to = {
              owner = arg.modclubCanisterId;
              subaccount = ?Constants.ICRC_VESTING_SA;
            };
            amount = lockedReward;
            fee = null;
            memo = null;
            created_at_time = null;
          });
        };
        case (_)(throw Error.reject("Unable to lock Reward Tokens: " # Nat.toText(lockedReward)));
      };

    };

    let _ = await rs.updateRSBulk(Buffer.toArray<RSTypes.UserAndVote>(usersToRewardRS));

    let treasuryDistTokens = Utils.floatToTokens(ModClubParam.GAMMA_T * CT);

    // treasury dist
    let _ = await ledger.icrc1_transfer({
      from_subaccount = provider.subaccounts.get("ACCOUNT_PAYABLE");
      to = {
        owner = arg.modclubCanisterId;
        subaccount = ?Constants.ICRC_TREASURY_SA;
      };
      amount = treasuryDistTokens;
      fee = null;
      memo = null;
      created_at_time = null;
    });

    let minting_account = switch (await ledger.icrc1_minting_account()) {
      case (?mAcc : ?ICRCTypes.Account) mAcc;
      case (_) {
        throw Error.reject("Unable to get minting_account from ledger.");
      };
    };

    // burn.
    ignore await ledger.icrc1_transfer({
      from_subaccount = provider.subaccounts.get("ACCOUNT_PAYABLE");
      to = minting_account;
      amount = Utils.floatToTokens(ModClubParam.GAMMA_B * CT);
      fee = null;
      memo = null;
      created_at_time = null;
    });
  };

  private func getViolatedRuleCount(violatedRuleCount : HashMap.HashMap<Text, Nat>) : [Types.ViolatedRules] {
    let vRulesCountBuff = Buffer.Buffer<Types.ViolatedRules>(violatedRuleCount.size());

    for ((vRuleId, count) in violatedRuleCount.entries()) {
      vRulesCountBuff.add({
        id = vRuleId;
        rejectionCount = count;
      });
    };
    return Buffer.toArray<Types.ViolatedRules>(vRulesCountBuff);
  };

  private func callBackDataToString(callbackData : Types.ContentResult) : Text {
    var res = "sourceId: " # callbackData.sourceId # " approvedCount: " # Nat.toText(callbackData.approvedCount) # " rejectedCount: " # Nat.toText(callbackData.rejectedCount);
    switch (callbackData.status) {
      case (#rejected) {
        res := res # " violatedRules size: " # Nat.toText(callbackData.violatedRules.size());
        for (vRules in callbackData.violatedRules.vals()) {
          res := res # " id: " # vRules.id # " rejectionCount: " # Nat.toText(vRules.rejectionCount);
        };
      };
      case (_)();
    };
    return res;
  };

};
