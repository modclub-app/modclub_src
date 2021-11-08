import type { Principal } from '@dfinity/principal';
export interface Content {
  'id' : ContentId__1,
  'status' : ContentStatus,
  'title' : [] | [string],
  'contentType' : ContentType,
  'createdAt' : Timestamp,
  'sourceId' : string,
  'updatedAt' : Timestamp,
  'providerId' : Principal,
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
  'appName' : string,
  'createdAt' : Timestamp,
  'text' : [] | [string],
  'sourceId' : string,
  'minStake' : bigint,
  'updatedAt' : Timestamp,
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
export interface ModClub {
  'addContentRules' : (arg_0: Array<string>) => Promise<undefined>,
  'addToWaitList' : (arg_0: string) => Promise<string>,
  'checkUsernameAvailable' : (arg_0: string) => Promise<boolean>,
  'deregisterProvider' : () => Promise<string>,
  'getAllContent' : (arg_0: ContentStatus) => Promise<Array<ContentPlus>>,
  'getContent' : (arg_0: string) => Promise<[] | [Content]>,
  'getContentRules' : () => Promise<Array<Rule>>,
  'getImage' : (arg_0: string) => Promise<[] | [Array<number>]>,
  'getMyVotes' : () => Promise<Array<Vote>>,
  'getProfile' : () => Promise<Profile>,
  'getProviderContent' : () => Promise<Array<ContentPlus>>,
  'getWaitList' : () => Promise<Array<string>>,
  'registerModerator' : (arg_0: string, arg_1: [] | [string]) => Promise<
      Profile
    >,
  'registerProvider' : (arg_0: string) => Promise<string>,
  'removeContentRules' : (arg_0: Array<RuleId>) => Promise<undefined>,
  'sendImage' : (arg_0: string, arg_1: Array<number>, arg_2: string) => Promise<
      string
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
  'updateSettings' : (arg_0: ProviderSettings) => Promise<undefined>,
  'vote' : (
      arg_0: ContentId,
      arg_1: Decision,
      arg_2: [] | [Array<RuleId>],
    ) => Promise<string>,
}
export interface Profile {
  'id' : UserId,
  'userName' : string,
  'createdAt' : Timestamp,
  'role' : Role,
  'picUrl' : [] | [string],
  'updatedAt' : Timestamp,
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
  'violatedRules' : [] | [Array<RuleId>],
}
export type VoteId = string;
export interface _SERVICE extends ModClub {}
