import type { Principal } from "@dfinity/principal";
import type { ActorMethod } from "@dfinity/agent";

export type CanisterCyclesAggregatedData = BigUint64Array | bigint[];
export type CanisterHeapMemoryAggregatedData = BigUint64Array | bigint[];
export type CanisterLogFeature =
  | { filterMessageByContains: null }
  | { filterMessageByRegex: null };
export interface CanisterLogMessages {
  data: Array<LogMessagesData>;
  lastAnalyzedMessageTimeNanos: [] | [Nanos];
}
export interface CanisterLogMessagesInfo {
  features: Array<[] | [CanisterLogFeature]>;
  lastTimeNanos: [] | [Nanos];
  count: number;
  firstTimeNanos: [] | [Nanos];
}
export type CanisterLogRequest =
  | { getMessagesInfo: null }
  | { getMessages: GetLogMessagesParameters }
  | { getLatestMessages: GetLatestLogMessagesParameters };
export type CanisterLogResponse =
  | { messagesInfo: CanisterLogMessagesInfo }
  | { messages: CanisterLogMessages };
export type CanisterMemoryAggregatedData = BigUint64Array | bigint[];
export interface CanisterMetrics {
  data: CanisterMetricsData;
}
export type CanisterMetricsData =
  | { hourly: Array<HourlyMetricsData> }
  | { daily: Array<DailyMetricsData> };
export type ConsumerPayload =
  | { events: Array<Event> }
  | { admins: Array<Principal> };
export interface DailyMetricsData {
  updateCalls: bigint;
  canisterHeapMemorySize: NumericEntity;
  canisterCycles: NumericEntity;
  canisterMemorySize: NumericEntity;
  timeMillis: bigint;
}
export type Decision = { approved: null } | { rejected: null };
export interface ENV {
  wallet_canister_id: Principal;
  vesting_canister_id: Principal;
  old_modclub_canister_id: Principal;
  modclub_canister_id: Principal;
  rs_canister_id: Principal;
  auth_canister_id: Principal;
}
export interface Event {
  topic: string;
  payload: Principal;
}
export interface GetLatestLogMessagesParameters {
  upToTimeNanos: [] | [Nanos];
  count: number;
  filter: [] | [GetLogMessagesFilter];
}
export interface GetLogMessagesFilter {
  analyzeCount: number;
  messageRegex: [] | [string];
  messageContains: [] | [string];
}
export interface GetLogMessagesParameters {
  count: number;
  filter: [] | [GetLogMessagesFilter];
  fromTimeNanos: [] | [Nanos];
}
export interface GetMetricsParameters {
  dateToMillis: bigint;
  granularity: MetricsGranularity;
  dateFromMillis: bigint;
}
export interface HourlyMetricsData {
  updateCalls: UpdateCallsAggregatedData;
  canisterHeapMemorySize: CanisterHeapMemoryAggregatedData;
  canisterCycles: CanisterCyclesAggregatedData;
  canisterMemorySize: CanisterMemoryAggregatedData;
  timeMillis: bigint;
}
export interface LogMessagesData {
  timeNanos: Nanos;
  message: string;
}
export type MetricsGranularity = { hourly: null } | { daily: null };
export type Nanos = bigint;
export interface NumericEntity {
  avg: bigint;
  max: bigint;
  min: bigint;
  first: bigint;
  last: bigint;
}
export interface RSAndLevel {
  level: UserLevel;
  score: bigint;
}
export interface RSManager {
  collectCanisterMetrics: ActorMethod<[], undefined>;
  getCanisterLog: ActorMethod<
    [[] | [CanisterLogRequest]],
    [] | [CanisterLogResponse]
  >;
  getCanisterMetrics: ActorMethod<
    [GetMetricsParameters],
    [] | [CanisterMetrics]
  >;
  handleSubscription: ActorMethod<[ConsumerPayload], undefined>;
  queryRSAndLevel: ActorMethod<[], RSAndLevel>;
  queryRSAndLevelByPrincipal: ActorMethod<[Principal], RSAndLevel>;
  setRS: ActorMethod<[Principal, bigint], Result>;
  showAdmins: ActorMethod<[], Array<Principal>>;
  subscribe: ActorMethod<[string], undefined>;
  topUsers: ActorMethod<[bigint, bigint], Array<UserAndRS>>;
  updateRS: ActorMethod<[Principal, boolean, Decision], UserAndRS>;
  updateRSBulk: ActorMethod<[Array<UserAndVote>], Array<UserAndRS>>;
  validate: ActorMethod<[any], Validate>;
}
export type Result = { ok: boolean } | { err: string };
export type UpdateCallsAggregatedData = BigUint64Array | bigint[];
export interface UserAndRS {
  userId: Principal;
  score: bigint;
}
export interface UserAndVote {
  votedCorrect: boolean;
  decision: Decision;
  userId: Principal;
}
export type UserLevel =
  | { junior: null }
  | { novice: null }
  | { senior1: null }
  | { senior2: null }
  | { senior3: null };
export type Validate = { Ok: string } | { Err: string };
export interface _SERVICE extends RSManager {}
