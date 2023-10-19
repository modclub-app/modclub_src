export const idlFactory = ({ IDL }) => {
  const ENV = IDL.Record({
    'wallet_canister_id' : IDL.Principal,
    'vesting_canister_id' : IDL.Principal,
    'old_modclub_canister_id' : IDL.Principal,
    'modclub_canister_id' : IDL.Principal,
    'rs_canister_id' : IDL.Principal,
    'auth_canister_id' : IDL.Principal,
  });
  const GetLogMessagesFilter = IDL.Record({
    'analyzeCount' : IDL.Nat32,
    'messageRegex' : IDL.Opt(IDL.Text),
    'messageContains' : IDL.Opt(IDL.Text),
  });
  const Nanos = IDL.Nat64;
  const GetLogMessagesParameters = IDL.Record({
    'count' : IDL.Nat32,
    'filter' : IDL.Opt(GetLogMessagesFilter),
    'fromTimeNanos' : IDL.Opt(Nanos),
  });
  const GetLatestLogMessagesParameters = IDL.Record({
    'upToTimeNanos' : IDL.Opt(Nanos),
    'count' : IDL.Nat32,
    'filter' : IDL.Opt(GetLogMessagesFilter),
  });
  const CanisterLogRequest = IDL.Variant({
    'getMessagesInfo' : IDL.Null,
    'getMessages' : GetLogMessagesParameters,
    'getLatestMessages' : GetLatestLogMessagesParameters,
  });
  const CanisterLogFeature = IDL.Variant({
    'filterMessageByContains' : IDL.Null,
    'filterMessageByRegex' : IDL.Null,
  });
  const CanisterLogMessagesInfo = IDL.Record({
    'features' : IDL.Vec(IDL.Opt(CanisterLogFeature)),
    'lastTimeNanos' : IDL.Opt(Nanos),
    'count' : IDL.Nat32,
    'firstTimeNanos' : IDL.Opt(Nanos),
  });
  const LogMessagesData = IDL.Record({
    'timeNanos' : Nanos,
    'message' : IDL.Text,
  });
  const CanisterLogMessages = IDL.Record({
    'data' : IDL.Vec(LogMessagesData),
    'lastAnalyzedMessageTimeNanos' : IDL.Opt(Nanos),
  });
  const CanisterLogResponse = IDL.Variant({
    'messagesInfo' : CanisterLogMessagesInfo,
    'messages' : CanisterLogMessages,
  });
  const MetricsGranularity = IDL.Variant({
    'hourly' : IDL.Null,
    'daily' : IDL.Null,
  });
  const GetMetricsParameters = IDL.Record({
    'dateToMillis' : IDL.Nat,
    'granularity' : MetricsGranularity,
    'dateFromMillis' : IDL.Nat,
  });
  const UpdateCallsAggregatedData = IDL.Vec(IDL.Nat64);
  const CanisterHeapMemoryAggregatedData = IDL.Vec(IDL.Nat64);
  const CanisterCyclesAggregatedData = IDL.Vec(IDL.Nat64);
  const CanisterMemoryAggregatedData = IDL.Vec(IDL.Nat64);
  const HourlyMetricsData = IDL.Record({
    'updateCalls' : UpdateCallsAggregatedData,
    'canisterHeapMemorySize' : CanisterHeapMemoryAggregatedData,
    'canisterCycles' : CanisterCyclesAggregatedData,
    'canisterMemorySize' : CanisterMemoryAggregatedData,
    'timeMillis' : IDL.Int,
  });
  const NumericEntity = IDL.Record({
    'avg' : IDL.Nat64,
    'max' : IDL.Nat64,
    'min' : IDL.Nat64,
    'first' : IDL.Nat64,
    'last' : IDL.Nat64,
  });
  const DailyMetricsData = IDL.Record({
    'updateCalls' : IDL.Nat64,
    'canisterHeapMemorySize' : NumericEntity,
    'canisterCycles' : NumericEntity,
    'canisterMemorySize' : NumericEntity,
    'timeMillis' : IDL.Int,
  });
  const CanisterMetricsData = IDL.Variant({
    'hourly' : IDL.Vec(HourlyMetricsData),
    'daily' : IDL.Vec(DailyMetricsData),
  });
  const CanisterMetrics = IDL.Record({ 'data' : CanisterMetricsData });
  const ContentInfo = IDL.Record({
    'contentId' : IDL.Text,
    'contentType' : IDL.Text,
    'numOfChunks' : IDL.Nat,
  });
  const Event = IDL.Record({ 'topic' : IDL.Text, 'payload' : IDL.Principal });
  const ConsumerPayload = IDL.Variant({
    'events' : IDL.Vec(Event),
    'admins' : IDL.Vec(IDL.Principal),
  });
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
  });
  const StreamingCallbackToken = IDL.Record({
    'key' : IDL.Text,
    'sha256' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'index' : IDL.Nat,
    'content_encoding' : IDL.Text,
  });
  const StreamingCallback = IDL.Func([], [], []);
  const StreamingStrategy = IDL.Variant({
    'Callback' : IDL.Record({
      'token' : StreamingCallbackToken,
      'callback' : StreamingCallback,
    }),
  });
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'streaming_strategy' : IDL.Opt(StreamingStrategy),
    'status_code' : IDL.Nat16,
  });
  const StreamingCallbackHttpResponse = IDL.Record({
    'token' : IDL.Opt(StreamingCallbackToken),
    'body' : IDL.Vec(IDL.Nat8),
  });
  const Bucket = IDL.Service({
    'collectCanisterMetrics' : IDL.Func([], [], []),
    'deRegisterModerators' : IDL.Func([IDL.Vec(IDL.Principal)], [], ['oneway']),
    'getCanisterLog' : IDL.Func(
        [IDL.Opt(CanisterLogRequest)],
        [IDL.Opt(CanisterLogResponse)],
        ['query'],
      ),
    'getCanisterMetrics' : IDL.Func(
        [GetMetricsParameters],
        [IDL.Opt(CanisterMetrics)],
        ['query'],
      ),
    'getChunk' : IDL.Func(
        [IDL.Text, IDL.Nat],
        [IDL.Opt(IDL.Vec(IDL.Nat8))],
        ['query'],
      ),
    'getChunkData' : IDL.Func([], [IDL.Vec(IDL.Text)], []),
    'getContentInfo' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, ContentInfo))],
        ['query'],
      ),
    'getFileInfoData' : IDL.Func([IDL.Text], [IDL.Opt(ContentInfo)], ['query']),
    'getSize' : IDL.Func([], [IDL.Nat], []),
    'handleSubscription' : IDL.Func([ConsumerPayload], [], []),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'markAllContentNotAccessible' : IDL.Func([], [], []),
    'markContentAccessible' : IDL.Func([IDL.Text], [], []),
    'markContentNotAccessible' : IDL.Func([IDL.Text], [], []),
    'putChunks' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Vec(IDL.Nat8), IDL.Nat, IDL.Text],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'registerModerators' : IDL.Func([IDL.Vec(IDL.Principal)], [], ['oneway']),
    'runDeleteContentJob' : IDL.Func([], [], []),
    'setParams' : IDL.Func([IDL.Vec(IDL.Principal), IDL.Text], [], ['oneway']),
    'setSigningKey' : IDL.Func([IDL.Text], [], []),
    'showAdmins' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'streamingCallback' : IDL.Func(
        [StreamingCallbackToken],
        [StreamingCallbackHttpResponse],
        ['query'],
      ),
    'subscribeOnAdmins' : IDL.Func([], [], []),
  });
  return Bucket;
};
export const init = ({ IDL }) => {
  const ENV = IDL.Record({
    'wallet_canister_id' : IDL.Principal,
    'vesting_canister_id' : IDL.Principal,
    'old_modclub_canister_id' : IDL.Principal,
    'modclub_canister_id' : IDL.Principal,
    'rs_canister_id' : IDL.Principal,
    'auth_canister_id' : IDL.Principal,
  });
  return [ENV];
};
