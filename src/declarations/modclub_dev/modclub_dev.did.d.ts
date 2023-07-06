import type { Principal } from "@dfinity/principal";
import type { ActorMethod } from "@dfinity/agent";

export interface Activity {
  status: ContentStatus;
  reward: number;
  title: [] | [string];
  voteCount: bigint;
  contentType: ContentType;
  rewardRelease: Timestamp;
  createdAt: Timestamp;
  vote: Vote;
  minStake: bigint;
  updatedAt: Timestamp;
  providerName: string;
  providerId: ProviderId;
  requiredVotes: bigint;
}
export type AssocList = [] | [[[Key, Trie_1], List_1]];
export type AssocList_1 = [] | [[[Key_1, null], List]];
export type AssocList_2 = [] | [[[Key_1, Trie_3], List_3]];
export type AssocList_3 = [] | [[[Key, null], List_2]];
export interface Branch {
  left: Trie;
  size: bigint;
  right: Trie;
}
export interface Branch_1 {
  left: Trie_1;
  size: bigint;
  right: Trie_1;
}
export interface Branch_2 {
  left: Trie_2;
  size: bigint;
  right: Trie_2;
}
export interface Branch_3 {
  left: Trie_3;
  size: bigint;
  right: Trie_3;
}
export type CanisterCyclesAggregatedData = BigUint64Array | bigint[];
export type CanisterHeapMemoryAggregatedData = BigUint64Array | bigint[];
export interface CanisterHttpResponsePayload {
  status: bigint;
  body: Uint8Array | number[];
  headers: Array<HttpHeader>;
}
export type CanisterLogFeature =
  | { filterMessageByContains: null }
  | { filterMessageByRegex: null };
export interface CanisterLogMessages {
  data: Array<LogMessagesData>;
  lastAnalyzedMessageTimeNanos: [] | [Nanos];
}
export interface CanisterLogMessagesInfo {
  features: Array<[] | [CanisterLogFeature]>;
  lastTimeNanos: [] | [Nanos];
  count: number;
  firstTimeNanos: [] | [Nanos];
}
export type CanisterLogRequest =
  | { getMessagesInfo: null }
  | { getMessages: GetLogMessagesParameters }
  | { getLatestMessages: GetLatestLogMessagesParameters };
export type CanisterLogResponse =
  | { messagesInfo: CanisterLogMessagesInfo }
  | { messages: CanisterLogMessages };
export type CanisterMemoryAggregatedData = BigUint64Array | bigint[];
export interface CanisterMetrics {
  data: CanisterMetricsData;
}
export type CanisterMetricsData =
  | { hourly: Array<HourlyMetricsData> }
  | { daily: Array<DailyMetricsData> };
export interface ChallengeResponse {
  status: PohChallengeStatus;
  completedAt: [] | [bigint];
  submittedAt: [] | [bigint];
  challengeId: string;
  requestedAt: [] | [bigint];
}
export interface Complexity {
  expiryTime: Timestamp;
  level: Level;
}
export type ConsumerPayload = { admins: Array<Principal> };
export type ContentId = string;
export interface ContentPlus {
  id: ContentId;
  status: ContentStatus;
  title: [] | [string];
  voteCount: bigint;
  receipt: Receipt;
  contentType: ContentType;
  createdAt: Timestamp;
  text: [] | [string];
  sourceId: string;
  minStake: bigint;
  updatedAt: Timestamp;
  reservedList: Array<Reserved>;
  providerName: string;
  image: [] | [Image];
  hasVoted: [] | [boolean];
  providerId: Principal;
  voteParameters: VoteParameters;
  requiredVotes: bigint;
}
export interface ContentResult {
  status: ContentStatus;
  approvedCount: bigint;
  sourceId: string;
  violatedRules: Array<ViolatedRules>;
  rejectedCount: bigint;
}
export type ContentStatus =
  | { new: null }
  | { approved: null }
  | { rejected: null };
export type ContentType =
  | { imageBlob: null }
  | { text: null }
  | { htmlContent: null }
  | { imageUrl: null }
  | { multiText: null };
