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
  'completedOn' : [] | [bigint],
  'challengeId' : string,
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
  'adminTransferTokens' : (arg_0: Principal, arg_1: bigint) => Promise<
      undefined
    >,
  'airdropRegister' : () => Promise<AirdropUser>,
  'allNewContent' : () => Promise<Array<string>>,
  'collectCanisterMetrics' : () => Promise<undefined>,
  'deregisterProvider' : () => Promise<string>,
  'distributeAllPendingRewards' : () => Promise<undefined>,
  'editProviderAdmin' : (
      arg_0: Principal,
      arg_1: Principal,
      arg_2: string,
    ) => Promise<ProviderResult>,
  'generateSigningKey' : () => Promise<undefined>,
  'getActivity' : (arg_0: boolean) => Promise<Array<Activity>>,
  'getAdminProviderIDs' : () => Promise<Array<Principal>>,
  'getAdmins' : () => Promise<Result_3>,
  'getAirdropUsers' : () => Promise<Array<AirdropUser>>,
  'getAirdropWhitelist' : () => Promise<Array<Principal>>,
  'getAllContent' : (arg_0: ContentStatus) => Promise<Array<ContentPlus>>,
  'getAllDataCanisterIds' : () => Promise<[Array<Principal>, Array<string>]>,
  'getAllModeratorHoldings' : () => Promise<Array<[Principal, Holdings]>>,
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
  'getPohAttempts' : () => Promise<
      Array<[Principal, Array<[string, Array<PohChallengesAttempt>]>]>
    >,
  'getPohTaskData' : (arg_0: string) => Promise<Result_2>,
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
  'issueJwt' : () => Promise<string>,
  'newContentQueuesByqId' : (arg_0: bigint) => Promise<Array<string>>,
  'newContentQueuesqIdCount' : () => Promise<[Array<bigint>, Array<bigint>]>,
  'pohGenerateUniqueToken' : (arg_0: Principal) => Promise<PohUniqueToken>,
  'pohVerificationRequest' : (arg_0: Principal) => Promise<
      PohVerificationResponse
    >,
  'populateChallenges' : () => Promise<undefined>,
  'registerAdmin' : (arg_0: Principal) => Promise<Result>,
  'registerModerator' : (
      arg_0: string,
      arg_1: string,
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
  'userId2QueueId' : () => Promise<Array<[Principal, string]>>,
  'verifyUserHumanity' : () => Promise<VerifyHumanityResponse>,
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
export type PohChallengeStatus = { 'notSubmitted' : null } |
  { 'verified' : null } |
  { 'expired' : null } |
  { 'pending' : null } |
  { 'rejected' : null };
export interface PohChallengeSubmissionRequest {
  'userName' : [] | [string],
  'numOfChunks' : bigint,
  'mimeType' : string,
  'fullName' : [] | [string],
  'offset' : bigint,
  'email' : [] | [string],
  'challengeId' : string,
  'dataSize' : bigint,
  'aboutUser' : [] | [string],
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
  { 'inputDataMissing' : null } |
  { 'incorrectChallenge' : null };
export type PohChallengeType = { 'dl' : null } |
  { 'ssn' : null } |
  { 'userName' : null } |
  { 'fullName' : null } |
  { 'email' : null } |
  { 'selfVideo' : null } |
  { 'selfPic' : null };
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
export type PohError = { 'invalidPackageId' : null } |
  { 'challengeNotPendingForSubmission' : null } |
  { 'invalidToken' : null };
export interface PohRulesViolated { 'ruleId' : string, 'challengeId' : string }
export interface PohTaskData {
  'dataCanisterId' : [] | [Principal],
  'status' : PohChallengeStatus,
  'userName' : [] | [string],
  'contentId' : [] | [string],
  'allowedViolationRules' : Array<ViolatedRules>,
  'userId' : Principal,
  'createdAt' : bigint,
  'fullName' : [] | [string],
  'email' : [] | [string],
  'updatedAt' : bigint,
  'challengeId' : string,
  'challengeType' : PohChallengeType,
  'aboutUser' : [] | [string],
  'wordList' : [] | [Array<string>],
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
  'userName' : [] | [string],
  'title' : [] | [string],
  'profileImageUrlSuffix' : [] | [string],
  'voteCount' : bigint,
  'minVotes' : bigint,
  'createdAt' : bigint,
  'fullName' : [] | [string],
  'email' : [] | [string],
  'minStake' : bigint,
  'updatedAt' : bigint,
  'aboutUser' : [] | [string],
  'hasVoted' : [] | [boolean],
  'packageId' : string,
}
export interface PohUniqueToken { 'token' : string }
export interface PohVerificationResponse {
  'status' : PohChallengeStatus,
  'requestId' : string,
  'providerId' : Principal,
  'challenges' : Array<ChallengeResponse>,
  'requestedOn' : bigint,
  'providerUserId' : Principal,
}
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
export type Result = { 'ok' : null } |
  { 'err' : string };
export type Result_1 = { 'ok' : Array<PohChallengesAttempt> } |
  { 'err' : PohError };
export type Result_2 = { 'ok' : PohTaskDataWrapperPlus } |
  { 'err' : PohError };
export type Result_3 = { 'ok' : Array<Principal> } |
  { 'err' : string };
export type Role = { 'admin' : null } |
  { 'moderator' : null } |
  { 'owner' : null };
export interface Rule { 'id' : RuleId, 'description' : string }
export type RuleId = string;
export interface SubscribeMessage { 'callback' : [Principal, string] }
export type Timestamp = bigint;
export type UpdateCallsAggregatedData = Array<bigint>;
export type UserId = Principal;
export interface VerifyHumanityResponse {
  'status' : PohChallengeStatus,
  'token' : [] | [PohUniqueToken],
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
export interface _SERVICE extends ModClub {}
