export const idlFactory = ({ IDL }) => {
  const ContentId__1 = IDL.Text;
  const ContentStatus = IDL.Variant({
    'approved' : IDL.Null,
    'rejected' : IDL.Null,
    'reviewRequired' : IDL.Null,
  });
  const ContentType = IDL.Variant({
    'imageBlob' : IDL.Null,
    'text' : IDL.Null,
    'imageUrl' : IDL.Null,
    'multiText' : IDL.Null,
  });
  const Timestamp = IDL.Int;
  const Content = IDL.Record({
    'id' : ContentId__1,
    'status' : ContentStatus,
    'title' : IDL.Opt(IDL.Text),
    'contentType' : ContentType,
    'createdAt' : Timestamp,
    'sourceId' : IDL.Text,
    'updateAt' : Timestamp,
    'providerId' : IDL.Principal,
  });
  const ContentPlus = IDL.Record({
    'id' : ContentId__1,
    'status' : ContentStatus,
    'title' : IDL.Opt(IDL.Text),
    'contentType' : ContentType,
    'createdAt' : Timestamp,
    'text' : IDL.Opt(IDL.Text),
    'sourceId' : IDL.Text,
    'updateAt' : Timestamp,
  });
  const ContentResult = IDL.Record({
    'status' : ContentStatus,
    'sourceId' : IDL.Text,
  });
  const SubscribeMessage = IDL.Record({
    'callback' : IDL.Func([ContentResult], [], ['oneway']),
  });
  const ContentId = IDL.Text;
  const Decision = IDL.Variant({
    'approved' : IDL.Null,
    'rejected' : IDL.Null,
  });
  const ModClub = IDL.Service({
    'addToWaitList' : IDL.Func([IDL.Text], [IDL.Text], []),
    'getAllContent' : IDL.Func([], [IDL.Vec(Content)], ['query']),
    'getContent' : IDL.Func([IDL.Text], [IDL.Opt(Content)], ['query']),
    'getProviderContent' : IDL.Func([], [IDL.Vec(ContentPlus)], ['query']),
    'getWaitList' : IDL.Func([], [IDL.Vec(IDL.Text)], []),
    'registerModerator' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Text)],
        [IDL.Text],
        [],
      ),
    'registerProvider' : IDL.Func([IDL.Text], [IDL.Text], []),
    'submitText' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Opt(IDL.Text)],
        [IDL.Text],
        [],
      ),
    'subscribe' : IDL.Func([SubscribeMessage], [], []),
    'vote' : IDL.Func([ContentId, Decision], [IDL.Text], []),
  });
  return ModClub;
};
export const init = ({ IDL }) => { return []; };
