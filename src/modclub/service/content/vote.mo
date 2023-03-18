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

import GlobalState "../../statev2";
import Helpers "../../helpers";
import Types "../../types";
import Tokens "../../token";
import ModClubParam "../parameters/params";
import Canistergeek "../../canistergeek/canistergeek";
import QueueManager "../queue/queue";
import ModWallet "../../remote_canisters/ModWallet";
import RSManager "../../remote_canisters/RSManager";
import RSTypes "../../../rs/types";
import WalletTypes "../../../wallet/types";

module ContentVotingModule {

  public type ContentVoteError = { #contentNotFound; #voteNotFound };

  public func getContentResult(
      contentId: Types.ContentId,
      sourceId: Text,
      status: Types.ContentStatus,
      voteCount : Types.VoteCount) : Types.ContentResult {
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
        completedVoteCount,
      );
    };
    return #ok(performance);
  };

  public func vote(
    userId : Principal,
    env: Text,
    contentId : Types.ContentId,
    decision : Types.Decision,
    violatedRules : ?[Types.RuleId],
    voteCount : Types.VoteCount,
    state : GlobalState.State,
    logger : Canistergeek.Logger,
    contentQueueManager : QueueManager.QueueManager,
    randomizationEnabled : Bool,
    modclubWalletId: Principal
  ) : async Text {
    if (
      not contentQueueManager.isContentAssignedToUser(
        userId,
        contentId,
        logger,
        randomizationEnabled,
      ),
    ) {
      throw Error.reject("User voted on Unauthorized Content.");
    };
    let voteId = "vote-" # Principal.toText(userId) # contentId;
    switch (state.votes.get(voteId)) {
      case (?v) {
        throw Error.reject("User already voted");
      };
      case (_)();
    };

    switch (state.content.get(contentId)) {
      case (?content) {
        if (content.status != #new) throw Error.reject(
          "Content has already been reviewed",
        );
      };
      case (_)(throw Error.reject("Content does not exist"));
    };

    // TODO: validation check staking requirement fulfilled for senior levels
    var voteApproved : Nat = 0;
    var voteRejected : Nat = 0;
    voteApproved := voteApproved + voteCount.approvedCount;
    voteRejected := voteRejected + voteCount.rejectedCount;

    // Check if the rules provided are valid
    if (decision == #rejected) {
      switch (violatedRules) {
        case (?result) {
          if (validateRules(contentId, result, state) != true) {
            throw Error.reject("The violated rules provided are incorrect");
          };
          for (vRuleId in result.vals()) {
            voteCount.violatedRulesCount.put(vRuleId, Option.get(voteCount.violatedRulesCount.get(vRuleId), 0) + 1);
          };
        };
        case (_) throw Error.reject("Must provide rules that were violated");
      };
    };

    let userRSAndLevel = await RSManager.getActor(env).queryRSAndLevelByPrincipal(userId);
    let vote : Types.VoteV2 = {
      id = voteId;
      contentId = contentId;
      userId = userId;
      decision = decision;
      violatedRules = violatedRules;
      rsBeforeVoting = userRSAndLevel.score;
      level = userRSAndLevel.level;
      createdAt = Helpers.timeNow();
    };

    if(userRSAndLevel.level != #novice) {
      switch (decision) {
        case (#approved) {
          voteApproved += 1;
        };
        case (#rejected) {
          voteRejected += 1;
        };
      };
    };

      // Update relations
    state.content2votes.put(contentId, vote.id);
    state.mods2votes.put(userId, vote.id);
    state.votes.put(vote.id, vote);

      // Evaluate and send notification to provider
    switch (state.content.get(contentId)) {
      case (?content) {
        await evaluateVotes(
          content,
          env,
          voteApproved,
          voteRejected,
          modclubWalletId,
          voteCount.violatedRulesCount,
          state,
          logger,
          contentQueueManager,
        );
      };
      case (_)(throw Error.reject("Content does not exist"));
    };
    
    return "Vote successful";
  };

  private func validateRules(
    contentId : Types.ContentId,
    violatedRules : [Types.RuleId],
    state : GlobalState.State,
  ) : Bool {
    if (violatedRules.size() == 0) {
      return false;
    };

    switch (state.content.get(contentId)) {
      case (?content) {
        for (rule in violatedRules.vals()) {
          let isMember : Bool = state.provider2rules.isMember(
            content.providerId,
            rule,
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
    content : Types.Content,
    env: Text,
    aCount : Nat,
    rCount : Nat,
    modclubWalletId : Principal,
    violatedRulesCount: HashMap.HashMap<Text, Nat>,
    state : GlobalState.State,
    logger : Canistergeek.Logger,
    contentQueueManager : QueueManager.QueueManager,
  ) : async () {
    var finishedVote = false;
    var status : Types.ContentStatus = #new;
    var decision : Types.Decision = #approved;

    var minVotes = 0;
    switch(state.providers.get(content.providerId)) {
      case(?provider) {
        minVotes := provider.settings.minVotes;
      };
      case(null)();
    };

    if (aCount >= minVotes) {
      // Approved
      finishedVote := true;
      status := #approved;
      decision := #approved;
      contentQueueManager.changeContentStatus(content.id, #approved);
    } else if (rCount >= minVotes) {
      // Rejected
      status := #rejected;
      decision := #rejected;
      finishedVote := true;
      contentQueueManager.changeContentStatus(content.id, #rejected);
    } else {
      return;
    };

    if (finishedVote) {
      // Reward / Slash voters ;
      let rewardingVotes = Buffer.Buffer<Types.VoteV2>(1);
      let usersToRewardRS = Buffer.Buffer<RSTypes.UserAndVote>(1);
      for(voteId in state.content2votes.get0(content.id).vals()) {
        switch (state.votes.get(voteId)) {
          case(null)();
          case(?vote) {
            var votedCorrect = false;
            if (vote.decision == decision) {
              if(vote.level != #novice) {
                rewardingVotes.add(vote);
              };
              votedCorrect := true;
            } else {
              votedCorrect := false;
            };
            usersToRewardRS.add({
              userId = vote.userId;
              votedCorrect = votedCorrect;
            });
          };
        };
      };
      var sumRS = 0.0;
      for(userVote in rewardingVotes.vals()) {
        sumRS := sumRS + userVote.rsBeforeVoting;
      };
      
      // For each rewarding vote, add the user to the buffer with the corresponding amount of MOD to be rewarded
      let usersToRewardMOD = Buffer.Buffer<WalletTypes.UserAndAmount>(1);
      let CT: Float = ModClubParam.CS * Float.fromInt(minVotes);
      for(userVote in rewardingVotes.vals()) {
        usersToRewardMOD.add({
          fromSA = ?(Principal.toText(content.providerId) # ModClubParam.ACCOUNT_PAYABLE);
          toOwner = userVote.userId;
          toSA = null;
          amount = (userVote.rsBeforeVoting * ModClubParam.GAMMA_M * CT)/ sumRS ;
        });
      };
      let _ = await RSManager.getActor(env).updateRSBulk(usersToRewardRS.toArray());
      // moderator dist and treasury dist
      usersToRewardMOD.add({
        fromSA = ?(Principal.toText(content.providerId) # ModClubParam.ACCOUNT_PAYABLE);
        toOwner = modclubWalletId;
        toSA = ?ModClubParam.TREASURY_SA;
        amount = (ModClubParam.GAMMA_T * CT) ;
      });
      let _ = await ModWallet.getActor(env).transferBulk(usersToRewardMOD.toArray());
      // burn
      let _ = await ModWallet.getActor(env).burn(
                    ?(Principal.toText(content.providerId) # ModClubParam.ACCOUNT_PAYABLE), 
                    (ModClubParam.GAMMA_B * CT)
                  );

    };

    // Update content status
    state.content.put(
      content.id,
      {
        id = content.id;
        providerId = content.providerId;
        contentType = content.contentType;
        status = status;
        sourceId = content.sourceId;
        title = content.title;
        createdAt = content.createdAt;
        updatedAt = Helpers.timeNow();
      },
    );

    // Call the providers callback
    switch (state.providerSubs.get(content.providerId)) {
      case (?result) {
        result.callback(
          {
            id = content.id;
            sourceId = content.sourceId;
            approvedCount = aCount;
            rejectedCount = rCount;
            status = status;
            violatedRules = getViolatedRuleCount(violatedRulesCount);
          },
        );
        Debug.print(
          "Called callback for provider " # Principal.toText(
            content.providerId,
          ),
        );
        Helpers.logMessage(
          logger,
          "Called callback for provider " # Principal.toText(
            content.providerId,
          ),
          #info,
        );
      };
      case (_) {
        Debug.print(
          "Provider " # Principal.toText(content.providerId) # " has not subscribed a callback",
        );
        Helpers.logMessage(
          logger,
          "Provider " # Principal.toText(content.providerId) # " has not subscribed a callback",
          #info,
        );
      };
    };
  };
  

  private func getViolatedRuleCount(violatedRuleCount: HashMap.HashMap<Text, Nat>) : [Types.ViolatedRules] {
    let vRulesCountBuff = Buffer.Buffer<Types.ViolatedRules>(violatedRuleCount.size());

    for((vRuleId, count) in violatedRuleCount.entries()) {
      vRulesCountBuff.add({
        id = vRuleId;
        rejectionCount = count;
      });
    };
    return vRulesCountBuff.toArray();
  };

  private func callBackDataToString(callbackData: Types.ContentResult) : Text {
    var res = "sourceId: " # callbackData.sourceId # " approvedCount: " # Nat.toText(callbackData.approvedCount) # " rejectedCount: " # Nat.toText(callbackData.rejectedCount);
    switch(callbackData.status) {
      case(#rejected) {
        res :=  res # " violatedRules size: " # Nat.toText(callbackData.violatedRules.size());
        for(vRules in callbackData.violatedRules.vals()) {
          res := res # " id: " # vRules.id # " rejectionCount: " # Nat.toText(vRules.rejectionCount);
        };
      };
      case(_)();
    };
    return res;
  };

};
