import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Types "../../types";
import VoteTypes "./types";

import Rel "../../data_structures/Rel";
import RelObj "../../data_structures/RelObj";

module State {

  public type PohVoteState = {
    var newPohPackages : Buffer.Buffer<Text>;
    approvedPohPackages : Buffer.Buffer<Text>;
    rejectedPohPackages : Buffer.Buffer<Text>;
    package2Status : HashMap.HashMap<Text, Types.ContentStatus>;
    pohVotes : HashMap.HashMap<Text, VoteTypes.Vote>;
    // relates content to votes
    pohContent2votes : RelObj.RelObj<Text, Text>;
    // relates users to votes
    mods2Pohvotes : RelObj.RelObj<Principal, Text>;
    // allowlisted userIds
    autoApprovePOHUserIds : HashMap.HashMap<Principal, Principal>;
    reservedPohPackages : Buffer.Buffer<Types.Reserved>;
  };

  public type PohVoteStableState = {
    newPohPackages : [Text];
    approvedPohPackages : [Text];
    rejectedPohPackages : [Text];
    package2Status : [(Text, Types.ContentStatus)];
    pohVotes : [(Text, VoteTypes.Vote)];
    pohContent2votes : Rel.RelShared<Types.ContentId, Types.VoteId>;
    mods2Pohvotes : Rel.RelShared<Types.UserId, Types.VoteId>;
    autoApprovePOHUserIds : [(Principal, Principal)];
    reservedPohPackages : ?[Types.Reserved];
  };

  public func emptyState() : PohVoteState {
    return {
      var newPohPackages = Buffer.Buffer<Text>(1);
      approvedPohPackages = Buffer.Buffer<Text>(1);
      rejectedPohPackages = Buffer.Buffer<Text>(1);
      package2Status = HashMap.HashMap<Text, Types.ContentStatus>(
        1,
        Text.equal,
        Text.hash
      );
      pohVotes = HashMap.HashMap<Text, VoteTypes.Vote>(1, Text.equal, Text.hash);

      pohContent2votes = RelObj.RelObj(
        (Text.hash, Text.hash),
        (Text.equal, Text.equal)
      );
      mods2Pohvotes = RelObj.RelObj(
        (Principal.hash, Text.hash),
        (Principal.equal, Text.equal)
      );
      autoApprovePOHUserIds = HashMap.HashMap<Principal, Principal>(
        1,
        Principal.equal,
        Principal.hash
      );
      reservedPohPackages = Buffer.Buffer<Types.Reserved>(1);
    };
  };

  public func emptyStableState() : PohVoteStableState {
    return {
      newPohPackages = [];
      approvedPohPackages = [];
      rejectedPohPackages = [];
      package2Status = [];
      pohVotes = [];
      pohContent2votes = Rel.emptyShared<Text, Text>();
      mods2Pohvotes = Rel.emptyShared<Principal, Text>();
      autoApprovePOHUserIds = [];
      reservedPohPackages = ?[];
    };
  };

  public func getState(stableState : PohVoteStableState) : PohVoteState {
    let state = emptyState();
    for (package in stableState.newPohPackages.vals()) {
      state.newPohPackages.add(package);
    };
    for (package in stableState.approvedPohPackages.vals()) {
      state.approvedPohPackages.add(package);
    };
    for (package in stableState.rejectedPohPackages.vals()) {
      state.rejectedPohPackages.add(package);
    };
    for ((pkg, status) in stableState.package2Status.vals()) {
      state.package2Status.put(pkg, status);
    };
    for ((pkg, votes) in stableState.pohVotes.vals()) {
      state.pohVotes.put(pkg, votes);
    };
    for ((pkg, votes) in stableState.pohVotes.vals()) {
      state.pohVotes.put(pkg, votes);
    };

    state.pohContent2votes.setRel(
      Rel.fromShare<Text, Text>(
        stableState.pohContent2votes,
        (Text.hash, Text.hash),
        (Text.equal, Text.equal)
      )
    );

    state.mods2Pohvotes.setRel(
      Rel.fromShare<Principal, Text>(
        stableState.mods2Pohvotes,
        (Principal.hash, Text.hash),
        (Principal.equal, Text.equal)
      )
    );
    for ((id, pid) in stableState.autoApprovePOHUserIds.vals()) {
      state.autoApprovePOHUserIds.put(id, pid);
    };

    for (package in Option.get(stableState.reservedPohPackages, []).vals()) {
      state.reservedPohPackages.add(package);
    };

    return state;
  };

  public func getStableState(state : PohVoteState) : PohVoteStableState {
    let stableState : PohVoteStableState = {
      newPohPackages = Buffer.toArray<Text>(state.newPohPackages);
      approvedPohPackages = Buffer.toArray<Text>(state.approvedPohPackages);
      rejectedPohPackages = Buffer.toArray<Text>(state.rejectedPohPackages);
      package2Status = Iter.toArray(state.package2Status.entries());
      pohVotes = Iter.toArray(state.pohVotes.entries());
      pohContent2votes = Rel.share<Text, Text>(state.pohContent2votes.getRel());
      mods2Pohvotes = Rel.share<Principal, Text>(state.mods2Pohvotes.getRel());
      autoApprovePOHUserIds = Iter.toArray(state.autoApprovePOHUserIds.entries());
      reservedPohPackages = ?Buffer.toArray<Types.Reserved>(state.reservedPohPackages);
    };
    return stableState;
  };

};
