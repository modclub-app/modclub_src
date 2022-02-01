
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import List "mo:base/Array";
import ModClubParam "../parameters/params";
import PohState "state";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Types "../../types";
import VoteState "./state";
import VoteTypes "./types";

module VoteModule {

    public class VoteManager(stableState : VoteState.PohVoteStableState) {

        var state:VoteState.PohVoteState = VoteState.getState(stableState);

        public func initiateVotingPoh(challengePackageId: Text, userId: Principal) : () {
            switch(state.autoApprovePOHUserIds.get(userId)) {
                case(null){
                    state.package2Status.put(challengePackageId, #new);
                    state.newPohPackages.add(challengePackageId);
                };
                case(approvedUser) {
                    state.package2Status.put(challengePackageId, #approved);
                    state.approvedPohPackages.add(challengePackageId);
                };
            };
        };

        public func isAutoApprovedPOHUser(userId: Principal) : Bool {
            switch(state.autoApprovePOHUserIds.get(userId)) {
                case(null){
                    return false;
                };
                case(_) {
                    return true;
                };
            };
        };

        public func addToAutoApprovedPOHUser(userId: Principal) {
            state.autoApprovePOHUserIds.put(userId, userId);
        };

        public func getTasksId(status: Types.ContentStatus, limit: Nat) : [Text] {
            var sourceBuffer = Buffer.Buffer<Text>(1);
            switch(status) {
                case(#new) {
                    sourceBuffer := state.newPohPackages;
                };
                case(#approved) {
                    sourceBuffer := state.approvedPohPackages;
                };
                case(#rejected) {
                    sourceBuffer := state.rejectedPohPackages;
                };
            };

            var fetchSize = limit;
            if(limit > sourceBuffer.size()) {
                fetchSize := sourceBuffer.size();
            };
            let buf = Buffer.Buffer<Text>(fetchSize);
            for(i in Iter.range(0, fetchSize - 1)) {
                buf.add(sourceBuffer.get(i));
            };
            return buf.toArray();
        };

        public func getContentStatus(packageId: Text) : Types.ContentStatus {
            switch(state.package2Status.get(packageId)) {
                case(null) {
                    return #new;
                };
                case(?status) {
                    return status;
                }
            };
        };

        public func getPOHVotesId(packageId: Text) : [Text] {
            return state.pohContent2votes.get0(packageId);
        };

        public func getPOHVote(voteId: Text) : ?VoteTypes.Vote {
            return state.pohVotes.get(voteId);
        };

        public func votePohContent(userId: Principal, packageId: Text, decision: Types.Decision, violatedRules: [Types.PohRulesViolated])  
        : Result.Result<Bool, VoteTypes.VoteError> {

            let voteId = "vote-poh-" # Principal.toText(userId) # packageId;
            switch(state.pohVotes.get(voteId)){
                case(?v){
                    return #err(#userAlreadyVoted);
                };
                case(_)();
            };

            switch(state.package2Status.get(packageId)) {
                case(null)();
                case(?status) {
                    if(status != #new) {
                        return #err(#contentAlreadyReviewed);
                    };
                };
            };

            var voteCount = getVoteCountForPoh(userId, packageId);
            var voteApproved = voteCount.approvedCount;
            var voteRejected = voteCount.rejectedCount;

            let vote : VoteTypes.Vote = {
                id = voteId;
                contentId =  packageId;
                userId = userId;
                decision = decision; 
                violatedRules = violatedRules;
                createdAt = Time.now();
            };

            switch(decision){
                case(#approved) {
                    voteApproved += 1 ;
                };
                case(#rejected) {
                    voteRejected += 1;
                };
            };

            // Update relations
            state.pohContent2votes.put(packageId, vote.id);
            state.mods2Pohvotes.put(userId, vote.id);
            state.pohVotes.put(vote.id, vote);

            // Evaluate and send notification to provider
            let finishedVoting = evaluatePohVotes(packageId, voteApproved, voteRejected);
            #ok(finishedVoting);
        };
        
        public func getVoteCountForPoh(userId: Principal, packageId: Text) : VoteTypes.VoteCount {
            var voteApproved : Nat = 0;
            var voteRejected : Nat  = 0;
            var hasVoted : Bool = false;
            
            for(vid in state.pohContent2votes.get0(packageId).vals()){
                switch(state.pohVotes.get(vid)){
                    case(?v){
                        if(v.decision == #approved){
                            voteApproved += 1;
                        } else {
                            voteRejected += 1;
                        };
                        if (v.userId == userId) {
                                hasVoted := true;
                        };
                    }; 
                    case(_) ();
                };
            };
            return {
                approvedCount = voteApproved;
                rejectedCount = voteRejected;
                hasVoted = hasVoted;
            };
        };

        public func evaluatePohVotes(packageId: Text, aCount: Nat, rCount: Nat) : Bool {
            var finishedVote = false;

            // var minVotes = ModClubParam.MIN_VOTE_POH;
            if(aCount >= ModClubParam.MIN_VOTE_POH) {
                // Approved
                finishedVote := true;
                state.newPohPackages := deleteElementFromBuffer(state.newPohPackages, packageId);
                state.approvedPohPackages.add(packageId);
                state.package2Status.put(packageId, #approved);
            } else if ( rCount >= ModClubParam.MIN_VOTE_POH) {
                // Rejected
                finishedVote := true;
                state.newPohPackages := deleteElementFromBuffer(state.newPohPackages, packageId);
                state.rejectedPohPackages.add(packageId);
                state.package2Status.put(packageId, #rejected);
            };

            return finishedVote;
        };

        func deleteElementFromBuffer(buff: Buffer.Buffer<Text>, ele: Text) : Buffer.Buffer<Text> {
            let newBuffer = Buffer.Buffer<Text>(buff.size());
            for(val in buff.vals()) {
                if(val != ele) {
                    newBuffer.add(ele);
                }
            };
            return newBuffer;
        };

        public func getStableState() : VoteState.PohVoteStableState {
            return VoteState.getStableState(state);
        }

    };
};