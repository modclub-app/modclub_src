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
import Timer "mo:base/Timer";

import GlobalState "../../statev2";
import Helpers "../../helpers";
import Types "../../types";
import RSTypes "../../../rs/types";
import RSConstants "../../../rs/constants";
import CommonTypes "../../../common/types";
import ModSecurity "../../../common/security/guard";

module ModeratorModule {

  public type ModError = {
    #notFound;
    #voteNotFound;
    #contentNotFound;
    #providerNotFound;
  };

  public func subscribeOnEvents(env : CommonTypes.ENV, topic : Text) : () {
    ignore Timer.setTimer(
      #seconds(0),
      func() : async () {
        await ModSecurity.Guard(env, "MODERATOT_SERVICE").getRSActor().subscribe(topic);
      }
    );
  };

  public func canClaimReward(user : Principal, whitelist : Buffer.Buffer<Principal>) : Bool {
    Buffer.contains<Principal>(whitelist, user, Principal.equal);
  };

  public func getStats(moderId : Principal, env : CommonTypes.ENV) : async RSTypes.RSAndLevel {
    let stats : RSTypes.RSAndLevel = await ModSecurity.Guard(env, "MODERATOT_SERVICE").getRSActor().queryRSAndLevelByPrincipal(moderId);
    return stats;
  };

  public func isSenior(rs : Int) : Bool {
    return rs >= RSConstants.SENIOR1_THRESHOLD;
  };

  public func reduceToJunior(moderId : Principal, env : CommonTypes.ENV) : async Result.Result<Bool, Text> {
    await ModSecurity.Guard(env, "MODERATOT_SERVICE").getRSActor().setRS(moderId, RSConstants.JUNIOR_THRESHOLD);
  };

