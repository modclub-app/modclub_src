import type { Principal } from '@dfinity/principal';
export interface Activity {
  'status' : ContentStatus,
  'reward' : number,
  'title' : [] | [string],
  'voteCount' : bigint,
  'contentType' : ContentType,
  'rewardRelease' : Timestamp,
  'minVotes' : bigint,
  'createdAt' : Timestamp,
  'vote' : Vote,
  'minStake' : bigint,
  'updatedAt' : Timestamp,
  'providerName' : string,
  'providerId' : ProviderId,
}
export interface AirdropUser { 'id' : Principal, 'createdAt' : Timestamp }
export type AssocList = [] | [[[Key, Trie_1], List_1]];
export type AssocList_1 = [] | [[[Key_1, null], List]];
export type AssocList_2 = [] | [[[Key_1, Trie_3], List_3]];
export type AssocList_3 = [] | [[[Key, null], List_2]];
export interface Branch { 'left' : Trie, 'size' : bigint, 'right' : Trie }
export interface Branch_1 { 'left' : Trie_1, 'size' : bigint, 'right' : Trie_1 }
export interface Branch_2 { 'left' : Trie_2, 'size' : bigint, 'right' : Trie_2 }
export interface Branch_3 { 'left' : Trie_3, 'size' : bigint, 'right' : Trie_3 }
export type CanisterCyclesAggregatedData = Array<bigint>;
export type CanisterHeapMemoryAggregatedData = Array<bigint>;
export type CanisterLogFeature = { 'filterMessageByContains' : null } |
  { 'filterMessageByRegex' : null };
export interface CanisterLogMessages {
  'data' : Array<LogMessagesData>,
  'lastAnalyzedMessageTimeNanos' : [] | [Nanos],
}
export interface CanisterLogMessagesInfo {
  'features' : Array<[] | [CanisterLogFeature]>,
  'lastTimeNanos' : [] | [Nanos],
  'count' : number,
  'firstTimeNanos' : [] | [Nanos],
}
export type CanisterLogRequest = { 'getMessagesInfo' : null } |
  { 'getMessages' : GetLogMessagesParameters } |
  { 'getLatestMessages' : GetLatestLogMessagesParameters };
export type CanisterLogResponse = { 'messagesInfo' : CanisterLogMessagesInfo } |
  { 'messages' : CanisterLogMessages };
export type CanisterMemoryAggregatedData = Array<bigint>;
export interface CanisterMetrics { 'data' : CanisterMetricsData }
export type CanisterMetricsData = { 'hourly' : Array<HourlyMetricsData> } |
  { 'daily' : Array<DailyMetricsData> };
export interface ChallengeResponse {
  'status' : PohChallengeStatus,
  'completedAt' : [] | [bigint],
  'submittedAt' : [] | [bigint],
  'challengeId' : string,
  'requestedAt' : [] | [bigint],
}
export type ContentId = string;
export interface ContentPlus {
  'id' : ContentId,
  'status' : ContentStatus,
  'title' : [] | [string],
  'voteCount' : bigint,
  'contentType' : ContentType,
  'minVotes' : bigint,
  'createdAt' : Timestamp,
  'text' : [] | [string],
  'sourceId' : string,
  'minStake' : bigint,
  'updatedAt' : Timestamp,
  'providerName' : string,
  'image' : [] | [Image],
  'hasVoted' : [] | [boolean],
  'providerId' : Principal,
}
export interface ContentResult { 'status' : ContentStatus, 'sourceId' : string }
export type ContentStatus = { 'new' : null } |
  { 'approved' : null } |
  { 'rejected' : null };
export type ContentType = { 'imageBlob' : null } |
  { 'text' : null } |
  { 'htmlContent' : null } |
  { 'imageUrl' : null } |
  { 'multiText' : null };
export interface DailyMetricsData {
  'updateCalls' : bigint,
  'canisterHeapMemorySize' : NumericEntity,
  'canisterCycles' : NumericEntity,
  'canisterMemorySize' : NumericEntity,
  'timeMillis' : bigint,
}
export type Decision = { 'approved' : null } |
  { 'rejected' : null };
export type Decision__1 = { 'approved' : null } |
  { 'rejected' : null };
