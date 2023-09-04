import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Subaccount],
}
export type CanisterCyclesAggregatedData = BigUint64Array | bigint[];
export type CanisterHeapMemoryAggregatedData = BigUint64Array | bigint[];
export type CanisterLogFeature = { 'filterMessageByContains' : null } |
  { 'filterMessageByRegex' : null };
export interface CanisterLogMessages {
  'data' : Array<LogMessagesData>,
  'lastAnalyzedMessageTimeNanos' : [] | [Nanos],
}
export interface CanisterLogMessagesInfo {
  'features' : Array<[] | [CanisterLogFeature]>,
  'lastTimeNanos' : [] | [Nanos],
  'count' : number,
  'firstTimeNanos' : [] | [Nanos],
}
export type CanisterLogRequest = { 'getMessagesInfo' : null } |
  { 'getMessages' : GetLogMessagesParameters } |
  { 'getLatestMessages' : GetLatestLogMessagesParameters };
export type CanisterLogResponse = { 'messagesInfo' : CanisterLogMessagesInfo } |
  { 'messages' : CanisterLogMessages };
export type CanisterMemoryAggregatedData = BigUint64Array | bigint[];
export interface CanisterMetrics { 'data' : CanisterMetricsData }
export type CanisterMetricsData = { 'hourly' : Array<HourlyMetricsData> } |
  { 'daily' : Array<DailyMetricsData> };
export type ConsumerPayload = { 'events' : Array<Event> } |
  { 'admins' : Array<Principal> };
export interface DailyMetricsData {
  'updateCalls' : bigint,
  'canisterHeapMemorySize' : NumericEntity,
  'canisterCycles' : NumericEntity,
  'canisterMemorySize' : NumericEntity,
  'timeMillis' : bigint,
}
export interface ENV {
  'wallet_canister_id' : Principal,
  'vesting_canister_id' : Principal,
  'old_modclub_canister_id' : Principal,
  'modclub_canister_id' : Principal,
  'rs_canister_id' : Principal,
  'auth_canister_id' : Principal,
}
export interface Event { 'topic' : string, 'payload' : Principal }
export interface GetLatestLogMessagesParameters {
  'upToTimeNanos' : [] | [Nanos],
  'count' : number,
  'filter' : [] | [GetLogMessagesFilter],
}
export interface GetLogMessagesFilter {
  'analyzeCount' : number,
  'messageRegex' : [] | [string],
  'messageContains' : [] | [string],
}
export interface GetLogMessagesParameters {
  'count' : number,
  'filter' : [] | [GetLogMessagesFilter],
  'fromTimeNanos' : [] | [Nanos],
}
export interface GetMetricsParameters {
  'dateToMillis' : bigint,
  'granularity' : MetricsGranularity,
  'dateFromMillis' : bigint,
}
export interface HourlyMetricsData {
  'updateCalls' : UpdateCallsAggregatedData,
  'canisterHeapMemorySize' : CanisterHeapMemoryAggregatedData,
  'canisterCycles' : CanisterCyclesAggregatedData,
  'canisterMemorySize' : CanisterMemoryAggregatedData,
  'timeMillis' : bigint,
}
export interface LockBlock {
  'dissolveDelay' : [] | [bigint],
  'operation' : Operation,
  'created_at_time' : bigint,
  'rewardsAmount' : [] | [bigint],
  'amount' : bigint,
}
export interface LogMessagesData { 'timeNanos' : Nanos, 'message' : string }
export type MetricsGranularity = { 'hourly' : null } |
  { 'daily' : null };
export type Nanos = bigint;
export interface NumericEntity {
  'avg' : bigint,
  'max' : bigint,
  'min' : bigint,
  'first' : bigint,
  'last' : bigint,
}
export type Operation = { 'StakingUnlock' : null } |
  { 'StakingRelease' : null } |
  { 'VestingClaim' : null } |
  { 'StakingLock' : null } |
  { 'VestingLock' : null } |
  { 'StakingDissolve' : null };
export type Result = { 'ok' : bigint } |
  { 'err' : string };
export type Subaccount = Uint8Array | number[];
export type Tokens = bigint;
export type UpdateCallsAggregatedData = BigUint64Array | bigint[];
export type Validate = { 'Ok' : string } |
  { 'Err' : string };
export interface Vesting {
  'claim_staking' : ActorMethod<[Account, Tokens], Result>,
  'claim_vesting' : ActorMethod<[Account, Tokens], Result>,
  'claimed_stakes_for' : ActorMethod<[Account], bigint>,
  'collectCanisterMetrics' : ActorMethod<[], undefined>,
  'getCanisterLog' : ActorMethod<
    [[] | [CanisterLogRequest]],
    [] | [CanisterLogResponse]
  >,
  'getCanisterMetrics' : ActorMethod<
    [GetMetricsParameters],
    [] | [CanisterMetrics]
  >,
  'handleSubscription' : ActorMethod<[ConsumerPayload], undefined>,
  'locked_for' : ActorMethod<[Account], bigint>,
  'pending_stakes_for' : ActorMethod<[Account], Array<LockBlock>>,
  'release_staking' : ActorMethod<[Account, Tokens], Result>,
  'stage_vesting_block' : ActorMethod<[Account, Tokens], Result>,
  'stake' : ActorMethod<[Account, Tokens], Result>,
  'staked_for' : ActorMethod<[Account], bigint>,
  'unlock_staking' : ActorMethod<[Account, Tokens], Result>,
  'unlocked_stakes_for' : ActorMethod<[Account], bigint>,
  'validate' : ActorMethod<[any], Validate>,
}
export interface _SERVICE extends Vesting {}
