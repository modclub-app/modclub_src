import type { Principal } from '@dfinity/principal';
export interface ContentResult { 'status' : ContentStatus, 'sourceId' : string }
export type ContentStatus = { 'approved' : null } |
  { 'rejected' : null } |
  { 'reviewRequired' : null };
export interface _SERVICE {
  'deregister' : () => Promise<string>,
  'greet' : (arg_0: string) => Promise<string>,
  'submitImage' : (
      arg_0: string,
      arg_1: Array<number>,
      arg_2: string,
      arg_3: string,
    ) => Promise<string>,
  'submitText' : (arg_0: string, arg_1: string, arg_2: string) => Promise<
      string
    >,
  'subscribe' : () => Promise<undefined>,
  'test' : () => Promise<string>,
  'voteResult' : (arg_0: ContentResult) => Promise<undefined>,
}
