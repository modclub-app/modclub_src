import type { Principal } from '@dfinity/principal';
export interface ContentResult { 'status' : ContentStatus, 'sourceId' : string }
export type ContentStatus = { 'approved' : null } |
  { 'rejected' : null } |
  { 'reviewRequired' : null };
export interface _SERVICE {
  'deregister' : () => Promise<string>,
  'greet' : (arg_0: string) => Promise<string>,
  'subscribe' : () => Promise<undefined>,
  'test' : () => Promise<string>,
  'voteResult' : (arg_0: ContentResult) => Promise<undefined>,
}
