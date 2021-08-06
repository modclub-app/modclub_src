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
import Set "mo:base/Set";

// types in separate file
import Types "../types";
import Rel "./Rel";
import RelObj "./RelObj";

module State {

  type Profile = Types.Profile;
  type Content = Types.Content;
  type Provider = Types.Provider;
  type Rel<X, Y> = RelObj.RelObj<X, Y>;
  

  // Our representation of finite mappings.
  public type MapShared<X, Y> = Trie.Trie<X, Y>;
  public type Map<X, Y> = HashMap.HashMap<X, Y>;

  /// State (internal CanCan use only).
  ///
  /// Not a shared type because of OO containers and HO functions.
  /// So, cannot send in messages or store in stable memory.
  ///
  public type State = {
    // Providers
    providers : Map<Principal, Provider>;

    /// all profiles.
    profiles : Map<Types.UserId, Profile>;

    /// all content.
    content : Map<Types.ContentId, Types.Content>;

    textContent: Map<Types.ContentId, Types.TextContent>;

    multiTextContent: Map<Types.ContentId, Types.MultiTextContent>;

    imageUrlContent: Map<Types.ContentId, Types.ImageUrl>;

    imageContent: Map<Types.ContentId, Types.Image>;

    // All of the approved content for each provider
    contentApproved: Map<Principal, Set.Set<Types.ContentId>>;

    // All of the rejected content for each provider
    contentRejected: Map<Principal, Set.Set<Types.ContentId>>;

    // All of the new content that has not been approved / rejected
    contentNew: Map<Principal, Set.Set<Types.ContentId>>;

    // relates content to votes
    content2votes: Rel<Types.ContentId, Types.VoteId>;

    // relates users to votes
    user2votes: Rel<Types.UserId, Types.VoteId>;

    // related content to providers
    provider2content: Rel<Types.ProviderId, Types.ContentId>;
  };

  public type StateShared = {
    /// all profiles.
    providers : [(Principal, Provider)];
    
    /// all profiles.
    profiles : [(Types.UserId, Profile)];

    /// all users. see andrew for disambiguation
    content : [(Types.ContentId, Types.Content)];
  };

  public func empty () : State {
    let equal = (Text.equal, Text.equal);
    let hash = (Text.hash, Text.hash);
    let st : State = {
      providers = HashMap.HashMap<Principal, Provider>(1, Principal.equal, Principal.hash);

      profiles = HashMap.HashMap<Types.UserId, Profile>(1, Principal.equal, Principal.hash);

      content = HashMap.HashMap<Types.ContentId, Types.Content>(1, Text.equal, Text.hash);
    
    textContent =  HashMap.HashMap<Types.ContentId, Types.TextContent>(1, Text.equal, Text.hash);

    multiTextContent = HashMap.HashMap<Types.ContentId, Types.MultiTextContent>(1, Text.equal, Text.hash);

    imageUrlContent = HashMap.HashMap<Types.ContentId, Types.ImageUrl>(1, Text.equal, Text.hash);

    imageContent =  HashMap.HashMap<Types.ContentId, Types.Image>(1, Text.equal, Text.hash);

    // All of the approved content for each provider
    contentApproved = HashMap.HashMap<Principal, Set.Set<Types.ContentId>>(1, Principal.equal, Principal.hash);

    // All of the rejected content for each provider
    contentRejected = HashMap.HashMap<Principal, Set.Set<Types.ContentId>>(1, Principal.equal, Principal.hash);

    // All of the new content that has not been approved / rejected
    contentNew = HashMap.HashMap<Principal, Set.Set<Types.ContentId>>(1, Principal.equal, Principal.hash);

      // relates content to votes
      content2votes = RelObj.RelObj(hash, equal);

        // relates users to votes
      user2votes = RelObj.RelObj((Principal.hash, Text.hash), (Principal.equal, Text.equal));

      //relates providers to content
      provider2content = RelObj.RelObj((Principal.hash, Text.hash), (Principal.equal, Text.equal));
    };
    st;
  };

  public func emptyShared(): StateShared {
    let st : StateShared = {
      profiles = [];
      content = [];
      providers = [];
    };
    st;
  };

  public func fromState(state: State) : StateShared {
    let st : StateShared = {
      providers = Iter.toArray(state.providers.entries();)
      profiles = Iter.toArray(state.profiles.entries());
      content = Iter.toArray(state.content.entries());
    };
    st;
  };

  public func toState(stateShared: StateShared) : State {
    let state = empty();
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
