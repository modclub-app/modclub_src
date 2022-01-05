import type { Principal } from '@dfinity/principal';
export interface Activity {
  'status' : ContentStatus,
  'reward' : bigint,
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
  { 'multiText' : null };
export type DataCanisterId = Principal;
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
  'getActivity' : (arg_0: boolean) => Promise<Array<Activity>>,
  'getAirdropUsers' : () => Promise<Array<AirdropUser>>,
  'getAirdropWhitelist' : () => Promise<Array<Principal>>,
  'getAllContent' : (arg_0: ContentStatus) => Promise<Array<ContentPlus>>,
  'getAllProfiles' : () => Promise<Array<Profile>>,
  'getBlob' : (
      arg_0: ContentId,
      arg_1: DataCanisterId,
      arg_2: bigint,
    ) => Promise<[] | [Array<number>]>,
  'getContent' : (arg_0: string) => Promise<[] | [ContentPlus]>,
  'getModclubHoldings' : () => Promise<Holdings>,
  'getModeratorLeaderboard' : (arg_0: bigint, arg_1: bigint) => Promise<
      Array<ModeratorLeaderboard>
    >,
  'getProfile' : () => Promise<Profile>,
  'getProvider' : (arg_0: Principal) => Promise<ProviderPlus>,
  'getProviderContent' : () => Promise<Array<ContentPlus>>,
  'getRules' : (arg_0: Principal) => Promise<Array<Rule>>,
  'getTokenHoldings' : () => Promise<Holdings>,
  'isAirdropRegistered' : () => Promise<AirdropUser>,
  'putBlobsInDataCanister' : (
      arg_0: ContentId,
      arg_1: Array<number>,
      arg_2: bigint,
      arg_3: bigint,
      arg_4: string,
    ) => Promise<Principal>,
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
  'stakeTokens' : (arg_0: bigint) => Promise<string>,
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
  'vote' : (
      arg_0: ContentId,
      arg_1: Decision,
      arg_2: [] | [Array<RuleId>],
    ) => Promise<string>,
}
export interface ModeratorLeaderboard {
  'id' : UserId,
  'pic' : [] | [Image__1],
  'completedVoteCount' : bigint,
  'userName' : string,
  'rewardsEarned' : bigint,
  'lastVoted' : [] | [Timestamp],
  'performance' : number,
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
export type Role = { 'admin' : null } |
  { 'moderator' : null } |
  { 'owner' : null };
export interface Rule { 'id' : RuleId, 'description' : string }
export type RuleId = string;
export interface SubscribeMessage { 'callback' : [Principal, string] }
export type Timestamp = bigint;
export type UserId = Principal;
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
