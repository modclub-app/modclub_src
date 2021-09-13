import Hash "mo:base/Hash";
import Prelude "mo:base/Prelude";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Trie "mo:base/Trie";
import TrieMap "mo:base/TrieMap";
import HashMap "mo:base/HashMap";
import SeqObj "./SeqObj";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Buffer "mo:base/Buffer";
import TrieSet "mo:base/TrieSet";

// types in separate file
import Types "../types";
import Rel "./Rel";
import RelObj "./RelObj";

module State {

  type Profile = Types.Profile;
  type Content = Types.Content;
  type Provider = Types.Provider;
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

    /// all content.
    content : Map<Types.ContentId, Types.Content>;

    rules: Map<Types.RuleId, Types.Rule>;

    votes : Map<Types.VoteId, Types.Vote>;

    textContent: Map<Types.ContentId, Types.TextContent>;

    // todo: Implement support for these
    // multiTextContent: Map<Types.ContentId, Types.MultiTextContent>;

    // imageUrlContent: Map<Types.ContentId, Types.ImageUrl>;

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
  };

  public type StateShared = {
    /// all global ids
    GLOBAL_ID_MAP : [(Text, Nat)];

    /// all profiles.
    providers : [(Principal, Provider)];
    
    /// all profiles.
    profiles : [(Types.UserId, Profile)];

    content : [(Types.ContentId, Types.Content)];

    //todo: Save state for other relations 
  };

  public func empty () : State {
    let equal = (Text.equal, Text.equal);
    let hash = (Text.hash, Text.hash);
    let st : State = {
      GLOBAL_ID_MAP = HashMap.HashMap<Text, Nat>(1, Text.equal, Text.hash);

      providers = HashMap.HashMap<Principal, Provider>(1, Principal.equal, Principal.hash);

      providerSubs =  HashMap.HashMap<Principal, Types.SubscribeMessage>(1, Principal.equal, Principal.hash);

      profiles = HashMap.HashMap<Types.UserId, Profile>(1, Principal.equal, Principal.hash);

      content = HashMap.HashMap<Types.ContentId, Types.Content>(1, Text.equal, Text.hash);

      votes = HashMap.HashMap<Types.VoteId, Types.Vote>(1, Text.equal, Text.hash);

      rules = HashMap.HashMap<Types.RuleId, Types.Rule>(1, Text.equal, Text.hash);
      
      textContent =  HashMap.HashMap<Types.ContentId, Types.TextContent>(1, Text.equal, Text.hash);

      // todo: Implement support for these
      // multiTextContent = HashMap.HashMap<Types.ContentId, Types.MultiTextContent>(1, Text.equal, Text.hash);

      // imageUrlContent = HashMap.HashMap<Types.ContentId, Types.ImageUrl>(1, Text.equal, Text.hash);

      imageContent =  HashMap.HashMap<Types.ContentId, Types.ImageContent>(1, Text.equal, Text.hash);

      // All of the approved content for each provider
      contentApproved = RelObj.RelObj((Principal.hash, Text.hash), (Principal.equal, Text.equal));

      // All of the rejected content for each provider
      contentRejected = RelObj.RelObj((Principal.hash, Text.hash), (Principal.equal, Text.equal));

      // All of the new content that has not been approved / rejected
      contentNew = RelObj.RelObj((Principal.hash, Text.hash), (Principal.equal, Text.equal));

      // relates content to votes
      content2votes = RelObj.RelObj(hash, equal);

        // relates mods to votes
      mods2votes = RelObj.RelObj((Principal.hash, Text.hash), (Principal.equal, Text.equal));

      //relates providers to content
      provider2content = RelObj.RelObj((Principal.hash, Text.hash), (Principal.equal, Text.equal));


      //relates providers to content
      provider2rules = RelObj.RelObj((Principal.hash, Text.hash), (Principal.equal, Text.equal));
    };
    st;
  };

  public func emptyShared(): StateShared {
    let st : StateShared = {
      GLOBAL_ID_MAP = [];
      profiles = [];
      content = [];
      providers = [];      
    };
    st;
  };

  public func fromState(state: State) : StateShared {
    let st : StateShared = {
      GLOBAL_ID_MAP = Iter.toArray(state.GLOBAL_ID_MAP.entries());
      providers = Iter.toArray(state.providers.entries());
      profiles = Iter.toArray(state.profiles.entries());
      content = Iter.toArray(state.content.entries());
    };
    st;
  };

  public func toState(stateShared: StateShared) : State {
    let state = empty();
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
    return state;
  };

};