export interface DailyMetricsData {
  updateCalls: bigint;
  canisterHeapMemorySize: NumericEntity;
  canisterCycles: NumericEntity;
  canisterMemorySize: NumericEntity;
  timeMillis: bigint;
}
export type Decision = { approved: null } | { rejected: null };
export type Decision__1 = { approved: null } | { rejected: null };
export type ENV =
  | { qa: null }
  | { dev: null }
  | { prod: null }
  | {
      local: {
        wallet_canister_id: Principal;
        modclub_canister_id: Principal;
        rs_canister_id: Principal;
        auth_canister_id: Principal;
      };
    };
export interface GetLatestLogMessagesParameters {
  upToTimeNanos: [] | [Nanos];
  count: number;
  filter: [] | [GetLogMessagesFilter];
}
export interface GetLogMessagesFilter {
  analyzeCount: number;
  messageRegex: [] | [string];
  messageContains: [] | [string];
}
export interface GetLogMessagesParameters {
  count: number;
  filter: [] | [GetLogMessagesFilter];
  fromTimeNanos: [] | [Nanos];
}
export interface GetMetricsParameters {
  dateToMillis: bigint;
  granularity: MetricsGranularity;
  dateFromMillis: bigint;
}
export type Hash = number;
export type HeaderField = [string, string];
export interface HourlyMetricsData {
  updateCalls: UpdateCallsAggregatedData;
  canisterHeapMemorySize: CanisterHeapMemoryAggregatedData;
  canisterCycles: CanisterCyclesAggregatedData;
  canisterMemorySize: CanisterMemoryAggregatedData;
  timeMillis: bigint;
}
export interface HttpHeader {
  value: string;
  name: string;
}
export interface HttpRequest {
  url: string;
  method: string;
  body: Uint8Array | number[];
  headers: Array<HeaderField>;
}
export interface HttpResponse {
  body: Uint8Array | number[];
  headers: Array<HeaderField>;
  upgrade: [] | [boolean];
  streaming_strategy: [] | [StreamingStrategy];
  status_code: number;
}
export interface Image {
  imageType: string;
  data: Uint8Array | number[];
}
export interface Key {
  key: string;
  hash: Hash;
}
export interface Key_1 {
  key: Principal;
  hash: Hash;
}
export interface Leaf {
  size: bigint;
  keyvals: AssocList;
}
export interface Leaf_1 {
  size: bigint;
  keyvals: AssocList_1;
}
export interface Leaf_2 {
  size: bigint;
  keyvals: AssocList_2;
}
export interface Leaf_3 {
  size: bigint;
  keyvals: AssocList_3;
}
export type Level =
  | { normal: null }
  | { hard: null }
  | { xhard: null }
  | { simple: null };
