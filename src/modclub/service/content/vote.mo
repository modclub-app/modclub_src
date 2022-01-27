import Int "mo:base/Int";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Float "mo:base/Float";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Result "mo:base/Result";

import GlobalState "../../state";
import Helpers "../../helpers";
import Types "../../types";
import Tokens "../../token";


module ContentVotingModule {

    public type ContentVoteError = {#contentNotFound; #voteNotFound;};

    public func getVotePerformance(caller: Principal, state: GlobalState.State) : Result.Result<Float, ContentVoteError> {
        var correctVoteCount : Int = 0;
        var completedVoteCount : Int = 0;
        for (vid in state.mods2votes.get0(caller).vals()) {
        switch(state.votes.get(vid)) {
            case (?vote) {
            switch(state.content.get(vote.contentId)) {
                case (?content) {
                if (content.status != #new) {
                    completedVoteCount := completedVoteCount + 1;
                    if (vote.decision == content.status) {
                    correctVoteCount := correctVoteCount + 1;
                    };
                };
                };
                case(_) return #err(#contentNotFound);
                // throw Error.reject("Content does not exist"); 
            };          
            };
            case (_) return #err(#voteNotFound);
            // throw Error.reject("Vote does not exist");
        };
        };
        var performance : Float = 0;
        if (completedVoteCount != 0) {
        performance := Float.fromInt(correctVoteCount) / Float.fromInt(completedVoteCount);
        };
        return #ok(performance);
    };

    public func vote(userId: Principal, contentId: Types.ContentId, decision: Types.Decision, violatedRules: ?[Types.RuleId], 
                    voteCount: Types.VoteCount, tokens : Tokens.Tokens, initializer: Principal, state: GlobalState.State) : async Text {

        let voteId = "vote-" # Principal.toText(userId) # contentId;
        switch(state.votes.get(voteId)){
            case(?v){
                throw Error.reject("User already voted");
            };
            case(_)();
        };

        switch(state.content.get(contentId)) {
            case(?content) {
                if(content.status != #new) throw Error.reject("Content has already been reviewed");
                
                // Check the user has enough tokens staked
                switch(state.providers.get(content.providerId)) {
                    case(?provider) {
                        let holdings = tokens.getHoldings(userId);
                        Debug.print("Holdings: wallet" # Int.toText(holdings.wallet) # "stake" # Int.toText(holdings.stake));
                        Debug.print("Provider: minStake" # Nat.toText(provider.settings.minStaked));
                        
                        if( holdings.stake < provider.settings.minStaked ) 
                            throw Error.reject("Not enough tokens staked");
                    };
                    case(_) throw Error.reject("Provider not found");
                };

                var voteApproved : Nat = 0;
                var voteRejected : Nat = 0;
                // var voteCount = getVoteCount(contentId, ?caller);
                voteApproved := voteApproved + voteCount.approvedCount;
                voteRejected := voteRejected + voteCount.rejectedCount;

                // Check if the rules provided are valid
                if(decision == #rejected) {
                    switch(violatedRules){
                        case(?result){
                            if(validateRules(contentId, result, state) != true){
                                throw Error.reject("The violated rules provided are incorrect");
                            };
                        };
                        case(_) throw Error.reject("Must provide rules that were violated");
                    };
                };

                let vote : Types.Vote = {
                    id = voteId;
                    contentId =  contentId;
                    userId = userId;
                    decision = decision; 
                    violatedRules = violatedRules;
                    createdAt = Helpers.timeNow();
                };
                switch(decision){
                    case(#approved) {
                        voteApproved += 1 
                    };
                    case(#rejected) {
                        voteRejected += 1;
                    };
                };

                // Update relations
                state.content2votes.put(content.id, vote.id);
                state.mods2votes.put(userId, vote.id);
                state.votes.put(vote.id, vote);

                // Evaluate and send notification to provider
                await evaluateVotes(content, voteApproved, voteRejected, tokens, initializer, state);
                return "Vote successful";
            };
            case(_)( throw Error.reject("Content does not exist"));
        }; 
        return "";         
    };
    
    private func validateRules(contentId: Types.ContentId, violatedRules: [Types.RuleId], state: GlobalState.State) : Bool {
        if(violatedRules.size() == 0) {
            return false;
        };

        switch(state.content.get(contentId)){
            case(?content) {
                for(rule in violatedRules.vals()){
                let isMember : Bool = state.provider2rules.isMember(content.providerId, rule);
                if(isMember != true) {
                    return false;
                };
                };
            };
            case(_) { 
                return false;
            };
        };
        return true;
    };

    private func evaluateVotes(content: Types.Content, aCount: Nat, rCount: Nat, tokens: Tokens.Tokens,
                                initializer: Principal, state: GlobalState.State) : async() {
        var finishedVote = false;
        var status : Types.ContentStatus = #new;
        var decision : Types.Decision = #approved;

        switch(state.providers.get(content.providerId)) {
            case(?provider) {
                var minVotes = provider.settings.minVotes;
                if(aCount >= minVotes) {
                    // Approved
                    finishedVote := true;
                    status := #approved;
                    decision := #approved;
                    state.contentNew.delete(content.providerId, content.id);
                    state.contentApproved.put(content.providerId, content.id);
                } else if ( rCount >= minVotes) {
                    // Rejected
                    status := #rejected;
                    decision := #rejected;
                    finishedVote := true;
                    state.contentNew.delete(content.providerId, content.id);
                    state.contentRejected.put(content.providerId, content.id);
                } else {
                    return;
                };

                if(finishedVote) {
                    // Reward / Slash voters ;                      
                    await tokens.voteFinalization(
                        initializer,
                        decision, 
                        state.content2votes.get0(content.id), 
                        provider.settings.minStaked, // TODO: Change this to a percentage
                        state
                    );              
                };

                // Update content status
                state.content.put(content.id, {
                        id = content.id;
                        providerId = content.providerId;
                        contentType = content.contentType;
                        status = status;
                        sourceId = content.sourceId;
                        title = content.title;
                        createdAt = content.createdAt;
                        updatedAt = Helpers.timeNow();
                });

                    // Call the providers callback
                switch(state.providerSubs.get(content.providerId)){
                    case(?result){
                        result.callback({
                        id = content.id;
                        sourceId = content.sourceId;
                        status = status;
                        });
                        Debug.print("Called callback for provider " # Principal.toText(content.providerId) );
                    };
                    case(_){
                        Debug.print("Provider " # Principal.toText(content.providerId) # " has not subscribed a callback");
                    }
                };
            };
            case(null) ();
        };
    };
};