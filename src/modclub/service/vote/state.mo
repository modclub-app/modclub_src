import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Types "../../types";
import VoteTypes "./types";

import Rel "../../data_structures/Rel";
import RelObj "../../data_structures/RelObj";

module State {

    public type PohVoteState = {
        var newPohPackages: Buffer.Buffer<Text>;
        approvedPohPackages: Buffer.Buffer<Text>;
        rejectedPohPackages: Buffer.Buffer<Text>;
        package2Status : HashMap.HashMap<Text, Types.ContentStatus>;
        pohVotes: HashMap.HashMap<Text, VoteTypes.Vote>;
        // relates content to votes
        pohContent2votes: RelObj.RelObj<Text, Text>;
        // relates users to votes
        mods2Pohvotes: RelObj.RelObj<Principal, Text>;
    };

    public type PohVoteStableState = {
        newPohPackages: [Text];
        approvedPohPackages: [Text];
        rejectedPohPackages: [Text];
        package2Status: [(Text, Types.ContentStatus)];
        pohVotes: [(Text, VoteTypes.Vote)];
        pohContent2votes: Rel.RelShared<Types.ContentId, Types.VoteId>;
        mods2Pohvotes: Rel.RelShared<Types.UserId, Types.VoteId>;
    };

    public func emptyState(): PohVoteState {
        return {
            var newPohPackages = Buffer.Buffer<Text>(1);
            approvedPohPackages = Buffer.Buffer<Text>(1);
            rejectedPohPackages = Buffer.Buffer<Text>(1);
            package2Status = HashMap.HashMap<Text, Types.ContentStatus>(1, Text.equal, Text.hash);
            pohVotes = HashMap.HashMap<Text, VoteTypes.Vote>(1, Text.equal, Text.hash);
            pohContent2votes = RelObj.RelObj((Text.hash, Text.hash), (Text.equal, Text.equal));
            mods2Pohvotes = RelObj.RelObj((Principal.hash, Text.hash), (Principal.equal, Text.equal));
        };
    };

    public func emptyStableState(): PohVoteStableState {
        return {
            newPohPackages = [];
            approvedPohPackages = [];
            rejectedPohPackages = [];
            package2Status = [];
            pohVotes = [];
            pohContent2votes = Rel.emptyShared<Text, Text>();
            mods2Pohvotes = Rel.emptyShared<Principal, Text>();
        };
    };

    public func getStableState(state: PohVoteState): PohVoteStableState {
        let stableState = emptyStableState();
    };

};