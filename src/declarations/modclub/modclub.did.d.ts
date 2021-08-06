import type { Principal } from '@dfinity/principal';
export interface Content {
  'id' : ContentId,
  'status' : ContentStatus,
  'title' : [] | [string],
  'contentType' : ContentType,
  'createdAt' : Timestamp,
  'sourceId' : string,
  'updateAt' : Timestamp,
}
export type ContentId = string;
export interface ContentPlus {
  'id' : ContentId,
  'status' : ContentStatus,
  'title' : [] | [string],
  'contentType' : ContentType,
  'createdAt' : Timestamp,
  'text' : [] | [string],
  'sourceId' : string,
  'updateAt' : Timestamp,
}
export type ContentStatus = { 'approved' : null } |
  { 'rejected' : null } |
  { 'reviewRequired' : null };
export type ContentType = { 'imageBlob' : null } |
  { 'text' : null } |
  { 'imageUrl' : null } |
  { 'multiText' : null };
export interface ModClub {
  'addToWaitList' : (arg_0: string) => Promise<string>,
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
}
export type Timestamp = bigint;
export interface _SERVICE extends ModClub {}
