import Array "mo:base/Array";
import Arrays "mo:base/Array";
import Bool "mo:base/Bool";
import Buffer "mo:base/Buffer";
import Canistergeek "../../canistergeek/canistergeek";
import Debug "mo:base/Debug";
import DownloadSupport "./downloadSupport";
import DownloadUtil "../../downloadUtil";
import Error "mo:base/Error";
import GlobalState "../../statev1";
import HashMap "mo:base/HashMap";
import Helpers "../../helpers";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import ModClubParam "../parameters/params";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Order "mo:base/Order";
import PohStateV1 "./statev1";
import PohStateV2 "./statev2";
import PohTypes "./types";
import Principal "mo:base/Principal";
import Rel "../../data_structures/Rel";
import RelObj "../../data_structures/RelObj";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import TrieMap "mo:base/TrieMap";
import Types "../../types";
import EmailManager "../email/email";
import VoteState "../vote/state";
import Content "../queue/state";
import List "mo:base/List";

module PohModule {

  public let CHALLENGE_PROFILE_PIC_ID = "challenge-profile-pic";
  public let CHALLENGE_USER_VIDEO_ID = "challenge-user-video";
  public let CHALLENGE_USER_AUDIO_ID = "challenge-user-audio";
  public let CHALLENGE_DRAWING_ID = "challenge-drawing";

  let SHAPE_LIST : [Text] = ["Triangle", "Smile", "Circle", "Square", "Star"];

