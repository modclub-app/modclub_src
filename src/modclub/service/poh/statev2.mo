import Buffer "mo:base/Buffer";
import Hash "mo:base/Hash";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import PohTypes "./types";
import Principal "mo:base/Principal";
import Rel "../../data_structures/Rel";
import RelObj "../../data_structures/RelObj";
import Text "mo:base/Text";
import TrieMap "mo:base/TrieMap";
import Common "../../../common/utils";
import Nat64 "mo:base/Nat64";

module State {

  public type PohState = {
    pohChallenges : HashMap.HashMap<Text, PohTypes.PohChallenges>;
    // Challenges attempted by each user
    // inner hashmap is for every challenge, how many times challenge user attempted and details
    pohUserChallengeAttempts : HashMap.HashMap<Principal, HashMap.HashMap<Text, Buffer.Buffer<PohTypes.PohChallengesAttemptV1>>>;
    // POH User data by unique token
    token2ProviderAndUserData : TrieMap.TrieMap<Text, PohTypes.PohProviderAndUserData>;
    //mapping providerUserId to our userId
    providerUserIdToModclubUserIdByProviderId : HashMap.HashMap<Principal, RelObj.RelObj<Text, Principal>>;
    pohChallengePackages : TrieMap.TrieMap<Text, PohTypes.PohChallengePackage>;
    userToPohChallengePackageId : RelObj.RelObj<Principal, Text>;
    wordList : Buffer.Buffer<Text>;
    providersCallback : HashMap.HashMap<Principal, PohTypes.SubscribePohMessage>;
    // Callback issued for all user at what time by provider id
    callbackIssuedByProvider : HashMap.HashMap<Principal, TrieMap.TrieMap<Principal, Int>>;
  };

  public type PohStableState = {
    // All poh Challenges with dependent challenges
    pohChallenges : [(Text, PohTypes.PohChallenges)];
    // Challenges attempted by each user
    // inner hashmap is for every challenge, how many times challenge user attempted and details
    pohUserChallengeAttempts : [(Principal, [(Text, [PohTypes.PohChallengesAttemptV1])])];

    // POH User data by unique token
    token2ProviderAndUserData : [(Text, PohTypes.PohProviderAndUserData)];
    //mapping providerUserId to our userId
    providerUserIdToModclubUserIdByProviderId : [(Principal, Rel.RelShared<Text, Principal>)];
    pohChallengePackages : [(Text, PohTypes.PohChallengePackage)];
    userToPohChallengePackageId : Rel.RelShared<Principal, Text>;
    wordList : [Text];
    providersCallback : [(Principal, PohTypes.SubscribePohMessage)];
    callbackIssuedByProvider : [(Principal, [(Principal, Int)])];
  };

  public func emptyState() : PohState {
    return {
      pohChallenges = HashMap.HashMap<Text, PohTypes.PohChallenges>(
        1,
        Text.equal,
        Text.hash
      );
      pohUserChallengeAttempts = HashMap.HashMap<Principal, HashMap.HashMap<Text, Buffer.Buffer<PohTypes.PohChallengesAttemptV1>>>(
        10,
        Principal.equal,
        Principal.hash
      );
      token2ProviderAndUserData = TrieMap.TrieMap<Text, PohTypes.PohProviderAndUserData>(
        Text.equal,
        Text.hash
      );
      providerUserIdToModclubUserIdByProviderId = HashMap.HashMap<Principal, RelObj.RelObj<Text, Principal>>(
        1,
        Principal.equal,
        Principal.hash
      );
      pohChallengePackages = TrieMap.TrieMap<Text, PohTypes.PohChallengePackage>(
        Text.equal,
        Text.hash
      );
      userToPohChallengePackageId = RelObj.RelObj(
        (Principal.hash, Text.hash),
        (Principal.equal, Text.equal)
      );
      wordList = Buffer.Buffer<Text>(1);
      providersCallback = HashMap.HashMap<Principal, PohTypes.SubscribePohMessage>(
        1,
        Principal.equal,
        Principal.hash
      );
      callbackIssuedByProvider = HashMap.HashMap<Principal, HashMap.HashMap<Principal, Int>>(
        1,
        Principal.equal,
        Principal.hash
      );
    };
  };

  public func emptyStableState() : PohStableState {
    let st = {
      pohChallenges = [];
      pohUserChallengeAttempts = [];
      token2ProviderAndUserData = [];
      providerUserIdToModclubUserIdByProviderId = [];
      pohChallengePackages = [];
      userToPohChallengePackageId = Rel.emptyShared<Principal, Text>();
      wordList = [];
      providersCallback = [];
      callbackIssuedByProvider = [];
    };
    return st;
  };

