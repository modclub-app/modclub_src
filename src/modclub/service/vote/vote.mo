import Buffer "mo:base/Buffer";
import Float "mo:base/Float";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Int "mo:base/Int";
import ModClubParam "../parameters/params";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Types "../../types";

// TODO remove this after upgrade
import VoteState "./state";
import VoteStateV2 "./statev2";

import VoteStateV3 "./pohVoteState";
import VoteTypes "./types";
import Helpers "../../../common/helpers";
import QueueManager "../queue/queue";
import GlobalState "../../statev2";
import RSTypes "../../../rs/types";
import CommonTypes "../../../common/types";
import Utils "../../../common/utils";
import ModSecurity "../../../common/security/guard";
import Constants "../../../common/constants";

module VoteModule {

  public class VoteManager(stableState : VoteStateV3.PohVoteStableState) {

    var state : VoteStateV3.PohVoteState = VoteStateV3.getState(stableState);

    public func isAutoApprovedPOHUser(userId : Principal) : Bool {
      switch (state.autoApprovePOHUserIds.get(userId)) {
        case (null) {
          return false;
        };
        case (_) {
          return true;
        };
      };
    };

    public func addToAutoApprovedPOHUser(userId : Principal) {
      state.autoApprovePOHUserIds.put(userId, userId);
    };

    public func getPOHVotesId(packageId : Text) : [Text] {
      return state.pohContent2votes.get0(packageId);
    };

    public func getPOHVote(voteId : Text) : ?VoteTypes.PohVote {
      return state.pohVotes.get(voteId);
    };

    public func setPOHVote(voteId : Text, v : VoteTypes.PohVote) {
      return state.pohVotes.put(voteId, v);
    };

    public func getPOHVotes(userId : Principal) : [VoteTypes.PohVote] {
      let buffer = Buffer.Buffer<VoteTypes.PohVote>(1);
      for (voteId in state.mods2Pohvotes.get0(userId).vals()) {
        var v = getPOHVote(voteId);
        switch (v) {
          case (?vote) {
            buffer.add(vote);
          };
          case null {};
        };
      };
      return Buffer.toArray(buffer);
    };

    public func getAllUniqueViolatedRules(packageId : Text) : [
      Types.PohRulesViolated
    ] {
      let uniqueViolatedRules = HashMap.HashMap<Text, Types.PohRulesViolated>(
        1,
        Text.equal,
        Text.hash
      );
      for (voteId in state.pohContent2votes.get0(packageId).vals()) {
        switch (state.pohVotes.get(voteId)) {
          case (null)();
          case (?vote) {
            if (vote.decision == #rejected) {
              for (vRule in vote.violatedRules.vals()) {
                let key = vRule.challengeId # vRule.ruleId;
                uniqueViolatedRules.put(key, vRule);
              };
            };
          };
        };
      };
      let buffer = Buffer.Buffer<Types.PohRulesViolated>(
        uniqueViolatedRules.size()
      );
      for ((key, val) in uniqueViolatedRules.entries()) {
        buffer.add(val);
      };
      return Buffer.toArray<Types.PohRulesViolated>(buffer);
    };

    public func createPohVoteReservation(
      env : CommonTypes.ENV,
      packageId : Text,
      userId : Principal
    ) : async Result.Result<Types.Reserved, VoteTypes.POHReservationError> {
      let id = getVoteId(userId, packageId);
      if (Utils.isReserved(id, Buffer.toArray<Types.Reserved>(state.reservedPohPackages))) {
        return #err(#userAlreadyReserved);
      };

      let reservation = await takePohReservation(userId, id, Constants.RESERVE_EXPIRE_TIME);
      return #ok(reservation);
    };

    public func getPohVoteReservation(
      packageId : Text,
      userId : Principal
    ) : ?Types.Reserved {
      let id = getVoteId(userId, packageId);

      let reservation = Utils.getReserved(id, Buffer.toArray<Types.Reserved>(state.reservedPohPackages));
      return reservation;
    };

    public func isReservedPOHContent(
      packageId : Text,
      userId : Principal
    ) : Bool {
      let id = getVoteId(userId, packageId);
      if (Utils.isReserved(id, Buffer.toArray<Types.Reserved>(state.reservedPohPackages))) {
        return true;
      };
      return false;
    };

