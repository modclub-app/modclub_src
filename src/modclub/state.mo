import Hash "mo:base/Hash";
import Prelude "mo:base/Prelude";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Trie "mo:base/Trie";
import TrieMap "mo:base/TrieMap";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Buffer "mo:base/Buffer";
import TrieSet "mo:base/TrieSet";
import SeqObj "data_structures/SeqObj";
import Rel "data_structures/Rel";
import RelObj "data_structures/RelObj";
import Debug "mo:base/Debug";

import Buckets "./data_canister/buckets";
import Types "./types";

module State {
  type Profile = Types.Profile;
  type Content = Types.Content;
  type Provider = Types.Provider;
  type Bucket = Buckets.Bucket;
  type Rel<X, Y> = RelObj.RelObj<X, Y>;
  public type RelShared<X, Y> = Rel.RelShared<X, Y>;
  public type MapShared<X, Y> = Trie.Trie<X, Y>;
  public type Map<X, Y> = HashMap.HashMap<X, Y>;

  public type State = {
    // Global IDs, Keeps track of 
    GLOBAL_ID_MAP : Map<Text, Nat>;

    // Providers
    providers : Map<Principal, Provider>;

    // Pub / Sub for Providers
    providerSubs: Map<Principal, Types.SubscribeMessage>;

    /// all profiles.
    profiles : Map<Types.UserId, Profile>;

    /// Airdrop Registrants.
    airdropUsers : Map<Principal, Types.AirdropUser>;

    /// Airdrop WhiteList Registrants.
    airdropWhitelist : Map<Principal, Principal>;

    /// usernames to userIds.
    usernames : Map<Text, Types.UserId>;

    /// all content.
    content : Map<Types.ContentId, Types.Content>;

    rules: Map<Types.RuleId, Types.Rule>;

    votes : Map<Types.VoteId, Types.Vote>;

    textContent: Map<Types.ContentId, Types.TextContent>;

    imageContent: Map<Types.ContentId, Types.ImageContent>;

    // All of the approved content for each provider
    contentApproved: Rel<Principal, Types.ContentId>;

    // All of the rejected content for each provider
    contentRejected: Rel<Principal, Types.ContentId>;

    // All of the new content that has not been approved / rejected
    contentNew: Rel<Principal, Types.ContentId>;

    // relates content to votes
    content2votes: Rel<Types.ContentId, Types.VoteId>;

    // relates users to votes
    mods2votes: Rel<Types.UserId, Types.VoteId>;

    // related content to providers
    provider2content: Rel<Types.ProviderId, Types.ContentId>;

    provider2rules: Rel<Types.ProviderId, Types.RuleId>;

    // data canisters to hold data and data canister's size
    dataCanisters: Map<Types.DataCanisterId, Bucket>;
    appName: Text;
  };

  public type StateShared = {    
    GLOBAL_ID_MAP : [(Text, Nat)];    
    providers : [(Principal, Provider)];        
    airdropUsers : [(Principal, Types.AirdropUser)]; 
    airdropWhitelist : [(Principal, Principal)];   
    profiles : [(Types.UserId, Profile)];
    content : [(Types.ContentId, Types.Content)];
    rules: [(Types.RuleId, Types.Rule)];
    votes: [(Types.VoteId, Types.Vote)];
    textContent: [(Types.ContentId, Types.TextContent)];
    imageContent: [(Types.ContentId, Types.ImageContent)];
    contentApproved: RelShared<Principal, Types.ContentId>; 
    contentRejected: RelShared<Principal, Types.ContentId>;
    contentNew: RelShared<Principal, Types.ContentId>;
    content2votes: RelShared<Types.ContentId, Types.VoteId>;
    mods2votes: RelShared<Types.UserId, Types.VoteId>;
    provider2content: RelShared<Types.ProviderId, Types.ContentId>;
    provider2rules: RelShared<Types.ProviderId, Types.RuleId>;
    dataCanisters: [(Types.DataCanisterId, Bucket)];
    appName: Text;
  };