  public class PohEngine(
    stableState : PohStateV2.PohStableState,
    pohCallbackDataByProviderStable : [(Principal, [(Text, [(Text, Int)])])],
    provider2ProviderUserId2IpStable : [(Principal, [(Text, Text)])],
    provider2Ip2WalletStable : [(Principal, Rel.RelShared<Text, Principal>)]
  ) {
    let state = PohStateV2.getState(stableState);

    let pohCallbackByProvider = HashMap.HashMap<Principal, TrieMap.TrieMap<Text, HashMap.HashMap<Text, Int>>>(
      1,
      Principal.equal,
      Principal.hash
    );

    for ((pId, callBackDataByUserId) in pohCallbackDataByProviderStable.vals()) {

      let callBackDataByUserIdMap = TrieMap.TrieMap<Text, HashMap.HashMap<Text, Int>>(Text.equal, Text.hash);
      for ((userId, callBackDataByStatus) in callBackDataByUserId.vals()) {
        let callBackDataByStatusMap = HashMap.HashMap<Text, Int>(1, Text.equal, Text.hash);
        for ((status, time) in callBackDataByStatus.vals()) {
          callBackDataByStatusMap.put(status, time);
        };
        callBackDataByUserIdMap.put(userId, callBackDataByStatusMap);
      };

      pohCallbackByProvider.put(pId, callBackDataByUserIdMap);
    };
    // Keep providerId to token to IP address Mapping.
    let provider2ProviderUserId2Ip = HashMap.HashMap<Principal, TrieMap.TrieMap<Text, Text>>(1, Principal.equal, Principal.hash);
    for ((providerId, providerUserId2Ip) in provider2ProviderUserId2IpStable.vals()) {
      let providerUserId2IpMap = TrieMap.fromEntries<Text, Text>(providerUserId2Ip.vals(), Text.equal, Text.hash);
      provider2ProviderUserId2Ip.put(providerId, providerUserId2IpMap);
    };

    // Keep providerId to ip to Modclub wallet/Principal mapping.
    let provider2Ip2Wallet = HashMap.HashMap<Principal, RelObj.RelObj<Text, Principal>>(1, Principal.equal, Principal.hash);
    for ((providerId, ip2Wallet) in provider2Ip2WalletStable.vals()) {
      let ip2WalletRelObj = RelObj.RelObj<Text, Principal>((Text.hash, Principal.hash), (Text.equal, Principal.equal));
      ip2WalletRelObj.setRel(
        Rel.fromShare<Text, Principal>(ip2Wallet, (Text.hash, Principal.hash), (Text.equal, Principal.equal))
      );
      provider2Ip2Wallet.put(providerId, ip2WalletRelObj);
    };

    let MILLI_SECONDS_DAY = 86400000;

    public func pohVerificationRequest(
      pohVerificationRequest : PohTypes.PohVerificationRequestV1,
      validForDays : Nat,
      configuredChallengeIds : [Text],
      getAllUniqueViolatedRules : Text -> [Types.PohRulesViolated],
      getContentStatus : Text -> Types.ContentStatus
    ) : PohTypes.PohVerificationResponsePlus {
      // request audit
      // TODO: Audit Fixing
      // state.pohVerificationRequests.put(pohVerificationRequest.requestId, pohVerificationRequest);
      // state.provider2PohVerificationRequests.put(pohVerificationRequest.providerId, pohVerificationRequest.requestId);

      let modclubUserIdOpt = findModclubId(
        pohVerificationRequest.providerUserId,
        pohVerificationRequest.providerId
      );
      switch (modclubUserIdOpt) {
        case (null) {
          return {
            providerUserId = pohVerificationRequest.providerUserId;
            providerId = pohVerificationRequest.providerId;
            status = #startPoh;
            challenges = [];
            requestedAt = null;
            submittedAt = null;
            completedAt = null;
            token = ?pohGenerateUniqueToken(
              pohVerificationRequest.providerUserId,
              pohVerificationRequest.providerId
            );
            rejectionReasons = [];
            isFirstAssociation = true;
          };
        };
        case (?modclubUserId) {
          let resp = formPohResponse(
            modclubUserId,
            configuredChallengeIds,
            pohVerificationRequest.providerUserId,
            pohVerificationRequest.providerId,
            validForDays,
            getAllUniqueViolatedRules,
            getContentStatus
          );
          if (resp.status == #verified) {
            // makeCallbackEntryForProvider(pohVerificationRequest.providerId);
            makeCallbackEntryForProviderUser(
              pohVerificationRequest.providerUserId,
              pohVerificationRequest.providerId
            );
            let _ = do ? {
              let callbackDataByUserId = pohCallbackByProvider.get(
                pohVerificationRequest.providerId
              )!;
              let callbackData = callbackDataByUserId.get(
                pohVerificationRequest.providerUserId
              )!;
              let statusText = statusToString(resp.status);
              switch (callbackData.get(statusText)) {
                case (null) {
                  // Saving that user has queried the approved status, so no callback
                  callbackData.put(statusText, Helpers.timeNow());
                };
                case (_)();
              };
            };
          };
          return resp;
        };
      };
    };

    func makeCallbackEntryForProvider(providerId : Principal) {
      switch (pohCallbackByProvider.get(providerId)) {
        case (null) {
          pohCallbackByProvider.put(
            providerId,
            HashMap.HashMap<Text, HashMap.HashMap<Text, Int>>(
              1,
              Text.equal,
              Text.hash
            )
          );
        };
        case (_)();
      };
    };

    func makeCallbackEntryForProviderUser(
      providerUserId : Text,
      providerId : Principal
    ) {
      makeCallbackEntryForProvider(providerId);
      let _ = do ? {
        let callbackByProvider = pohCallbackByProvider.get(providerId)!;
        switch (callbackByProvider.get(providerUserId)) {
          case (null) {
            callbackByProvider.put(
              providerUserId,
              HashMap.HashMap<Text, Int>(1, Text.equal, Text.hash)
            );
          };
          case (_)();
        };
      };

    };

    func formPohResponse(
      modclubUserId : Principal,
      configuredChallengeIds : [Text],
      providerUserId : Text,
      providerId : Principal,
      validForDays : Nat,
      getAllUniqueViolatedRules : Text -> [Types.PohRulesViolated],
      getContentStatus : Text -> Types.ContentStatus
    ) : PohTypes.PohVerificationResponsePlus {
      switch (state.pohUserChallengeAttempts.get(modclubUserId)) {
        case (null)
        // If user is in record, but no attempt is not possible in our flow
        // Extra cautious and sending zero challenges attempted array
        return {
          providerUserId = providerUserId;
          providerId = providerId;
          status = #startPoh;
          challenges = [];
          requestedAt = null;
          submittedAt = null;
          completedAt = null;
          token = ?pohGenerateUniqueToken(providerUserId, providerId);
          rejectionReasons = [];
          isFirstAssociation = true;
        };
        case (?attemptsByChallenges) {
          let challenges = Buffer.Buffer<PohTypes.ChallengeResponse>(
            configuredChallengeIds.size()
          );
          var overAllStatus : PohTypes.PohVerificationStatus = #verified;
          var overAllRequestedDate = -1;
          var overAllSubmittedDate = -1;
          var overAllCompletedDate = -1;

          for (challengeId in configuredChallengeIds.vals()) {
            switch (attemptsByChallenges.get(challengeId)) {
              case (null) {
                overAllStatus := #notSubmitted;
                challenges.add(
                  {
                    challengeId = challengeId;
                    status = #notSubmitted;
                    requestedAt = null;
                    submittedAt = null;
                    completedAt = null;
                  }
                );
              };
              case (?attempts) {
                var status : PohTypes.PohChallengeStatus = #notSubmitted;
                var completedOn : ?Int = null;
                var requestedAt = -1;
                var submittedAt = -1;
                if (attempts.size() != 0) {
                  let statusAndDate = findChallengeStatus(
                    attempts,
                    validForDays
                  );
                  status := statusAndDate.0;
                  completedOn := statusAndDate.1;
                  requestedAt := statusAndDate.2;
                  submittedAt := statusAndDate.3;
                  overAllRequestedDate := Int.max(
                    overAllRequestedDate,
                    requestedAt
                  );
                  overAllSubmittedDate := Int.max(
                    overAllSubmittedDate,
                    submittedAt
                  );
                  overAllCompletedDate := Int.max(
                    overAllCompletedDate,
                    Option.get(completedOn, -1)
                  );
                };
                challenges.add(
                  {
                    challengeId = challengeId;
                    status = status;
                    requestedAt = ?requestedAt;
                    submittedAt = ?submittedAt;
                    completedAt = completedOn;
                  }
                );

                // if any of the challenge is rejected, then overall status is rejected
                if (status == #rejected) {
                  overAllStatus := #rejected;
                } else if (overAllStatus != #rejected and status == #expired) {
                  // if any of the challenge is expired and none is rejected, then overall status is expired
                  overAllStatus := #expired;
                };

                // so that rejected or expired overallstatus can't be overidden
                if (overAllStatus != #rejected and overAllStatus != #expired) {
                  // if any of the challenge is not submitted then it's not submitted.
                  if (status == #notSubmitted) {
                    overAllStatus := #notSubmitted;
                  } else if (
                    overAllStatus != #notSubmitted and status == #pending
                  ) {
                    overAllStatus := #pending;
                  };
                };
              };
            };
          };

          var reasons : [Text] = [];
          if (overAllStatus == #rejected) {
            // second part of get won't get evaluated so giving random value
            reasons := findRejectionReasons(
              modclubUserId,
              configuredChallengeIds,
              getAllUniqueViolatedRules,
              getContentStatus
            );
          };
          var token : ?Text = null;
          if (
            overAllStatus == #startPoh or overAllStatus == #notSubmitted or overAllStatus == #expired
          ) {
            token := ?pohGenerateUniqueToken(providerUserId, providerId);
          };

          return {
            providerUserId = providerUserId;
            providerId = providerId;
            status = overAllStatus;
            challenges = challenges.toArray();
            requestedAt = ?overAllRequestedDate;
            submittedAt = ?overAllSubmittedDate;
            completedAt = ?overAllCompletedDate;
            token = token;
            rejectionReasons = reasons;
            isFirstAssociation = checkIfFirstAssoication(
              modclubUserId,
              providerUserId,
              providerId
            );
          };
        };
      };
    };

    private func findRejectionReasons(
      userId : Principal,
      challengeIds : [Text],
      getAllUniqueViolatedRules : Text -> [Types.PohRulesViolated],
      getContentStatus : Text -> Types.ContentStatus
    ) : [Text] {
      let rejectedPackageId = retrieveRejectedPackageId(
        userId,
        challengeIds,
        getContentStatus
      );
      switch (rejectedPackageId) {
        case (null) {
          return [];
        };
        case (?id) {
          let violatedRules = getAllUniqueViolatedRules(id);
          return resolveViolatedRulesById(violatedRules);
        };
      };
    };

    // User A
    // 4 years back   3 years back  2 year back
    // rejected        verified       verified  pending

    // User B
    // 4 years back   1 years back
    //  rejected         verified       rejected  rejected

    // Provider A expiry: 1 year
    // Provider B expiry: 2 year
    func findChallengeStatus(
      attempts : Buffer.Buffer<PohTypes.PohChallengesAttemptV1>,
      validForDays : Nat
    ) : (PohTypes.PohChallengeStatus, ?Int, Int, Int) {

      for (i in Iter.revRange(attempts.size() - 1, 0)) {
        let attempt = attempts.get(Helpers.intToNat(i));
        // search for a verified and non expired attempt through all attempts in reverse order
        if (
          attempt.status == #verified and not isChallengeExpired(
            attempt,
            validForDays
          )
        ) {
          return (
            #verified,
            ?attempt.completedOn,
            attempt.createdAt,
            attempt.submittedAt
          );
        };
      };
      // if not found, return the status of last attempt whatsoever it is
      // but check for expiry if the last one is verified
      let lastAttempt = attempts.get(attempts.size() -1);
      if (isChallengeExpired(lastAttempt, validForDays)) {
        return (
          #expired,
          ?lastAttempt.completedOn,
          lastAttempt.createdAt,
          lastAttempt.submittedAt
        );
      };
      return (
        lastAttempt.status,
        ?lastAttempt.completedOn,
        lastAttempt.createdAt,
        lastAttempt.submittedAt
      );
    };

