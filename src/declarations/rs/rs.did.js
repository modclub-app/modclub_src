export const idlFactory = ({ IDL }) => {
  const ENV = IDL.Variant({
    qa: IDL.Null,
    dev: IDL.Null,
    prod: IDL.Null,
    local: IDL.Text,
  });
  const Result_1 = IDL.Variant({
    ok: IDL.Vec(IDL.Principal),
    err: IDL.Text,
  });
  const UserLevel = IDL.Variant({
    junior: IDL.Null,
    novice: IDL.Null,
    senior1: IDL.Null,
    senior2: IDL.Null,
    senior3: IDL.Null,
  });
  const RSAndLevel = IDL.Record({ level: UserLevel, score: IDL.Float64 });
  const Result = IDL.Variant({ ok: IDL.Null, err: IDL.Text });
  const UserAndRS = IDL.Record({
    userId: IDL.Principal,
    score: IDL.Float64,
  });
  const UserAndVote = IDL.Record({
    votedCorrect: IDL.Bool,
    userId: IDL.Principal,
  });
  const RSManager = IDL.Service({
    getAdmins: IDL.Func([], [Result_1], ["query"]),
    isUserAdmin: IDL.Func([], [IDL.Bool], ["query"]),
    queryRSAndLevel: IDL.Func([], [RSAndLevel], ["query"]),
    queryRSAndLevelByPrincipal: IDL.Func(
      [IDL.Principal],
      [RSAndLevel],
      ["query"]
    ),
    registerAdmin: IDL.Func([IDL.Principal], [Result], []),
    setRS: IDL.Func([IDL.Principal, IDL.Float64], [], []),
    topUsers: IDL.Func([IDL.Nat, IDL.Nat], [IDL.Vec(UserAndRS)], ["query"]),
    unregisterAdmin: IDL.Func([IDL.Text], [Result], []),
    updateRS: IDL.Func([IDL.Principal, IDL.Bool], [UserAndRS], []),
    updateRSBulk: IDL.Func([IDL.Vec(UserAndVote)], [IDL.Vec(UserAndRS)], []),
  });
  return RSManager;
};
export const init = ({ IDL }) => {
  const ENV = IDL.Variant({
    qa: IDL.Null,
    dev: IDL.Null,
    prod: IDL.Null,
    local: IDL.Text,
  });
  return [ENV];
};