  public func empty () : State {
    let equal = (Text.equal, Text.equal);
    let hash = (Text.hash, Text.hash);
    var st : State = {
      GLOBAL_ID_MAP = HashMap.HashMap<Text, Nat>(1, Text.equal, Text.hash);
      providers = HashMap.HashMap<Principal, Provider>(1, Principal.equal, Principal.hash);
      providerSubs =  HashMap.HashMap<Principal, Types.SubscribeMessage>(1, Principal.equal, Principal.hash);
      profiles = HashMap.HashMap<Types.UserId, Profile>(1, Principal.equal, Principal.hash);
      usernames = HashMap.HashMap<Text, Types.UserId>(1, Text.equal, Text.hash);
      airdropUsers =  HashMap.HashMap<Principal, Types.AirdropUser>(1, Principal.equal, Principal.hash);
      airdropWhitelist =  HashMap.HashMap<Principal, Principal>(1, Principal.equal, Principal.hash);
      content = HashMap.HashMap<Types.ContentId, Types.Content>(1, Text.equal, Text.hash);
      votes = HashMap.HashMap<Types.VoteId, Types.Vote>(1, Text.equal, Text.hash);
      rules = HashMap.HashMap<Types.RuleId, Types.Rule>(1, Text.equal, Text.hash);
      textContent =  HashMap.HashMap<Types.ContentId, Types.TextContent>(1, Text.equal, Text.hash);
      imageContent =  HashMap.HashMap<Types.ContentId, Types.ImageContent>(1, Text.equal, Text.hash);
      contentApproved = RelObj.RelObj((Principal.hash, Text.hash), (Principal.equal, Text.equal));
      contentRejected = RelObj.RelObj((Principal.hash, Text.hash), (Principal.equal, Text.equal));
      contentNew = RelObj.RelObj((Principal.hash, Text.hash), (Principal.equal, Text.equal));
      content2votes = RelObj.RelObj(hash, equal);
      mods2votes = RelObj.RelObj((Principal.hash, Text.hash), (Principal.equal, Text.equal));
      provider2content = RelObj.RelObj((Principal.hash, Text.hash), (Principal.equal, Text.equal));
      provider2rules = RelObj.RelObj((Principal.hash, Text.hash), (Principal.equal, Text.equal));
      dataCanisters = HashMap.HashMap<Types.DataCanisterId, Bucket> (1, Principal.equal, Principal.hash);
      appName = "MODCLUB";
    };
    st;
  };

  public func emptyShared(): StateShared {
    var st : StateShared = {
      GLOBAL_ID_MAP = [];
      profiles = [];
      content = [];
      providers = [];   
      rules = [];
      votes = [];
      textContent = [];
      imageContent = [];
      airdropUsers = [];
      airdropWhitelist = [];
      contentApproved = Rel.emptyShared<Principal, Text>();
      contentRejected = Rel.emptyShared<Principal, Text>();
      contentNew = Rel.emptyShared<Principal, Text>();
      content2votes = Rel.emptyShared<Text, Text>();
      mods2votes = Rel.emptyShared<Principal, Text>();
      provider2content = Rel.emptyShared<Principal, Text>();
      provider2rules = Rel.emptyShared<Principal, Text>();
      dataCanisters = [];
      appName = "MODCLUB";
    };
    st;
  };

