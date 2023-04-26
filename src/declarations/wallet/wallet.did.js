export const idlFactory = ({ IDL }) => {
  const ENV = IDL.Variant({
    'qa' : IDL.Null,
    'dev' : IDL.Null,
    'prod' : IDL.Null,
    'local' : IDL.Text,
  });
  const SubAccount = IDL.Text;
  const Result_1 = IDL.Variant({
    'ok' : IDL.Vec(IDL.Principal),
    'err' : IDL.Text,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const UserAndAmount = IDL.Record({
    'toOwner' : IDL.Principal,
    'toSA' : IDL.Opt(IDL.Text),
    'fromSA' : IDL.Opt(IDL.Text),
    'amount' : IDL.Float64,
  });
  const Wallet = IDL.Service({
    'burn' : IDL.Func([IDL.Opt(SubAccount), IDL.Float64], [], []),
    'getAdmins' : IDL.Func([], [Result_1], ['query']),
    'isUserAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'queryBalance' : IDL.Func([IDL.Opt(SubAccount)], [IDL.Float64], ['query']),
    'queryBalancePr' : IDL.Func(
        [IDL.Principal, IDL.Opt(SubAccount)],
        [IDL.Float64],
        ['query'],
      ),
    'registerAdmin' : IDL.Func([IDL.Principal], [Result], []),
    'stakeTokens' : IDL.Func([IDL.Float64], [], []),
    'tge' : IDL.Func([], [], []),
    'transfer' : IDL.Func(
        [IDL.Opt(SubAccount), IDL.Principal, IDL.Opt(SubAccount), IDL.Float64],
        [],
        [],
      ),
    'transferBulk' : IDL.Func([IDL.Vec(UserAndAmount)], [], []),
    'transferToProvider' : IDL.Func(
        [
          IDL.Principal,
          IDL.Opt(SubAccount),
          IDL.Principal,
          IDL.Opt(SubAccount),
          IDL.Float64,
        ],
        [],
        [],
      ),
    'unregisterAdmin' : IDL.Func([IDL.Text], [Result], []),
  });
  return Wallet;
};
export const init = ({ IDL }) => {
  const ENV = IDL.Variant({
    'qa' : IDL.Null,
    'dev' : IDL.Null,
    'prod' : IDL.Null,
    'local' : IDL.Text,
  });
  return [ENV];
};
