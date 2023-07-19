import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Subaccount],
}
export type ConsumerPayload = { 'events' : Array<Event> } |
  { 'admins' : Array<Principal> };
export interface ENV {
  'wallet_canister_id' : Principal,
  'vesting_canister_id' : Principal,
  'old_modclub_canister_id' : Principal,
  'modclub_canister_id' : Principal,
  'rs_canister_id' : Principal,
  'auth_canister_id' : Principal,
}
export interface Event { 'topic' : string, 'payload' : Principal }
export type Result = { 'ok' : bigint } |
  { 'err' : string };
export type Subaccount = Uint8Array | number[];
export type Tokens = bigint;
export interface Vesting {
  'claim_staking' : ActorMethod<[Account, Tokens], Result>,
  'claim_vesting' : ActorMethod<[Account, Tokens], Result>,
  'handleSubscription' : ActorMethod<[ConsumerPayload], undefined>,
  'locked_for' : ActorMethod<[Account], bigint>,
  'stage_vesting_block' : ActorMethod<[Account, Tokens], Result>,
  'stake' : ActorMethod<[Account, Tokens], Result>,
  'staked_for' : ActorMethod<[Account], bigint>,
  'unlock_staking' : ActorMethod<[Account, Tokens], Result>,
  'unlocked_stakes_for' : ActorMethod<[Account], bigint>,
}
export interface _SERVICE extends Vesting {}
