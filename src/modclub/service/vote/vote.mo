import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import ModClubParam "../parameters/params";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
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
            Debug.print("isAutoApprovedPOHUser: " # Principal.toText(userId));
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
            Debug.print("addToAudoapprovedUser: " # Principal.toText(userId));
            state.autoApprovePOHUserIds.put(userId, userId);
        };

        public func getTasksId(status: Types.ContentStatus, start: Nat, end: Nat) : [Text] {
            if(start > end) {
                return [];
            };
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

            if(start >= sourceBuffer.size()) {
                return [];
            };
            
            var fetchSize = end;
            if(end >= sourceBuffer.size()) {
                fetchSize := sourceBuffer.size() - 1;
            };
            let buf = Buffer.Buffer<Text>(fetchSize);
            for(i in Iter.range(start, fetchSize)) {
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

        public func getAllUniqueViolatedRules(packageId: Text) : [Types.PohRulesViolated] {
            let uniqueViolatedRules = HashMap.HashMap<Text, Types.PohRulesViolated>(1, Text.equal, Text.hash);
            for(voteId in state.pohContent2votes.get0(packageId).vals()) {
                switch(state.pohVotes.get(voteId)) {
                    case(null)();
                    case(?vote) {
                        if(vote.decision == #rejected) {
                            for(vRule in vote.violatedRules.vals()) {
                                let key = vRule.challengeId # vRule.ruleId;
                                uniqueViolatedRules.put(key, vRule);
                            };
                        };
                    };
                };
            };
            let buffer = Buffer.Buffer<Types.PohRulesViolated>(uniqueViolatedRules.size());
            for((key, val) in uniqueViolatedRules.entries()) {
                buffer.add(val);
            };
            return buffer.toArray();
        };

        public func votePohContent(
            userId: Principal,
            packageId: Text,
            decision: Types.Decision,
            violatedRules: [Types.PohRulesViolated]
            )  
        : Result.Result<Bool, VoteTypes.VoteError> {
            Debug.print("votePohContent: " # packageId # " UserId " # Principal.toText(userId));
            if (checkPohUserHasVoted(userId, packageId)) {
                    return #err(#userAlreadyVoted);
            };
            switch (state.package2Status.get(packageId)) {
                case (null)();
                case (?status) {
                    if (status != #new) {
                        return #err(#contentAlreadyReviewed);
                    };
                };
            };

            var voteCount = getVoteCountForPoh(userId, packageId);
            var voteApproved = voteCount.approvedCount;
            var voteRejected = voteCount.rejectedCount;

            let vote : VoteTypes.Vote = {
                id = getVoteId(userId, packageId);
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
            Debug.print("Finished voting: ");
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

        public func checkPohUserHasVoted(userId: Principal, packageId: Text) : Bool {
        let voteId = getVoteId(userId, packageId);
            switch(state.pohVotes.get(voteId)){
                case(?v){
                    return true;
                };
                case(_)();
            };
            return false;
        };

        public func getVoteId(userId: Principal, packageId: Text) : Text {
            return "vote-poh-" # Principal.toText(userId) # packageId;
        };

        public func evaluatePohVotes(packageId: Text, aCount: Nat, rCount: Nat) : Bool {
            var finishedVote = false;

            // var minVotes = ModClubParam.MIN_VOTE_POH;
            if(aCount >= ModClubParam.MIN_VOTE_POH) {
                // Approved
                finishedVote := true;
                changePohPackageVotingStatus(packageId, #approved);
            } else if ( rCount >= ModClubParam.MIN_VOTE_POH) {
                // Rejected
                finishedVote := true;
                changePohPackageVotingStatus(packageId, #rejected);
            };

            return finishedVote;
        };

        public func changePohPackageVotingStatus(packageId: Text, status : Types.ContentStatus) {
            state.newPohPackages := deleteElementFromBuffer(state.newPohPackages, packageId);
            state.package2Status.put(packageId, status);
            if(status == #approved) {
                state.approvedPohPackages.add(packageId);
            } else if ( status == #rejected) {
                state.rejectedPohPackages.add(packageId);
            };
        };

        func deleteElementFromBuffer(buff: Buffer.Buffer<Text>, ele: Text) : Buffer.Buffer<Text> {
            let newBuffer = Buffer.Buffer<Text>(buff.size());
            for(val in buff.vals()) {
                if(val != ele) {
                    newBuffer.add(val);
                }
            };
            return newBuffer;
        };

        public func getStableState() : VoteState.PohVoteStableState {
            return VoteState.getStableState(state);
        };

    };
};