import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Nat "mo:base/Nat";
import Float "mo:base/Float";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Option "mo:base/Option";

import GlobalState "../../statev1";
import Helpers "../../helpers";
import Types "../../types";
import Tokens "../../token";


module ModeratorModule {
  
  public type ModError = {#notFound; #voteNotFound; #contentNotFound; #providerNotFound};
  
  public func registerModerator(
    moderatorId: Principal,
    userName: Text,
    email: ?Text,
    pic: ?Types.Image,
    state: GlobalState.State
    ) : async Types.Profile {
    var _userName = Text.trim(userName, #text " ");
    var _email = Text.trim(Option.get(email, ""), #text " ");
    if(_email.size() > 320) 
      throw Error.reject("Invalid email, too long");
    if(_userName.size() > 64 or _userName.size() < 3) 
      throw Error.reject("Username length must be longer than 3 and less than 64 characters");

    switch(pic){
      case(null) ();
      case(?result) {
          Debug.print(debug_show(result));
      };
    };

    // Check if already registered
    switch(state.profiles.get(moderatorId)){
      case (null) {
        switch( await checkUsernameAvailable(userName, state) ) {
          case(true) {
            let now = Helpers.timeNow();
            let profile : Types.Profile = {
              id = moderatorId;
              userName = _userName;
              pic = pic;
              role = #moderator; 
              email = _email;
              createdAt = now;
              updatedAt = now;
            };
            state.profiles.put(moderatorId, profile);
            return profile;
          };
          case(false) throw Error.reject("username already taken");
        };
      };
      case (?result) throw Error.reject("Already registered");
    }
  };

  public func getProfile(moderatorId : Principal, state : GlobalState.State) : Result.Result<Types.Profile, ModError> { 
      switch(state.profiles.get(moderatorId)) {
        case (null) #err(#notFound);
        case (?result) return #ok(result);
      };
  };

  public func getAllProfiles(state : GlobalState.State) : [Types.Profile] {
      let buf = Buffer.Buffer<Types.Profile>(0);
      for ( (pid, p) in state.profiles.entries()) {
        buf.add(p);                        
      };
      return buf.toArray();
  };

  public func getModeratorLeaderboard(start: Nat, end: Nat, state: GlobalState.State, getHolding :  Principal -> Tokens.Holdings ) : Result.Result<[Types.ModeratorLeaderboard], ModError> {
      let rewardsEarnedBuffer = Buffer.Buffer<Types.RewardsEarnedMap>(0);
      for ( (pid, p) in state.profiles.entries()) {
        let holdings = getHolding(p.id);
        rewardsEarnedBuffer.add({
          rewardsEarned = holdings.userPoints;
          userId = p.id;
        });
      };
      let sortedArray = Array.sort(
        rewardsEarnedBuffer.toArray(), 
        func (a: Types.RewardsEarnedMap, b: Types.RewardsEarnedMap) : { #less; #equal; #greater } {
          if (a.rewardsEarned > b.rewardsEarned) { #less }
          else if (a.rewardsEarned == b.rewardsEarned) { #equal }
          else { #greater }
        }
      );

      let buf = Buffer.Buffer<Types.ModeratorLeaderboard>(0);
      var i: Nat = start;
      while (i < end and i < sortedArray.size()) {
        let pid = sortedArray[i].userId;
        let rewardsEarned = sortedArray[i].rewardsEarned;
        let profile = state.profiles.get(pid);

        switch (profile) {
          case (?p) {
            Debug.print("getModeratorLeaderboard pid " # Principal.toText(pid) );
            var correctVoteCount : Int = 0;
            var completedVoteCount : Int = 0;
            var lastVoted : Int = 0;
            for (vid in state.mods2votes.get0(pid).vals()) {
              switch(state.votes.get(vid)) {
                case (?vote) {
                  switch(state.content.get(vote.contentId)) {
                    case (?content) {
                      if (content.status != #new) {
                        completedVoteCount := completedVoteCount + 1;
                        if (lastVoted == 0 or lastVoted < vote.createdAt) {
                          lastVoted := vote.createdAt;
                        };
                        if (vote.decision == content.status) {
                          correctVoteCount := correctVoteCount + 1;
                        };
                      };
                    };
                    case(_) return #err(#contentNotFound);
                  };          
                };
                case (_) return #err(#voteNotFound);
              };
            };
            var performance : Float = 0;
            if (completedVoteCount != 0) {
              performance := Float.fromInt(correctVoteCount) / Float.fromInt(completedVoteCount);
            };
            
            let item : Types.ModeratorLeaderboard = {
                id = pid;
                userName = p.userName;
                completedVoteCount = completedVoteCount;
                rewardsEarned = rewardsEarned;
                performance = performance;
                lastVoted = ?lastVoted;
            };
            buf.add(item);
          };
          case (_) ();
        };

        i := i + 1;
      }; 
      return #ok(buf.toArray());
  };

  public func getModerators(state: GlobalState.State) : [Principal] {
    let moderatorIds = Buffer.Buffer<Principal>(1);
    for((id, profile) in state.profiles.entries()) {
      if(profile.role == #moderator) {
        moderatorIds.add(id);
      };
    };
    return moderatorIds.toArray();
  };

  public func getActivity(moderatorId: Principal, isComplete: Bool, 
                        getVoteCount : (Types.ContentId, ?Principal) -> Types.VoteCount, 
                        state: GlobalState.State) : Result.Result<[Types.Activity], ModError> {
      let buf = Buffer.Buffer<Types.Activity>(0);
      label l for (vid in state.mods2votes.get0(moderatorId).vals()) {
        switch(state.votes.get(vid)) {
          case (?vote) {
            switch(state.content.get(vote.contentId)) {
              case (?content) {
                // Filter out wrong results
                if(content.status == #new and isComplete == true) {
                  continue l;
                } else if(content.status != #new and isComplete == false) {
                  continue l;
                };
                switch(state.providers.get(content.providerId)) {
                  case(?provider) {
                    let voteCount = getVoteCount(content.id, ?moderatorId);

                    let item : Types.Activity = {
                        vote = vote;
                        providerId = content.providerId;
                        providerName =  provider.name;
                        contentType = content.contentType;    
                        status =  content.status;
                        title = content.title;
                        createdAt = content.createdAt;
                        updatedAt = content.updatedAt;
                        voteCount = Nat.max(voteCount.approvedCount, voteCount.rejectedCount);
                        minVotes = provider.settings.minVotes;
                        minStake = provider.settings.minStaked;
                        rewardRelease = Helpers.timeNow();
                        reward = do  {
                          switch(isComplete == true) {
                            case(true) {
                              switch(vote.decision == content.status) {
                                case(true) Float.fromInt(provider.settings.minStaked);
                                case(false) -1 * Float.fromInt(provider.settings.minStaked);
                              };
                            };
                            case(false) 0;
                          };
                        }; 
                    };
                    buf.add(item);
                };
                case(_) return #err(#providerNotFound);
                };
              };
              case(_) return #err(#contentNotFound); 
          };          
        };
        case (_) return #err(#voteNotFound);
      };    
    };
    return #ok(buf.toArray());
  };

  func checkUsernameAvailable(userName_ : Text, state: GlobalState.State): async Bool {
    switch (state.usernames.get(userName_)) {
      case (?_) { /* error -- ID already taken. */ false };
      case null { /* ok, not taken yet. */ true };
    }
  };

};