    func isChallengeExpired(
      attempt : PohTypes.PohChallengesAttemptV1,
      validForDays : Nat
    ) : Bool {
      return Helpers.timeNow() - attempt.completedOn >= validForDays * MILLI_SECONDS_DAY and attempt.status == #verified;
    };

    //Pre Step 4 Generate token
    public func pohGenerateUniqueToken(
      providerUserId : Text,
      providerId : Principal
    ) : Text {
      //using token: as salt instead of time here to keep behavior deterministic for us
      let token : Text = Helpers.generateHash(
        "token:" # providerUserId # Principal.toText(providerId) #
        Int.toText(Helpers.timeNow())
      );
      switch (state.token2ProviderAndUserData.get(token)) {
        case (null) {
          // recording the time when the first time token was generated
          let providerUser : PohTypes.PohProviderAndUserData = {
            token = token;
            providerUserId = providerUserId;
            providerId = providerId;
            generatedAt = Helpers.timeNow();
          };
          state.token2ProviderAndUserData.put(token, providerUser);
        };
        case (_)();
      };
      return token;
    };

    public func decodeToken(token : Text) : Result.Result<PohTypes.PohProviderAndUserData, PohTypes.PohError> {
      switch (state.token2ProviderAndUserData.get(token)) {
        case (null) return #err(#invalidToken);
        case (?pUser) {
          #ok(pUser);
        };
      };
    };

