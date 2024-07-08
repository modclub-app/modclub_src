import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import List "mo:base/List";
import Bool "mo:base/Bool";
import Iter "mo:base/Iter";
import GlobalState "../../statev2";
import Types "../../types"
module UserModule {
  public type Map<X, Y> = HashMap.HashMap<X, Y>;

  public func getStats(
    state : GlobalState.State
  ) : List.List<Types.UserStat> {

    let stats = Iter.map<Types.Profile, Types.UserStat>(
      state.profiles.vals(),
      func(profile : Types.Profile) : Types.UserStat {
        var userVotes = Iter.filter(
          state.votes.vals(),
          func(vote : Types.VoteV2) : Bool {
            Principal.equal(profile.id, vote.userId);
          }
        );

        return {
          id = profile.id;
          userName = profile.userName;
          email = profile.email;
          totalVotes = Iter.size(userVotes);
        };
      }
    );

    return Iter.toList<Types.UserStat>(stats);
  };
};
