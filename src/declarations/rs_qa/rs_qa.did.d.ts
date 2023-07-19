import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type ConsumerPayload = { 'events' : Array<Event> } |
  { 'admins' : Array<Principal> };
export type Decision = { 'approved' : null } |
  { 'rejected' : null };
export interface ENV {
  'wallet_canister_id' : Principal,
  'vesting_canister_id' : Principal,
  'old_modclub_canister_id' : Principal,
  'modclub_canister_id' : Principal,
  'rs_canister_id' : Principal,
  'auth_canister_id' : Principal,
}
export interface Event { 'topic' : string, 'payload' : Principal }
export interface RSAndLevel { 'level' : UserLevel, 'score' : bigint }
export interface RSManager {
  'handleSubscription' : ActorMethod<[ConsumerPayload], undefined>,
  'queryRSAndLevel' : ActorMethod<[], RSAndLevel>,
  'queryRSAndLevelByPrincipal' : ActorMethod<[Principal], RSAndLevel>,
  'setRS' : ActorMethod<[Principal, bigint], Result>,
  'showAdmins' : ActorMethod<[], Array<Principal>>,
  'subscribe' : ActorMethod<[string], undefined>,
  'topUsers' : ActorMethod<[bigint, bigint], Array<UserAndRS>>,
  'updateRS' : ActorMethod<[Principal, boolean, Decision], UserAndRS>,
  'updateRSBulk' : ActorMethod<[Array<UserAndVote>], Array<UserAndRS>>,
}
export type Result = { 'ok' : boolean } |
  { 'err' : string };
export interface UserAndRS { 'userId' : Principal, 'score' : bigint }
export interface UserAndVote {
  'votedCorrect' : boolean,
  'decision' : Decision,
  'userId' : Principal,
}
export type UserLevel = { 'junior' : null } |
  { 'novice' : null } |
  { 'senior1' : null } |
  { 'senior2' : null } |
  { 'senior3' : null };
export interface _SERVICE extends RSManager {}
