export const idlFactory = ({ IDL }) => {
  const ProviderError = IDL.Variant({
    'ProviderAdminIsAlreadyRegistered' : IDL.Null,
    'InvalidContentType' : IDL.Null,
    'NotFound' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'RequiresWhitelisting' : IDL.Null,
    'InvalidContentStatus' : IDL.Null,
    'InvalidProvider' : IDL.Null,
    'ProviderIsRegistered' : IDL.Null,
  });
  const ProviderResult = IDL.Variant({
    'ok' : IDL.Null,
    'err' : ProviderError,
  });
  const Timestamp = IDL.Int;
  const AirdropUser = IDL.Record({
    'id' : IDL.Principal,
    'createdAt' : Timestamp,
  });
  const ContentStatus = IDL.Variant({
    'new' : IDL.Null,
    'approved' : IDL.Null,
    'rejected' : IDL.Null,
  });
  const ContentType = IDL.Variant({
    'imageBlob' : IDL.Null,
    'text' : IDL.Null,
    'htmlContent' : IDL.Null,
    'imageUrl' : IDL.Null,
    'multiText' : IDL.Null,
  });
  const VoteId = IDL.Text;
  const Decision = IDL.Variant({
    'approved' : IDL.Null,
    'rejected' : IDL.Null,
  });
  const UserId = IDL.Principal;
  const RuleId = IDL.Text;
  const Vote = IDL.Record({
    'id' : VoteId,
    'contentId' : IDL.Text,
    'decision' : Decision,
    'userId' : UserId,
    'createdAt' : Timestamp,
    'violatedRules' : IDL.Opt(IDL.Vec(RuleId)),
  });
  const ProviderId = IDL.Principal;
  const Activity = IDL.Record({
    'status' : ContentStatus,
    'reward' : IDL.Float64,
    'title' : IDL.Opt(IDL.Text),
    'voteCount' : IDL.Nat,
    'contentType' : ContentType,
    'rewardRelease' : Timestamp,
    'minVotes' : IDL.Nat,
    'createdAt' : Timestamp,
    'vote' : Vote,
    'minStake' : IDL.Nat,
    'updatedAt' : Timestamp,
    'providerName' : IDL.Text,
    'providerId' : ProviderId,
  });
  const Result_3 = IDL.Variant({
    'ok' : IDL.Vec(IDL.Principal),
    'err' : IDL.Text,
  });
  const ContentId = IDL.Text;
  const Image = IDL.Record({
    'imageType' : IDL.Text,
    'data' : IDL.Vec(IDL.Nat8),
  });
  const ContentPlus = IDL.Record({
    'id' : ContentId,
    'status' : ContentStatus,
    'title' : IDL.Opt(IDL.Text),
    'voteCount' : IDL.Nat,
    'contentType' : ContentType,
    'minVotes' : IDL.Nat,
    'createdAt' : Timestamp,
    'text' : IDL.Opt(IDL.Text),
    'sourceId' : IDL.Text,
    'minStake' : IDL.Nat,
    'updatedAt' : Timestamp,
    'providerName' : IDL.Text,
    'image' : IDL.Opt(Image),
    'hasVoted' : IDL.Opt(IDL.Bool),
    'providerId' : IDL.Principal,
  });
  const Holdings = IDL.Record({
    'pendingRewards' : IDL.Int,
    'stake' : IDL.Int,
    'wallet' : IDL.Int,
    'userPoints' : IDL.Int,
  });
  const Role = IDL.Variant({
    'admin' : IDL.Null,
    'moderator' : IDL.Null,
    'owner' : IDL.Null,
  });
  const Profile = IDL.Record({
    'id' : UserId,
    'pic' : IDL.Opt(Image),
    'userName' : IDL.Text,
    'createdAt' : Timestamp,
    'role' : Role,
    'email' : IDL.Text,
    'updatedAt' : Timestamp,
  });
  const GetLogMessagesFilter = IDL.Record({
    'analyzeCount' : IDL.Nat32,
    'messageRegex' : IDL.Opt(IDL.Text),
    'messageContains' : IDL.Opt(IDL.Text),
  });
  const Nanos = IDL.Nat64;
  const GetLogMessagesParameters = IDL.Record({
    'count' : IDL.Nat32,
    'filter' : IDL.Opt(GetLogMessagesFilter),
    'fromTimeNanos' : IDL.Opt(Nanos),
  });
  const GetLatestLogMessagesParameters = IDL.Record({
    'upToTimeNanos' : IDL.Opt(Nanos),
    'count' : IDL.Nat32,
    'filter' : IDL.Opt(GetLogMessagesFilter),
  });
  const CanisterLogRequest = IDL.Variant({
    'getMessagesInfo' : IDL.Null,
    'getMessages' : GetLogMessagesParameters,
    'getLatestMessages' : GetLatestLogMessagesParameters,
  });
  const CanisterLogFeature = IDL.Variant({
    'filterMessageByContains' : IDL.Null,
    'filterMessageByRegex' : IDL.Null,
  });
  const CanisterLogMessagesInfo = IDL.Record({
    'features' : IDL.Vec(IDL.Opt(CanisterLogFeature)),
    'lastTimeNanos' : IDL.Opt(Nanos),
    'count' : IDL.Nat32,
    'firstTimeNanos' : IDL.Opt(Nanos),
  });
  const LogMessagesData = IDL.Record({
    'timeNanos' : Nanos,
    'message' : IDL.Text,
  });
  const CanisterLogMessages = IDL.Record({
    'data' : IDL.Vec(LogMessagesData),
    'lastAnalyzedMessageTimeNanos' : IDL.Opt(Nanos),
  });
  const CanisterLogResponse = IDL.Variant({
    'messagesInfo' : CanisterLogMessagesInfo,
    'messages' : CanisterLogMessages,
  });
  const MetricsGranularity = IDL.Variant({
    'hourly' : IDL.Null,
    'daily' : IDL.Null,
  });
  const GetMetricsParameters = IDL.Record({
    'dateToMillis' : IDL.Nat,
    'granularity' : MetricsGranularity,
    'dateFromMillis' : IDL.Nat,
  });
  const UpdateCallsAggregatedData = IDL.Vec(IDL.Nat64);
  const CanisterHeapMemoryAggregatedData = IDL.Vec(IDL.Nat64);
  const CanisterCyclesAggregatedData = IDL.Vec(IDL.Nat64);
  const CanisterMemoryAggregatedData = IDL.Vec(IDL.Nat64);
  const HourlyMetricsData = IDL.Record({
    'updateCalls' : UpdateCallsAggregatedData,
    'canisterHeapMemorySize' : CanisterHeapMemoryAggregatedData,
    'canisterCycles' : CanisterCyclesAggregatedData,
    'canisterMemorySize' : CanisterMemoryAggregatedData,
    'timeMillis' : IDL.Int,
  });
  const NumericEntity = IDL.Record({
    'avg' : IDL.Nat64,
    'max' : IDL.Nat64,
    'min' : IDL.Nat64,
    'first' : IDL.Nat64,
    'last' : IDL.Nat64,
  });
  const DailyMetricsData = IDL.Record({
    'updateCalls' : IDL.Nat64,
    'canisterHeapMemorySize' : NumericEntity,
    'canisterCycles' : NumericEntity,
    'canisterMemorySize' : NumericEntity,
    'timeMillis' : IDL.Int,
  });
  const CanisterMetricsData = IDL.Variant({
    'hourly' : IDL.Vec(HourlyMetricsData),
    'daily' : IDL.Vec(DailyMetricsData),
  });
  const CanisterMetrics = IDL.Record({ 'data' : CanisterMetricsData });
  const ModeratorLeaderboard = IDL.Record({
    'id' : UserId,
    'completedVoteCount' : IDL.Int,
    'userName' : IDL.Text,
    'rewardsEarned' : IDL.Int,
    'lastVoted' : IDL.Opt(Timestamp),
    'performance' : IDL.Float64,
  });
  const PohChallengeStatus = IDL.Variant({
    'notSubmitted' : IDL.Null,
    'verified' : IDL.Null,
    'expired' : IDL.Null,
    'pending' : IDL.Null,
    'rejected' : IDL.Null,
  });
  const PohChallengeType = IDL.Variant({
    'dl' : IDL.Null,
    'ssn' : IDL.Null,
    'userName' : IDL.Null,
    'fullName' : IDL.Null,
    'email' : IDL.Null,
    'selfVideo' : IDL.Null,
    'selfPic' : IDL.Null,
  });
  const PohChallengesAttempt = IDL.Record({
    'dataCanisterId' : IDL.Opt(IDL.Principal),
    'status' : PohChallengeStatus,
    'completedOn' : IDL.Int,
    'attemptId' : IDL.Opt(IDL.Text),
    'userId' : IDL.Principal,
    'createdAt' : IDL.Int,
    'updatedAt' : IDL.Int,
    'challengeId' : IDL.Text,
    'challengeDescription' : IDL.Text,
    'challengeName' : IDL.Text,
    'challengeType' : PohChallengeType,
    'wordList' : IDL.Opt(IDL.Vec(IDL.Text)),
  });
  const ViolatedRules = IDL.Record({
    'ruleId' : IDL.Text,
    'ruleDesc' : IDL.Text,
  });
  const PohTaskData = IDL.Record({
    'dataCanisterId' : IDL.Opt(IDL.Principal),
    'status' : PohChallengeStatus,
    'userName' : IDL.Opt(IDL.Text),
    'contentId' : IDL.Opt(IDL.Text),
    'allowedViolationRules' : IDL.Vec(ViolatedRules),
    'userId' : IDL.Principal,
    'createdAt' : IDL.Int,
    'fullName' : IDL.Opt(IDL.Text),
    'email' : IDL.Opt(IDL.Text),
    'updatedAt' : IDL.Int,
    'challengeId' : IDL.Text,
    'challengeType' : PohChallengeType,
    'aboutUser' : IDL.Opt(IDL.Text),
    'wordList' : IDL.Opt(IDL.Vec(IDL.Text)),
  });
  const PohTaskDataWrapperPlus = IDL.Record({
    'reward' : IDL.Float64,
    'minVotes' : IDL.Int,
    'votes' : IDL.Nat,
    'createdAt' : IDL.Int,
    'minStake' : IDL.Int,
    'updatedAt' : IDL.Int,
    'pohTaskData' : IDL.Vec(PohTaskData),
    'packageId' : IDL.Text,
  });
  const PohError = IDL.Variant({
    'invalidPackageId' : IDL.Null,
    'challengeNotPendingForSubmission' : IDL.Null,
    'invalidToken' : IDL.Null,
  });
  const Result_2 = IDL.Variant({
    'ok' : PohTaskDataWrapperPlus,
    'err' : PohError,
  });
  const PohTaskPlus = IDL.Record({
    'status' : ContentStatus,
    'reward' : IDL.Float64,
    'userName' : IDL.Opt(IDL.Text),
    'title' : IDL.Opt(IDL.Text),
    'profileImageUrlSuffix' : IDL.Opt(IDL.Text),
    'voteCount' : IDL.Nat,
    'minVotes' : IDL.Int,
    'createdAt' : IDL.Int,
    'fullName' : IDL.Opt(IDL.Text),
    'email' : IDL.Opt(IDL.Text),
    'minStake' : IDL.Int,
    'updatedAt' : IDL.Int,
    'aboutUser' : IDL.Opt(IDL.Text),
    'hasVoted' : IDL.Opt(IDL.Bool),
    'packageId' : IDL.Text,
  });
  const ProviderSettings = IDL.Record({
    'minVotes' : IDL.Nat,
    'minStaked' : IDL.Nat,
  });
  const Rule = IDL.Record({ 'id' : RuleId, 'description' : IDL.Text });
  const ProviderPlus = IDL.Record({
    'id' : IDL.Principal,
    'contentCount' : IDL.Nat,
    'rewardsSpent' : IDL.Nat,
    'name' : IDL.Text,
    'createdAt' : Timestamp,
    'description' : IDL.Text,
    'updatedAt' : Timestamp,
    'settings' : ProviderSettings,
    'activeCount' : IDL.Nat,
    'image' : IDL.Opt(Image),
    'rules' : IDL.Vec(Rule),
  });
  const PohUniqueToken = IDL.Record({ 'token' : IDL.Text });
  const ChallengeResponse = IDL.Record({
    'status' : PohChallengeStatus,
    'completedOn' : IDL.Opt(IDL.Int),
    'challengeId' : IDL.Text,
  });
  const PohVerificationResponse = IDL.Record({
    'status' : PohChallengeStatus,
    'requestId' : IDL.Text,
    'providerId' : IDL.Principal,
    'challenges' : IDL.Vec(ChallengeResponse),
    'requestedOn' : IDL.Int,
    'providerUserId' : IDL.Principal,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Result_1 = IDL.Variant({
    'ok' : IDL.Vec(PohChallengesAttempt),
    'err' : PohError,
  });
  const PohChallengeSubmissionRequest = IDL.Record({
    'userName' : IDL.Opt(IDL.Text),
    'numOfChunks' : IDL.Nat,
    'mimeType' : IDL.Text,
    'fullName' : IDL.Opt(IDL.Text),
    'offset' : IDL.Nat,
    'email' : IDL.Opt(IDL.Text),
    'challengeId' : IDL.Text,
    'dataSize' : IDL.Nat,
    'aboutUser' : IDL.Opt(IDL.Text),
    'challengeDataBlob' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const PohChallengeSubmissionStatus = IDL.Variant({
    'ok' : IDL.Null,
    'notPendingForSubmission' : IDL.Null,
    'alreadySubmitted' : IDL.Null,
    'alreadyApproved' : IDL.Null,
    'alreadyRejected' : IDL.Null,
    'inputDataMissing' : IDL.Null,
    'incorrectChallenge' : IDL.Null,
  });
  const PohChallengeSubmissionResponse = IDL.Record({
    'submissionStatus' : PohChallengeSubmissionStatus,
    'challengeId' : IDL.Text,
  });
  const ContentResult = IDL.Record({
    'status' : ContentStatus,
    'sourceId' : IDL.Text,
  });
  const SubscribeMessage = IDL.Record({
    'callback' : IDL.Func([ContentResult], [], ['oneway']),
  });
  const ProviderMeta = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Text,
  });
  const ProviderMetaResult = IDL.Variant({
    'ok' : ProviderMeta,
    'err' : ProviderError,
  });
  const ProviderSettingResult = IDL.Variant({
    'ok' : ProviderSettings,
    'err' : ProviderError,
  });
  const VerifyHumanityResponse = IDL.Record({
    'status' : PohChallengeStatus,
    'token' : IDL.Opt(PohUniqueToken),
    'rejectionReasons' : IDL.Vec(IDL.Text),
  });
  const PohRulesViolated = IDL.Record({
    'ruleId' : IDL.Text,
    'challengeId' : IDL.Text,
  });
  const ModClub = IDL.Service({
    'addProviderAdmin' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Opt(IDL.Principal)],
        [ProviderResult],
        [],
      ),
    'addRules' : IDL.Func([IDL.Vec(IDL.Text), IDL.Opt(IDL.Principal)], [], []),
    'addToAirdropWhitelist' : IDL.Func([IDL.Vec(IDL.Principal)], [], []),
    'addToAllowList' : IDL.Func([IDL.Principal], [], []),
    'addToApprovedUser' : IDL.Func([IDL.Principal], [], []),
    'adminInit' : IDL.Func([], [], []),
    'adminTransferTokens' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'airdropRegister' : IDL.Func([], [AirdropUser], []),
    'allNewContent' : IDL.Func([], [IDL.Vec(IDL.Text)], []),
    'collectCanisterMetrics' : IDL.Func([], [], []),
    'convertAllToModerator' : IDL.Func([], [], []),
    'deregisterProvider' : IDL.Func([], [IDL.Text], []),
    'distributeAllPendingRewards' : IDL.Func([], [], []),
    'editProviderAdmin' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Text],
        [ProviderResult],
        [],
      ),
    'generateSigningKey' : IDL.Func([], [], []),
    'getActivity' : IDL.Func([IDL.Bool], [IDL.Vec(Activity)], ['query']),
    'getAdminProviderIDs' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'getAdmins' : IDL.Func([], [Result_3], ['query']),
    'getAirdropUsers' : IDL.Func([], [IDL.Vec(AirdropUser)], []),
    'getAirdropWhitelist' : IDL.Func([], [IDL.Vec(IDL.Principal)], []),
    'getAllContent' : IDL.Func(
        [ContentStatus],
        [IDL.Vec(ContentPlus)],
        ['query'],
      ),
    'getAllDataCanisterIds' : IDL.Func(
        [],
        [IDL.Vec(IDL.Principal), IDL.Vec(IDL.Text)],
        [],
      ),
    'getAllModeratorHoldings' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, Holdings))],
        ['query'],
      ),
    'getAllProfiles' : IDL.Func([], [IDL.Vec(Profile)], ['query']),
    'getCanisterLog' : IDL.Func(
        [IDL.Opt(CanisterLogRequest)],
        [IDL.Opt(CanisterLogResponse)],
        ['query'],
      ),
    'getCanisterMetrics' : IDL.Func(
        [GetMetricsParameters],
        [IDL.Opt(CanisterMetrics)],
        ['query'],
      ),
    'getContent' : IDL.Func([IDL.Text], [IDL.Opt(ContentPlus)], ['query']),
    'getDeployer' : IDL.Func([], [IDL.Principal], ['query']),
    'getModclubHoldings' : IDL.Func([], [Holdings], ['query']),
    'getModeratorLeaderboard' : IDL.Func(
        [IDL.Nat, IDL.Nat],
        [IDL.Vec(ModeratorLeaderboard)],
        ['query'],
      ),
    'getPohAttempts' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Tuple(
              IDL.Principal,
              IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(PohChallengesAttempt))),
            )
          ),
        ],
        [],
      ),
    'getPohTaskData' : IDL.Func([IDL.Text], [Result_2], ['query']),
    'getPohTasks' : IDL.Func(
        [ContentStatus, IDL.Nat, IDL.Nat],
        [IDL.Vec(PohTaskPlus)],
        ['query'],
      ),
    'getProfile' : IDL.Func([], [Profile], ['query']),
    'getProfileById' : IDL.Func([IDL.Principal], [Profile], ['query']),
    'getProvider' : IDL.Func([IDL.Principal], [ProviderPlus], []),
    'getProviderAdmins' : IDL.Func([IDL.Principal], [IDL.Vec(Profile)], []),
    'getProviderContent' : IDL.Func(
        [IDL.Principal, ContentStatus, IDL.Nat, IDL.Nat],
        [IDL.Vec(ContentPlus)],
        ['query'],
      ),
    'getRules' : IDL.Func([IDL.Principal], [IDL.Vec(Rule)], ['query']),
    'getTasks' : IDL.Func(
        [IDL.Nat, IDL.Nat, IDL.Bool],
        [IDL.Vec(ContentPlus)],
        ['query'],
      ),
    'getTokenHoldings' : IDL.Func([], [Holdings], ['query']),
    'getVotePerformance' : IDL.Func([], [IDL.Float64], ['query']),
    'isAirdropRegistered' : IDL.Func([], [AirdropUser], []),
    'issueJwt' : IDL.Func([], [IDL.Text], []),
    'newContentQueuesByqId' : IDL.Func([IDL.Nat], [IDL.Vec(IDL.Text)], []),
    'newContentQueuesqIdCount' : IDL.Func(
        [],
        [IDL.Vec(IDL.Nat), IDL.Vec(IDL.Nat)],
        [],
      ),
    'pohGenerateUniqueToken' : IDL.Func([IDL.Principal], [PohUniqueToken], []),
    'pohVerificationRequest' : IDL.Func(
        [IDL.Principal],
        [PohVerificationResponse],
        [],
      ),
    'populateChallenges' : IDL.Func([], [], []),
    'registerAdmin' : IDL.Func([IDL.Principal], [Result], []),
    'registerModerator' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Opt(Image)],
        [Profile],
        [],
      ),
    'registerProvider' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Opt(Image)],
        [IDL.Text],
        [],
      ),
    'removeProviderAdmin' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [ProviderResult],
        [],
      ),
    'removeRules' : IDL.Func([IDL.Vec(RuleId), IDL.Opt(IDL.Principal)], [], []),
    'resetUserChallengeAttempt' : IDL.Func([IDL.Text], [Result_1], []),
    'retiredDataCanisterIdForWriting' : IDL.Func([IDL.Text], [], ['oneway']),
    'retrieveChallengesForUser' : IDL.Func([IDL.Text], [Result_1], []),
    'rewardPoints' : IDL.Func([IDL.Principal, IDL.Int], [], []),
    'setRandomization' : IDL.Func([IDL.Bool], [], []),
    'shuffleContent' : IDL.Func([], [], []),
    'stakeTokens' : IDL.Func([IDL.Nat], [IDL.Text], []),
    'submitChallengeData' : IDL.Func(
        [PohChallengeSubmissionRequest],
        [PohChallengeSubmissionResponse],
        [],
      ),
    'submitHtmlContent' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Opt(IDL.Text)],
        [IDL.Text],
        [],
      ),
    'submitImage' : IDL.Func(
        [IDL.Text, IDL.Vec(IDL.Nat8), IDL.Text, IDL.Opt(IDL.Text)],
        [IDL.Text],
        [],
      ),
    'submitText' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Opt(IDL.Text)],
        [IDL.Text],
        [],
      ),
    'subscribe' : IDL.Func([SubscribeMessage], [], []),
    'toggleAllowSubmission' : IDL.Func([IDL.Bool], [], []),
    'unStakeTokens' : IDL.Func([IDL.Nat], [IDL.Text], []),
    'unregisterAdmin' : IDL.Func([IDL.Text], [Result], []),
    'updateProvider' : IDL.Func(
        [IDL.Principal, ProviderMeta],
        [ProviderMetaResult],
        [],
      ),
    'updateProviderLogo' : IDL.Func(
        [IDL.Principal, IDL.Vec(IDL.Nat8), IDL.Text],
        [IDL.Text],
        [],
      ),
    'updateRules' : IDL.Func([IDL.Vec(Rule), IDL.Opt(IDL.Principal)], [], []),
    'updateSettings' : IDL.Func(
        [IDL.Principal, ProviderSettings],
        [ProviderSettingResult],
        [],
      ),
    'userId2QueueId' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Text))],
        ['query'],
      ),
    'verifyUserHumanity' : IDL.Func([], [VerifyHumanityResponse], []),
    'vote' : IDL.Func(
        [ContentId, Decision, IDL.Opt(IDL.Vec(RuleId))],
        [IDL.Text],
        [],
      ),
    'votePohContent' : IDL.Func(
        [IDL.Text, Decision, IDL.Vec(PohRulesViolated)],
        [],
        [],
      ),
    'whoami' : IDL.Func([], [IDL.Principal], []),
  });
  return ModClub;
};
export const init = ({ IDL }) => { return []; };