    public func votePohContent(
      userId : Principal,
      env : CommonTypes.ENV,
      packageId : Text,
      decision : Types.Decision,
      violatedRules : [Types.PohRulesViolated],
      moderatorStats : RSTypes.RSAndLevel,
      pohContentQueueManager : QueueManager.QueueManager
    ) : async Result.Result<Bool, VoteTypes.POHVoteError> {
      let id = getVoteId(userId, packageId);
      var voteCount = getVoteCountForPoh(userId, packageId);
      var voteApproved = voteCount.approvedCount;
      var voteRejected = voteCount.rejectedCount;

      let vote : VoteTypes.PohVote = {
        id = getVoteId(userId, packageId);
        contentId = packageId;
        userId = userId;
        decision = decision;
        violatedRules = violatedRules;
        rsBeforeVoting = Float.fromInt(moderatorStats.score);
        level = moderatorStats.level;
        createdAt = Time.now(); // [TODO] should use Helpers.timeNow()
        lockedReward = null;
        totalReward = null;
        rsReceived = null;
      };

      switch (decision) {
        case (#approved) {
          voteApproved += 1;
        };
        case (#rejected) {
          voteRejected += 1;
        };
      };

      // Update relations
      state.pohContent2votes.put(packageId, vote.id);
      state.mods2Pohvotes.put(userId, vote.id);
      state.pohVotes.put(vote.id, vote);

      // Evaluate and send notification to provider
      let finishedVoting = evaluatePohVotes(
        packageId,
        voteApproved,
        voteRejected,
        pohContentQueueManager
      );
      #ok(finishedVoting);
    };

    public func getVoteCountForPoh(userId : Principal, packageId : Text) : VoteTypes.VoteCount {
      var voteApproved : Nat = 0;
      var voteRejected : Nat = 0;
      var hasVoted : Bool = false;

      for (vid in state.pohContent2votes.get0(packageId).vals()) {
        switch (state.pohVotes.get(vid)) {
          case (?v) {
            if (v.decision == #approved) {
              voteApproved += 1;
            } else {
              voteRejected += 1;
            };
            if (v.userId == userId) {
              hasVoted := true;
            };
          };
          case (_)();
        };
      };
      return {
        approvedCount = voteApproved;
        rejectedCount = voteRejected;
        hasVoted = hasVoted;
      };
    };

    public func isVotedByUser(userId : Principal, packageId : Text) : Bool {
      let voteId = getVoteId(userId, packageId);
      switch (state.pohVotes.get(voteId)) {
        case (?v) {
          return true;
        };
        case (_)();
      };
      return false;
    };

    public func getVoteId(userId : Principal, packageId : Text) : Text {
      return "vote-poh-" # Principal.toText(userId) # packageId;
    };

