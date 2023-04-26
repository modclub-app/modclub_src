import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type ENV = { 'qa' : null } |
  { 'dev' : null } |
  { 'prod' : null } |
  { 'local' : string };
export type Result = { 'ok' : null } |
  { 'err' : string };
export type Result_1 = { 'ok' : Array<Principal> } |
  { 'err' : string };
export type SubAccount = string;
export interface UserAndAmount {
  'toOwner' : Principal,
  'toSA' : [] | [string],
  'fromSA' : [] | [string],
  'amount' : number,
}
export interface Wallet {
  'burn' : ActorMethod<[[] | [SubAccount], number], undefined>,
  'getAdmins' : ActorMethod<[], Result_1>,
  'isUserAdmin' : ActorMethod<[], boolean>,
  'queryBalance' : ActorMethod<[[] | [SubAccount]], number>,
  'queryBalancePr' : ActorMethod<[Principal, [] | [SubAccount]], number>,
  'registerAdmin' : ActorMethod<[Principal], Result>,
  'stakeTokens' : ActorMethod<[number], undefined>,
  'tge' : ActorMethod<[], undefined>,
  'transfer' : ActorMethod<
    [[] | [SubAccount], Principal, [] | [SubAccount], number],
    undefined
  >,
  'transferBulk' : ActorMethod<[Array<UserAndAmount>], undefined>,
  'transferToProvider' : ActorMethod<
    [Principal, [] | [SubAccount], Principal, [] | [SubAccount], number],
    undefined
  >,
  'unregisterAdmin' : ActorMethod<[string], Result>,
}
export interface _SERVICE extends Wallet {}