  public func fromState(state: State) : StateShared {
    let st : StateShared = {
      GLOBAL_ID_MAP = Iter.toArray(state.GLOBAL_ID_MAP.entries());
      providers = Iter.toArray(state.providers.entries());
      profiles = Iter.toArray(state.profiles.entries());
      content = Iter.toArray(state.content.entries());
      rules = Iter.toArray(state.rules.entries());
      votes = Iter.toArray(state.votes.entries());
      textContent = Iter.toArray(state.textContent.entries());
      imageContent = Iter.toArray(state.imageContent.entries());
      airdropUsers = Iter.toArray(state.airdropUsers.entries());
      airdropWhitelist = Iter.toArray(state.airdropWhitelist.entries());
      contentApproved = Rel.share<Principal, Types.ContentId>(state.contentApproved.getRel());
      contentRejected = Rel.share<Principal, Types.ContentId>(state.contentRejected.getRel());
      contentNew = Rel.share<Principal, Types.ContentId>(state.contentNew.getRel());
      content2votes = Rel.share<Types.ContentId, Types.VoteId>(state.content2votes.getRel());
      mods2votes = Rel.share<Types.UserId, Types.VoteId>(state.mods2votes.getRel());
      provider2content = Rel.share<Principal, Types.ContentId>(state.provider2content.getRel());
      provider2rules = Rel.share<Principal, Types.ContentId>(state.provider2rules.getRel());
      dataCanisters = Iter.toArray(state.dataCanisters.entries());
      appName = state.appName;
    };
    st;
  };

  public func toState(stateShared: StateShared) : State {
    let state = empty();
    let equal = (Text.equal, Text.equal);
    let hash = (Text.hash, Text.hash);
    for( (category, val) in stateShared.GLOBAL_ID_MAP.vals()) {
      state.GLOBAL_ID_MAP.put(category, val);
    };
    for( (id, content) in stateShared.content.vals()) {
      state.content.put(id, content);
    };
    for( (id, provider) in stateShared.providers.vals()) {
      state.providers.put(id, provider);
    };
    for( (id, profile) in stateShared.profiles.vals()) {
      state.profiles.put(id, profile);
    };
    for( (id, rule) in stateShared.rules.vals()) {
      state.rules.put(id, rule);
    };
    for( (id, vote) in stateShared.votes.vals()) {
      state.votes.put(id, vote);
    };
    for( (id, text) in stateShared.textContent.vals()) {
      state.textContent.put(id, text);
    };
    for( (id, image) in stateShared.imageContent.vals()) {
      state.imageContent.put(id, image);
    };
    Debug.print("MODCLUB AIRDROP STATE RESTORING");
    for( (id, airdropUser) in stateShared.airdropUsers.vals()) {
      state.airdropUsers.put(id, airdropUser);
    };
    for( (id, pid) in stateShared.airdropWhitelist.vals()) {
      state.airdropWhitelist.put(id, pid);
    };
   
    state.contentApproved.setRel(
      Rel.fromShare<Principal, Types.ContentId>(
      stateShared.contentApproved,
      (Principal.hash, Text.hash),
      (Principal.equal, Text.equal))
    );
    state.contentRejected.setRel(Rel.fromShare<Principal, Types.ContentId>(
      stateShared.contentRejected,
      (Principal.hash, Text.hash),
      (Principal.equal, Text.equal))
    );
    state.contentNew.setRel(Rel.fromShare<Principal, Types.ContentId>(
      stateShared.contentNew,
      (Principal.hash, Text.hash),
      (Principal.equal, Text.equal))
    );
    state.content2votes.setRel( Rel.fromShare<Types.ContentId, Types.VoteId>(
      stateShared.content2votes,
      hash,
      equal
    ));
    state.mods2votes.setRel(Rel.fromShare<Types.UserId, Types.VoteId>(
      stateShared.mods2votes,
      (Principal.hash, Text.hash),
      (Principal.equal, Text.equal)
    ));
    state.provider2content.setRel(Rel.fromShare<Principal, Types.ContentId>(
      stateShared.provider2content,
      (Principal.hash, Text.hash),
      (Principal.equal, Text.equal)
    ));
    state.provider2rules.setRel( Rel.fromShare<Principal, Types.ContentId>(
      stateShared.provider2rules,
      (Principal.hash, Text.hash),
      (Principal.equal, Text.equal)
    ));
    for( (id, pid) in stateShared.dataCanisters.vals()) {
      state.dataCanisters.put(id, pid);
    };

    return state;
  };


};