  public func registerModerator(
    moderatorId : Principal,
    userName : Text,
    email : ?Text,
    pic : ?Types.Image,
    state : GlobalState.State
  ) : async Types.Profile {
    var _userName = Text.trim(userName, #text " ");
    var _email = Text.trim(Option.get(email, ""), #text " ");
    if (_email.size() > 320) throw Error.reject("Invalid email, too long");
    if (_userName.size() > 64 or _userName.size() < 3) throw Error.reject(
      "Username length must be longer than 3 and less than 64 characters"
    );

    switch (state.profiles.get(moderatorId)) {
      case (null) {
        switch (await checkUsernameAvailable(userName, state)) {
          case (true) {
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
          case (false) throw Error.reject("username already taken");
        };
      };
      case (?result) throw Error.reject("Already registered");
    };
  };

  public func getProfile(moderatorId : Principal, state : GlobalState.State) : Result.Result<Types.Profile, ModError> {
    switch (state.profiles.get(moderatorId)) {
      case (null) #err(#notFound);
      case (?result) return #ok(result);
    };
  };

  public func adminUpdateEmail(
    moderatorId : Principal,
    newEmail : Text,
    state : GlobalState.State
  ) : Result.Result<Types.Profile, ModError> {
    switch (state.profiles.get(moderatorId)) {
      case (null) #err(#notFound);
      case (?result) {
        let profile : Types.Profile = {
          id = result.id;
          userName = result.userName;
          pic = result.pic;
          role = result.role;
          email = newEmail;
          createdAt = result.createdAt;
          updatedAt = Helpers.timeNow();
        };
        state.profiles.put(result.id, profile);
        return #ok(profile);
      };
    };
  };

  public func getAllProfiles(state : GlobalState.State) : [Types.Profile] {
    let buf = Buffer.Buffer<Types.Profile>(0);
    for ((pid, p) in state.profiles.entries()) {
      buf.add(p);
    };
    return Buffer.toArray<Types.Profile>(buf);
  };

  public func formModeratorLeaderboard(
    topUsers : [RSTypes.UserAndRS],
    state : GlobalState.State
  ) : Result.Result<[Types.ModeratorLeaderboard], ModError> {
    let buf = Buffer.Buffer<Types.ModeratorLeaderboard>(0);

    for (user in topUsers.vals()) {
      switch (state.profiles.get(user.userId)) {
        case (?p) {
          var correctVoteCount : Int = 0;
          var completedVoteCount : Int = 0;
          var lastVoted : Int = 0;
          for (vid in state.mods2votes.get0(user.userId).vals()) {
            switch (state.votes.get(vid)) {
              case (?vote) {
                switch (state.content.get(vote.contentId)) {
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
                  case (_) return #err(#contentNotFound);
                };
              };
              case (_) return #err(#voteNotFound);
            };
          };
          var performance : Float = 0;
          if (completedVoteCount != 0) {
            performance := Float.fromInt(correctVoteCount) / Float.fromInt(
              completedVoteCount
            );
          };

          let item : Types.ModeratorLeaderboard = {
            id = user.userId;
            userName = p.userName;
            completedVoteCount = completedVoteCount;
            rewardsEarned = 0;
            rs = Float.fromInt(user.score);
            performance = performance;
            lastVoted = ?lastVoted;
          };
          buf.add(item);
        };
        case (_)();
      };
    };
    return #ok(Buffer.toArray<Types.ModeratorLeaderboard>(buf));

  };

  public func getModerators(state : GlobalState.State) : [Principal] {
    let moderatorIds = Buffer.Buffer<Principal>(1);
    for ((id, profile) in state.profiles.entries()) {
      if (profile.role == #moderator) {
        moderatorIds.add(id);
      };
    };
    return Buffer.toArray<Principal>(moderatorIds);
  };

  public func getActivity(
    moderatorId : Principal,
    isComplete : Bool,
    getVoteCount : (Types.ContentId, ?Principal) -> Types.VoteCount,
    state : GlobalState.State
  ) : Result.Result<[Types.Activity], ModError> {
    let buf = Buffer.Buffer<Types.Activity>(0);
    label l for (vid in state.mods2votes.get0(moderatorId).vals()) {
      switch (state.votes.get(vid)) {
        case (?vote) {
          switch (state.content.get(vote.contentId)) {
            case (?content) {
              // Filter out wrong results
              if (content.status == #new and isComplete == true) {
                continue l;
              } else if (content.status != #new and isComplete == false) {
                continue l;
              };
              switch (state.providers.get(content.providerId)) {
                case (?provider) {
                  let voteCount = getVoteCount(content.id, ?moderatorId);

                  let item : Types.Activity = {
                    vote = vote;
                    providerId = content.providerId;
                    providerName = provider.name;
                    contentType = content.contentType;
                    status = content.status;
                    title = content.title;
                    createdAt = content.createdAt;
                    updatedAt = content.updatedAt;
                    voteCount = Nat.max(
                      voteCount.approvedCount,
                      voteCount.rejectedCount
                    );
                    requiredVotes = provider.settings.requiredVotes;
                    minStake = provider.settings.minStaked;
                    rewardRelease = Helpers.timeNow();
                    reward = do {
                      switch (isComplete == true) {
                        case (true) {
                          switch (vote.decision == content.status) {
                            case (true) Float.fromInt(
                              provider.settings.minStaked
                            );
                            case (false) -1 * Float.fromInt(
                              provider.settings.minStaked
                            );
                          };
                        };
                        case (false) 0;
                      };
                    };
                  };
                  buf.add(item);
                };
                case (_) return #err(#providerNotFound);
              };
            };
            case (_) return #err(#contentNotFound);
          };
        };
        case (_) return #err(#voteNotFound);
      };
    };
    return #ok(Buffer.toArray<Types.Activity>(buf));
  };

  func checkUsernameAvailable(userName_ : Text, state : GlobalState.State) : async Bool {
    switch (state.usernames.get(userName_)) {
      case (?_) {
        /* error -- ID already taken. */
        false;
      };
      case null {
        /* ok, not taken yet. */
        true;
      };
    };
  };

};