  public func getState(stableState : PohStableState) : PohState {
    var state : PohState = emptyState();

    for ((p, val) in stableState.pohChallenges.vals()) {
      state.pohChallenges.put(p, val);
    };

    for ((userId, challenges) in stableState.pohUserChallengeAttempts.vals()) {
      let attemptsByChallengeIdMap = HashMap.HashMap<Text, Buffer.Buffer<PohTypes.PohChallengesAttemptV1>>(
        5,
        Text.equal,
        Text.hash
      );
      for ((challengeId, attempts) in challenges.vals()) {
        let attemptsBuffer = Buffer.Buffer<PohTypes.PohChallengesAttemptV1>(
          attempts.size()
        );
        for (attempt in attempts.vals()) {
          attemptsBuffer.add(attempt);
        };
        attemptsByChallengeIdMap.put(challengeId, attemptsBuffer);
      };
      state.pohUserChallengeAttempts.put(userId, attemptsByChallengeIdMap);
    };

    for ((p, val) in stableState.token2ProviderAndUserData.vals()) {
      state.token2ProviderAndUserData.put(p, val);
    };
    for (
      (provider, user2ModclubUser) in stableState.providerUserIdToModclubUserIdByProviderId.vals()
    ) {
      let user2ModclubUserRelObj = RelObj.RelObj<Text, Principal>(
        (Text.hash, Principal.hash),
        (Text.equal, Principal.equal)
      );
      user2ModclubUserRelObj.setRel(
        Rel.fromShare<Text, Principal>(
          user2ModclubUser,
          (Text.hash, Principal.hash),
          (Text.equal, Principal.equal)
        )
      );
      state.providerUserIdToModclubUserIdByProviderId.put(
        provider,
        user2ModclubUserRelObj
      );
    };

    for ((p, val) in stableState.pohChallengePackages.vals()) {
      state.pohChallengePackages.put(p, val);
    };

    state.userToPohChallengePackageId.setRel(
      Rel.fromShare<Principal, Text>(
        stableState.userToPohChallengePackageId,
        (Principal.hash, Text.hash),
        (Principal.equal, Text.equal)
      )
    );
    for (w in stableState.wordList.vals()) {
      state.wordList.add(w);
    };
    for ((pId, callback) in stableState.providersCallback.vals()) {
      state.providersCallback.put(pId, callback);
    };

    for (
      (providerId, callbackByUser) in stableState.callbackIssuedByProvider.vals()
    ) {
      let callbackDataMap = HashMap.fromIter<Principal, Int>(
        callbackByUser.vals(),
        callbackByUser.size(),
        Principal.equal,
        Principal.hash
      );
      state.callbackIssuedByProvider.put(providerId, callbackDataMap);
    };
    return state;
  };

  public func getStableState(state : PohState) : PohStableState {
    let pohUserChallengeAttempts = Buffer.Buffer<(Principal, [(Text, [PohTypes.PohChallengesAttemptV1])])>(
      state.pohUserChallengeAttempts.size()
    );
    for ((userId, challenges) in state.pohUserChallengeAttempts.entries()) {
      let challengeMap = Buffer.Buffer<(Text, [PohTypes.PohChallengesAttemptV1])>(
        challenges.size()
      );
      for ((challengeId, attempts) in challenges.entries()) {
        let attemptsBuffer = Buffer.Buffer<PohTypes.PohChallengesAttemptV1>(
          attempts.size()
        );
        for (attempt in attempts.vals()) {
          attemptsBuffer.add(attempt);
        };
        challengeMap.add((challengeId, Buffer.toArray<PohTypes.PohChallengesAttemptV1>(attemptsBuffer)));
      };
      pohUserChallengeAttempts.add((userId, Buffer.toArray<(Text, [PohTypes.PohChallengesAttemptV1])>(challengeMap)));
    };

    let providerUserIdToModclubUserIdByProviderIdBuf = Buffer.Buffer<(Principal, Rel.RelShared<Text, Principal>)>(
      1
    );
    for (
      (provider, user2ModclubUserRelObj) in state.providerUserIdToModclubUserIdByProviderId.entries()
    ) {
      providerUserIdToModclubUserIdByProviderIdBuf.add((provider, Rel.share(user2ModclubUserRelObj.getRel())));
    };

    let callbackIssuedByProviderBuff = Buffer.Buffer<(Principal, [(Principal, Int)])>(
      1
    );
    for (
      (providerId, callbackByUser) in state.callbackIssuedByProvider.entries()
    ) {
      let callbackByUserBuff = Buffer.Buffer<(Principal, Int)>(1);
      for ((userId, time) in callbackByUser.entries()) {
        callbackByUserBuff.add((userId, time));
      };
      callbackIssuedByProviderBuff.add((providerId, Buffer.toArray<(Principal, Int)>(callbackByUserBuff)));
    };

    let st = {
      pohChallenges = Iter.toArray(state.pohChallenges.entries());
      pohUserChallengeAttempts = Buffer.toArray<(Principal, [(Text, [PohTypes.PohChallengesAttemptV1])])>(pohUserChallengeAttempts);
      token2ProviderAndUserData = Iter.toArray(
        state.token2ProviderAndUserData.entries()
      );
      providerUserIdToModclubUserIdByProviderId = Buffer.toArray<(Principal, Rel.RelShared<Text, Principal>)>(providerUserIdToModclubUserIdByProviderIdBuf);
      pohChallengePackages = Iter.toArray(state.pohChallengePackages.entries());
      userToPohChallengePackageId = Rel.share<Principal, Text>(
        state.userToPohChallengePackageId.getRel()
      );
      wordList = Buffer.toArray<Text>(state.wordList);
      providersCallback = Iter.toArray(state.providersCallback.entries());
      callbackIssuedByProvider = Buffer.toArray<(Principal, [(Principal, Int)])>(callbackIssuedByProviderBuff);
    };
    return st;
  };

};