export interface GetLatestLogMessagesParameters {
  'upToTimeNanos' : [] | [Nanos],
  'count' : number,
  'filter' : [] | [GetLogMessagesFilter],
}
export interface GetLogMessagesFilter {
  'analyzeCount' : number,
  'messageRegex' : [] | [string],
  'messageContains' : [] | [string],
}
export interface GetLogMessagesParameters {
  'count' : number,
  'filter' : [] | [GetLogMessagesFilter],
  'fromTimeNanos' : [] | [Nanos],
}
export interface GetMetricsParameters {
  'dateToMillis' : bigint,
  'granularity' : MetricsGranularity,
  'dateFromMillis' : bigint,
}
export type Hash = number;
export interface Holdings {
  'pendingRewards' : bigint,
  'stake' : bigint,
  'wallet' : bigint,
  'userPoints' : bigint,
}
export interface HourlyMetricsData {
  'updateCalls' : UpdateCallsAggregatedData,
  'canisterHeapMemorySize' : CanisterHeapMemoryAggregatedData,
  'canisterCycles' : CanisterCyclesAggregatedData,
  'canisterMemorySize' : CanisterMemoryAggregatedData,
  'timeMillis' : bigint,
}
export interface Image { 'imageType' : string, 'data' : Array<number> }
export interface Key { 'key' : string, 'hash' : Hash }
export interface Key_1 { 'key' : Principal, 'hash' : Hash }
export interface Leaf { 'size' : bigint, 'keyvals' : AssocList }
export interface Leaf_1 { 'size' : bigint, 'keyvals' : AssocList_1 }
export interface Leaf_2 { 'size' : bigint, 'keyvals' : AssocList_2 }
export interface Leaf_3 { 'size' : bigint, 'keyvals' : AssocList_3 }
export type List = [] | [[[Key_1, null], List]];
export type List_1 = [] | [[[Key, Trie_1], List_1]];
export type List_2 = [] | [[[Key, null], List_2]];
export type List_3 = [] | [[[Key_1, Trie_3], List_3]];
export interface LogMessagesData { 'timeNanos' : Nanos, 'message' : string }
export type MetricsGranularity = { 'hourly' : null } |
  { 'daily' : null };
