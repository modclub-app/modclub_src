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
  'addProviderAdmin' : (
      arg_0: string,
      arg_1: Principal,
      arg_2: [] | [Principal],
    ) => Promise<ProviderResult>,
  'addRules' : (arg_0: Array<string>) => Promise<ProviderResult>,
  'airdropRegister' : () => Promise<AirdropUser>,
  'checkUsernameAvailable' : (arg_0: string) => Promise<boolean>,
  'deregisterProvider' : () => Promise<Result>,
  'getActivity' : (arg_0: boolean) => Promise<Array<Activity>>,
  'getAirdropUsers' : () => Promise<Array<AirdropUser>>,
  'getAllContent' : (arg_0: ContentStatus) => Promise<Array<ContentPlus>>,
  'getAllProfiles' : () => Promise<Array<Profile>>,
  'getContent' : (arg_0: string) => Promise<[] | [ContentPlus]>,
  'getModclubHoldings' : () => Promise<Holdings>,
  'getProfile' : () => Promise<Profile>,
  'getProvider' : (arg_0: Principal) => Promise<ProviderPlus>,
  'getProviderContent' : () => Promise<Array<ContentPlus>>,
  'getProviders' : () => Promise<Array<ProviderPlus>>,
  'getRules' : (arg_0: Principal) => Promise<Array<Rule>>,
  'getSettings' : () => Promise<ProviderSettingResult>,
  'getTokenHoldings' : () => Promise<Holdings>,
  'isAirdropRegistered' : () => Promise<AirdropUser>,
  'registerModerator' : (
      arg_0: string,
      arg_1: string,
      arg_2: [] | [Image],
    ) => Promise<Profile>,
  'registerProvider' : (
      arg_0: string,
      arg_1: string,
      arg_2: [] | [Image],
    ) => Promise<ProviderRegisterResult>,
  'removeRules' : (arg_0: Array<RuleId>) => Promise<ProviderResult>,
  'stakeTokens' : (arg_0: bigint) => Promise<string>,
  'submitImage' : (
      arg_0: string,
      arg_1: Array<number>,
      arg_2: string,
      arg_3: [] | [string],
    ) => Promise<Result>,
  'submitText' : (
      arg_0: string,
      arg_1: string,
      arg_2: [] | [string],
    ) => Promise<Result>,
  'subscribe' : (arg_0: SubscribeMessage) => Promise<ProviderResult>,
  'unStakeTokens' : (arg_0: bigint) => Promise<string>,
  'updateSettings' : (arg_0: ProviderSettings) => Promise<ProviderResult>,
  'vote' : (
      arg_0: ContentId,
      arg_1: Decision,
      arg_2: [] | [Array<RuleId>],
    ) => Promise<string>,
  'whiteListProvider' : (arg_0: Principal) => Promise<undefined>,
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
export type ProviderError = { 'InvalidContentType' : null } |
  { 'NotFound' : null } |
  { 'Unauthorized' : null } |
  { 'RequiresWhitelisting' : null } |
  { 'InvalidContentStatus' : null } |
  { 'InvalidProvider' : null } |
  { 'ProviderIsRegistered' : null };
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
export type ProviderRegisterResult = { 'ok' : string } |
  { 'err' : ProviderError };
export type ProviderResult = { 'ok' : null } |
  { 'err' : ProviderError };
export type ProviderSettingResult = { 'ok' : ProviderSettings } |
  { 'err' : ProviderError };
export interface ProviderSettings { 'minVotes' : bigint, 'minStaked' : bigint }
export type Result = { 'ok' : string } |
  { 'err' : ProviderError };
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
