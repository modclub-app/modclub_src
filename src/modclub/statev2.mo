import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Rel "data_structures/Rel";
import RelObj "data_structures/RelObj";
import Text "mo:base/Text";
import Types "./types";

module StateV1 {
  type Profile = Types.Profile;
  type ProviderId = Types.ProviderId;
  type Content = Types.Content;
  type Provider = Types.Provider;
  type Rel<X, Y> = RelObj.RelObj<X, Y>;
  public type RelShared<X, Y> = Rel.RelShared<X, Y>;
  public type Map<X, Y> = HashMap.HashMap<X, Y>;
  public type ProviderAdminMap = HashMap.HashMap<Types.UserId, ()>;

  public type State = {
    // Global IDs, Keeps track of
    GLOBAL_ID_MAP : Map<Text, Nat>;

    // Provider whitelist
    providersWhitelist : Map<Principal, Bool>;

    // Providers
    providers : Map<Principal, Provider>;

    // Pub / Sub for Providers
    providerSubs : Map<Principal, Types.SubscribeMessage>;

    providerAdmins : Map<ProviderId, ProviderAdminMap>;

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

    rules : Map<Types.RuleId, Types.Rule>;

    votes : Map<Types.VoteId, Types.VoteV2>;

    textContent : Map<Types.ContentId, Types.TextContent>;

    imageContent : Map<Types.ContentId, Types.ImageContent>;

    // relates content to votes
    content2votes : Rel<Types.ContentId, Types.VoteId>;

    // relates users to votes
    mods2votes : Rel<Types.UserId, Types.VoteId>;

    // related content to providers
    provider2content : Rel<Types.ProviderId, Types.ContentId>;

    provider2rules : Rel<Types.ProviderId, Types.RuleId>;

    admin2Provider : Rel<Types.UserId, Types.ProviderId>;

    appName : Text;

    providerAllowedForAIFiltering : Map<Principal, Bool>;

    provider2PohChallengeIds : Map<Principal, Buffer.Buffer<Text>>;
    provider2PohExpiry : Map<Principal, Nat>;

  };

  public type StateShared = {
    GLOBAL_ID_MAP : [(Text, Nat)];
    providers : [(Principal, Provider)];
    providerSubs : [(Principal, Types.SubscribeMessage)];
    providersWhitelist : [(Principal, Bool)];
    providerAdmins : [(Principal, [(Principal, ())])];
    airdropUsers : [(Principal, Types.AirdropUser)];
    airdropWhitelist : [(Principal, Principal)];
    profiles : [(Types.UserId, Profile)];
    usernames : [(Text, Types.UserId)];
    content : [(Types.ContentId, Types.Content)];
    rules : [(Types.RuleId, Types.Rule)];
    votes : [(Types.VoteId, Types.VoteV2)];
    textContent : [(Types.ContentId, Types.TextContent)];
    imageContent : [(Types.ContentId, Types.ImageContent)];
    content2votes : RelShared<Types.ContentId, Types.VoteId>;
    mods2votes : RelShared<Types.UserId, Types.VoteId>;
    provider2content : RelShared<Types.ProviderId, Types.ContentId>;
    provider2rules : RelShared<Types.ProviderId, Types.RuleId>;
    admin2Provider : RelShared<Types.UserId, Types.ProviderId>;
    appName : Text;
    providerAllowedForAIFiltering : [(Principal, Bool)];
    provider2PohChallengeIds : [(Principal, [Text])];
    provider2PohExpiry : [(Principal, Nat)];
  };

