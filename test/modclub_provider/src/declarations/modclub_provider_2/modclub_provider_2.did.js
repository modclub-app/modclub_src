export const idlFactory = ({ IDL }) => {
  const ContentStatus = IDL.Variant({
    'approved' : IDL.Null,
    'rejected' : IDL.Null,
    'reviewRequired' : IDL.Null,
  });
  const ContentResult = IDL.Record({
    'status' : ContentStatus,
    'sourceId' : IDL.Text,
  });
  const ModclubProvider = IDL.Service({
    'addAdmin' : IDL.Func([IDL.Principal], [], []),
    'addRule' : IDL.Func([IDL.Text], [], []),
    'deregister' : IDL.Func([], [IDL.Text], []),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], []),
    'onlyOwner' : IDL.Func([IDL.Principal], [], []),
    'register' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'submitImage' : IDL.Func(
        [IDL.Text, IDL.Vec(IDL.Nat8), IDL.Text, IDL.Text],
        [IDL.Text],
        [],
      ),
    'submitText' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Opt(IDL.Text)],
        [IDL.Text],
        [],
      ),
    'subscribe' : IDL.Func([], [], []),
    'test' : IDL.Func([], [IDL.Text], []),
    'testDataCanisterStorage' : IDL.Func(
        [],
        [IDL.Principal, IDL.Principal, IDL.Text],
        [],
      ),
    'updateSettings' : IDL.Func([IDL.Nat, IDL.Nat], [], []),
    'voteResult' : IDL.Func([ContentResult], [], ['oneway']),
  });
  return ModclubProvider;
};
export const init = ({ IDL }) => { return []; };