export type List = [] | [[[Key_1, null], List]];
export type List_1 = [] | [[[Key, Trie_1], List_1]];
export type List_2 = [] | [[[Key, null], List_2]];
export type List_3 = [] | [[[Key_1, Trie_3], List_3]];
export interface LogMessagesData {
  timeNanos: Nanos;
  message: string;
}
export type MetricsGranularity = { hourly: null } | { daily: null };
export interface ModClub {
  AdminCheckPohVerificationResp: ActorMethod<
    [string, Principal],
    PohVerificationResponsePlus
  >;
  addProviderAdmin: ActorMethod<
    [Principal, string, [] | [Principal]],
    ProviderResult
  >;
  addRules: ActorMethod<[Array<string>, [] | [Principal]], undefined>;
  addToAllowList: ActorMethod<[Principal], undefined>;
  adminInit: ActorMethod<[], undefined>;
  adminUpdateEmail: ActorMethod<[Principal, string], Profile>;
  canReserveContent: ActorMethod<[string], Result_4>;
  checkIfUserOptToReciveAlerts: ActorMethod<[], boolean>;
  collectCanisterMetrics: ActorMethod<[], undefined>;
  configurePohForProvider: ActorMethod<
    [Principal, Array<string>, bigint, boolean],
    undefined
  >;
  deregisterProvider: ActorMethod<[], string>;
  downloadSupport: ActorMethod<
    [string, string, bigint, bigint],
    Array<Array<string>>
  >;
  editProviderAdmin: ActorMethod<
    [Principal, Principal, string],
    ProviderResult
  >;
  generateSigningKey: ActorMethod<[], undefined>;
  getActivity: ActorMethod<[boolean], Array<Activity>>;
  getAdminProviderIDs: ActorMethod<[], Array<Principal>>;
  getAllContent: ActorMethod<[ContentStatus], Array<ContentPlus>>;
  getAllDataCanisterIds: ActorMethod<[], [Array<Principal>, Array<string>]>;
  getAllPohTasksForAdminUsers: ActorMethod<
    [ContentStatus, bigint, bigint, Array<string>, bigint, bigint],
    Array<PohTaskPlusForAdmin>
  >;
  getAllProfiles: ActorMethod<[], Array<Profile>>;
  getAllUsersWantToReceiveAlerts: ActorMethod<[], Array<string>>;
  getCanisterLog: ActorMethod<
    [[] | [CanisterLogRequest]],
    [] | [CanisterLogResponse]
  >;
  getCanisterMetrics: ActorMethod<
    [GetMetricsParameters],
    [] | [CanisterMetrics]
  >;
  getContent: ActorMethod<[string], [] | [ContentPlus]>;
  getContentResult: ActorMethod<[string], ContentResult>;
  getDeployer: ActorMethod<[], Principal>;
  getModeratorEmailsForPOHAndSendEmail: ActorMethod<[string], undefined>;
  getModeratorLeaderboard: ActorMethod<
    [bigint, bigint],
    Array<ModeratorLeaderboard>
  >;
  getPohAttempts: ActorMethod<[], PohStableState>;
  getPohTaskData: ActorMethod<[string], Result_3>;
  getPohTaskDataForAdminUsers: ActorMethod<[string], Result_2>;
  getPohTasks: ActorMethod<[ContentStatus, bigint, bigint], Array<PohTaskPlus>>;
  getProfile: ActorMethod<[], Profile>;
  getProfileById: ActorMethod<[Principal], Profile>;
  getProvider: ActorMethod<[Principal], ProviderPlus>;
  getProviderAdmins: ActorMethod<[Principal], Array<Profile>>;
  getProviderContent: ActorMethod<
    [Principal, ContentStatus, bigint, bigint],
    Array<ContentPlus>
  >;
  getProviderRules: ActorMethod<[], Array<Rule>>;
  getReservedByContentId: ActorMethod<[string], Result_1>;
  getRules: ActorMethod<[Principal], Array<Rule>>;
  getTaskStats: ActorMethod<[bigint], [bigint, bigint, bigint, bigint]>;
  getTasks: ActorMethod<[bigint, bigint, boolean], Array<ContentPlus>>;
  getVotePerformance: ActorMethod<[], number>;
  handleSubscription: ActorMethod<[ConsumerPayload], undefined>;
  http_request: ActorMethod<[HttpRequest], HttpResponse>;
  http_request_update: ActorMethod<[HttpRequest], HttpResponse>;
  issueJwt: ActorMethod<[], string>;
  pohCallbackForModclub: ActorMethod<[PohVerificationResponsePlus], undefined>;
  populateChallenges: ActorMethod<[], undefined>;
  providerSaBalance: ActorMethod<[string], Tokens>;
  registerModerator: ActorMethod<
    [string, [] | [string], [] | [Image]],
    Profile
  >;
  registerProvider: ActorMethod<[string, string, [] | [Image]], string>;
  registerUserToReceiveAlerts: ActorMethod<[Principal, boolean], boolean>;
  removeProviderAdmin: ActorMethod<[Principal, Principal], ProviderResult>;
  removeRules: ActorMethod<[Array<RuleId>, [] | [Principal]], undefined>;
  reserveContent: ActorMethod<[string], undefined>;
  resetUserChallengeAttempt: ActorMethod<[string], Result>;
  retiredDataCanisterIdForWriting: ActorMethod<[string], undefined>;
  retrieveChallengesForUser: ActorMethod<[string], Result>;
  sendVerificationEmail: ActorMethod<[string], boolean>;
  setRandomization: ActorMethod<[boolean], undefined>;
  setVoteParamsForLevel: ActorMethod<[bigint, Level], undefined>;
  showAdmins: ActorMethod<[], Array<Principal>>;
  shuffleContent: ActorMethod<[], undefined>;
  shufflePohContent: ActorMethod<[], undefined>;
  submitChallengeData: ActorMethod<
    [PohChallengeSubmissionRequest],
    PohChallengeSubmissionResponse
  >;
  submitHtmlContent: ActorMethod<[string, string, [] | [string]], string>;
  submitImage: ActorMethod<
    [string, Uint8Array | number[], string, [] | [string]],
    string
  >;
  submitText: ActorMethod<[string, string, [] | [string]], string>;
  subscribe: ActorMethod<[SubscribeMessage], undefined>;
  subscribePohCallback: ActorMethod<[SubscribePohMessage], undefined>;
  toggleAllowSubmission: ActorMethod<[boolean], undefined>;
  topUpProviderReserve: ActorMethod<
    [{ amount: bigint; providerId: [] | [Principal] }],
    undefined
  >;
  transform: ActorMethod<[TransformArgs], CanisterHttpResponsePayload>;
  unStakeTokens: ActorMethod<[bigint], string>;
  updateProvider: ActorMethod<[Principal, ProviderMeta], ProviderMetaResult>;
  updateProviderLogo: ActorMethod<
    [Principal, Uint8Array | number[], string],
    string
  >;
  updateRules: ActorMethod<[Array<Rule>, [] | [Principal]], undefined>;
  updateSettings: ActorMethod<
    [Principal, ProviderSettings],
    ProviderSettingResult
  >;
  verifyHumanity: ActorMethod<[string], PohVerificationResponsePlus>;
  verifyUserHumanityForModclub: ActorMethod<[], VerifyHumanityResponse>;
  vote: ActorMethod<[ContentId, Decision, [] | [Array<RuleId>]], string>;
  votePohContent: ActorMethod<
    [string, Decision, Array<PohRulesViolated>],
    undefined
  >;
  whoami: ActorMethod<[], Principal>;
}
export interface ModeratorLeaderboard {
  id: UserId;
  rs: number;
  completedVoteCount: bigint;
  userName: string;
  rewardsEarned: bigint;
  lastVoted: [] | [Timestamp];
  performance: number;
}
export type Nanos = bigint;
export interface NumericEntity {
  avg: bigint;
  max: bigint;
  min: bigint;
  first: bigint;
  last: bigint;
}
export interface PohChallengePackage {
  id: string;
  title: [] | [string];
  userId: Principal;
  createdAt: bigint;
  updatedAt: bigint;
  challengeIds: Array<string>;
}
export type PohChallengeRequiredField =
  | { imageBlob: null }
  | { textBlob: null }
  | { videoBlob: null }
  | { profileFieldBlobs: null };