    public func associateProviderUserId2ModclubUserId(
      providerId : Principal,
      providerUserId : Text,
      modclubUserId : Principal
    ) : Result.Result<(), PohTypes.PohError> {
      let providerUserId2ModclubUserId = Option.get(
        state.providerUserIdToModclubUserIdByProviderId.get(providerId),
        RelObj.RelObj<Text, Principal>(
          (Text.hash, Principal.hash),
          (Text.equal, Principal.equal)
        )
      );
      let alreadyAssociatedModclubIds = providerUserId2ModclubUserId.get0(
        providerUserId
      );
      if (
        alreadyAssociatedModclubIds.size() != 0 and alreadyAssociatedModclubIds.get(
          0
        ) != modclubUserId
      ) {
        return #err(
          #attemptToAssociateMultipleModclubAccounts(
            alreadyAssociatedModclubIds.get(0)
          )
        );
      };
      providerUserId2ModclubUserId.put(providerUserId, modclubUserId);
      state.providerUserIdToModclubUserIdByProviderId.put(
        providerId,
        providerUserId2ModclubUserId
      );
      return #ok();
    };

    func findModclubId(providerUserId : Text, providerId : Principal) : ?Principal {
      do ? {
        let modclubUserId = state.providerUserIdToModclubUserIdByProviderId.get(
          providerId
        )!.get0(providerUserId);
        if (modclubUserId.size() == 0) {
          return null;
        };
        return ?modclubUserId.get(0);
      };
    };

    func findProviderUserIds(modclubUserId : Principal, providerId : Principal) : [
      Text
    ] {
      var pUserIds : [Text] = [];
      let _ = do ? {
        pUserIds := state.providerUserIdToModclubUserIdByProviderId.get(
          providerId
        )!.get1(modclubUserId);
      };
      return pUserIds;
    };

    func checkIfFirstAssoication(
      modclubUserId : Principal,
      providerUserId : Text,
      providerId : Principal
    ) : Bool {
      var isFirstAssociation = true;
      let _ = do ? {
        let providerUserIds = state.providerUserIdToModclubUserIdByProviderId.get(
          providerId
        )!.get1(modclubUserId);
        if (
          providerUserIds.size() != 0 and providerUserIds.get(0) != providerUserId
        ) {
          isFirstAssociation := false;
        };
      };
      return isFirstAssociation;
    };

    // Step 4 The dApp asks the user to perform POH and presents an iFrame which loads MODCLUB’s POH screens.
    // Modclub UI will ask for all the challenge for a user to show
    public func retrieveChallengesForUser(
      userId : Principal,
      challengeIds : [Text],
      validForDays : Nat,
      forceCreateNewAttempts : Bool
    ) : async Result.Result<[PohTypes.PohChallengesAttemptV1], PohTypes.PohError> {
      switch (state.pohUserChallengeAttempts.get(userId)) {
        case (null) state.pohUserChallengeAttempts.put(
          userId,
          HashMap.HashMap<Text, Buffer.Buffer<PohTypes.PohChallengesAttemptV1>>(
            challengeIds.size(),
            Text.equal,
            Text.hash
          )
        );
        case (_)();
      };

      let challengesCurrent = Buffer.Buffer<PohTypes.PohChallengesAttemptV1>(
        challengeIds.size()
      );

      let _ = do ? {
        for (challengeId in challengeIds.vals()) {
          switch (
            (state.pohUserChallengeAttempts.get(userId))!.get(challengeId)
          ) {
            case (null) {
              (state.pohUserChallengeAttempts.get(userId))!.put(
                challengeId,
                Buffer.Buffer<PohTypes.PohChallengesAttemptV1>(1)
              );
            };
            case (_)();
          };

          let attempts = state.pohUserChallengeAttempts.get(userId)!.get(
            challengeId
          )!;

          if (attempts.size() == 0 or forceCreateNewAttempts == true) {
            let newAttempt = createNewAttempt(
              userId,
              challengeId,
              attempts.size()
            )!;
            state.pohUserChallengeAttempts.get(userId)!.get(challengeId)!.add(
              newAttempt
            );
            challengesCurrent.add(newAttempt);
          } else {
            let lastAttempt = attempts.get(attempts.size() - 1);
            // if last attempt was rejected, auto create a new one.
            if (
              lastAttempt.status == #rejected or isChallengeExpired(
                lastAttempt,
                validForDays
              )
            ) {
              let newAttempt = createNewAttempt(
                userId,
                challengeId,
                attempts.size()
              )!;
              state.pohUserChallengeAttempts.get(userId)!.get(challengeId)!.add(
                newAttempt
              );
            };
            challengesCurrent.add(attempts.get(attempts.size() - 1));
          };
        };
      };
      #ok(challengesCurrent.toArray());
    };

    func createNewAttempt(
      userId : Principal,
      challengeId : Text,
      nextAttemptIndex : Nat
    ) : ?PohTypes.PohChallengesAttemptV1 {
      do ? {
        {
          attemptId = ?Helpers.generateHash(
            Principal.toText(userId) # challengeId # Nat.toText(
              nextAttemptIndex
            )
          );
          challengeId = challengeId;
          userId = userId;
          challengeName = state.pohChallenges.get(challengeId)!.challengeName;
          challengeDescription = state.pohChallenges.get(challengeId)!.challengeDescription;
          challengeType = state.pohChallenges.get(challengeId)!.challengeType;
          status = #notSubmitted;
          contentId = null;
          dataCanisterId = null;
          createdAt = Helpers.timeNow();
          updatedAt = Helpers.timeNow();
          submittedAt = -1;
          completedOn = -1;
          // -1 means not completed
          wordList = do ? {
            switch (state.pohChallenges.get(challengeId)!.challengeType) {
              case (#selfVideo) Helpers.generateRandomList(
                ModClubParam.WORD_SIZE_FOR_VIDEO,
                state.wordList.toArray(),
                Helpers.getRandomFeedGenerator()
              );
              // case(#selfAudio) Helpers.generateRandomList(ModClubParam.WORD_SIZE_FOR_AUDIO, state.wordList.toArray(), Helpers.getRandomFeedGenerator());
              case (#dl) Helpers.generateRandomList(
                ModClubParam.SHAPE_COUNT,
                SHAPE_LIST,
                Helpers.getRandomFeedGenerator()
              );
              case (_)[];
            };
          };
        };
      };
    };

    public func validateChallengeSubmission(
      challengeData : PohTypes.PohChallengeSubmissionRequest,
      userId : Principal
    ) : PohTypes.PohChallengeSubmissionStatus {
      Debug.print(Principal.toText(userId));
      switch (state.pohChallenges.get(challengeData.challengeId)) {
        case (null) return #incorrectChallenge;
        case (?pohChallenge) {
          if (
            pohChallenge.requiredField != #profileFieldBlobs and challengeData.challengeDataBlob == null
          ) {
            return #inputDataMissing;
          };
        };
      };

      switch (state.pohUserChallengeAttempts.get(userId)) {
        case (null) {
          Debug.print("Empty null");
          return #notPendingForSubmission;
        };
        case (?challengeAttempts) {
          switch (challengeAttempts.get(challengeData.challengeId)) {
            case (null) {
              Debug.print("It's a null");
              return #notPendingForSubmission;
            };
            case (?attempts) {
              Debug.print(Nat.toText(attempts.size()));
              if (attempts.size() == 0) {
                return #notPendingForSubmission;
              } else if (attempts.get(attempts.size() -1).status == #pending) {
                return #alreadySubmitted;
              } else if (attempts.get(attempts.size() -1).status == #verified) {
                return #alreadyApproved;
              } else if (attempts.get(attempts.size() -1).status == #rejected) {
                return #alreadyRejected;
              };
              return #ok;
            };
          };
        };
      };
    };

    public func changeChallengePackageStatus(
      packageId : Text,
      status : PohTypes.PohChallengeStatus
    ) : [Text] {
      let buff = Buffer.Buffer<Text>(1);
      switch (state.pohChallengePackages.get(packageId)) {
        case (null)();
        case (?package) {
          for (id in package.challengeIds.vals()) {
            let attemptId = changeChallengeTaskStatus(
              id,
              package.userId,
              status
            );
            buff.add(Option.get(attemptId, ""));
          };
        };
      };
      return buff.toArray();
    };

    // Step 6 MODCLUB mods verify that user data and approve the user. The
    // dApp is then notified that the user has verified their POH.
    public func changeChallengeTaskStatus(
      challengeId : Text,
      userId : Principal,
      status : PohTypes.PohChallengeStatus
    ) : ?Text {
      let _ = do ? {
        var completedOn = -1;
        if (status == #verified or status == #rejected) {
          completedOn := Helpers.timeNow();
        };
        let attempts = state.pohUserChallengeAttempts.get(userId)!.get(
          challengeId
        )!;
        let attempt = attempts.get(attempts.size() - 1);
        let updatedAttempt = {
          attemptId = attempt.attemptId;
          challengeId = attempt.challengeId;
          challengeName = attempt.challengeName;
          challengeDescription = attempt.challengeDescription;
          challengeType = attempt.challengeType;
          userId = attempt.userId;
          status = status;
          // contentId = attempt.contentId;
          dataCanisterId = attempt.dataCanisterId;
          createdAt = attempt.createdAt;
          updatedAt = Helpers.timeNow();
          submittedAt = attempt.submittedAt;
          completedOn = completedOn;
          wordList = attempt.wordList;
        };
        attempts.put(attempts.size() - 1, updatedAttempt);
        return attempt.attemptId;
      };
    };

    public func updateDataCanisterId(
      challengeId : Text,
      userId : Principal,
      dataCanisterId : ?Principal
    ) {
      let _ = do ? {
        let attempts = state.pohUserChallengeAttempts.get(userId)!.get(
          challengeId
        )!;
        let attempt = attempts.get(attempts.size() - 1);
        let updatedAttempt = {
          attemptId = attempt.attemptId;
          challengeId = attempt.challengeId;
          challengeName = attempt.challengeName;
          challengeDescription = attempt.challengeDescription;
          challengeType = attempt.challengeType;
          userId = attempt.userId;
          status = attempt.status;
          // contentId = attempt.contentId;
          dataCanisterId = dataCanisterId;
          createdAt = attempt.createdAt;
          updatedAt = Helpers.timeNow();
          submittedAt = Helpers.timeNow();
          completedOn = attempt.completedOn;
          wordList = attempt.wordList;
        };
        attempts.put(attempts.size() - 1, updatedAttempt);
      };
    };

    public func getAttemptId(challengeId : Text, userId : Principal) : Text {
      var contentId = "";
      let _ = do ? {
        let attempts = state.pohUserChallengeAttempts.get(userId)!.get(
          challengeId
        )!;
        let attempt = attempts.get(attempts.size() - 1);
        contentId := attempt.attemptId!;
      };
      return contentId;
    };

    public func getPohPackageIDForUserList(userId : [Principal]) : [Text] {
      let contenBuff = Buffer.Buffer<Text>(0);
      for (user in userId.vals()) {
        for (packageId in state.userToPohChallengePackageId.get0(user).vals()) {
          contenBuff.add(packageId);
        };
      };
      return contenBuff.toArray();
    };

    public func getAllPohIDsForDateRange(startDate : Int, endDate : Int) : [
      Text
    ] {
      let packageIdForDateRangeBuf = Buffer.Buffer<Text>(0);
      for ((packageId, package) in state.pohChallengePackages.entries()) {
        if (package.createdAt > startDate and package.createdAt < endDate) {
          packageIdForDateRangeBuf.add(packageId);
        };
      };
      return packageIdForDateRangeBuf.toArray();
    };

    private func sortByComplexChallengeFirst(
      a : (Principal, [Text]),
      b : (Principal, [Text])
    ) : Order.Order {
      if (a.1. size() > b.1. size()) {
        return #less;
      } else if (a.1. size() < b.1. size()) {
        return #greater;
      };
      #equal;
    };

    private func sortByCreatedDateDesc(packageIdA : Text, packageIdB : Text) : Order.Order {
      switch (state.pohChallengePackages.get(packageIdA)) {
        case (null) {
          return #greater;
        };
        case (?packageA) {
          switch (state.pohChallengePackages.get(packageIdB)) {
            case (null) {
              return #less;
            };
            case (?packageB) {
              if (packageA.createdAt > packageB.createdAt) {
                return #greater;
              } else if (packageA.createdAt < packageB.createdAt) {
                return #less;
              };
              return #equal;
            };
          };
        };
      };
    };

    public func createChallengePackageForVoting(
      userId : Principal,
      getContentStatus : Text -> Types.ContentStatus,
      globalState : GlobalState.State,
      canistergeekLogger : Canistergeek.Logger
    ) : [PohTypes.PohChallengePackage] {

      let challengeIdByProviderBuff = Buffer.Buffer<(Principal, [Text])>(1);
      for (
        (pid, challengeIds) in globalState.provider2PohChallengeIds.entries()
      ) {
        if (findProviderUserIds(userId, pid).size() != 0) {
          challengeIdByProviderBuff.add((pid, challengeIds.toArray()));
        };
      };
      var challengeIdByProviderArr = challengeIdByProviderBuff.toArray();
      // sort to get provider with more challenges configured as first so that package for them
      // can cover other providers with small list of challenges
      challengeIdByProviderArr := Array.sort(
        challengeIdByProviderArr,
        sortByComplexChallengeFirst
      );
      Helpers.logMessage(canistergeekLogger, "Creating packages", #info);

      let packagesCreated = Buffer.Buffer<PohTypes.PohChallengePackage>(1);
      // Check if a package needs to be created for a provider
      for ((pid, challengeIds) in challengeIdByProviderArr.vals()) {
        Helpers.logMessage(
          canistergeekLogger,
          "provider: " # Principal.toText(pid) # " challengeIds: " # DownloadUtil.joinArr(
            challengeIds
          ),
          #info
        );

        // Get all challenges submitted, but not approved. If even one of them is rejected or not submitted, fetch None( blank array[]).
        let potentialChallengeIdsForPackage = getChallengeIdsToBeVotedForUser(
          userId,
          challengeIds
        );
        Helpers.logMessage(
          canistergeekLogger,
          "provider: " # Principal.toText(pid) # "  potentialChallengeIdsForPackage: " # DownloadUtil.joinArr(
            potentialChallengeIdsForPackage
          ),
          #info
        );

        // This needs to go for voting now but first check if these are already sent for voting in any
        // other package. If yes, remove them from double voting.
        let potentialChallengeIdsForPackageMap = HashMap.HashMap<Text, Text>(
          1,
          Text.equal,
          Text.hash
        );
        for (id in potentialChallengeIdsForPackage.vals()) {
          potentialChallengeIdsForPackageMap.put(id, id);
        };
        if (potentialChallengeIdsForPackageMap.size() > 0) {
          for (
            packageId in state.userToPohChallengePackageId.get0(userId).vals()
          ) {
            // if package is already voted, then skip checking it and go to new package
            if (getContentStatus(packageId) == #new) {
              switch (state.pohChallengePackages.get(packageId)) {
                case (null)();
                case (?package) {
                  for (cIdInPackage in package.challengeIds.vals()) {
                    potentialChallengeIdsForPackageMap.delete(cIdInPackage);
                  };
                };
              };
            };
          };
        };

        Helpers.logMessage(
          canistergeekLogger,
          "provider: " # Principal.toText(pid) # "  potentialChallengeIdsForPackage after removing already submitted challenge: " # DownloadUtil.joinArr(
            Iter.toArray(potentialChallengeIdsForPackageMap.keys())
          ),
          #info
        );
        // Now check again if we are left something for voting.
        if (potentialChallengeIdsForPackageMap.size() > 0) {

          Debug.print("Creating Package");
          let pohPackage = {
            id = Helpers.generateId(userId, "poh-content", globalState);
            challengeIds = Iter.toArray(
              potentialChallengeIdsForPackageMap.keys()
            );
            userId = userId;
            contentType = #pohPackage;
            title = ?("POH Content for User: " # Principal.toText(userId));
            createdAt = Helpers.timeNow();
            updatedAt = Helpers.timeNow();
          };
          Helpers.logMessage(
            canistergeekLogger,
            "Creating package finally: " # pohPackage.id # " for userId: " # Principal.toText(
              userId
            ),
            #info
          );
          state.pohChallengePackages.put(pohPackage.id, pohPackage);
          state.userToPohChallengePackageId.put(userId, pohPackage.id);
          packagesCreated.add(pohPackage);
        };
      };
      return packagesCreated.toArray();
    };

    func getChallengeIdsToBeVotedForUser(
      userId : Principal,
      providerChallengeIds : [Text]
    ) : [Text] {
      let challengeIdsForPackage = Buffer.Buffer<Text>(1);
      var createPackage = true;
      let _ = do ? {
        let challengeAttempts = state.pohUserChallengeAttempts.get(userId)!;
        label l for (id in providerChallengeIds.vals()) {
          let attempts = challengeAttempts.get(id)!;
          if (
            attempts.size() == 0 or attempts.get(attempts.size() - 1).status == #notSubmitted or attempts.get(
              attempts.size() - 1
            ).status == #rejected or attempts.get(attempts.size() - 1).status == #expired
          ) {
            createPackage := false;
            break l;
          };
          if (attempts.get(attempts.size() - 1).status == #pending) {
            challengeIdsForPackage.add(id);
          };
        };
      };
      if (not createPackage) {
        return [];
      };
      return challengeIdsForPackage.toArray();
    };

    public func getPohTasks(taskIds : [Text]) : [PohTypes.PohTaskDataWrapper] {
      let pohTasks = Buffer.Buffer<PohTypes.PohTaskDataWrapper>(taskIds.size());

      for (id in taskIds.vals()) {
        let taskData = Buffer.Buffer<PohTypes.PohTaskData>(taskIds.size());
        switch (state.pohChallengePackages.get(id)) {
          case (null)();
          case (?package) {
            for (challengeId in package.challengeIds.vals()) {
              let attempt = do ? {
                let attempts = state.pohUserChallengeAttempts.get(
                  package.userId
                )!.get(challengeId)!;
                attempts.get(attempts.size() - 1);
              };
              let challenge = state.pohChallenges.get(challengeId);

              switch (attempt) {
                case (null)();
                case (?att) {
                  let pohTaskData = {
                    challengeId = challengeId;
                    challengeType = att.challengeType;
                    userId = package.userId;
                    status = att.status;
                    contentId = att.attemptId;
                    //attemptId is contentId for a challenge
                    dataCanisterId = att.dataCanisterId;
                    wordList = att.wordList;
                    allowedViolationRules = switch (challenge) {
                      case (?c) {
                        c.allowedViolationRules;
                      };
                      case (null) { [] };
                    };
                    createdAt = att.createdAt;
                    updatedAt = att.updatedAt;
                    submittedAt = att.submittedAt;
                    completedOn = att.completedOn;
                  };
                  taskData.add(pohTaskData);
                };
              };
            };
            pohTasks.add(
              {
                packageId = id;
                pohTaskData = taskData.toArray();
                createdAt = package.createdAt;
                updatedAt = package.updatedAt;
              }
            );
          };
        };

      };
      return pohTasks.toArray();
    };

    public func retrieveRejectedPackageId(
      userId : Principal,
      challengeIds : [Text],
      getContentStatus : Text -> Types.ContentStatus
    ) : ?Text {
      let packageIds = state.userToPohChallengePackageId.get0(userId);
      if (packageIds.size() == 0) {
        return null;
      };
      for (i in Iter.range(packageIds.size() - 1, 0)) {
        switch (state.pohChallengePackages.get(packageIds.get(i))) {
          case (null)();
          case (?package) {
            if (
              package.challengeIds.size() == challengeIds.size() and getContentStatus(
                package.id
              ) == #rejected
            ) {
              let cIdsMap = HashMap.HashMap<Text, Text>(
                1,
                Text.equal,
                Text.hash
              );
              for (id in package.challengeIds.vals()) {
                cIdsMap.put(id, id);
              };
              var allMatched = true;
              label l for (id in challengeIds.vals()) {
                switch (cIdsMap.get(id)) {
                  case (null) {
                    allMatched := false;
                    break l;
                  };
                  case (_)();
                };
              };
              // if package exists with same challenge
              if (allMatched) {
                return ?package.id;
              };
            };
          };
        };
      };
      return null;
    };

    public func resolveViolatedRulesById(
      violatedRules : [Types.PohRulesViolated]
    ) : [Text] {
      let buff = Buffer.Buffer<Text>(violatedRules.size());
      for (vRule in violatedRules.vals()) {
        switch (state.pohChallenges.get(vRule.challengeId)) {
          case (null)();
          case (?challenge) {
            label l for (allowedVRule in challenge.allowedViolationRules.vals()) {
              if (allowedVRule.ruleId == vRule.ruleId) {
                buff.add(allowedVRule.ruleDesc);
                break l;
              };
            };
          };
        };
      };
      return buff.toArray();
    };

    public func sortPackagesByCreatedDate(items : Buffer.Buffer<Text>) : [Text] {
      Arrays.sort(items.toArray(), sortByCreatedDateDesc);
    };

    public func getPohChallengePackage(packageId : Text) : ?PohTypes.PohChallengePackage {
      return state.pohChallengePackages.get(packageId);
    };

    public func validateRules(violatedRules : [Types.PohRulesViolated]) : Bool {
      let validRules : ?Bool = do ? {
        for (vRule in violatedRules.vals()) {
          let challenge = state.pohChallenges.get(vRule.challengeId)!;
          var found = false;
          for (aVRule in challenge.allowedViolationRules.vals()) {
            if (aVRule.ruleId == vRule.ruleId) {
              found := true;
            };
          };
          if (found == false) {
            return false;
          };
        };
        return true;
      };
      return Option.get(validRules, false);
    };

    public func getProviderPohConfiguration(
      providerId : Principal,
      state : GlobalState.State
    ) : Result.Result<PohTypes.PohConfigurationForProvider, PohTypes.PohError> {
      let challengeIds = Option.get(
        state.provider2PohChallengeIds.get(providerId),
        Buffer.Buffer<Text>(0)
      );
      let expiry = Option.get(state.provider2PohExpiry.get(providerId), 0);
      if (expiry == 0 or challengeIds.size() == 0) {
        return #err(#pohNotConfiguredForProvider);
      };
      return #ok(
        {
          challengeIds = challengeIds.toArray();
          expiry = expiry;
        }
      );
    };

    public func registerIPWithProviderUser(providerUserId : Text, ip : Text, providerId : Principal) : Bool {

      let providerUser2Ip = Option.get(provider2ProviderUserId2Ip.get(providerId), TrieMap.TrieMap<Text, Text>(Text.equal, Text.hash));
      switch (providerUser2Ip.get(providerUserId)) {
        case (null) {
          // If there is no association for a token to ip, then add it.
          providerUser2Ip.put(providerUserId, ip);
          provider2ProviderUserId2Ip.put(providerId, providerUser2Ip);
          return true;
        };
        case (?storedIp) {
          // If there is already an association for a token to ip, then check it's the same.
          if (storedIp == ip) {
            return true;
          };
          // else
          return false;
        };
      };
    };

    public func registerIPWithWallet(providerUserId : Text, providerId : Principal, modclubUserId : Principal) : Bool {
      var done = false;

      let _ = do ? {
        let storedIpForProviderUser = provider2ProviderUserId2Ip.get(providerId)!.get(providerUserId)!;
        let ip2ModclubId = Option.get(provider2Ip2Wallet.get(providerId), RelObj.RelObj<Text, Principal>((Text.hash, Principal.hash), (Text.equal, Principal.equal)));
        let alreadyAssociatedWallets = ip2ModclubId.get0(storedIpForProviderUser);
        if (alreadyAssociatedWallets.size() == 0) {
          ip2ModclubId.put(storedIpForProviderUser, modclubUserId);
          provider2Ip2Wallet.put(providerId, ip2ModclubId);
          done := true;
        } else if (alreadyAssociatedWallets.size() == 1) {
          if (alreadyAssociatedWallets.get(0) == modclubUserId) {
            done := true;
          } else {
            done := false;
          };
        };
      };
      return done;
    };

    public func populateChallenges() : () {
      let allowedViolationRules2 = Buffer.Buffer<PohTypes.ViolatedRules>(3);
      allowedViolationRules2.add(
        {
          ruleId = "1";
          ruleDesc = "The person face is well lit";
        }
      );
      allowedViolationRules2.add(
        {
          ruleId = "2";
          ruleDesc = "You can clearly see the persons face";
        }
      );
      allowedViolationRules2.add(
        {
          ruleId = "3";
          ruleDesc = "The person is not wearing a mask or hiding their face";
        }
      );
      state.pohChallenges.put(
        CHALLENGE_PROFILE_PIC_ID,
        {
          challengeId = CHALLENGE_PROFILE_PIC_ID;
          challengeName = "Please provide your picture";
          challengeDescription = "Please provide your picture";
          requiredField = #imageBlob;
          // assuming there will be no transitive dependencies. else graph needs to be used
          dependentChallengeId = null;
          challengeType = #selfPic;
          allowedViolationRules = allowedViolationRules2.toArray();
          createdAt = Helpers.timeNow();
          updatedAt = Helpers.timeNow();
        }
      );

      let allowedViolationRules3 = Buffer.Buffer<PohTypes.ViolatedRules>(4);
      allowedViolationRules3.add(
        {
          ruleId = "1";
          ruleDesc = "The person in the video is the same person in the profile picture";
        }
      );
      allowedViolationRules3.add(
        {
          ruleId = "2";
          ruleDesc = "The person in the video says all the words in order in the box above";
        }
      );
      allowedViolationRules3.add(
        {
          ruleId = "3";
          ruleDesc = "The person in the video appears to be a real person and not AI generated";
        }
      );
      state.pohChallenges.put(
        CHALLENGE_USER_VIDEO_ID,
        {
          challengeId = CHALLENGE_USER_VIDEO_ID;
          challengeName = "Please record your video saying these words";
          challengeDescription = "Please record your video saying these words";
          requiredField = #videoBlob;
          // assuming there will be no transitive dependencies. else graph needs to be used
          dependentChallengeId = null;
          challengeType = #selfVideo;
          allowedViolationRules = allowedViolationRules3.toArray();
          createdAt = Helpers.timeNow();
          updatedAt = Helpers.timeNow();
        }
      );

      let allowedViolationRules4 = Buffer.Buffer<PohTypes.ViolatedRules>(4);
      allowedViolationRules4.add(
        {
          ruleId = "1";
          ruleDesc = "The person in the audio says all the words in order in the box above";
        }
      );
      allowedViolationRules4.add(
        {
          ruleId = "2";
          ruleDesc = "The person in the audio appears to be sound like a real person and not  an AI-generated voice";
        }
      );
      state.pohChallenges.put(
        CHALLENGE_USER_AUDIO_ID,
        {
          challengeId = CHALLENGE_USER_AUDIO_ID;
          challengeName = "Please record your audio reading these words";
          challengeDescription = "Please record your audio reading these words";
          requiredField = #videoBlob;
          // TODO: Switch to just blob or audio blob
          // assuming there will be no transitive dependencies. else graph needs to be used
          dependentChallengeId = null;
          challengeType = #selfVideo;
          allowedViolationRules = allowedViolationRules4.toArray();
          createdAt = Helpers.timeNow();
          updatedAt = Helpers.timeNow();
        }
      );

      let challengeDrawingRules : [PohTypes.ViolatedRules] = [
        {
          ruleId = "1";
          ruleDesc = "All the shapes are present in the drawing.";
        },
        {
          ruleId = "2";
          ruleDesc = "The shapes were drawn on a piece of Paper. This has to be a physical piece of paper and not a digital drawing.";
        }
      ];
      state.pohChallenges.put(
        CHALLENGE_DRAWING_ID,
        {
          challengeId = CHALLENGE_DRAWING_ID;
          challengeName = "Draw the unique shapes";
          challengeDescription = "Draw the following shapes on a piece of paper. Take a photo of the paper.";
          requiredField = #imageBlob;
          // assuming there will be no transitive dependencies. else graph needs to be used
          dependentChallengeId = null;
          challengeType = #dl;
          allowedViolationRules = challengeDrawingRules;
          createdAt = Helpers.timeNow();
          updatedAt = Helpers.timeNow();
        }
      );

      state.wordList.clear();
      state.wordList.add("Cute");
      state.wordList.add("Free");
      state.wordList.add("Pair");
      state.wordList.add("Jolt");
      state.wordList.add("Safe");
      state.wordList.add("Lack");
      state.wordList.add("Live");
      state.wordList.add("Seal");
      state.wordList.add("Need");
      state.wordList.add("Crop");
      state.wordList.add("Five");
      state.wordList.add("Dull");
      state.wordList.add("Dead");
      state.wordList.add("Tile");
      state.wordList.add("Meet");
      state.wordList.add("Till");
      state.wordList.add("Form");
      state.wordList.add("Very");
      state.wordList.add("Blue");
      state.wordList.add("City");
      state.wordList.add("Neat");
      state.wordList.add("Stun");
      state.wordList.add("Rank");
      state.wordList.add("Cove");
      state.wordList.add("Bell");
      state.wordList.add("Fail");
      state.wordList.add("Rose");
      state.wordList.add("Rook");
      state.wordList.add("Disk");
      state.wordList.add("Sing");
      state.wordList.add("List");
      state.wordList.add("Fear");
      state.wordList.add("Shop");
      state.wordList.add("Okra");
      state.wordList.add("Side");
      state.wordList.add("Cask");
      state.wordList.add("Axie");
      state.wordList.add("Stag");
      state.wordList.add("Cake");
      state.wordList.add("Bold");
      state.wordList.add("Desk");
      state.wordList.add("Stub");
      state.wordList.add("Soar");
      state.wordList.add("Pole");
      state.wordList.add("Halo");
      state.wordList.add("Plow");
      state.wordList.add("Team");
      state.wordList.add("Lace");
      state.wordList.add("Gaze");
      state.wordList.add("Kill");
    };

    public func issueCallbackToProviders(
      modclubUserId : Principal,
      globalState : GlobalState.State,
      getAllUniqueViolatedRules : Text -> [Types.PohRulesViolated],
      getContentStatus : Text -> Types.ContentStatus,
      canistergeekLogger : Canistergeek.Logger
    ) : async () {
      for ((providerId, callbackSubs) in state.providersCallback.entries()) {
        makeCallbackEntryForProvider(providerId);
        Helpers.logMessage(
          canistergeekLogger,
          "Attempting callback for provider: " # Principal.toText(providerId),
          #info
        );
        let _ = do ? {
          let callbackDataByUserId = pohCallbackByProvider.get(providerId)!;
          let pUserIds = findProviderUserIds(modclubUserId, providerId);
          for (pUserId in pUserIds.vals()) {
            makeCallbackEntryForProviderUser(pUserId, providerId);
            let callbackData = callbackDataByUserId.get(pUserId)!;
            Helpers.logMessage(
              canistergeekLogger,
              "Finding providerUserId for provider: " # Principal.toText(
                providerId
              ),
              #info
            );
            switch (getProviderPohConfiguration(providerId, globalState)) {
              case (#ok(config)) {
                let resp = formPohResponse(
                  modclubUserId,
                  config.challengeIds,
                  pUserId,
                  providerId,
                  config.expiry,
                  getAllUniqueViolatedRules,
                  getContentStatus
                );
                if (
                  resp.status == #verified or resp.status == #rejected or resp.status == #pending
                ) {
                  let statusText = statusToString(resp.status);
                  switch (callbackData.get(statusText)) {
                    case (null) {
                      Helpers.logMessage(
                        canistergeekLogger,
                        "issueCallbackToProviders - callback:  " # statusToString(
                          resp.status
                        ) # " submittedAt: " # Int.toText(
                          Option.get(resp.submittedAt, -1)
                        ) # " requestedAt: " # Int.toText(
                          Option.get(resp.requestedAt, -1)
                        ) # " completedAt: " # Int.toText(
                          Option.get(resp.completedAt, -1)
                        ) # "isFirstAssociation: " # Bool.toText(
                          resp.isFirstAssociation
                        ) # "providerUserId: " # resp.providerUserId,
                        #info
                      );
                      callbackSubs.callback(resp);
                      // Saving that user has queried the approved status, so no callback
                      callbackData.put(statusText, Helpers.timeNow());
                    };
                    case (_)();
                  };

                };
              };
              case (_)();
            };
          };
        };
      };
    };

    public func statusToString(status : PohTypes.PohVerificationStatus) : Text {
      switch (status) {
        case (#verified) {
          "verified";
        };
        case (#rejected) {
          "rejected";
        };
        case (#pending) {
          "pending";
        };
        case (#expired) {
          "expired";
        };
        case (#notSubmitted) {
          "notSubmitted";
        };
        case (#startPoh) {
          "startPoh";
        };
      };
    };

    public func subscribe(
      providerId : Principal,
      sub : PohTypes.SubscribePohMessage
    ) {
      state.providersCallback.put(providerId, sub);
    };

    public func getPohCallback(providerId : Principal) : Result.Result<PohTypes.SubscribePohMessage, PohTypes.PohError> {
      switch (state.providersCallback.get(providerId)) {
        case (?sub) {
          return #ok(sub);
        };
        case (null) {
          return #err(#pohCallbackNotRegistered);
        };
      };
    };

    public func getStableStateV2() : (
      PohStateV2.PohStableState,
      [(Principal, [(Text, [(Text, Int)])])],
      [(Principal, [(Text, Text)])],
      [(Principal, Rel.RelShared<Text, Principal>)]
    ) {

      let pohCallbackDataByProviderStableStateBuff = Buffer.Buffer<(Principal, [(Text, [(Text, Int)])])>(1);
      for ((providerId, callBackByUser) in pohCallbackByProvider.entries()) {
        let callBackByUserBuff = Buffer.Buffer<(Text, [(Text, Int)])>(1);
        for ((userId, callbackData) in callBackByUser.entries()) {
          let callbackBuff = Buffer.Buffer<(Text, Int)>(1);
          for ((status, time) in callbackData.entries()) {
            callbackBuff.add((status, time));
          };
          callBackByUserBuff.add(userId, callbackBuff.toArray());
        };
        pohCallbackDataByProviderStableStateBuff.add(providerId, callBackByUserBuff.toArray());
      };

      let provider2ProviderUserId2IpBuff = Buffer.Buffer<(Principal, [(Text, Text)])>(1);
      for ((providerId, providerUserId2Ip) in provider2ProviderUserId2Ip.entries()) {
        let providerUserId2IpBuff = Buffer.Buffer<(Text, Text)>(1);
        for ((pUserId, ip) in providerUserId2Ip.entries()) {
          providerUserId2IpBuff.add(pUserId, ip);
        };
        provider2ProviderUserId2IpBuff.add(providerId, providerUserId2IpBuff.toArray());
      };

      let provider2Ip2WalletBuff = Buffer.Buffer<(Principal, Rel.RelShared<Text, Principal>)>(1);
      for ((providerId, ip2Wallets) in provider2Ip2Wallet.entries()) {
        provider2Ip2WalletBuff.add((providerId, Rel.share(ip2Wallets.getRel())));
      };

      return (
        PohStateV2.getStableState(state),
        pohCallbackDataByProviderStableStateBuff.toArray(),
        provider2ProviderUserId2IpBuff.toArray(),
        provider2Ip2WalletBuff.toArray()
      );
    };

    public func downloadSupport(varName : Text, start : Nat, end : Nat) : [[Text]] {
      DownloadSupport.download(
        state,
        pohCallbackByProvider,
        varName,
        start,
        end
      );
    };

    // Delete this function
    public func migrateV1ToV2(
      pohStableStateV1 : PohStateV1.PohStableState,
      pohStableStateV2 : PohStateV2.PohStableState,
      modclubCanisterId : Principal
    ) : PohStateV2.PohStableState {
      let token2ProviderAndUserDataBuff = Buffer.Buffer<(Text, PohTypes.PohProviderAndUserData)>(
        1
      );
      for (
        (token, userProviderData) in pohStableStateV1.pohProviderUserData.vals()
      ) {
        token2ProviderAndUserDataBuff.add((
          token,
          {
            token = userProviderData.token;
            providerUserId = Principal.toText(userProviderData.providerUserId);
            providerId = userProviderData.providerUserId;
            generatedAt = Helpers.timeNow();
          }
        ));
      };

      let relObj = RelObj.RelObj<Text, Principal>(
        (Text.hash, Principal.hash),
        (Text.equal, Principal.equal)
      );
      let providerUserIdToModclubUserIdByProviderIdBuff = Buffer.Buffer<(Principal, Rel.RelShared<Text, Principal>)>(
        1
      );
      for ((pUserId, mUserId) in pohStableStateV1.providerToModclubUser.vals()) {
        relObj.put(Principal.toText(pUserId), mUserId);
      };
      providerUserIdToModclubUserIdByProviderIdBuff.add((modclubCanisterId, Rel.share(relObj.getRel())));

      let pohUserChallengeAttemptBuff = Buffer.Buffer<(Principal, [(Text, [PohTypes.PohChallengesAttemptV1])])>(
        1
      );

      for (
        (userId, attemptByChallengeId) in pohStableStateV1.pohUserChallengeAttempts.vals()
      ) {
        let newAttemptByChallengeIdBuff = Buffer.Buffer<(Text, [PohTypes.PohChallengesAttemptV1])>(
          1
        );

        for ((challengeId, oldAttempts) in attemptByChallengeId.vals()) {
          let newAttemptBuff = Buffer.Buffer<PohTypes.PohChallengesAttemptV1>(1);
          for (oldAttempt in oldAttempts.vals()) {
            newAttemptBuff.add(
              {
                attemptId = oldAttempt.attemptId;
                challengeId = oldAttempt.challengeId;
                challengeName = oldAttempt.challengeName;
                challengeDescription = oldAttempt.challengeDescription;
                challengeType = oldAttempt.challengeType;
                userId = oldAttempt.userId;
                status = oldAttempt.status;
                createdAt = oldAttempt.createdAt;
                //setting new submitted field as last updated field coz of lack of data
                submittedAt = oldAttempt.updatedAt;
                updatedAt = oldAttempt.updatedAt;
                completedOn = oldAttempt.completedOn;
                dataCanisterId = oldAttempt.dataCanisterId;
                wordList = oldAttempt.wordList;
              }
            );
          };

          newAttemptByChallengeIdBuff.add((challengeId, newAttemptBuff.toArray()));
        };
        pohUserChallengeAttemptBuff.add((userId, newAttemptByChallengeIdBuff.toArray()));
      };

      return {
        pohChallenges = Array.append(
          pohStableStateV1.pohChallenges,
          pohStableStateV2.pohChallenges
        );
        pohUserChallengeAttempts = pohUserChallengeAttemptBuff.toArray();
        token2ProviderAndUserData = token2ProviderAndUserDataBuff.toArray();
        providerUserIdToModclubUserIdByProviderId = providerUserIdToModclubUserIdByProviderIdBuff.toArray();
        pohChallengePackages = Array.append(
          pohStableStateV1.pohChallengePackages,
          pohStableStateV2.pohChallengePackages
        );
        userToPohChallengePackageId = pohStableStateV1.userToPohChallengePackageId;
        wordList = Array.append(
          pohStableStateV1.wordList,
          pohStableStateV2.wordList
        );
        providersCallback = pohStableStateV2.providersCallback;
        callbackIssuedByProvider = [];
      };
    };
    public func getPOHState() : PohStateV2.PohState {
      return state;
    };
  };
};
