import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Subaccount],
}
export interface Allowance {
  'allowance' : bigint,
  'expires_at' : [] | [bigint],
}
export interface AllowanceArgs { 'account' : Account, 'spender' : Principal }
export interface ApproveArgs {
  'fee' : [] | [Tokens],
  'memo' : [] | [Memo],
  'from_subaccount' : [] | [Subaccount],
  'created_at_time' : [] | [Timestamp],
  'amount' : bigint,
  'expires_at' : [] | [bigint],
  'spender' : Principal,
}
export type ApproveError = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'TemporarilyUnavailable' : null } |
  { 'Duplicate' : { 'duplicate_of' : TxIndex } } |
  { 'BadFee' : { 'expected_fee' : Tokens } } |
  { 'CreatedInFuture' : { 'ledger_time' : Timestamp } } |
  { 'TooOld' : null } |
  { 'Expired' : { 'ledger_time' : bigint } } |
  { 'InsufficientFunds' : { 'balance' : Tokens } };
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
export interface LedgerInitParams {
  'decimals' : number,
  'token_symbol' : string,
  'transfer_fee' : bigint,
  'minting_account' : Account,
  'initial_mints' : Array<{ 'account' : Account, 'amount' : bigint }>,
  'ledger_account' : Account,
  'token_name' : string,
}
export type Memo = Uint8Array | number[];
export type Result = { 'Ok' : TxIndex } |
  { 'Err' : TransferError };
export type Result_1 = { 'Ok' : TxIndex } |
  { 'Err' : TransferFromError };
export type Result_2 = { 'Ok' : TxIndex } |
  { 'Err' : ApproveError };
export type Result__1 = { 'ok' : Array<Principal> } |
  { 'err' : string };
export type Subaccount = Uint8Array | number[];
export type Timestamp = bigint;
export type Tokens = bigint;
export type TransferError = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'TemporarilyUnavailable' : null } |
  { 'BadBurn' : { 'min_burn_amount' : Tokens } } |
  { 'Duplicate' : { 'duplicate_of' : TxIndex } } |
  { 'BadFee' : { 'expected_fee' : Tokens } } |
  { 'CreatedInFuture' : { 'ledger_time' : Timestamp } } |
  { 'TooOld' : null } |
  { 'InsufficientFunds' : { 'balance' : Tokens } };
export interface TransferFromArgs {
  'to' : Account,
  'fee' : [] | [Tokens],
  'from' : Account,
  'memo' : [] | [Memo],
  'created_at_time' : [] | [Timestamp],
  'amount' : Tokens,
}
export type TransferFromError = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'TemporarilyUnavailable' : null } |
  { 'InsufficientAllowance' : { 'allowance' : bigint } } |
  { 'BadBurn' : { 'min_burn_amount' : Tokens } } |
  { 'Duplicate' : { 'duplicate_of' : TxIndex } } |
  { 'BadFee' : { 'expected_fee' : Tokens } } |
  { 'CreatedInFuture' : { 'ledger_time' : Timestamp } } |
  { 'TooOld' : null } |
  { 'InsufficientFunds' : { 'balance' : Tokens } };
export interface TransferToProviderArgs {
  'to' : Account,
  'from' : Account,
  'amount' : Tokens,
}
export type TxIndex = bigint;
export type Value = { 'Int' : bigint } |
  { 'Nat' : bigint } |
  { 'Blob' : Uint8Array | number[] } |
  { 'Text' : string };
export interface Wallet {
  'burn' : ActorMethod<[[] | [Subaccount], bigint], undefined>,
  'getAdmins' : ActorMethod<[], Result__1>,
  'handleSubscription' : ActorMethod<[ConsumerPayload], undefined>,
  'icrc1_balance_of' : ActorMethod<[Account], Tokens>,
  'icrc1_decimals' : ActorMethod<[], number>,
  'icrc1_fee' : ActorMethod<[], bigint>,
  'icrc1_metadata' : ActorMethod<[], Array<[string, Value]>>,
  'icrc1_minting_account' : ActorMethod<[], [] | [Account]>,
  'icrc1_name' : ActorMethod<[], string>,
  'icrc1_supported_standards' : ActorMethod<
    [],
    Array<{ 'url' : string, 'name' : string }>
  >,
  'icrc1_symbol' : ActorMethod<[], string>,
  'icrc1_total_supply' : ActorMethod<[], Tokens>,
  'icrc1_transfer' : ActorMethod<
    [
      {
        'to' : Account,
        'fee' : [] | [Tokens],
        'memo' : [] | [Memo],
        'from_subaccount' : [] | [Subaccount],
        'created_at_time' : [] | [Timestamp],
        'amount' : Tokens,
      },
    ],
    Result
  >,
  'icrc2_allowance' : ActorMethod<[AllowanceArgs], Allowance>,
  'icrc2_approve' : ActorMethod<[ApproveArgs], Result_2>,
  'icrc2_transfer_from' : ActorMethod<[TransferFromArgs], Result_1>,
  'ledger_account' : ActorMethod<[], Account>,
  'stakeTokens' : ActorMethod<[bigint], Result>,
  'transferToProvider' : ActorMethod<[TransferToProviderArgs], Result>,
  'unstakeTokens' : ActorMethod<[Tokens], Result>,
}
export interface _SERVICE extends Wallet {}