export type PohChallengeStatus =
  | { notSubmitted: null }
  | { verified: null }
  | { expired: null }
  | { pending: null }
  | { rejected: null };
export interface PohChallengeSubmissionRequest {
  numOfChunks: bigint;
  mimeType: string;
  offset: bigint;
  challengeId: string;
  dataSize: bigint;
  challengeDataBlob: [] | [Uint8Array | number[]];
}
export interface PohChallengeSubmissionResponse {
  submissionStatus: PohChallengeSubmissionStatus;
  challengeId: string;
}
export type PohChallengeSubmissionStatus =
  | { ok: null }
  | { notPendingForSubmission: null }
  | { alreadySubmitted: null }
  | { alreadyApproved: null }
  | { alreadyRejected: null }
  | { submissionDataLimitExceeded: null }
  | { inputDataMissing: null }
  | { incorrectChallenge: null };
export type PohChallengeType =
  | { dl: null }
  | { ssn: null }
  | { userName: null }
  | { fullName: null }
  | { email: null }
  | { selfVideo: null }
  | { selfPic: null };
export interface PohChallenges {
  allowedViolationRules: Array<ViolatedRules__1>;
  createdAt: bigint;
  dependentChallengeId: [] | [Array<string>];
  updatedAt: bigint;
  challengeId: string;
  challengeDescription: string;
  challengeName: string;
  challengeType: PohChallengeType;
  requiredField: PohChallengeRequiredField;
}
export interface PohChallengesAttempt {
  dataCanisterId: [] | [Principal];
  status: PohChallengeStatus;
  completedOn: bigint;
  attemptId: [] | [string];
  userId: Principal;
  createdAt: bigint;
  updatedAt: bigint;
  challengeId: string;
  challengeDescription: string;
  challengeName: string;
  challengeType: PohChallengeType;
  wordList: [] | [Array<string>];
}
export interface PohChallengesAttemptV1 {
  dataCanisterId: [] | [Principal];
  status: PohChallengeStatus;
  completedOn: bigint;
  attemptId: [] | [string];
  userId: Principal;
  createdAt: bigint;
  submittedAt: bigint;
  updatedAt: bigint;
  challengeId: string;
  challengeDescription: string;
  challengeName: string;
  challengeType: PohChallengeType;
  wordList: [] | [Array<string>];
}
export type PohError =
  | { pohCallbackNotRegistered: null }
  | { invalidPackageId: null }
  | { pohNotConfiguredForProvider: null }
  | { challengeNotPendingForSubmission: null }
  | { invalidToken: null }
  | { attemptToCreateMultipleWalletsWithSameIp: null }
  | { attemptToAssociateMultipleModclubAccounts: Principal };
