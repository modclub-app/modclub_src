import type { Principal } from '@dfinity/principal';
export interface Content {
  'id' : ContentId__1,
  'status' : ContentStatus,
  'title' : [] | [string],
  'contentType' : ContentType,
  'createdAt' : Timestamp,
  'sourceId' : string,
  'updateAt' : Timestamp,
  'providerId' : Principal,
}
export type ContentId = string;
export type ContentId__1 = string;
export interface ContentPlus {
  'id' : ContentId__1,
  'status' : ContentStatus,
  'title' : [] | [string],
  'contentType' : ContentType,
  'createdAt' : Timestamp,
  'text' : [] | [string],
  'sourceId' : string,
  'updateAt' : Timestamp,
}
export interface ContentResult { 'status' : ContentStatus, 'sourceId' : string }
export type ContentStatus = { 'approved' : null } |
  { 'rejected' : null } |
  { 'reviewRequired' : null };
export type ContentType = { 'imageBlob' : null } |
  { 'text' : null } |
  { 'imageUrl' : null } |
  { 'multiText' : null };
export type Decision = { 'approved' : null } |
  { 'rejected' : null };
export interface ModClub {
  'addToWaitList' : (arg_0: string) => Promise<string>,
  'getAllContent' : () => Promise<Array<Content>>,
  'getContent' : (arg_0: string) => Promise<[] | [Content]>,
  'getProviderContent' : () => Promise<Array<ContentPlus>>,
  'getWaitList' : () => Promise<Array<string>>,
  'registerModerator' : (arg_0: string, arg_1: [] | [string]) => Promise<
      string
    >,
  'registerProvider' : (arg_0: string) => Promise<string>,
  'submitText' : (
      arg_0: string,
      arg_1: string,
      arg_2: [] | [string],
    ) => Promise<string>,
  'subscribe' : (arg_0: SubscribeMessage) => Promise<undefined>,
  'vote' : (arg_0: ContentId, arg_1: Decision) => Promise<string>,
}
export interface SubscribeMessage { 'callback' : [Principal, string] }
export type Timestamp = bigint;
export interface _SERVICE extends ModClub {}