export interface ModClub {
  'addProviderAdmin' : (
      arg_0: Principal,
      arg_1: string,
      arg_2: [] | [Principal],
    ) => Promise<ProviderResult>,
  'addRules' : (arg_0: Array<string>, arg_1: [] | [Principal]) => Promise<
      undefined
    >,
  'addToAirdropWhitelist' : (arg_0: Array<Principal>) => Promise<undefined>,
  'addToAllowList' : (arg_0: Principal) => Promise<undefined>,
  'addToApprovedUser' : (arg_0: Principal) => Promise<undefined>,
  'adminInit' : () => Promise<undefined>,
  'adminSlashStake' : (arg_0: Principal, arg_1: bigint) => Promise<undefined>,
  'adminTransferTokens' : (arg_0: Principal, arg_1: bigint) => Promise<
      undefined
    >,
  'airdropRegister' : () => Promise<AirdropUser>,
  'collectCanisterMetrics' : () => Promise<undefined>,
  'configurePohForProvider' : (
      arg_0: Principal,
      arg_1: Array<string>,
      arg_2: bigint,
    ) => Promise<undefined>,
  'deregisterProvider' : () => Promise<string>,
  'distributeAllPendingRewards' : () => Promise<undefined>,
  'downloadSupport' : (
      arg_0: string,
      arg_1: string,
      arg_2: bigint,
      arg_3: bigint,
    ) => Promise<Array<Array<string>>>,
  'editProviderAdmin' : (
      arg_0: Principal,
      arg_1: Principal,
      arg_2: string,
    ) => Promise<ProviderResult>,
  'generateSigningKey' : () => Promise<undefined>,
  'getActivity' : (arg_0: boolean) => Promise<Array<Activity>>,
  'getAdminProviderIDs' : () => Promise<Array<Principal>>,
  'getAdmins' : () => Promise<Result_4>,
  'getAirdropUsers' : () => Promise<Array<AirdropUser>>,
  'getAirdropWhitelist' : () => Promise<Array<Principal>>,
  'getAllContent' : (arg_0: ContentStatus) => Promise<Array<ContentPlus>>,
  'getAllDataCanisterIds' : () => Promise<[Array<Principal>, Array<string>]>,
  'getAllModeratorHoldings' : () => Promise<Array<[Principal, Holdings]>>,
  'getAllPohTasksForAdminUsers' : (
      arg_0: ContentStatus,
      arg_1: bigint,
      arg_2: bigint,
      arg_3: Array<string>,
      arg_4: bigint,
      arg_5: bigint,
    ) => Promise<Array<PohTaskPlusForAdmin>>,
  'getAllProfiles' : () => Promise<Array<Profile>>,
  'getCanisterLog' : (arg_0: [] | [CanisterLogRequest]) => Promise<
      [] | [CanisterLogResponse]
    >,
  'getCanisterMetrics' : (arg_0: GetMetricsParameters) => Promise<
      [] | [CanisterMetrics]
    >,
  'getContent' : (arg_0: string) => Promise<[] | [ContentPlus]>,
  'getDeployer' : () => Promise<Principal>,
  'getModclubHoldings' : () => Promise<Holdings>,
  'getModeratorLeaderboard' : (arg_0: bigint, arg_1: bigint) => Promise<
      Array<ModeratorLeaderboard>
    >,
  'getPohAttempts' : () => Promise<PohStableState>,
  'getPohTaskData' : (arg_0: string) => Promise<Result_3>,
  'getPohTaskDataForAdminUsers' : (arg_0: string) => Promise<Result_2>,
  'getPohTasks' : (
      arg_0: ContentStatus,
      arg_1: bigint,
      arg_2: bigint,
    ) => Promise<Array<PohTaskPlus>>,
  'getProfile' : () => Promise<Profile>,
  'getProfileById' : (arg_0: Principal) => Promise<Profile>,
  'getProvider' : (arg_0: Principal) => Promise<ProviderPlus>,
  'getProviderAdmins' : (arg_0: Principal) => Promise<Array<Profile>>,
  'getProviderContent' : (
      arg_0: Principal,
      arg_1: ContentStatus,
      arg_2: bigint,
      arg_3: bigint,
    ) => Promise<Array<ContentPlus>>,
  'getRules' : (arg_0: Principal) => Promise<Array<Rule>>,
  'getTaskStats' : (arg_0: bigint) => Promise<[bigint, bigint, bigint, bigint]>,
  'getTasks' : (arg_0: bigint, arg_1: bigint, arg_2: boolean) => Promise<
      Array<ContentPlus>
    >,
  'getTokenHoldings' : () => Promise<Holdings>,
  'getVotePerformance' : () => Promise<number>,
  'isAirdropRegistered' : () => Promise<AirdropUser>,
  'isUserAdmin' : () => Promise<boolean>,
  'issueJwt' : () => Promise<string>,
  'pohCallbackForModclub' : (arg_0: PohVerificationResponsePlus) => Promise<
      undefined
    >,
  'populateChallenges' : () => Promise<undefined>,
  'registerAdmin' : (arg_0: Principal) => Promise<Result>,
  'registerModerator' : (
      arg_0: string,
      arg_1: [] | [string],
      arg_2: [] | [Image],
    ) => Promise<Profile>,
  'registerProvider' : (
      arg_0: string,
      arg_1: string,
      arg_2: [] | [Image],
    ) => Promise<string>,
  'removeProviderAdmin' : (arg_0: Principal, arg_1: Principal) => Promise<
      ProviderResult
    >,
  'removeRules' : (arg_0: Array<RuleId>, arg_1: [] | [Principal]) => Promise<
      undefined
    >,
  'resetUserChallengeAttempt' : (arg_0: string) => Promise<Result_1>,
  'retiredDataCanisterIdForWriting' : (arg_0: string) => Promise<undefined>,
  'retrieveChallengesForUser' : (arg_0: string) => Promise<Result_1>,
  'rewardPoints' : (arg_0: Principal, arg_1: bigint) => Promise<undefined>,
  'setRandomization' : (arg_0: boolean) => Promise<undefined>,
  'shuffleContent' : () => Promise<undefined>,
  'shufflePohContent' : () => Promise<undefined>,
  'stakeTokens' : (arg_0: bigint) => Promise<string>,
  'submitChallengeData' : (arg_0: PohChallengeSubmissionRequest) => Promise<
      PohChallengeSubmissionResponse
    >,
  'submitHtmlContent' : (
      arg_0: string,
      arg_1: string,
      arg_2: [] | [string],
    ) => Promise<string>,
  'submitImage' : (
      arg_0: string,
      arg_1: Array<number>,
      arg_2: string,
      arg_3: [] | [string],
    ) => Promise<string>,
  'submitText' : (
      arg_0: string,
      arg_1: string,
      arg_2: [] | [string],
    ) => Promise<string>,
  'subscribe' : (arg_0: SubscribeMessage) => Promise<undefined>,
  'subscribePohCallback' : (arg_0: SubscribePohMessage) => Promise<undefined>,
  'toggleAllowSubmission' : (arg_0: boolean) => Promise<undefined>,
  'unStakeTokens' : (arg_0: bigint) => Promise<string>,
  'unregisterAdmin' : (arg_0: string) => Promise<Result>,
  'updateProvider' : (arg_0: Principal, arg_1: ProviderMeta) => Promise<
      ProviderMetaResult
    >,
  'updateProviderLogo' : (
      arg_0: Principal,
      arg_1: Array<number>,
      arg_2: string,
    ) => Promise<string>,
  'updateRules' : (arg_0: Array<Rule>, arg_1: [] | [Principal]) => Promise<
      undefined
    >,
  'updateSettings' : (arg_0: Principal, arg_1: ProviderSettings) => Promise<
      ProviderSettingResult
    >,
  'verifyHumanity' : (arg_0: string) => Promise<PohVerificationResponsePlus>,
  'verifyUserHumanityForModclub' : () => Promise<VerifyHumanityResponse>,
  'vote' : (
      arg_0: ContentId,
      arg_1: Decision,
      arg_2: [] | [Array<RuleId>],
    ) => Promise<string>,
  'votePohContent' : (
      arg_0: string,
      arg_1: Decision,
      arg_2: Array<PohRulesViolated>,
    ) => Promise<undefined>,
  'whoami' : () => Promise<Principal>,
}
export interface ModeratorLeaderboard {
  'id' : UserId,
  'completedVoteCount' : bigint,
  'userName' : string,
  'rewardsEarned' : bigint,
  'lastVoted' : [] | [Timestamp],
  'performance' : number,
}
export type Nanos = bigint;
export interface NumericEntity {
  'avg' : bigint,
  'max' : bigint,
  'min' : bigint,
  'first' : bigint,
  'last' : bigint,
}
export interface PohChallengePackage {
  'id' : string,
  'title' : [] | [string],
  'userId' : Principal,
  'createdAt' : bigint,
  'updatedAt' : bigint,
  'challengeIds' : Array<string>,
}
export type PohChallengeRequiredField = { 'imageBlob' : null } |
  { 'textBlob' : null } |
  { 'videoBlob' : null } |
  { 'profileFieldBlobs' : null };