export interface PohProviderAndUserData {
  token: string;
  generatedAt: bigint;
  providerId: Principal;
  providerUserId: string;
}
export interface PohRulesViolated {
  ruleId: string;
  challengeId: string;
}
export interface PohStableState {
  userToPohChallengePackageId: RelShared_1;
  providersCallback: Array<[Principal, SubscribePohMessage]>;
  pohChallenges: Array<[string, PohChallenges]>;
  callbackIssuedByProvider: Array<[Principal, Array<[Principal, bigint]>]>;
  token2ProviderAndUserData: Array<[string, PohProviderAndUserData]>;
  pohChallengePackages: Array<[string, PohChallengePackage]>;
  pohUserChallengeAttempts: Array<
    [Principal, Array<[string, Array<PohChallengesAttemptV1>]>]
  >;
  providerUserIdToModclubUserIdByProviderId: Array<[Principal, RelShared]>;
  wordList: Array<string>;
}
export interface PohTaskData {
  dataCanisterId: [] | [Principal];
  status: PohChallengeStatus;
  completedOn: bigint;
  contentId: [] | [string];
  allowedViolationRules: Array<ViolatedRules__1>;
  userId: Principal;
  createdAt: bigint;
  submittedAt: bigint;
  updatedAt: bigint;
  challengeId: string;
  challengeType: PohChallengeType;
  wordList: [] | [Array<string>];
}
export interface PohTaskDataAndVotesWrapperPlus {
  reward: number;
  createdAt: bigint;
  minStake: bigint;
  updatedAt: bigint;
  pohTaskData: Array<PohTaskData>;
  packageId: string;
  requiredVotes: bigint;
  voteUserDetails: Array<VotePlusUser>;
}
export interface PohTaskDataWrapperPlus {
  reward: number;
  votes: bigint;
  createdAt: bigint;
  minStake: bigint;
  updatedAt: bigint;
  pohTaskData: Array<PohTaskData>;
  packageId: string;
  requiredVotes: bigint;
}
export interface PohTaskPlus {
  status: ContentStatus;
  reward: number;
  title: [] | [string];
  profileImageUrlSuffix: [] | [string];
  voteCount: bigint;
  createdAt: bigint;
  minStake: bigint;
  updatedAt: bigint;
  hasVoted: [] | [boolean];
  packageId: string;
  requiredVotes: bigint;
}
export interface PohTaskPlusForAdmin {
  status: ContentStatus;
  completedOn: bigint;
  profileImageUrlSuffix: [] | [string];
  voteCount: bigint;
  submittedAt: bigint;
  userUserName: string;
  userModClubId: string;
  pohTaskData: Array<PohTaskData>;
  userEmailId: string;
  packageId: string;
}
export interface PohVerificationResponsePlus {
  status: PohVerificationStatus;
  completedAt: [] | [bigint];
  token: [] | [string];
  rejectionReasons: Array<string>;
  submittedAt: [] | [bigint];
  isFirstAssociation: boolean;
  providerId: Principal;
  challenges: Array<ChallengeResponse>;
  requestedAt: [] | [bigint];
  providerUserId: string;
}
export type PohVerificationStatus =
  | { notSubmitted: null }
  | { verified: null }
  | { expired: null }
  | { pending: null }
  | { startPoh: null }
  | { rejected: null };
export interface Profile {
  id: UserId;
  pic: [] | [Image];
  userName: string;
  createdAt: Timestamp;
  role: Role;
  email: string;
  updatedAt: Timestamp;
}
export type ProviderError =
  | { ProviderAdminIsAlreadyRegistered: null }
  | { InvalidContentType: null }
  | { NotFound: null }
  | { Unauthorized: null }
  | { RequiresWhitelisting: null }
  | { InvalidContentStatus: null }
  | { InvalidProvider: null }
  | { ProviderIsRegistered: null };
