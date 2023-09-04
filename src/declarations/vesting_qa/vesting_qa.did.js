export const idlFactory = ({ IDL }) => {
  const ENV = IDL.Record({
    'wallet_canister_id' : IDL.Principal,
    'vesting_canister_id' : IDL.Principal,
    'old_modclub_canister_id' : IDL.Principal,
    'modclub_canister_id' : IDL.Principal,
    'rs_canister_id' : IDL.Principal,
    'auth_canister_id' : IDL.Principal,
  });
  const Subaccount = IDL.Vec(IDL.Nat8);
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(Subaccount),
  });
  const Tokens = IDL.Nat;
  const Result = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
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
  const Event = IDL.Record({ 'topic' : IDL.Text, 'payload' : IDL.Principal });
  const ConsumerPayload = IDL.Variant({
    'events' : IDL.Vec(Event),
    'admins' : IDL.Vec(IDL.Principal),
  });
  const Operation = IDL.Variant({
    'StakingUnlock' : IDL.Null,
    'StakingRelease' : IDL.Null,
    'VestingClaim' : IDL.Null,
    'StakingLock' : IDL.Null,
    'VestingLock' : IDL.Null,
    'StakingDissolve' : IDL.Null,
  });
  const LockBlock = IDL.Record({
    'dissolveDelay' : IDL.Opt(IDL.Nat64),
    'operation' : Operation,
    'created_at_time' : IDL.Nat64,
    'rewardsAmount' : IDL.Opt(IDL.Nat),
    'amount' : IDL.Nat,
  });
  const Validate = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  const Vesting = IDL.Service({
    'claim_staking' : IDL.Func([Account, Tokens], [Result], []),
    'claim_vesting' : IDL.Func([Account, Tokens], [Result], []),
    'claimed_stakes_for' : IDL.Func([Account], [IDL.Nat], []),
    'collectCanisterMetrics' : IDL.Func([], [], []),
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
    'handleSubscription' : IDL.Func([ConsumerPayload], [], []),
    'locked_for' : IDL.Func([Account], [IDL.Nat], []),
    'pending_stakes_for' : IDL.Func([Account], [IDL.Vec(LockBlock)], []),
    'release_staking' : IDL.Func([Account, Tokens], [Result], []),
    'stage_vesting_block' : IDL.Func([Account, Tokens], [Result], []),
    'stake' : IDL.Func([Account, Tokens], [Result], []),
    'staked_for' : IDL.Func([Account], [IDL.Nat], []),
    'unlock_staking' : IDL.Func([Account, Tokens], [Result], []),
    'unlocked_stakes_for' : IDL.Func([Account], [IDL.Nat], []),
    'validate' : IDL.Func([IDL.Reserved], [Validate], []),
  });
  return Vesting;
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
  return [IDL.Record({ 'env' : ENV })];
};
