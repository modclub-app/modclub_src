import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import DownloadUtil "./downloadUtil";
import GlobalState "./statev2";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Bool "mo:base/Bool";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import RelObj "./data_structures/RelObj";
import TrieMap "mo:base/TrieMap";
import Types "./types";

module {

  // providerSubs: Map<Principal, Types.SubscribeMessage>;
  public func download(
    state : GlobalState.State,
    varName : Text,
    start : Int,
    end : Int,
  ) : [[Text]] {
    switch (varName) {
      case ("GLOBAL_ID_MAP") {
        return serializeGLOBAL_ID_MAP(state.GLOBAL_ID_MAP);
      };
      case ("providersWhitelist") {
        return serializeProvidersWhitelist(state.providersWhitelist);
      };
      case ("providers") {
        return serializeProviders(state.providers);
      };
      case ("providerSubs") {
        return serializeProviderSubs(state.providerSubs);
      };
      case ("providerAdmins") {
        return serializeProviderAdmins(state.providerAdmins);
      };
      case ("profiles") {
        return serializeProfiles(state.profiles);
      };
      case ("airdropUsers") {
        return serializeAirdropUsers(state.airdropUsers);
      };
      case ("airdropWhitelist") {
        return serializeAirdropWhitelist(state.airdropWhitelist);
      };
      case ("usernames") {
        return serializeUsernames(state.usernames);
      };
      case ("content") {
        return serializeContent(state.content);
      };
      case ("rules") {
        return serializeRules(state.rules);
      };
      case ("votes") {
        return serializeVotes(state.votes);
      };
      case ("textContent") {
        return serializeTextContent(state.textContent);
      };
      case ("imageContent") {
        return serializeImageContent(state.imageContent);
      };
      case ("content2votes") {
        return serializeContent2votes(state.content2votes);
      };
      case ("mods2votes") {
        return serializeRel(state.mods2votes);
      };
      case ("provider2content") {
        return serializeRel(state.provider2content);
      };
      case ("provider2rules") {
        return serializeRel(state.provider2rules);
      };
      case ("admin2Provider") {
        return serializeRelPrincipal2Principal(state.admin2Provider);
      };
      case ("appName") {
        return [[state.appName]];
      };
      case ("providerAllowedForAIFiltering") {
        return serializeProvidersWhitelist(state.providerAllowedForAIFiltering);
      };
      case ("provider2PohExpiry") {
        return serializeProvider2PohExpiry(state.provider2PohExpiry);
      };
      case ("provider2PohChallengeIds") {
        return serializeProvider2PohChallengeIds(state.provider2PohChallengeIds);
      };
      case (_) {
        return [];
      };
    };
  };

  func serializeGLOBAL_ID_MAP(GLOBAL_ID_MAP : HashMap.HashMap<Text, Nat>) : [
    [Text]
  ] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((category, id) in GLOBAL_ID_MAP.entries()) {
      buff.add(
        [category, Nat.toText(id)]
      );
    };
    return buff.toArray();
  };

  func serializeProvidersWhitelist(
    providersWhitelist : HashMap.HashMap<Principal, Bool>,
  ) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((pId, allowedOrNotAllowed) in providersWhitelist.entries()) {
      buff.add(
        [Principal.toText(pId), Bool.toText(allowedOrNotAllowed)]
      );
    };
    return buff.toArray();
  };

  func serializeProviders(
    providers : HashMap.HashMap<Principal, Types.Provider>,
  ) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((pId, providerDetail) in providers.entries()) {
      buff.add(
        [
          Principal.toText(pId),
          DownloadUtil.joinArr(DownloadUtil.toString_Provider([providerDetail])),
        ],
      );
    };
    return buff.toArray();
  };

  func serializeProviderAdmins(
    providerAdmin : HashMap.HashMap<Principal, HashMap.HashMap<Principal, ()>>,
  ) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((pId, userIdMap) in providerAdmin.entries()) {
      for ((userId, _) in userIdMap.entries()) {
        buff.add(
          [Principal.toText(pId), Principal.toText(userId)],
        );
      };
    };
    return buff.toArray();
  };

  func serializeProfiles(profiles : HashMap.HashMap<Principal, Types.Profile>) : [
    [Text]
  ] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((pId, profile) in profiles.entries()) {
      buff.add(
        [
          Principal.toText(pId),
          DownloadUtil.joinArr(DownloadUtil.toString_Profile([profile])),
        ],
      );
    };
    return buff.toArray();
  };

  func serializeAirdropWhitelist(
    airdropWhitelist : HashMap.HashMap<Principal, Principal>,
  ) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((userId, userId1) in airdropWhitelist.entries()) {
      buff.add(
        [Principal.toText(userId), Principal.toText(userId1)],
      );
    };
    return buff.toArray();
  };

  func serializeUsernames(usernames : HashMap.HashMap<Text, Principal>) : [
    [Text]
  ] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((username, userId) in usernames.entries()) {
      buff.add(
        [username, Principal.toText(userId)],
      );
    };
    return buff.toArray();
  };

  func serializeContent2votes(content2votes : RelObj.RelObj<Text, Text>) : [
    [Text]
  ] {
    let buff = Buffer.Buffer<[Text]>(1);
    for (cId in content2votes.getKeys().vals()) {
      for (vId in content2votes.get0(cId).vals()) {
        buff.add(
          [cId, vId],
        );
      };

    };
    return buff.toArray();
  };

  func serializeRel(mods2votes : RelObj.RelObj<Principal, Text>) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for (userId in mods2votes.getKeys().vals()) {
      for (vId in mods2votes.get0(userId).vals()) {
        buff.add(
          [Principal.toText(userId), vId],
        );
      };

    };
    return buff.toArray();
  };

  func serializeRelPrincipal2Principal(
    mods2votes : RelObj.RelObj<Principal, Principal>,
  ) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for (userId in mods2votes.getKeys().vals()) {
      for (vId in mods2votes.get0(userId).vals()) {
        buff.add(
          [Principal.toText(userId), Principal.toText(vId)],
        );
      };

    };
    return buff.toArray();
  };

  func serializeProvider2PohExpiry(
    GLOBAL_ID_MAP : HashMap.HashMap<Principal, Nat>,
  ) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((category, id) in GLOBAL_ID_MAP.entries()) {
      buff.add(
        [Principal.toText(category), Nat.toText(id)],
      );
    };
    return buff.toArray();
  };

  func serializeProvider2PohChallengeIds(
    provider2PohChallengeIds : HashMap.HashMap<Principal, Buffer.Buffer<Text>>,
  ) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((pId, challengeIds) in provider2PohChallengeIds.entries()) {
      for (cId in challengeIds.vals()) {
        buff.add(
          [Principal.toText(pId), cId],
        );
      };
    };
    return buff.toArray();
  };

  func serializeAirdropUsers(
    airdropUsers : HashMap.HashMap<Principal, Types.AirdropUser>,
  ) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((uId, user) in airdropUsers.entries()) {
      buff.add(
        [
          Principal.toText(uId),
          DownloadUtil.joinArr(DownloadUtil.toString_AirdropUser([user])),
        ],
      );
    };
    return buff.toArray();
  };

  func serializeContent(contents : HashMap.HashMap<Text, Types.Content>) : [
    [Text]
  ] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((cId, content) in contents.entries()) {
      buff.add(
        [cId, DownloadUtil.joinArr(DownloadUtil.toString_Content([content]))],
      );
    };
    return buff.toArray();
  };

  func serializeRules(rules : HashMap.HashMap<Text, Types.Rule>) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((rId, rules) in rules.entries()) {
      buff.add(
        [rId, DownloadUtil.joinArr(DownloadUtil.toString_Rule([rules]))],
      );
    };
    return buff.toArray();
  };

  func serializeVotes(votes : HashMap.HashMap<Text, Types.VoteV2>) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((vId, votes) in votes.entries()) {
      buff.add(
        [vId, DownloadUtil.joinArr(DownloadUtil.toString_Vote([votes]))],
      );
    };
    return buff.toArray();
  };
  func serializeTextContent(
    textContents : HashMap.HashMap<Text, Types.TextContent>,
  ) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((cId, textContent) in textContents.entries()) {
      buff.add(
        [
          cId,
          DownloadUtil.joinArr(DownloadUtil.toString_TextContent([textContent])),
        ],
      );
    };
    return buff.toArray();
  };

  func serializeImageContent(
    imageContents : HashMap.HashMap<Text, Types.ImageContent>,
  ) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((cId, imageContent) in imageContents.entries()) {
      buff.add(
        [
          cId,
          DownloadUtil.joinArr(
            DownloadUtil.toString_ImageContent([imageContent]),
          ),
        ],
      );
    };
    return buff.toArray();
  };

  func serializeProviderSubs(
    providerSubs : HashMap.HashMap<Principal, Types.SubscribeMessage>,
  ) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((pId, _) in providerSubs.entries()) {
      buff.add(
        [Principal.toText(pId)],
      );
    };
    return buff.toArray();
  };
};