export type PohChallengeStatus = { 'notSubmitted' : null } |
  { 'verified' : null } |
  { 'expired' : null } |
  { 'pending' : null } |
  { 'rejected' : null };
export interface PohChallengeSubmissionRequest {
  'numOfChunks' : bigint,
  'mimeType' : string,
  'offset' : bigint,
  'challengeId' : string,
  'dataSize' : bigint,
  'challengeDataBlob' : [] | [Array<number>],
}
export interface PohChallengeSubmissionResponse {
  'submissionStatus' : PohChallengeSubmissionStatus,
  'challengeId' : string,
}
export type PohChallengeSubmissionStatus = { 'ok' : null } |
  { 'notPendingForSubmission' : null } |
  { 'alreadySubmitted' : null } |
  { 'alreadyApproved' : null } |
  { 'alreadyRejected' : null } |
  { 'submissionDataLimitExceeded' : null } |
  { 'inputDataMissing' : null } |
  { 'incorrectChallenge' : null };
export type PohChallengeType = { 'dl' : null } |
  { 'ssn' : null } |
  { 'userName' : null } |
  { 'fullName' : null } |
  { 'email' : null } |
  { 'selfVideo' : null } |
  { 'selfPic' : null };
export interface PohChallenges {
  'allowedViolationRules' : Array<ViolatedRules>,
  'createdAt' : bigint,
  'dependentChallengeId' : [] | [Array<string>],
  'updatedAt' : bigint,
  'challengeId' : string,
  'challengeDescription' : string,
  'challengeName' : string,
  'challengeType' : PohChallengeType,
  'requiredField' : PohChallengeRequiredField,
}
export interface PohChallengesAttempt {
  'dataCanisterId' : [] | [Principal],
  'status' : PohChallengeStatus,
  'completedOn' : bigint,
  'attemptId' : [] | [string],
  'userId' : Principal,
  'createdAt' : bigint,
  'updatedAt' : bigint,
  'challengeId' : string,
  'challengeDescription' : string,
  'challengeName' : string,
  'challengeType' : PohChallengeType,
  'wordList' : [] | [Array<string>],
}
export interface PohChallengesAttemptV1 {
  'dataCanisterId' : [] | [Principal],
  'status' : PohChallengeStatus,
  'completedOn' : bigint,
  'attemptId' : [] | [string],
  'userId' : Principal,
  'createdAt' : bigint,
  'submittedAt' : bigint,
  'updatedAt' : bigint,
  'challengeId' : string,
  'challengeDescription' : string,
  'challengeName' : string,
  'challengeType' : PohChallengeType,
  'wordList' : [] | [Array<string>],
}
export type PohError = { 'pohCallbackNotRegistered' : null } |
  { 'invalidPackageId' : null } |
  { 'pohNotConfiguredForProvider' : null } |
  { 'challengeNotPendingForSubmission' : null } |
  { 'invalidToken' : null } |
  { 'attemptToAssociateMultipleModclubAccounts' : Principal };
