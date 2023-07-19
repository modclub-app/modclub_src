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
  const Event = IDL.Record({ 'topic' : IDL.Text, 'payload' : IDL.Principal });
  const ConsumerPayload = IDL.Variant({
    'events' : IDL.Vec(Event),
    'admins' : IDL.Vec(IDL.Principal),
  });
  const Vesting = IDL.Service({
    'claim_staking' : IDL.Func([Account, Tokens], [Result], []),
    'claim_vesting' : IDL.Func([Account, Tokens], [Result], []),
    'handleSubscription' : IDL.Func([ConsumerPayload], [], []),
    'locked_for' : IDL.Func([Account], [IDL.Nat], []),
    'stage_vesting_block' : IDL.Func([Account, Tokens], [Result], []),
    'stake' : IDL.Func([Account, Tokens], [Result], []),
    'staked_for' : IDL.Func([Account], [IDL.Nat], []),
    'unlock_staking' : IDL.Func([Account, Tokens], [Result], []),
    'unlocked_stakes_for' : IDL.Func([Account], [IDL.Nat], []),
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
