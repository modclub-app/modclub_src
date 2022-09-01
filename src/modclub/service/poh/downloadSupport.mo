import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import DownloadUtil "../../downloadUtil";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Option "mo:base/Option";
import PohStateV2 "./statev2";
import PohTypes "./types";
import Principal "mo:base/Principal";
import RelObj "../../data_structures/RelObj";
import TrieMap "mo:base/TrieMap";

module {
  // [Text] is one row of csv here... whole function return is a row of rows
  public func download(
    state : PohStateV2.PohState,
    pohCallbackByProvider : HashMap.HashMap<Principal, TrieMap.TrieMap<Text, HashMap.HashMap<Text, Int>>>,
    varName : Text,
    start : Int,
    end : Int,
  ) : [[Text]] {
    switch (varName) {
      case ("pohChallenges") {
        return serializePohChallenges(state.pohChallenges);
      };
      case ("pohUserChallengeAttempts") {
        return serializePohUserChallengeAttempts(state.pohUserChallengeAttempts);
      };
      case ("token2ProviderAndUserData") {
        return serializeToken2ProviderAndUserData(
          state.token2ProviderAndUserData,
        );
      };
      case ("providerUserIdToModclubUserIdByProviderId") {
        return serializeProviderUserIdToModclubUserIdByProviderId(
          state.providerUserIdToModclubUserIdByProviderId,
        );
      };
      case ("pohChallengePackages") {
        return serializePohChallengePackages(state.pohChallengePackages);
      };
      case ("userToPohChallengePackageId") {
        return serializeUserToPohChallengePackageId(
          state.userToPohChallengePackageId,
        );
      };
      case ("wordList") {
        return serializeWordList(state.wordList);
      };
      case ("callbackIssuedByProvider") {
        return serializeCallbackIssuedByProvider(pohCallbackByProvider);
      };
      case (_) {
        return [];
      };
    };
  };

  func serializeCallbackIssuedByProvider(
    pohCallbackByProvider : HashMap.HashMap<Principal, TrieMap.TrieMap<Text, HashMap.HashMap<Text, Int>>>,
  ) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((pId, calbackByUserId) in pohCallbackByProvider.entries()) {
      for ((pUserId, callbackByStatus) in calbackByUserId.entries()) {
        for ((status, callbackTime) in callbackByStatus.entries()) {
          buff.add(
            [
              Principal.toText(pId),
              pUserId,
              status,
              Int.toText(callbackTime),
            ],
          );
        };
      };
    };
    return buff.toArray();
  };

  func serializeProviderUserIdToModclubUserIdByProviderId(
    providerUserIdToModclubUserIdByProviderId : HashMap.HashMap<Principal, RelObj.RelObj<Text, Principal>>,
  ) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for (
      (pId, pUserId2McId) in providerUserIdToModclubUserIdByProviderId.entries()
    ) {
      for (pUserId in pUserId2McId.getKeys().vals()) {
        buff.add(
          [
            Principal.toText(pId),
            pUserId,
            DownloadUtil.joinArr(
              Array.map(pUserId2McId.get0(pUserId), Principal.toText),
            ),
          ],
        );
      };
    };
    return buff.toArray();
  };

  func serializePohUserChallengeAttempts(
    pohUserChallengeAttempts : HashMap.HashMap<Principal, HashMap.HashMap<Text, Buffer.Buffer<PohTypes.PohChallengesAttemptV1>>>,
  ) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for (
      (modclubUserId, pohChallengesByCId) in pohUserChallengeAttempts.entries()
    ) {
      for ((cId, attempts) in pohChallengesByCId.entries()) {
        for (attempt in attempts.vals()) {
          buff.add(
            [
              Principal.toText(modclubUserId),
              cId,
              DownloadUtil.joinArr(
                DownloadUtil.toString_PohChallengesAttemptV1([attempt]),
              ),
            ],
          );
        };
      };
    };
    return buff.toArray();
  };

  func serializeUserToPohChallengePackageId(
    userToPohChallengePackageId : RelObj.RelObj<Principal, Text>,
  ) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for (modclubUserId in userToPohChallengePackageId.getKeys().vals()) {
      buff.add(
        [
          Principal.toText(modclubUserId),
          DownloadUtil.joinArr(userToPohChallengePackageId.get0(modclubUserId)),
        ],
      );
    };
    return buff.toArray();
  };

  func serializeWordList(wordList : Buffer.Buffer<Text>) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for (word in wordList.vals()) {
      buff.add([word]);
    };
    return buff.toArray();
  };

  func serializePohChallengePackages(
    pohChallengePackages : TrieMap.TrieMap<Text, PohTypes.PohChallengePackage>,
  ) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((packageId, package) in pohChallengePackages.entries()) {
      buff.add(
        [
          packageId,
          package.id,
          DownloadUtil.joinArr(package.challengeIds),
          Principal.toText(package.userId),
          Option.get(package.title, ""),
          Int.toText(package.createdAt),
          Int.toText(package.updatedAt),
        ],
      );
    };
    return buff.toArray();
  };

  func serializePohChallenges(
    pohChallenges : HashMap.HashMap<Text, PohTypes.PohChallenges>,
  ) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((challengeId, challenge) in pohChallenges.entries()) {
      buff.add(
        [
          challengeId,
          challenge.challengeId,
          challenge.challengeName,
          challenge.challengeDescription,
          DownloadUtil.joinArrOpt(challenge.dependentChallengeId),
          DownloadUtil.joinArr(
            DownloadUtil.toString_PohChallengeRequiredField(
              [challenge.requiredField],
            ),
          ),
          DownloadUtil.joinArr(
            DownloadUtil.toString_PohChallengeType([challenge.challengeType]),
          ),
          DownloadUtil.joinArr(
            DownloadUtil.toString_ViolatedRules(challenge.allowedViolationRules),
          ),
          Int.toText(challenge.createdAt),
          Int.toText(challenge.updatedAt),
        ],
      );
    };
    return buff.toArray();
  };

  func serializeToken2ProviderAndUserData(
    token2ProviderAndUserData : HashMap.HashMap<Text, PohTypes.PohProviderAndUserData>,
  ) : [[Text]] {
    let buff = Buffer.Buffer<[Text]>(1);
    for ((token, providerAndUserData) in token2ProviderAndUserData.entries()) {
      buff.add(
        [
          token,
          providerAndUserData.token,
          providerAndUserData.providerUserId,
          Principal.toText(providerAndUserData.providerId),
          Int.toText(providerAndUserData.generatedAt),
        ],
      );
    };
    return buff.toArray();
  };
};
