export const idlFactory = ({ IDL }) => {
  const ENV = IDL.Variant({
    'qa' : IDL.Null,
    'dev' : IDL.Null,
    'prod' : IDL.Null,
    'local' : IDL.Record({
      'wallet_canister_id' : IDL.Principal,
      'vesting_canister_id' : IDL.Principal,
      'old_modclub_canister_id' : IDL.Principal,
      'modclub_canister_id' : IDL.Principal,
      'rs_canister_id' : IDL.Principal,
      'auth_canister_id' : IDL.Principal,
    }),
  });
  const Subaccount = IDL.Vec(IDL.Nat8);
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(Subaccount),
  });
  const LedgerInitParams = IDL.Record({
    'decimals' : IDL.Nat8,
    'token_symbol' : IDL.Text,
    'transfer_fee' : IDL.Nat,
    'minting_account' : Account,
    'initial_mints' : IDL.Vec(
      IDL.Record({ 'account' : Account, 'amount' : IDL.Nat })
    ),
    'ledger_account' : Account,
    'token_name' : IDL.Text,
  });
  const Result__1 = IDL.Variant({
    'ok' : IDL.Vec(IDL.Principal),
    'err' : IDL.Text,
  });
  const Event = IDL.Record({ 'topic' : IDL.Text, 'payload' : IDL.Principal });
  const ConsumerPayload = IDL.Variant({
    'events' : IDL.Vec(Event),
    'admins' : IDL.Vec(IDL.Principal),
  });
  const Tokens = IDL.Nat;
  const Value = IDL.Variant({
    'Int' : IDL.Int,
    'Nat' : IDL.Nat,
    'Blob' : IDL.Vec(IDL.Nat8),
    'Text' : IDL.Text,
  });
  const Memo = IDL.Vec(IDL.Nat8);
  const Timestamp = IDL.Nat64;
  const TxIndex = IDL.Nat;
  const TransferError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'BadBurn' : IDL.Record({ 'min_burn_amount' : Tokens }),
    'Duplicate' : IDL.Record({ 'duplicate_of' : TxIndex }),
    'BadFee' : IDL.Record({ 'expected_fee' : Tokens }),
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : Timestamp }),
    'TooOld' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : Tokens }),
  });
  const Result = IDL.Variant({ 'Ok' : TxIndex, 'Err' : TransferError });
  const AllowanceArgs = IDL.Record({
    'account' : Account,
    'spender' : IDL.Principal,
  });
  const Allowance = IDL.Record({
    'allowance' : IDL.Nat,
    'expires_at' : IDL.Opt(IDL.Nat64),
  });
  const ApproveArgs = IDL.Record({
    'fee' : IDL.Opt(Tokens),
    'memo' : IDL.Opt(Memo),
    'from_subaccount' : IDL.Opt(Subaccount),
    'created_at_time' : IDL.Opt(Timestamp),
    'amount' : IDL.Int,
    'expires_at' : IDL.Opt(IDL.Nat64),
    'spender' : IDL.Principal,
  });
  const ApproveError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'Duplicate' : IDL.Record({ 'duplicate_of' : TxIndex }),
    'BadFee' : IDL.Record({ 'expected_fee' : Tokens }),
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : Timestamp }),
    'TooOld' : IDL.Null,
    'Expired' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
    'InsufficientFunds' : IDL.Record({ 'balance' : Tokens }),
  });
  const Result_2 = IDL.Variant({ 'Ok' : TxIndex, 'Err' : ApproveError });
  const TransferFromArgs = IDL.Record({
    'to' : Account,
    'fee' : IDL.Opt(Tokens),
    'from' : Account,
    'memo' : IDL.Opt(Memo),
    'created_at_time' : IDL.Opt(Timestamp),
    'amount' : Tokens,
  });
  const TransferFromError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'InsufficientAllowance' : IDL.Record({ 'allowance' : IDL.Nat }),
    'BadBurn' : IDL.Record({ 'min_burn_amount' : Tokens }),
    'Duplicate' : IDL.Record({ 'duplicate_of' : TxIndex }),
    'BadFee' : IDL.Record({ 'expected_fee' : Tokens }),
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : Timestamp }),
    'TooOld' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : Tokens }),
  });
  const Result_1 = IDL.Variant({ 'Ok' : TxIndex, 'Err' : TransferFromError });
  const SubAccount = IDL.Text;
  const UserAndAmount = IDL.Record({
    'toOwner' : IDL.Principal,
    'toSA' : IDL.Opt(IDL.Text),
    'fromSA' : IDL.Opt(IDL.Text),
    'amount' : IDL.Float64,
  });
  const TransferToProviderArgs = IDL.Record({
    'to' : Account,
    'from' : Account,
    'amount' : Tokens,
  });
  const Wallet = IDL.Service({
    'burn' : IDL.Func([IDL.Opt(Subaccount), IDL.Nat], [], []),
    'getAdmins' : IDL.Func([], [Result__1], ['query']),
    'handleSubscription' : IDL.Func([ConsumerPayload], [], []),
    'icrc1_balance_of' : IDL.Func([Account], [Tokens], ['query']),
    'icrc1_decimals' : IDL.Func([], [IDL.Nat8], ['query']),
    'icrc1_fee' : IDL.Func([], [IDL.Nat], ['query']),
    'icrc1_metadata' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, Value))],
        ['query'],
      ),
    'icrc1_minting_account' : IDL.Func([], [IDL.Opt(Account)], ['query']),
    'icrc1_name' : IDL.Func([], [IDL.Text], ['query']),
    'icrc1_supported_standards' : IDL.Func(
        [],
        [IDL.Vec(IDL.Record({ 'url' : IDL.Text, 'name' : IDL.Text }))],
        ['query'],
      ),
    'icrc1_symbol' : IDL.Func([], [IDL.Text], ['query']),
    'icrc1_total_supply' : IDL.Func([], [Tokens], ['query']),
    'icrc1_transfer' : IDL.Func(
        [
          IDL.Record({
            'to' : Account,
            'fee' : IDL.Opt(Tokens),
            'memo' : IDL.Opt(Memo),
            'from_subaccount' : IDL.Opt(Subaccount),
            'created_at_time' : IDL.Opt(Timestamp),
            'amount' : Tokens,
          }),
        ],
        [Result],
        [],
      ),
    'icrc2_allowance' : IDL.Func([AllowanceArgs], [Allowance], ['query']),
    'icrc2_approve' : IDL.Func([ApproveArgs], [Result_2], []),
    'icrc2_transfer_from' : IDL.Func([TransferFromArgs], [Result_1], []),
    'isUserAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'ledger_account' : IDL.Func([], [Account], ['query']),
    'queryBalance' : IDL.Func([IDL.Opt(SubAccount)], [IDL.Float64], ['query']),
    'queryBalancePr' : IDL.Func(
        [IDL.Principal, IDL.Opt(SubAccount)],
        [IDL.Float64],
        ['query'],
      ),
    'stakeTokens' : IDL.Func([IDL.Nat], [Result], []),
    'tge' : IDL.Func([], [], []),
    'transfer' : IDL.Func(
        [IDL.Opt(SubAccount), IDL.Principal, IDL.Opt(SubAccount), IDL.Float64],
        [],
        [],
      ),
    'transferBulk' : IDL.Func([IDL.Vec(UserAndAmount)], [], []),
    'transferToProvider' : IDL.Func([TransferToProviderArgs], [Result], []),
    'unstakeTokens' : IDL.Func([Tokens], [Result], []),
  });
  return Wallet;
};
export const init = ({ IDL }) => {
  const ENV = IDL.Variant({
    'qa' : IDL.Null,
    'dev' : IDL.Null,
    'prod' : IDL.Null,
    'local' : IDL.Record({
      'wallet_canister_id' : IDL.Principal,
      'vesting_canister_id' : IDL.Principal,
      'old_modclub_canister_id' : IDL.Principal,
      'modclub_canister_id' : IDL.Principal,
      'rs_canister_id' : IDL.Principal,
      'auth_canister_id' : IDL.Principal,
    }),
  });
  const Subaccount = IDL.Vec(IDL.Nat8);
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(Subaccount),
  });
  const LedgerInitParams = IDL.Record({
    'decimals' : IDL.Nat8,
    'token_symbol' : IDL.Text,
    'transfer_fee' : IDL.Nat,
    'minting_account' : Account,
    'initial_mints' : IDL.Vec(
      IDL.Record({ 'account' : Account, 'amount' : IDL.Nat })
    ),
    'ledger_account' : Account,
    'token_name' : IDL.Text,
  });
  return [IDL.Record({ 'env' : ENV, 'ledgerInit' : LedgerInitParams })];
};
