export const idlFactory = ({ IDL }) => {
  const ENV = IDL.Variant({
    qa: IDL.Null,
    dev: IDL.Null,
    prod: IDL.Null,
    local: IDL.Record({
      wallet_canister_id: IDL.Principal,
      modclub_canister_id: IDL.Principal,
      rs_canister_id: IDL.Principal,
      auth_canister_id: IDL.Principal,
    }),
  });
  const ConsumerPayload = IDL.Variant({ admins: IDL.Vec(IDL.Principal) });
  const UserLevel = IDL.Variant({
    junior: IDL.Null,
    novice: IDL.Null,
    senior1: IDL.Null,
    senior2: IDL.Null,
    senior3: IDL.Null,
  });
  const RSAndLevel = IDL.Record({ level: UserLevel, score: IDL.Int });
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
    handleSubscription: IDL.Func([ConsumerPayload], [], []),
    queryRSAndLevel: IDL.Func([], [RSAndLevel], ["query"]),
    queryRSAndLevelByPrincipal: IDL.Func(
      [IDL.Principal],
      [RSAndLevel],
      ["query"]
    ),
    setRS: IDL.Func([IDL.Principal, IDL.Int], [], []),
    showAdmins: IDL.Func([], [IDL.Vec(IDL.Principal)], ["query"]),
    topUsers: IDL.Func([IDL.Nat, IDL.Nat], [IDL.Vec(UserAndRS)], ["query"]),
    updateRS: IDL.Func([IDL.Principal, IDL.Bool, Decision], [UserAndRS], []),
    updateRSBulk: IDL.Func([IDL.Vec(UserAndVote)], [IDL.Vec(UserAndRS)], []),
  });
  return RSManager;
};
export const init = ({ IDL }) => {
  const ENV = IDL.Variant({
    qa: IDL.Null,
    dev: IDL.Null,
    prod: IDL.Null,
    local: IDL.Record({
      wallet_canister_id: IDL.Principal,
      modclub_canister_id: IDL.Principal,
      rs_canister_id: IDL.Principal,
      auth_canister_id: IDL.Principal,
    }),
  });
  return [ENV];
};