  public func empty() : State {
    let equal = (Text.equal, Text.equal);
    let hash = (Text.hash, Text.hash);
    var st : State = {
      GLOBAL_ID_MAP = HashMap.HashMap<Text, Nat>(1, Text.equal, Text.hash);
      providers = HashMap.HashMap<Principal, Provider>(
        1,
        Principal.equal,
        Principal.hash
      );
      providersWhitelist = HashMap.HashMap<Principal, Bool>(
        1,
        Principal.equal,
        Principal.hash
      );
      providerSubs = HashMap.HashMap<Principal, Types.SubscribeMessage>(
        1,
        Principal.equal,
        Principal.hash
      );
      providerAdmins = HashMap.HashMap<Principal, ProviderAdminMap>(
        1,
        Principal.equal,
        Principal.hash
      );
      profiles = HashMap.HashMap<Types.UserId, Profile>(
        1,
        Principal.equal,
        Principal.hash
      );
      usernames = HashMap.HashMap<Text, Types.UserId>(1, Text.equal, Text.hash);
      airdropUsers = HashMap.HashMap<Principal, Types.AirdropUser>(
        1,
        Principal.equal,
        Principal.hash
      );
      airdropWhitelist = HashMap.HashMap<Principal, Principal>(
        1,
        Principal.equal,
        Principal.hash
      );
      content = HashMap.HashMap<Types.ContentId, Types.Content>(
        1,
        Text.equal,
        Text.hash
      );

      votes = HashMap.HashMap<Types.VoteId, Types.VoteV2>(
        1,
        Text.equal,
        Text.hash
      );

      rules = HashMap.HashMap<Types.RuleId, Types.Rule>(
        1,
        Text.equal,
        Text.hash
      );
      textContent = HashMap.HashMap<Types.ContentId, Types.TextContent>(
        1,
        Text.equal,
        Text.hash
      );
      imageContent = HashMap.HashMap<Types.ContentId, Types.ImageContent>(
        1,
        Text.equal,
        Text.hash
      );
      content2votes = RelObj.RelObj(hash, equal);
      mods2votes = RelObj.RelObj(
        (Principal.hash, Text.hash),
        (Principal.equal, Text.equal)
      );
      provider2content = RelObj.RelObj(
        (Principal.hash, Text.hash),
        (Principal.equal, Text.equal)
      );
      provider2rules = RelObj.RelObj(
        (Principal.hash, Text.hash),
        (Principal.equal, Text.equal)
      );
      admin2Provider = RelObj.RelObj(
        (Principal.hash, Principal.hash),
        (Principal.equal, Principal.equal)
      );
      appName = "MODCLUB";

      providerAllowedForAIFiltering = HashMap.HashMap<Principal, Bool>(
        1,
        Principal.equal,
        Principal.hash
      );
      provider2PohChallengeIds = HashMap.HashMap<Principal, Buffer.Buffer<Text>>(
        1,
        Principal.equal,
        Principal.hash
      );
      provider2PohExpiry = HashMap.HashMap<Principal, Nat>(
        1,
        Principal.equal,
        Principal.hash
      );
    };
    st;
  };

  public func emptyShared() : StateShared {
    var st : StateShared = {
      GLOBAL_ID_MAP = [];
      profiles = [];
      content = [];
      providerSubs = [];
      usernames = [];
      providers = [];
      providersWhitelist = [];
      providerAdmins = [];
      rules = [];
      votes = [];
      textContent = [];
      imageContent = [];
      airdropUsers = [];
      airdropWhitelist = [];
      content2votes = Rel.emptyShared<Text, Text>();
      mods2votes = Rel.emptyShared<Principal, Text>();
      provider2content = Rel.emptyShared<Principal, Text>();
      provider2rules = Rel.emptyShared<Principal, Text>();
      admin2Provider = Rel.emptyShared<Principal, Principal>();
      appName = "MODCLUB";
      providerAllowedForAIFiltering = [];
      provider2PohChallengeIds = [];
      provider2PohExpiry = [];
    };
    st;
  };

  public func fromState(state : State) : StateShared {
    let buf = Buffer.Buffer<(Principal, [(Principal, ())])>(0);
    for ((pid, admins) in state.providerAdmins.entries()) {
      buf.add((pid, Iter.toArray(admins.entries())));
    };
    let provider2PohChallengeIdsStable = Buffer.Buffer<(Principal, [Text])>(1);
    for (
      (pid : Principal, challengeIdBuffer : Buffer.Buffer<Text>) in state.provider2PohChallengeIds.entries()
    ) {
      provider2PohChallengeIdsStable.add((pid, Buffer.toArray<Text>(challengeIdBuffer)));
    };
    let st : StateShared = {
      GLOBAL_ID_MAP = Iter.toArray(state.GLOBAL_ID_MAP.entries());
      providers = Iter.toArray(state.providers.entries());
      providerSubs = Iter.toArray(state.providerSubs.entries());
      usernames = Iter.toArray(state.usernames.entries());
      providersWhitelist = Iter.toArray(state.providersWhitelist.entries());
      profiles = Iter.toArray(state.profiles.entries());
      content = Iter.toArray(state.content.entries());
      rules = Iter.toArray(state.rules.entries());
      votes = Iter.toArray(state.votes.entries());
      textContent = Iter.toArray(state.textContent.entries());
      imageContent = Iter.toArray(state.imageContent.entries());
      airdropUsers = Iter.toArray(state.airdropUsers.entries());
      providerAdmins = Buffer.toArray<(Principal, [(Principal, ())])>(buf);
      airdropWhitelist = Iter.toArray(state.airdropWhitelist.entries());
      content2votes = Rel.share<Types.ContentId, Types.VoteId>(
        state.content2votes.getRel()
      );
      mods2votes = Rel.share<Types.UserId, Types.VoteId>(
        state.mods2votes.getRel()
      );
      provider2content = Rel.share<Principal, Types.ContentId>(
        state.provider2content.getRel()
      );
      provider2rules = Rel.share<Principal, Types.ContentId>(
        state.provider2rules.getRel()
      );
      admin2Provider = Rel.share<Principal, Types.ProviderId>(
        state.admin2Provider.getRel()
      );
      appName = state.appName;
      providerAllowedForAIFiltering = Iter.toArray(
        state.providerAllowedForAIFiltering.entries()
      );
      provider2PohChallengeIds = Buffer.toArray<(Principal, [Text])>(provider2PohChallengeIdsStable);
      provider2PohExpiry = Iter.toArray(state.provider2PohExpiry.entries());
    };
    st;
  };

