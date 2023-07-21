export const idlFactory = ({ IDL }) => {
  const Branch = IDL.Rec();
  const Branch_2 = IDL.Rec();
  const List = IDL.Rec();
  const List_1 = IDL.Rec();
  const List_2 = IDL.Rec();
  const List_3 = IDL.Rec();
  const Trie_1 = IDL.Rec();
  const Trie_3 = IDL.Rec();
  const ENV = IDL.Record({
    'wallet_canister_id' : IDL.Principal,
    'vesting_canister_id' : IDL.Principal,
    'old_modclub_canister_id' : IDL.Principal,
    'modclub_canister_id' : IDL.Principal,
    'rs_canister_id' : IDL.Principal,
    'auth_canister_id' : IDL.Principal,
  });
  const PohVerificationStatus = IDL.Variant({
    'notSubmitted' : IDL.Null,
    'verified' : IDL.Null,
    'expired' : IDL.Null,
    'pending' : IDL.Null,
    'startPoh' : IDL.Null,
    'rejected' : IDL.Null,
  });
  const PohChallengeStatus = IDL.Variant({
    'notSubmitted' : IDL.Null,
    'verified' : IDL.Null,
    'expired' : IDL.Null,
    'pending' : IDL.Null,
    'rejected' : IDL.Null,
  });
  const ChallengeResponse = IDL.Record({
    'status' : PohChallengeStatus,
    'completedAt' : IDL.Opt(IDL.Int),
    'submittedAt' : IDL.Opt(IDL.Int),
    'challengeId' : IDL.Text,
    'requestedAt' : IDL.Opt(IDL.Int),
  });
  const PohVerificationResponsePlus = IDL.Record({
    'status' : PohVerificationStatus,
    'completedAt' : IDL.Opt(IDL.Int),
    'token' : IDL.Opt(IDL.Text),
    'rejectionReasons' : IDL.Vec(IDL.Text),
    'submittedAt' : IDL.Opt(IDL.Int),
    'isFirstAssociation' : IDL.Bool,
    'providerId' : IDL.Principal,
    'challenges' : IDL.Vec(ChallengeResponse),
    'requestedAt' : IDL.Opt(IDL.Int),
    'providerUserId' : IDL.Text,
  });
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
  const UserId = IDL.Principal;
  const Image = IDL.Record({
    'imageType' : IDL.Text,
    'data' : IDL.Vec(IDL.Nat8),
  });
  const Timestamp = IDL.Int;
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
  const Tokens = IDL.Nat;
  const CanClaimLockedResponse = IDL.Record({
    'claimPrice' : Tokens,
    'claimAmount' : Tokens,
    'canClaim' : IDL.Bool,
  });
  const Result_5 = IDL.Variant({
    'ok' : CanClaimLockedResponse,
    'err' : IDL.Text,
  });
  const Result_4 = IDL.Variant({ 'ok' : IDL.Bool, 'err' : IDL.Text });
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
    'createdAt' : Timestamp,
    'vote' : Vote,
    'minStake' : IDL.Nat,
    'updatedAt' : Timestamp,
    'providerName' : IDL.Text,
    'providerId' : ProviderId,
    'requiredVotes' : IDL.Nat,
  });
  const ContentId = IDL.Text;
  const ReceiptId = IDL.Text;
  const Receipt = IDL.Record({
    'id' : ReceiptId,
    'cost' : IDL.Int,
    'createdAt' : Timestamp,
  });
  const ReservedId = IDL.Text;
  const Reserved = IDL.Record({
    'id' : ReservedId,
    'createdAt' : Timestamp,
    'profileId' : IDL.Text,
    'reservedExpiryTime' : Timestamp,
    'updatedAt' : Timestamp,
  });
  const VoteParamsId = IDL.Text;
  const Level = IDL.Variant({
    'normal' : IDL.Null,
    'hard' : IDL.Null,
    'xhard' : IDL.Null,
    'simple' : IDL.Null,
  });
  const Complexity = IDL.Record({ 'expiryTime' : Timestamp, 'level' : Level });
  const VoteParameters = IDL.Record({
    'id' : VoteParamsId,
    'complexity' : Complexity,
    'createdAt' : Timestamp,
    'updatedAt' : Timestamp,
    'requiredVotes' : IDL.Int,
  });
  const ContentPlus = IDL.Record({
    'id' : ContentId,
    'status' : ContentStatus,
    'title' : IDL.Opt(IDL.Text),
    'voteCount' : IDL.Nat,
    'receipt' : Receipt,
    'contentType' : ContentType,
    'createdAt' : Timestamp,
    'text' : IDL.Opt(IDL.Text),
    'sourceId' : IDL.Text,
    'minStake' : IDL.Nat,
    'updatedAt' : Timestamp,
    'reservedList' : IDL.Vec(Reserved),
    'providerName' : IDL.Text,
    'image' : IDL.Opt(Image),
    'hasVoted' : IDL.Opt(IDL.Bool),
    'providerId' : IDL.Principal,
    'voteParameters' : VoteParameters,
    'requiredVotes' : IDL.Nat,
  });
  const ViolatedRules__1 = IDL.Record({
    'ruleId' : IDL.Text,
    'ruleDesc' : IDL.Text,
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
  const PohTaskData = IDL.Record({
    'dataCanisterId' : IDL.Opt(IDL.Principal),
    'status' : PohChallengeStatus,
    'completedOn' : IDL.Int,
    'contentId' : IDL.Opt(IDL.Text),
    'allowedViolationRules' : IDL.Vec(ViolatedRules__1),
    'userId' : IDL.Principal,
    'createdAt' : IDL.Int,
    'submittedAt' : IDL.Int,
    'updatedAt' : IDL.Int,
    'challengeId' : IDL.Text,
    'challengeType' : PohChallengeType,
    'wordList' : IDL.Opt(IDL.Vec(IDL.Text)),
  });
  const PohTaskPlusForAdmin = IDL.Record({
    'status' : ContentStatus,
    'completedOn' : IDL.Int,
    'profileImageUrlSuffix' : IDL.Opt(IDL.Text),
    'voteCount' : IDL.Nat,
    'submittedAt' : IDL.Int,
    'userUserName' : IDL.Text,
    'userModClubId' : IDL.Text,
    'pohTaskData' : IDL.Vec(PohTaskData),
    'userEmailId' : IDL.Text,
    'packageId' : IDL.Text,
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
  const ViolatedRules = IDL.Record({
    'id' : RuleId,
    'rejectionCount' : IDL.Nat,
  });
  const ContentResult = IDL.Record({
    'status' : ContentStatus,
    'approvedCount' : IDL.Nat,
    'sourceId' : IDL.Text,
    'violatedRules' : IDL.Vec(ViolatedRules),
    'rejectedCount' : IDL.Nat,
  });
  const ModeratorLeaderboard = IDL.Record({
    'id' : UserId,
    'rs' : IDL.Float64,
    'completedVoteCount' : IDL.Int,
    'userName' : IDL.Text,
    'rewardsEarned' : IDL.Int,
    'lastVoted' : IDL.Opt(Timestamp),
    'performance' : IDL.Float64,
  });
  const Hash = IDL.Nat32;
  const Key_1 = IDL.Record({ 'key' : IDL.Principal, 'hash' : Hash });
  const Branch_3 = IDL.Record({
    'left' : Trie_3,
    'size' : IDL.Nat,
    'right' : Trie_3,
  });
  const Key = IDL.Record({ 'key' : IDL.Text, 'hash' : Hash });
  List_2.fill(IDL.Opt(IDL.Tuple(IDL.Tuple(Key, IDL.Null), List_2)));
  const AssocList_3 = IDL.Opt(IDL.Tuple(IDL.Tuple(Key, IDL.Null), List_2));
  const Leaf_3 = IDL.Record({ 'size' : IDL.Nat, 'keyvals' : AssocList_3 });
  Trie_3.fill(
    IDL.Variant({ 'branch' : Branch_3, 'leaf' : Leaf_3, 'empty' : IDL.Null })
  );
  List_3.fill(IDL.Opt(IDL.Tuple(IDL.Tuple(Key_1, Trie_3), List_3)));
  const AssocList_2 = IDL.Opt(IDL.Tuple(IDL.Tuple(Key_1, Trie_3), List_3));
  const Leaf_2 = IDL.Record({ 'size' : IDL.Nat, 'keyvals' : AssocList_2 });
  const Trie_2 = IDL.Variant({
    'branch' : Branch_2,
    'leaf' : Leaf_2,
    'empty' : IDL.Null,
  });
  Branch_2.fill(
    IDL.Record({ 'left' : Trie_2, 'size' : IDL.Nat, 'right' : Trie_2 })
  );
  const Trie2D_1 = IDL.Variant({
    'branch' : Branch_2,
    'leaf' : Leaf_2,
    'empty' : IDL.Null,
  });
  const RelShared_1 = IDL.Record({ 'forw' : Trie2D_1 });
  const SubscribePohMessage = IDL.Record({
    'callback' : IDL.Func([PohVerificationResponsePlus], [], ['oneway']),
  });
  const PohChallengeRequiredField = IDL.Variant({
    'imageBlob' : IDL.Null,
    'textBlob' : IDL.Null,
    'videoBlob' : IDL.Null,
    'profileFieldBlobs' : IDL.Null,
  });
  const PohChallenges = IDL.Record({
    'allowedViolationRules' : IDL.Vec(ViolatedRules__1),
    'createdAt' : IDL.Int,
    'dependentChallengeId' : IDL.Opt(IDL.Vec(IDL.Text)),
    'updatedAt' : IDL.Int,
    'challengeId' : IDL.Text,
    'challengeDescription' : IDL.Text,
    'challengeName' : IDL.Text,
    'challengeType' : PohChallengeType,
    'requiredField' : PohChallengeRequiredField,
  });
  const PohProviderAndUserData = IDL.Record({
    'token' : IDL.Text,
    'generatedAt' : IDL.Int,
    'providerId' : IDL.Principal,
    'providerUserId' : IDL.Text,
  });
  const PohChallengePackage = IDL.Record({
    'id' : IDL.Text,
    'title' : IDL.Opt(IDL.Text),
    'userId' : IDL.Principal,
    'createdAt' : IDL.Int,
    'updatedAt' : IDL.Int,
    'challengeIds' : IDL.Vec(IDL.Text),
  });
  const PohChallengesAttemptV1 = IDL.Record({
    'dataCanisterId' : IDL.Opt(IDL.Principal),
    'status' : PohChallengeStatus,
    'completedOn' : IDL.Int,
    'attemptId' : IDL.Opt(IDL.Text),
    'userId' : IDL.Principal,
    'createdAt' : IDL.Int,
    'submittedAt' : IDL.Int,
    'updatedAt' : IDL.Int,
    'challengeId' : IDL.Text,
    'challengeDescription' : IDL.Text,
    'challengeName' : IDL.Text,
    'challengeType' : PohChallengeType,
    'wordList' : IDL.Opt(IDL.Vec(IDL.Text)),
  });
  const Branch_1 = IDL.Record({
    'left' : Trie_1,
    'size' : IDL.Nat,
    'right' : Trie_1,
  });
  List.fill(IDL.Opt(IDL.Tuple(IDL.Tuple(Key_1, IDL.Null), List)));
  const AssocList_1 = IDL.Opt(IDL.Tuple(IDL.Tuple(Key_1, IDL.Null), List));
  const Leaf_1 = IDL.Record({ 'size' : IDL.Nat, 'keyvals' : AssocList_1 });
  Trie_1.fill(
    IDL.Variant({ 'branch' : Branch_1, 'leaf' : Leaf_1, 'empty' : IDL.Null })
  );
  List_1.fill(IDL.Opt(IDL.Tuple(IDL.Tuple(Key, Trie_1), List_1)));
  const AssocList = IDL.Opt(IDL.Tuple(IDL.Tuple(Key, Trie_1), List_1));
  const Leaf = IDL.Record({ 'size' : IDL.Nat, 'keyvals' : AssocList });
  const Trie = IDL.Variant({
    'branch' : Branch,
    'leaf' : Leaf,
    'empty' : IDL.Null,
  });
  Branch.fill(IDL.Record({ 'left' : Trie, 'size' : IDL.Nat, 'right' : Trie }));
  const Trie2D = IDL.Variant({
    'branch' : Branch,
    'leaf' : Leaf,
    'empty' : IDL.Null,
  });
  const RelShared = IDL.Record({ 'forw' : Trie2D });
  const PohStableState = IDL.Record({
    'userToPohChallengePackageId' : RelShared_1,
    'providersCallback' : IDL.Vec(
      IDL.Tuple(IDL.Principal, SubscribePohMessage)
    ),
    'pohChallenges' : IDL.Vec(IDL.Tuple(IDL.Text, PohChallenges)),
    'callbackIssuedByProvider' : IDL.Vec(
      IDL.Tuple(IDL.Principal, IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Int)))
    ),
    'token2ProviderAndUserData' : IDL.Vec(
      IDL.Tuple(IDL.Text, PohProviderAndUserData)
    ),
    'pohChallengePackages' : IDL.Vec(IDL.Tuple(IDL.Text, PohChallengePackage)),
    'pohUserChallengeAttempts' : IDL.Vec(
      IDL.Tuple(
        IDL.Principal,
        IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(PohChallengesAttemptV1))),
      )
    ),
    'providerUserIdToModclubUserIdByProviderId' : IDL.Vec(
      IDL.Tuple(IDL.Principal, RelShared)
    ),
    'wordList' : IDL.Vec(IDL.Text),
  });
  const PohTaskDataWrapperPlus = IDL.Record({
    'reward' : IDL.Float64,
    'votes' : IDL.Nat,
    'createdAt' : IDL.Int,
    'minStake' : IDL.Int,
    'updatedAt' : IDL.Int,
    'pohTaskData' : IDL.Vec(PohTaskData),
    'packageId' : IDL.Text,
    'requiredVotes' : IDL.Int,
  });
  const PohError = IDL.Variant({
    'pohCallbackNotRegistered' : IDL.Null,
    'invalidPackageId' : IDL.Null,
    'pohNotConfiguredForProvider' : IDL.Null,
    'challengeNotPendingForSubmission' : IDL.Null,
    'invalidToken' : IDL.Null,
    'attemptToCreateMultipleWalletsWithSameIp' : IDL.Null,
    'attemptToAssociateMultipleModclubAccounts' : IDL.Principal,
  });
  const Result_3 = IDL.Variant({
    'ok' : PohTaskDataWrapperPlus,
    'err' : PohError,
  });
  const Decision__1 = IDL.Variant({
    'approved' : IDL.Null,
    'rejected' : IDL.Null,
  });
  const VotePlusUser = IDL.Record({
    'userVoteDecision' : Decision__1,
    'userUserName' : IDL.Text,
    'userModClubId' : IDL.Principal,
    'userEmailId' : IDL.Text,
    'userVoteCreatedAt' : IDL.Int,
  });
  const PohTaskDataAndVotesWrapperPlus = IDL.Record({
    'reward' : IDL.Float64,
    'createdAt' : IDL.Int,
    'minStake' : IDL.Int,
    'updatedAt' : IDL.Int,
    'pohTaskData' : IDL.Vec(PohTaskData),
    'packageId' : IDL.Text,
    'requiredVotes' : IDL.Int,
    'voteUserDetails' : IDL.Vec(VotePlusUser),
  });
  const Result_2 = IDL.Variant({
    'ok' : PohTaskDataAndVotesWrapperPlus,
    'err' : PohError,
  });
  const PohTaskPlus = IDL.Record({
    'status' : ContentStatus,
    'reward' : IDL.Float64,
    'title' : IDL.Opt(IDL.Text),
    'profileImageUrlSuffix' : IDL.Opt(IDL.Text),
    'voteCount' : IDL.Nat,
    'createdAt' : IDL.Int,
    'minStake' : IDL.Int,
    'updatedAt' : IDL.Int,
    'hasVoted' : IDL.Opt(IDL.Bool),
    'packageId' : IDL.Text,
    'requiredVotes' : IDL.Int,
  });
  const ProviderSettings = IDL.Record({
    'minStaked' : IDL.Nat,
    'requiredVotes' : IDL.Nat,
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
  const Result_1 = IDL.Variant({ 'ok' : Reserved, 'err' : IDL.Text });
  const Event = IDL.Record({ 'topic' : IDL.Text, 'payload' : IDL.Principal });
  const ConsumerPayload = IDL.Variant({
    'events' : IDL.Vec(Event),
    'admins' : IDL.Vec(IDL.Principal),
  });
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
  });
  const Token = IDL.Record({});
  const StreamingCallbackHttpResponse = IDL.Record({
    'token' : Token,
    'body' : IDL.Vec(IDL.Nat8),
  });
  const StreamingStrategy = IDL.Variant({
    'Callback' : IDL.Record({
      'token' : Token,
      'callback' : IDL.Func([Token], [StreamingCallbackHttpResponse], []),
    }),
  });
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
    'upgrade' : IDL.Opt(IDL.Bool),
    'streaming_strategy' : IDL.Opt(StreamingStrategy),
    'status_code' : IDL.Nat16,
  });
  const ProviderAdmins = IDL.Record({
    'pid' : IDL.Principal,
    'admins' : IDL.Vec(Profile),
  });
  const ProviderInfo = IDL.Record({
    'id' : IDL.Principal,
    'name' : IDL.Text,
    'createdAt' : Timestamp,
    'description' : IDL.Text,
    'updatedAt' : Timestamp,
    'image' : IDL.Opt(Image),
  });
  const OldModeratorLeaderboard = IDL.Record({
    'id' : UserId,
    'completedVoteCount' : IDL.Int,
    'userName' : IDL.Text,
    'rewardsEarned' : IDL.Int,
    'lastVoted' : IDL.Opt(Timestamp),
    'performance' : IDL.Float64,
  });
  const AccountsImportPayload = IDL.Record({
    'adminsByProvider' : IDL.Vec(ProviderAdmins),
    'providers' : IDL.Vec(ProviderInfo),
    'approvedPOHUsers' : IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Principal)),
    'moderators' : IDL.Vec(OldModeratorLeaderboard),
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
  const Result = IDL.Variant({
    'ok' : IDL.Vec(PohChallengesAttempt),
    'err' : PohError,
  });
  const PohChallengeSubmissionRequest = IDL.Record({
    'numOfChunks' : IDL.Nat,
    'mimeType' : IDL.Text,
    'offset' : IDL.Nat,
    'challengeId' : IDL.Text,
    'dataSize' : IDL.Nat,
    'challengeDataBlob' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const PohChallengeSubmissionStatus = IDL.Variant({
    'ok' : IDL.Null,
    'notPendingForSubmission' : IDL.Null,
    'alreadySubmitted' : IDL.Null,
    'alreadyApproved' : IDL.Null,
    'alreadyRejected' : IDL.Null,
    'submissionDataLimitExceeded' : IDL.Null,
    'inputDataMissing' : IDL.Null,
    'incorrectChallenge' : IDL.Null,
  });
  const PohChallengeSubmissionResponse = IDL.Record({
    'submissionStatus' : PohChallengeSubmissionStatus,
    'challengeId' : IDL.Text,
  });
  const SubscribeMessage = IDL.Record({
    'callback' : IDL.Func([ContentResult], [], ['oneway']),
  });
  const HttpHeader = IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text });
  const CanisterHttpResponsePayload = IDL.Record({
    'status' : IDL.Nat,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HttpHeader),
  });
  const TransformArgs = IDL.Record({
    'context' : IDL.Vec(IDL.Nat8),
    'response' : CanisterHttpResponsePayload,
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
    'status' : PohVerificationStatus,
    'token' : IDL.Opt(IDL.Text),
    'rejectionReasons' : IDL.Vec(IDL.Text),
  });
  const PohRulesViolated = IDL.Record({
    'ruleId' : IDL.Text,
    'challengeId' : IDL.Text,
  });
  const ModClub = IDL.Service({
    'AdminCheckPohVerificationResp' : IDL.Func(
        [IDL.Text, IDL.Principal],
        [PohVerificationResponsePlus],
        [],
      ),
    'addProviderAdmin' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Opt(IDL.Principal)],
        [ProviderResult],
        [],
      ),
    'addRules' : IDL.Func([IDL.Vec(IDL.Text), IDL.Opt(IDL.Principal)], [], []),
    'addToAllowList' : IDL.Func([IDL.Principal], [], []),
    'addToApprovedUser' : IDL.Func([IDL.Principal], [], []),
    'adminInit' : IDL.Func([], [], []),
    'adminUpdateEmail' : IDL.Func([IDL.Principal, IDL.Text], [Profile], []),
    'canClaimLockedReward' : IDL.Func([IDL.Opt(Tokens)], [Result_5], []),
    'canReserveContent' : IDL.Func([IDL.Text], [Result_4], []),
    'checkIfUserOptToReciveAlerts' : IDL.Func([], [IDL.Bool], ['query']),
    'claimLockedReward' : IDL.Func(
        [Tokens, IDL.Opt(IDL.Principal)],
        [Result_4],
        [],
      ),
    'collectCanisterMetrics' : IDL.Func([], [], []),
    'configurePohForProvider' : IDL.Func(
        [IDL.Principal, IDL.Vec(IDL.Text), IDL.Nat, IDL.Bool],
        [],
        [],
      ),
    'deregisterProvider' : IDL.Func([], [IDL.Text], []),
    'editProviderAdmin' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Text],
        [ProviderResult],
        [],
      ),
    'generateSigningKey' : IDL.Func([], [], []),
    'getActivity' : IDL.Func([IDL.Bool], [IDL.Vec(Activity)], ['query']),
    'getAdminProviderIDs' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'getAllContent' : IDL.Func([ContentStatus], [IDL.Vec(ContentPlus)], []),
    'getAllDataCanisterIds' : IDL.Func(
        [],
        [IDL.Vec(IDL.Principal), IDL.Vec(IDL.Text)],
        [],
      ),
    'getAllPohTasksForAdminUsers' : IDL.Func(
        [ContentStatus, IDL.Nat, IDL.Nat, IDL.Vec(IDL.Text), IDL.Int, IDL.Int],
        [IDL.Vec(PohTaskPlusForAdmin)],
        ['query'],
      ),
    'getAllProfiles' : IDL.Func([], [IDL.Vec(Profile)], ['query']),
    'getAllUsersWantToReceiveAlerts' : IDL.Func(
        [],
        [IDL.Vec(IDL.Text)],
        ['query'],
      ),
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
    'getContent' : IDL.Func([IDL.Text], [IDL.Opt(ContentPlus)], []),
    'getContentResult' : IDL.Func([IDL.Text], [ContentResult], []),
    'getDeployer' : IDL.Func([], [IDL.Principal], ['query']),
    'getModeratorEmailsForPOHAndSendEmail' : IDL.Func([IDL.Text], [], []),
    'getModeratorLeaderboard' : IDL.Func(
        [IDL.Nat, IDL.Nat],
        [IDL.Vec(ModeratorLeaderboard)],
        [],
      ),
    'getPohAttempts' : IDL.Func([], [PohStableState], []),
    'getPohTaskData' : IDL.Func([IDL.Text], [Result_3], ['query']),
    'getPohTaskDataForAdminUsers' : IDL.Func([IDL.Text], [Result_2], ['query']),
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
        [],
      ),
    'getProviderRules' : IDL.Func([], [IDL.Vec(Rule)], ['query']),
    'getReservedByContentId' : IDL.Func([IDL.Text], [Result_1], []),
    'getRules' : IDL.Func([IDL.Principal], [IDL.Vec(Rule)], ['query']),
    'getTaskStats' : IDL.Func(
        [IDL.Int],
        [IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat],
        [],
      ),
    'getTasks' : IDL.Func(
        [IDL.Nat, IDL.Nat, IDL.Bool],
        [IDL.Vec(ContentPlus)],
        [],
      ),
    'getVotePerformance' : IDL.Func([], [IDL.Float64], ['query']),
    'handleSubscription' : IDL.Func([ConsumerPayload], [], []),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'http_request_update' : IDL.Func([HttpRequest], [HttpResponse], []),
    'importAccounts' : IDL.Func(
        [AccountsImportPayload],
        [IDL.Record({ 'status' : IDL.Bool })],
        [],
      ),
    'issueJwt' : IDL.Func([], [IDL.Text], []),
    'pohCallbackForModclub' : IDL.Func(
        [PohVerificationResponsePlus],
        [],
        ['oneway'],
      ),
    'populateChallenges' : IDL.Func([], [], []),
    'providerSaBalance' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Principal)],
        [Tokens],
        [],
      ),
    'registerModerator' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Text), IDL.Opt(Image)],
        [Profile],
        [],
      ),
    'registerProvider' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Opt(Image)],
        [IDL.Text],
        [],
      ),
    'registerUserToReceiveAlerts' : IDL.Func(
        [IDL.Principal, IDL.Bool],
        [IDL.Bool],
        [],
      ),
    'removeProviderAdmin' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [ProviderResult],
        [],
      ),
    'removeRules' : IDL.Func([IDL.Vec(RuleId), IDL.Opt(IDL.Principal)], [], []),
    'reserveContent' : IDL.Func([IDL.Text], [], []),
    'resetUserChallengeAttempt' : IDL.Func([IDL.Text], [Result], []),
    'retiredDataCanisterIdForWriting' : IDL.Func([IDL.Text], [], ['oneway']),
    'retrieveChallengesForUser' : IDL.Func([IDL.Text], [Result], []),
    'sendVerificationEmail' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'setLambdaToken' : IDL.Func([IDL.Text], [], []),
    'setRandomization' : IDL.Func([IDL.Bool], [], []),
    'setVoteParamsForLevel' : IDL.Func([IDL.Int, Level], [], []),
    'showAdmins' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'shuffleContent' : IDL.Func([], [], []),
    'shufflePohContent' : IDL.Func([], [], []),
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
    'subscribePohCallback' : IDL.Func([SubscribePohMessage], [], []),
    'toggleAllowSubmission' : IDL.Func([IDL.Bool], [], []),
    'topUpProviderReserve' : IDL.Func(
        [
          IDL.Record({
            'amount' : IDL.Nat,
            'providerId' : IDL.Opt(IDL.Principal),
          }),
        ],
        [],
        [],
      ),
    'transform' : IDL.Func(
        [TransformArgs],
        [CanisterHttpResponsePayload],
        ['query'],
      ),
    'unStakeTokens' : IDL.Func([IDL.Nat], [IDL.Text], []),
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
    'verifyHumanity' : IDL.Func([IDL.Text], [PohVerificationResponsePlus], []),
    'verifyUserHumanityForModclub' : IDL.Func([], [VerifyHumanityResponse], []),
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
export const init = ({ IDL }) => {
  const ENV = IDL.Record({
    'wallet_canister_id' : IDL.Principal,
    'vesting_canister_id' : IDL.Principal,
    'old_modclub_canister_id' : IDL.Principal,
    'modclub_canister_id' : IDL.Principal,
    'rs_canister_id' : IDL.Principal,
    'auth_canister_id' : IDL.Principal,
  });
  return [ENV];
};
