import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Bucket {
  'collectCanisterMetrics' : ActorMethod<[], undefined>,
  'deRegisterModerators' : ActorMethod<[Array<Principal>], undefined>,
  'getCanisterLog' : ActorMethod<
    [[] | [CanisterLogRequest]],
    [] | [CanisterLogResponse]
  >,
  'getCanisterMetrics' : ActorMethod<
    [GetMetricsParameters],
    [] | [CanisterMetrics]
  >,
  'getChunk' : ActorMethod<[string, bigint], [] | [Uint8Array | number[]]>,
  'getChunkData' : ActorMethod<[], Array<string>>,
  'getContentInfo' : ActorMethod<[], Array<[string, ContentInfo]>>,
  'getFileInfoData' : ActorMethod<[string], [] | [ContentInfo]>,
  'getSize' : ActorMethod<[], bigint>,
  'handleSubscription' : ActorMethod<[ConsumerPayload], undefined>,
  'http_request' : ActorMethod<[HttpRequest], HttpResponse>,
  'markAllContentNotAccessible' : ActorMethod<[], undefined>,
  'markContentAccessible' : ActorMethod<[string], undefined>,
  'markContentNotAccessible' : ActorMethod<[string], undefined>,
  'putChunks' : ActorMethod<
    [string, bigint, Uint8Array | number[], bigint, string],
    [] | [null]
  >,
  'registerModerators' : ActorMethod<[Array<Principal>], undefined>,
  'runDeleteContentJob' : ActorMethod<[], undefined>,
  'setParams' : ActorMethod<[Array<Principal>, string], undefined>,
  'setSigningKey' : ActorMethod<[string], undefined>,
  'showAdmins' : ActorMethod<[], Array<Principal>>,
  'streamingCallback' : ActorMethod<
    [StreamingCallbackToken],
    StreamingCallbackHttpResponse
  >,
  'subscribeOnAdmins' : ActorMethod<[], undefined>,
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
export interface ContentInfo {
  'contentId' : string,
  'contentType' : string,
  'numOfChunks' : bigint,
}
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
export interface HttpRequest {
  'url' : string,
  'method' : string,
  'body' : Uint8Array | number[],
  'headers' : Array<[string, string]>,
}
export interface HttpResponse {
  'body' : Uint8Array | number[],
  'headers' : Array<[string, string]>,
  'streaming_strategy' : [] | [StreamingStrategy],
  'status_code' : number,
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
export type StreamingCallback = ActorMethod<[], undefined>;
export interface StreamingCallbackHttpResponse {
  'token' : [] | [StreamingCallbackToken],
  'body' : Uint8Array | number[],
}
export interface StreamingCallbackToken {
  'key' : string,
  'sha256' : [] | [Uint8Array | number[]],
  'index' : bigint,
  'content_encoding' : string,
}
export type StreamingStrategy = {
    'Callback' : {
      'token' : StreamingCallbackToken,
      'callback' : StreamingCallback,
    }
  };
export type UpdateCallsAggregatedData = BigUint64Array | bigint[];
export interface _SERVICE extends Bucket {}
