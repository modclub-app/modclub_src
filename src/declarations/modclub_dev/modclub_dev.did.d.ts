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
export interface ChallengeResponse {
  'status' : PohChallengeStatus,
  'completedOn' : [] | [bigint],
  'challengeId' : string,
}
export type ContentId = string;
export type ContentId__1 = string;
export interface ContentPlus {
  'id' : ContentId__1,
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
  'image' : [] | [Image__1],
  'hasVoted' : [] | [boolean],
  'providerId' : Principal,
}
export interface ContentResult { 'status' : ContentStatus, 'sourceId' : string }
export type ContentStatus = { 'new' : null } |
  { 'approved' : null } |
  { 'rejected' : null };
export type ContentType = { 'imageBlob' : null } |
  { 'text' : null } |
  { 'imageUrl' : null } |
  { 'multiText' : null } |
  { 'pohPackage' : null };
export type Decision = { 'approved' : null } |
  { 'rejected' : null };
export type Decision__1 = { 'approved' : null } |
  { 'rejected' : null };
export interface Holdings {
  'pendingRewards' : bigint,
  'stake' : bigint,
  'wallet' : bigint,
}
export interface Image { 'imageType' : string, 'data' : Array<number> }
export interface Image__1 { 'imageType' : string, 'data' : Array<number> }
export interface ModClub {
  'addRules' : (arg_0: Array<string>) => Promise<undefined>,
  'addToAirdropWhitelist' : (arg_0: Array<Principal>) => Promise<undefined>,
  'airdropRegister' : () => Promise<AirdropUser>,
  'checkUsernameAvailable' : (arg_0: string) => Promise<boolean>,
  'deregisterProvider' : () => Promise<string>,
  'generateUniqueToken' : (arg_0: Principal) => Promise<PohUniqueToken>,
  'getActivity' : (arg_0: boolean) => Promise<Array<Activity>>,
  'getAirdropUsers' : () => Promise<Array<AirdropUser>>,
  'getAirdropWhitelist' : () => Promise<Array<Principal>>,
  'getAllContent' : (arg_0: ContentStatus) => Promise<Array<ContentPlus>>,
  'getAllProfiles' : () => Promise<Array<Profile>>,
  'getContent' : (arg_0: string) => Promise<[] | [ContentPlus]>,
  'getModclubHoldings' : () => Promise<Holdings>,
  'getModeratorLeaderboard' : (arg_0: bigint, arg_1: bigint) => Promise<
      Array<ModeratorLeaderboard>
    >,
  'getPohTaskData' : (arg_0: string) => Promise<Result_1>,
  'getPohTasks' : (arg_0: ContentStatus) => Promise<Array<PohTaskPlus>>,
  'getProfile' : () => Promise<Profile>,
  'getProfileById' : (arg_0: Principal) => Promise<Profile>,
  'getProvider' : (arg_0: Principal) => Promise<ProviderPlus>,
  'getProviderContent' : () => Promise<Array<ContentPlus>>,
  'getRules' : (arg_0: Principal) => Promise<Array<Rule>>,
  'getTokenHoldings' : () => Promise<Holdings>,
  'getVotePerformance' : () => Promise<number>,
  'isAirdropRegistered' : () => Promise<AirdropUser>,
  'populateChallenges' : () => Promise<undefined>,
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
  'removeRules' : (arg_0: Array<RuleId>) => Promise<undefined>,
  'retrieveChallengesForUser' : (arg_0: string) => Promise<Result>,
  'stakeTokens' : (arg_0: bigint) => Promise<string>,
  'submitChallengeData' : (arg_0: PohChallengeSubmissionRequest) => Promise<
      PohChallengeSubmissionResponse
    >,
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
  'updateSettings' : (arg_0: ProviderSettings) => Promise<undefined>,
  'verifyForHumanity' : (arg_0: Principal) => Promise<PohVerificationResponse>,
  'verifyUserHumanity' : () => Promise<
      [PohChallengeStatus, [] | [PohUniqueToken]]
    >,
  'verifyUserHumanityAPI' : () => Promise<
      { 'status' : PohChallengeStatus, 'token' : [] | [PohUniqueToken] }
    >,
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
}
export interface ModeratorLeaderboard {
  'id' : UserId,
  'completedVoteCount' : bigint,
  'userName' : string,
  'rewardsEarned' : bigint,
  'lastVoted' : [] | [Timestamp],
  'performance' : number,
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
  'minVotes' : bigint,
  'votes' : bigint,
  'createdAt' : bigint,
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
  'pic' : [] | [Image__1],
  'userName' : string,
  'createdAt' : Timestamp,
  'role' : Role,
  'email' : string,
  'updatedAt' : Timestamp,
}
export type ProviderId = Principal;
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
  'image' : [] | [Image__1],
  'rules' : Array<Rule>,
}
export interface ProviderSettings { 'minVotes' : bigint, 'minStaked' : bigint }
export type Result = { 'ok' : Array<PohChallengesAttempt> } |
  { 'err' : PohError };
export type Result_1 = { 'ok' : PohTaskDataWrapperPlus } |
  { 'err' : PohError };
export type Role = { 'admin' : null } |
  { 'moderator' : null } |
  { 'owner' : null };
export interface Rule { 'id' : RuleId, 'description' : string }
export type RuleId = string;
export interface SubscribeMessage { 'callback' : [Principal, string] }
export type Timestamp = bigint;
export type UserId = Principal;
export interface ViolatedRules { 'ruleId' : string, 'ruleDesc' : string }
export interface Vote {
  'id' : VoteId,
  'contentId' : string,
  'decision' : Decision__1,
  'userId' : UserId,
  'createdAt' : Timestamp,
  'violatedRules' : [] | [Array<RuleId>],
}
export type VoteId = string;
export interface _SERVICE extends ModClub {}