    public func evaluatePohVotes(
      packageId : Text,
      aCount : Nat,
      rCount : Nat,
      pohContentQueueManager : QueueManager.QueueManager
    ) : Bool {
      var finishedVote = false;
      var requiredVotes = ModClubParam.MIN_VOTE_POH;
      let majorityVotes = requiredVotes - Int.abs(requiredVotes / 2);
      let factVotes = aCount + rCount;

      if (factVotes == requiredVotes and aCount >= majorityVotes) {
        // Approved
        finishedVote := true;
        pohContentQueueManager.changeContentStatus(packageId, #approved);
      } else if (factVotes == requiredVotes and rCount >= majorityVotes) {
        // Rejected
        finishedVote := true;
        pohContentQueueManager.changeContentStatus(packageId, #rejected);
      };

      return finishedVote;
    };

    func deleteElementFromBuffer(buff : Buffer.Buffer<Text>, ele : Text) : Buffer.Buffer<Text> {
      let newBuffer = Buffer.Buffer<Text>(buff.size());
      for (val in buff.vals()) {
        if (val != ele) {
          newBuffer.add(val);
        };
      };
      return newBuffer;
    };

    public func getVotesForPOHBasedOnPackageId(
      packageId : Text,
      globalState : GlobalState.State
    ) : [VoteTypes.VotePlusUser] {
      let buffer = Buffer.Buffer<VoteTypes.VotePlusUser>(0);
      for (vid in state.pohContent2votes.get0(packageId).vals()) {
        switch (state.pohVotes.get(vid)) {
          case (null)();
          case (?v) {
            switch (globalState.profiles.get(v.userId)) {
              case (null)();
              case (?result) {
                buffer.add(
                  {
                    userModClubId = result.id;
                    userUserName = result.userName;
                    userEmailId = result.email;
                    userVoteDecision = v.decision;
                    userVoteCreatedAt = v.createdAt;
                  }
                );
              };
            };
          };
        };
      };
      return Buffer.toArray<VoteTypes.VotePlusUser>(buffer);
    };

    private func takePohReservation(
      caller : Principal,
      id : Text,
      expireTime : Types.Timestamp
    ) : async Types.Reserved {
      let now = Helpers.timeNow();
      if (isVotedByUser(caller, id)) {
        throw Error.reject("Reservation failed");
      };
      if (isReservedPOHContent(id, caller)) {
        throw Error.reject("Already take reservation");
      };
      let reservation : Types.Reserved = {
        id = id;
        profileId = Principal.toText(caller);
        createdAt = now;
        updatedAt = now;
        reservedExpiryTime = now + expireTime;
      };
      state.reservedPohPackages.add(reservation);
      return reservation;
    };

    public func getStableState() : VoteStateV3.PohVoteStableState {
      return VoteStateV3.getStableState(state);
    };

    public func getVoteState() : VoteStateV3.PohVoteState {
      return state;
    };

    public func migrateV1ToV2(pohVoteStableState : VoteState.PohVoteStableState, pohVoteStableStateV2 : VoteStateV2.PohVoteStableState) : VoteStateV2.PohVoteStableState {
      let buff = Buffer.Buffer<(Text, VoteTypes.VoteV2)>(pohVoteStableState.pohVotes.size());
      for ((voteId, vote) in pohVoteStableState.pohVotes.vals()) {
        buff.add((
          voteId,
          {
            id = vote.id;
            contentId = vote.contentId;
            userId = vote.userId;
            decision = vote.decision;
            rsBeforeVoting = 0.0;
            level = #novice;
            violatedRules = vote.violatedRules;
            createdAt = vote.createdAt;
            lockedReward = null;
            totalReward = null;
            rsReceived = null;
          }
        ));
      };

      return {
        newPohPackages = pohVoteStableState.newPohPackages;
        approvedPohPackages = pohVoteStableState.approvedPohPackages;
        rejectedPohPackages = pohVoteStableState.rejectedPohPackages;
        package2Status = pohVoteStableState.package2Status;
        pohVotes = Buffer.toArray<(Text, VoteTypes.VoteV2)>(buff);
        pohContent2votes = pohVoteStableState.pohContent2votes;
        mods2Pohvotes = pohVoteStableState.mods2Pohvotes;
        autoApprovePOHUserIds = pohVoteStableState.autoApprovePOHUserIds;
        reservedPohPackages = pohVoteStableState.reservedPohPackages;
      };
    };

    public func migrateV2ToV3(pohVoteStableState2 : VoteStateV2.PohVoteStableState) : VoteStateV3.PohVoteStableState {
      let pohVotesBuff = Buffer.Buffer<(Text, VoteTypes.PohVote)>(pohVoteStableState2.pohVotes.size());
      for ((voteId, vote) in pohVoteStableState2.pohVotes.vals()) {
        pohVotesBuff.add((
          voteId,
          {
            id = vote.id;
            contentId = vote.contentId;
            userId = vote.userId;
            decision = vote.decision;
            rsBeforeVoting = vote.rsBeforeVoting;
            level = vote.level;
            violatedRules = vote.violatedRules;
            createdAt = vote.createdAt;
            lockedReward = null;
            totalReward = null;
            rsReceived = null;
          }
        ));
      };

      return {
        newPohPackages = pohVoteStableState2.newPohPackages;
        approvedPohPackages = pohVoteStableState2.approvedPohPackages;
        rejectedPohPackages = pohVoteStableState2.rejectedPohPackages;
        package2Status = pohVoteStableState2.package2Status;
        pohVotes = Buffer.toArray<(Text, VoteTypes.PohVote)>(pohVotesBuff);
        pohContent2votes = pohVoteStableState2.pohContent2votes;
        mods2Pohvotes = pohVoteStableState2.mods2Pohvotes;
        autoApprovePOHUserIds = pohVoteStableState2.autoApprovePOHUserIds;
        reservedPohPackages = pohVoteStableState2.reservedPohPackages;
      };
    };
  };
};
