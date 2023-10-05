import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type AccountIdentifier = string;
export interface Airdrop {
  '_getElapsedMonths' : ActorMethod<[], bigint>,
  'airdrop' : ActorMethod<[number], Result_2>,
  'checkUnclaimedNFTs' : ActorMethod<[string], Result_1>,
  'getAllNFTs' : ActorMethod<[], Result_1>,
  'getNFTCount' : ActorMethod<[string], Result>,
  'getStartTimestamp' : ActorMethod<[], bigint>,
  'getSubAccountZero' : ActorMethod<[], AccountIdentifier>,
}
export interface Claim { 'timeStamp' : Time, 'claimStatus' : ClaimStatus }
export type ClaimStatus = { 'available' : null } |
  { 'notRegistered' : null } |
  { 'timeLocked' : null };
export interface ENV {
  'wallet_canister_id' : Principal,
  'vesting_canister_id' : Principal,
  'old_modclub_canister_id' : Principal,
  'modclub_canister_id' : Principal,
  'rs_canister_id' : Principal,
  'auth_canister_id' : Principal,
}
export interface NFT {
  'dissolveDelay' : bigint,
  'tokenIndex' : TokenIndex,
  'tier' : Tier,
  'claimCount' : bigint,
  'lastClaim' : Claim,
}
export type Result = { 'ok' : bigint } |
  { 'err' : string };
export type Result_1 = { 'ok' : Array<NFT> } |
  { 'err' : string };
export type Result_2 = { 'ok' : string } |
  { 'err' : string };
export type Tier = { 'bronze' : null } |
  { 'gold' : null } |
  { 'none' : null } |
  { 'silver' : null };
export type Time = bigint;
export type TokenIndex = number;
export interface _SERVICE extends Airdrop {}
