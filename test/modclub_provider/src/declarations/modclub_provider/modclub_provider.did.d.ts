import type { Principal } from '@dfinity/principal';
export interface ContentResult { 'status' : ContentStatus, 'sourceId' : string }
export type ContentStatus = { 'approved' : null } |
  { 'rejected' : null } |
  { 'reviewRequired' : null };
export interface ModclubProvider {
  'addRule' : (arg_0: string) => Promise<undefined>,
  'deregister' : () => Promise<string>,
  'greet' : (arg_0: string) => Promise<string>,
  'onlyOwner' : (arg_0: Principal) => Promise<undefined>,
  'register' : (arg_0: string, arg_1: string) => Promise<undefined>,
  'submitImage' : (
      arg_0: string,
      arg_1: Array<number>,
      arg_2: string,
      arg_3: string,
    ) => Promise<string>,
  'submitText' : (
      arg_0: string,
      arg_1: string,
      arg_2: [] | [string],
    ) => Promise<string>,
  'subscribe' : () => Promise<undefined>,
  'test' : () => Promise<string>,
  'testDataCanisterStorage' : () => Promise<[Principal, Principal, string]>,
  'updateSettings' : (arg_0: bigint, arg_1: bigint) => Promise<undefined>,
  'voteResult' : (arg_0: ContentResult) => Promise<undefined>,
}
export interface _SERVICE extends ModclubProvider {}