export interface PohProviderAndUserData {
  'token' : string,
  'generatedAt' : bigint,
  'providerId' : Principal,
  'providerUserId' : string,
}
export interface PohRulesViolated { 'ruleId' : string, 'challengeId' : string }
export interface PohStableState {
  'userToPohChallengePackageId' : RelShared_1,
  'providersCallback' : Array<[Principal, SubscribePohMessage]>,
  'pohChallenges' : Array<[string, PohChallenges]>,
  'callbackIssuedByProvider' : Array<[Principal, Array<[Principal, bigint]>]>,
  'token2ProviderAndUserData' : Array<[string, PohProviderAndUserData]>,
  'pohChallengePackages' : Array<[string, PohChallengePackage]>,
  'pohUserChallengeAttempts' : Array<
    [Principal, Array<[string, Array<PohChallengesAttemptV1>]>]
  >,
  'providerUserIdToModclubUserIdByProviderId' : Array<[Principal, RelShared]>,
  'wordList' : Array<string>,
}
export interface PohTaskData {
  'dataCanisterId' : [] | [Principal],
  'status' : PohChallengeStatus,
  'completedOn' : bigint,
  'contentId' : [] | [string],
  'allowedViolationRules' : Array<ViolatedRules>,
  'userId' : Principal,
  'createdAt' : bigint,
  'submittedAt' : bigint,
  'updatedAt' : bigint,
  'challengeId' : string,
  'challengeType' : PohChallengeType,
  'wordList' : [] | [Array<string>],
}
export interface PohTaskDataAndVotesWrapperPlus {
  'reward' : number,
  'minVotes' : bigint,
  'createdAt' : bigint,
  'minStake' : bigint,
  'updatedAt' : bigint,
  'pohTaskData' : Array<PohTaskData>,
  'packageId' : string,
  'voteUserDetails' : Array<VotePlusUser>,
}
export interface PohTaskDataWrapperPlus {
  'reward' : number,
  'minVotes' : bigint,
  'votes' : bigint,
  'createdAt' : bigint,
  'minStake' : bigint,
  'updatedAt' : bigint,
  'pohTaskData' : Array<PohTaskData>,
  'packageId' : string,
}
export interface PohTaskPlus {
  'status' : ContentStatus,
  'reward' : number,
  'title' : [] | [string],
  'profileImageUrlSuffix' : [] | [string],
  'voteCount' : bigint,
  'minVotes' : bigint,
  'createdAt' : bigint,
  'minStake' : bigint,
  'updatedAt' : bigint,
  'hasVoted' : [] | [boolean],
  'packageId' : string,
}
export interface PohTaskPlusForAdmin {
  'status' : ContentStatus,
  'completedOn' : bigint,
  'profileImageUrlSuffix' : [] | [string],
  'voteCount' : bigint,
  'submittedAt' : bigint,
  'userUserName' : string,
  'userModClubId' : string,
  'pohTaskData' : Array<PohTaskData>,
  'userEmailId' : string,
  'packageId' : string,
}
export interface PohVerificationResponsePlus {
  'status' : PohVerificationStatus,
  'completedAt' : [] | [bigint],
  'token' : [] | [string],
  'rejectionReasons' : Array<string>,
  'submittedAt' : [] | [bigint],
  'isFirstAssociation' : boolean,
  'providerId' : Principal,
  'challenges' : Array<ChallengeResponse>,
  'requestedAt' : [] | [bigint],
  'providerUserId' : string,
}
export type PohVerificationStatus = { 'notSubmitted' : null } |
  { 'verified' : null } |
  { 'expired' : null } |
  { 'pending' : null } |
  { 'startPoh' : null } |
  { 'rejected' : null };