  public func toState(stateShared : StateShared) : State {
    let state = empty();
    let equal = (Text.equal, Text.equal);
    let hash = (Text.hash, Text.hash);
    for ((category, val) in stateShared.GLOBAL_ID_MAP.vals()) {
      state.GLOBAL_ID_MAP.put(category, val);
    };
    for ((id, content) in stateShared.content.vals()) {
      state.content.put(id, content);
    };
    for ((pid, callback) in stateShared.providerSubs.vals()) {
      state.providerSubs.put(pid, callback);
    };
    for ((username, uid) in stateShared.usernames.vals()) {
      state.usernames.put(username, uid);
    };
    for ((id, provider) in stateShared.providers.vals()) {
      state.providers.put(id, provider);
    };
    for ((id, val) in stateShared.providersWhitelist.vals()) {
      state.providersWhitelist.put(id, val);
    };
    for ((id, profile) in stateShared.profiles.vals()) {
      state.profiles.put(id, profile);
    };
    for ((id, rule) in stateShared.rules.vals()) {
      state.rules.put(id, rule);
    };
    for ((id, vote) in stateShared.votes.vals()) {
      state.votes.put(id, vote);
    };
    for ((id, text) in stateShared.textContent.vals()) {
      state.textContent.put(id, text);
    };
    for ((id, image) in stateShared.imageContent.vals()) {
      state.imageContent.put(id, image);
    };
    Debug.print("MODCLUB AIRDROP STATE RESTORING");
    for ((id, airdropUser) in stateShared.airdropUsers.vals()) {
      state.airdropUsers.put(id, airdropUser);
    };

    for ((pid, admins) in stateShared.providerAdmins.vals()) {
      let adminMap : ProviderAdminMap = HashMap.HashMap<Types.UserId, ()>(
        1,
        Principal.equal,
        Principal.hash
      );
      for ((admin, ()) in admins.vals()) {
        adminMap.put(admin, ());
      };
      state.providerAdmins.put(pid, adminMap);
    };

    for ((id, pid) in stateShared.airdropWhitelist.vals()) {
      state.airdropWhitelist.put(id, pid);
    };

    state.content2votes.setRel(
      Rel.fromShare<Types.ContentId, Types.VoteId>(
        stateShared.content2votes,
        hash,
        equal
      )
    );
    state.mods2votes.setRel(
      Rel.fromShare<Types.UserId, Types.VoteId>(
        stateShared.mods2votes,
        (Principal.hash, Text.hash),
        (Principal.equal, Text.equal)
      )
    );
    state.provider2content.setRel(
      Rel.fromShare<Principal, Types.ContentId>(
        stateShared.provider2content,
        (Principal.hash, Text.hash),
        (Principal.equal, Text.equal)
      )
    );
    state.provider2rules.setRel(
      Rel.fromShare<Principal, Types.ContentId>(
        stateShared.provider2rules,
        (Principal.hash, Text.hash),
        (Principal.equal, Text.equal)
      )
    );
    state.admin2Provider.setRel(
      Rel.fromShare<Principal, Types.ProviderId>(
        stateShared.admin2Provider,
        (Principal.hash, Principal.hash),
        (Principal.equal, Principal.equal)
      )
    );
    for ((pid, allowed) in stateShared.providerAllowedForAIFiltering.vals()) {
      state.providerAllowedForAIFiltering.put(pid, allowed);
    };
    for ((pid, challengeIdArray) in stateShared.provider2PohChallengeIds.vals()) {
      let challengeIdBuff = Buffer.Buffer<Text>(challengeIdArray.size());
      for (id in challengeIdArray.vals()) {
        challengeIdBuff.add(id);
      };
      state.provider2PohChallengeIds.put(pid, challengeIdBuff);
    };

    for ((pid, expiry) in stateShared.provider2PohExpiry.vals()) {
      state.provider2PohExpiry.put(pid, expiry);
    };
    return state;
  };

};
