import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import GlobalState "../../statev2";
import Types "../../types"
module UserModule {
  public type Map<X, Y> = HashMap.HashMap<X, Y>;

  public func getStats(
    state : GlobalState.State
  ) : Types.UserStat {
    return {
        totalUsers = Iter.size(state.profiles.vals());
        totalVotes = Iter.size(state.votes.vals());
    }
  };
};
