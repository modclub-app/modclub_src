export const idlFactory = ({ IDL }) => {
  const List = IDL.Rec();
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
  const Result_2 = IDL.Variant({
    ok: IDL.Vec(IDL.Principal),
    err: IDL.Text,
  });
  const ConsumerPayload = IDL.Variant({ admins: IDL.Vec(IDL.Principal) });
  const SubscriberCanisterType = IDL.Service({
    handleSubscription: IDL.Func([ConsumerPayload], [], []),
  });
  const Subscriber = IDL.Record({
    topic: IDL.Text,
    _actor: SubscriberCanisterType,
    consumer: IDL.Principal,
  });
  const Result_1 = IDL.Variant({
    ok: IDL.Vec(Subscriber),
    err: IDL.Text,
  });
  List.fill(IDL.Opt(IDL.Tuple(IDL.Principal, List)));
  const AdminsList = IDL.Opt(IDL.Tuple(IDL.Principal, List));
  const Result = IDL.Variant({ ok: AdminsList, err: IDL.Text });
  const ModclubAuth = IDL.Service({
    getAdmins: IDL.Func([], [Result_2], ["query"]),
    getSubscriptions: IDL.Func([], [Result_1], ["query"]),
    isAdmin: IDL.Func([IDL.Principal], [IDL.Bool], ["query"]),
    registerAdmin: IDL.Func([IDL.Principal], [Result], []),
    subscribe: IDL.Func([IDL.Text], [], []),
    unregisterAdmin: IDL.Func([IDL.Text], [Result], []),
  });
  return ModclubAuth;
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