export type ProviderId = Principal;
export interface ProviderMeta {
  name: string;
  description: string;
}
export type ProviderMetaResult = { ok: ProviderMeta } | { err: ProviderError };
export interface ProviderPlus {
  id: Principal;
  contentCount: bigint;
  rewardsSpent: bigint;
  name: string;
  createdAt: Timestamp;
  description: string;
  updatedAt: Timestamp;
  settings: ProviderSettings;
  activeCount: bigint;
  image: [] | [Image];
  rules: Array<Rule>;
}
export type ProviderResult = { ok: null } | { err: ProviderError };
export type ProviderSettingResult =
  | { ok: ProviderSettings }
  | { err: ProviderError };
export interface ProviderSettings {
  minStaked: bigint;
  requiredVotes: bigint;
}
export interface Receipt {
  id: ReceiptId;
  cost: bigint;
  createdAt: Timestamp;
}
export type ReceiptId = string;
export interface RelShared {
  forw: Trie2D;
}
export interface RelShared_1 {
  forw: Trie2D_1;
}
export interface Reserved {
  id: ReservedId;
  createdAt: Timestamp;
  profileId: string;
  reservedExpiryTime: Timestamp;
  updatedAt: Timestamp;
}
export type ReservedId = string;
export type Result = { ok: Array<PohChallengesAttempt> } | { err: PohError };
export type Result_1 = { ok: Reserved } | { err: string };
export type Result_2 =
  | { ok: PohTaskDataAndVotesWrapperPlus }
  | { err: PohError };
export type Result_3 = { ok: PohTaskDataWrapperPlus } | { err: PohError };
export type Result_4 = { ok: boolean } | { err: string };
export type Role = { admin: null } | { moderator: null } | { owner: null };
export interface Rule {
  id: RuleId;
  description: string;
}
export type RuleId = string;
export interface StreamingCallbackHttpResponse {
  token: Token;
  body: Uint8Array | number[];
}
export type StreamingStrategy = {
  Callback: { token: Token; callback: [Principal, string] };
};
export interface SubscribeMessage {
  callback: [Principal, string];
}
export interface SubscribePohMessage {
  callback: [Principal, string];
}
export type Timestamp = bigint;
export type Token = {};
export type Tokens = bigint;
export interface TransformArgs {
  context: Uint8Array | number[];
  response: CanisterHttpResponsePayload;
}
export type Trie = { branch: Branch } | { leaf: Leaf } | { empty: null };
export type Trie2D = { branch: Branch } | { leaf: Leaf } | { empty: null };
export type Trie2D_1 =
  | { branch: Branch_2 }
  | { leaf: Leaf_2 }
  | { empty: null };
export type Trie_1 = { branch: Branch_1 } | { leaf: Leaf_1 } | { empty: null };
export type Trie_2 = { branch: Branch_2 } | { leaf: Leaf_2 } | { empty: null };
export type Trie_3 = { branch: Branch_3 } | { leaf: Leaf_3 } | { empty: null };
export type UpdateCallsAggregatedData = BigUint64Array | bigint[];
export type UserId = Principal;
export interface VerifyHumanityResponse {
  status: PohVerificationStatus;
  token: [] | [string];
  rejectionReasons: Array<string>;
}
export interface ViolatedRules {
  id: RuleId;
  rejectionCount: bigint;
}
export interface ViolatedRules__1 {
  ruleId: string;
  ruleDesc: string;
}
export interface Vote {
  id: VoteId;
  contentId: string;
  decision: Decision;
  userId: UserId;
  createdAt: Timestamp;
  violatedRules: [] | [Array<RuleId>];
}
export type VoteId = string;
export interface VoteParameters {
  id: VoteParamsId;
  complexity: Complexity;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  requiredVotes: bigint;
}
export type VoteParamsId = string;
export interface VotePlusUser {
  userVoteDecision: Decision__1;
  userUserName: string;
  userModClubId: Principal;
  userEmailId: string;
  userVoteCreatedAt: bigint;
}
export interface _SERVICE extends ModClub {}
