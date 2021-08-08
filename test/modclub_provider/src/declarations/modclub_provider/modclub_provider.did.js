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
  return IDL.Service({
    'deregister' : IDL.Func([], [IDL.Text], []),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], []),
    'subscribe' : IDL.Func([], [], []),
    'test' : IDL.Func([], [IDL.Text], []),
    'voteResult' : IDL.Func([ContentResult], [], ['oneway']),
  });
};
export const init = ({ IDL }) => { return []; };
