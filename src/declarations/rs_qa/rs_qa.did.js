export const idlFactory = ({ IDL }) => {
  const ENV = IDL.Record({
    wallet_canister_id: IDL.Principal,
    vesting_canister_id: IDL.Principal,
    old_modclub_canister_id: IDL.Principal,
    modclub_canister_id: IDL.Principal,
    rs_canister_id: IDL.Principal,
    auth_canister_id: IDL.Principal,
  });
  const GetLogMessagesFilter = IDL.Record({
    analyzeCount: IDL.Nat32,
    messageRegex: IDL.Opt(IDL.Text),
    messageContains: IDL.Opt(IDL.Text),
  });
  const Nanos = IDL.Nat64;
  const GetLogMessagesParameters = IDL.Record({
    count: IDL.Nat32,
    filter: IDL.Opt(GetLogMessagesFilter),
    fromTimeNanos: IDL.Opt(Nanos),
  });
  const GetLatestLogMessagesParameters = IDL.Record({
    upToTimeNanos: IDL.Opt(Nanos),
    count: IDL.Nat32,
    filter: IDL.Opt(GetLogMessagesFilter),
  });
  const CanisterLogRequest = IDL.Variant({
    getMessagesInfo: IDL.Null,
    getMessages: GetLogMessagesParameters,
    getLatestMessages: GetLatestLogMessagesParameters,
  });
  const CanisterLogFeature = IDL.Variant({
    filterMessageByContains: IDL.Null,
    filterMessageByRegex: IDL.Null,
  });
  const CanisterLogMessagesInfo = IDL.Record({
    features: IDL.Vec(IDL.Opt(CanisterLogFeature)),
    lastTimeNanos: IDL.Opt(Nanos),
    count: IDL.Nat32,
    firstTimeNanos: IDL.Opt(Nanos),
  });
  const LogMessagesData = IDL.Record({
    timeNanos: Nanos,
    message: IDL.Text,
  });
  const CanisterLogMessages = IDL.Record({
    data: IDL.Vec(LogMessagesData),
    lastAnalyzedMessageTimeNanos: IDL.Opt(Nanos),
  });
  const CanisterLogResponse = IDL.Variant({
    messagesInfo: CanisterLogMessagesInfo,
    messages: CanisterLogMessages,
  });
  const MetricsGranularity = IDL.Variant({
    hourly: IDL.Null,
    daily: IDL.Null,
  });
  const GetMetricsParameters = IDL.Record({
    dateToMillis: IDL.Nat,
    granularity: MetricsGranularity,
    dateFromMillis: IDL.Nat,
  });
  const UpdateCallsAggregatedData = IDL.Vec(IDL.Nat64);
  const CanisterHeapMemoryAggregatedData = IDL.Vec(IDL.Nat64);
  const CanisterCyclesAggregatedData = IDL.Vec(IDL.Nat64);
  const CanisterMemoryAggregatedData = IDL.Vec(IDL.Nat64);
  const HourlyMetricsData = IDL.Record({
    updateCalls: UpdateCallsAggregatedData,
    canisterHeapMemorySize: CanisterHeapMemoryAggregatedData,
    canisterCycles: CanisterCyclesAggregatedData,
    canisterMemorySize: CanisterMemoryAggregatedData,
    timeMillis: IDL.Int,
  });
  const NumericEntity = IDL.Record({
    avg: IDL.Nat64,
    max: IDL.Nat64,
    min: IDL.Nat64,
    first: IDL.Nat64,
    last: IDL.Nat64,
  });
  const DailyMetricsData = IDL.Record({
    updateCalls: IDL.Nat64,
    canisterHeapMemorySize: NumericEntity,
    canisterCycles: NumericEntity,
    canisterMemorySize: NumericEntity,
    timeMillis: IDL.Int,
  });
  const CanisterMetricsData = IDL.Variant({
    hourly: IDL.Vec(HourlyMetricsData),
    daily: IDL.Vec(DailyMetricsData),
  });
  const CanisterMetrics = IDL.Record({ data: CanisterMetricsData });
  const Event = IDL.Record({ topic: IDL.Text, payload: IDL.Principal });
  const ConsumerPayload = IDL.Variant({
    events: IDL.Vec(Event),
    admins: IDL.Vec(IDL.Principal),
  });
  const UserLevel = IDL.Variant({
    junior: IDL.Null,
    novice: IDL.Null,
    senior1: IDL.Null,
    senior2: IDL.Null,
    senior3: IDL.Null,
  });
  const RSAndLevel = IDL.Record({ level: UserLevel, score: IDL.Int });
  const Result = IDL.Variant({ ok: IDL.Bool, err: IDL.Text });
  const UserAndRS = IDL.Record({ userId: IDL.Principal, score: IDL.Int });
  const Decision = IDL.Variant({
    approved: IDL.Null,
    rejected: IDL.Null,
  });
  const UserAndVote = IDL.Record({
    votedCorrect: IDL.Bool,
    decision: Decision,
    userId: IDL.Principal,
  });
  const RSManager = IDL.Service({
    collectCanisterMetrics: IDL.Func([], [], []),
    getCanisterLog: IDL.Func(
      [IDL.Opt(CanisterLogRequest)],
      [IDL.Opt(CanisterLogResponse)],
      ["query"]
    ),
    getCanisterMetrics: IDL.Func(
      [GetMetricsParameters],
      [IDL.Opt(CanisterMetrics)],
      ["query"]
    ),
    handleSubscription: IDL.Func([ConsumerPayload], [], []),
    queryRSAndLevel: IDL.Func([], [RSAndLevel], ["query"]),
    queryRSAndLevelByPrincipal: IDL.Func(
      [IDL.Principal],
      [RSAndLevel],
      ["query"]
    ),
    setRS: IDL.Func([IDL.Principal, IDL.Int], [Result], []),
    showAdmins: IDL.Func([], [IDL.Vec(IDL.Principal)], ["query"]),
    subscribe: IDL.Func([IDL.Text], [], []),
    topUsers: IDL.Func([IDL.Nat, IDL.Nat], [IDL.Vec(UserAndRS)], ["query"]),
    updateRS: IDL.Func([IDL.Principal, IDL.Bool, Decision], [UserAndRS], []),
    updateRSBulk: IDL.Func([IDL.Vec(UserAndVote)], [IDL.Vec(UserAndRS)], []),
  });
  return RSManager;
};
export const init = ({ IDL }) => {
  const ENV = IDL.Record({
    wallet_canister_id: IDL.Principal,
    vesting_canister_id: IDL.Principal,
    old_modclub_canister_id: IDL.Principal,
    modclub_canister_id: IDL.Principal,
    rs_canister_id: IDL.Principal,
    auth_canister_id: IDL.Principal,
  });
  return [ENV];
};