export interface Profile {
  'id' : UserId,
  'pic' : [] | [Image],
  'userName' : string,
  'createdAt' : Timestamp,
  'role' : Role,
  'email' : string,
  'updatedAt' : Timestamp,
}
export type ProviderError = { 'ProviderAdminIsAlreadyRegistered' : null } |
  { 'InvalidContentType' : null } |
  { 'NotFound' : null } |
  { 'Unauthorized' : null } |
  { 'RequiresWhitelisting' : null } |
  { 'InvalidContentStatus' : null } |
  { 'InvalidProvider' : null } |
  { 'ProviderIsRegistered' : null };
export type ProviderId = Principal;
export interface ProviderMeta { 'name' : string, 'description' : string }
export type ProviderMetaResult = { 'ok' : ProviderMeta } |
  { 'err' : ProviderError };
export interface ProviderPlus {
  'id' : Principal,
  'contentCount' : bigint,
  'rewardsSpent' : bigint,
  'name' : string,
  'createdAt' : Timestamp,
  'description' : string,
  'updatedAt' : Timestamp,
  'settings' : ProviderSettings,
  'activeCount' : bigint,
  'image' : [] | [Image],
  'rules' : Array<Rule>,
}
export type ProviderResult = { 'ok' : null } |
  { 'err' : ProviderError };
export type ProviderSettingResult = { 'ok' : ProviderSettings } |
  { 'err' : ProviderError };
export interface ProviderSettings { 'minVotes' : bigint, 'minStaked' : bigint }
export interface RelShared { 'forw' : Trie2D }
export interface RelShared_1 { 'forw' : Trie2D_1 }
export type Result = { 'ok' : null } |
  { 'err' : string };
export type Result_1 = { 'ok' : Array<PohChallengesAttempt> } |
  { 'err' : PohError };
export type Result_2 = { 'ok' : PohTaskDataAndVotesWrapperPlus } |
  { 'err' : PohError };
export type Result_3 = { 'ok' : PohTaskDataWrapperPlus } |
  { 'err' : PohError };
export type Result_4 = { 'ok' : Array<Principal> } |
  { 'err' : string };
export type Role = { 'admin' : null } |
  { 'moderator' : null } |
  { 'owner' : null };
export interface Rule { 'id' : RuleId, 'description' : string }
export type RuleId = string;
export interface SubscribeMessage { 'callback' : [Principal, string] }
export interface SubscribePohMessage { 'callback' : [Principal, string] }
export type Timestamp = bigint;
export type Trie = { 'branch' : Branch } |
  { 'leaf' : Leaf } |
  { 'empty' : null };
export type Trie2D = { 'branch' : Branch } |
  { 'leaf' : Leaf } |
  { 'empty' : null };
export type Trie2D_1 = { 'branch' : Branch_2 } |
  { 'leaf' : Leaf_2 } |
  { 'empty' : null };
export type Trie_1 = { 'branch' : Branch_1 } |
  { 'leaf' : Leaf_1 } |
  { 'empty' : null };
export type Trie_2 = { 'branch' : Branch_2 } |
  { 'leaf' : Leaf_2 } |
  { 'empty' : null };
export type Trie_3 = { 'branch' : Branch_3 } |
  { 'leaf' : Leaf_3 } |
  { 'empty' : null };
export type UpdateCallsAggregatedData = Array<bigint>;
export type UserId = Principal;
export interface VerifyHumanityResponse {
  'status' : PohVerificationStatus,
  'token' : [] | [string],
  'rejectionReasons' : Array<string>,
}
export interface ViolatedRules { 'ruleId' : string, 'ruleDesc' : string }
export interface Vote {
  'id' : VoteId,
  'contentId' : string,
  'decision' : Decision,
  'userId' : UserId,
  'createdAt' : Timestamp,
  'violatedRules' : [] | [Array<RuleId>],
}
export type VoteId = string;
export interface VotePlusUser {
  'userVoteDecision' : Decision__1,
  'userUserName' : string,
  'userModClubId' : Principal,
  'userEmailId' : string,
  'userVoteCreatedAt' : bigint,
}
export interface _SERVICE extends ModClub {}
