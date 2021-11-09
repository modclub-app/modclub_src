export const idlFactory = ({ IDL }) => {
  const ContentStatus = IDL.Variant({
    'new' : IDL.Null,
    'approved' : IDL.Null,
    'rejected' : IDL.Null,
  });
  const ContentId__1 = IDL.Text;
  const ContentType = IDL.Variant({
    'imageBlob' : IDL.Null,
    'text' : IDL.Null,
    'imageUrl' : IDL.Null,
    'multiText' : IDL.Null,
  });
  const Timestamp = IDL.Int;
  const ContentPlus = IDL.Record({
    'id' : ContentId__1,
    'status' : ContentStatus,
    'title' : IDL.Opt(IDL.Text),
    'voteCount' : IDL.Nat,
    'contentType' : ContentType,
    'minVotes' : IDL.Nat,
    'appName' : IDL.Text,
    'createdAt' : Timestamp,
    'text' : IDL.Opt(IDL.Text),
    'sourceId' : IDL.Text,
    'minStake' : IDL.Nat,
    'updatedAt' : Timestamp,
    'providerId' : IDL.Principal,
  });
  const Content = IDL.Record({
    'id' : ContentId__1,
    'status' : ContentStatus,
    'title' : IDL.Opt(IDL.Text),
    'contentType' : ContentType,
    'createdAt' : Timestamp,
    'sourceId' : IDL.Text,
    'updatedAt' : Timestamp,
    'providerId' : IDL.Principal,
  });
  const RuleId = IDL.Text;
  const Rule = IDL.Record({ 'id' : RuleId, 'description' : IDL.Text });
  const VoteId = IDL.Text;
  const Decision__1 = IDL.Variant({
    'approved' : IDL.Null,
    'rejected' : IDL.Null,
  });
  const UserId = IDL.Principal;
  const Vote = IDL.Record({
    'id' : VoteId,
    'contentId' : IDL.Text,
    'decision' : Decision__1,
    'userId' : UserId,
    'violatedRules' : IDL.Opt(IDL.Vec(RuleId)),
  });
  const Role = IDL.Variant({
    'admin' : IDL.Null,
    'moderator' : IDL.Null,
    'owner' : IDL.Null,
  });
  const Profile = IDL.Record({
    'id' : UserId,
    'userName' : IDL.Text,
    'createdAt' : Timestamp,
    'role' : Role,
    'picUrl' : IDL.Opt(IDL.Text),
    'updatedAt' : Timestamp,
  });
  const ContentResult = IDL.Record({
    'status' : ContentStatus,
    'sourceId' : IDL.Text,
  });
  const SubscribeMessage = IDL.Record({
    'callback' : IDL.Func([ContentResult], [], ['oneway']),
  });
  const ProviderSettings = IDL.Record({
    'minVotes' : IDL.Nat,
    'minStaked' : IDL.Nat,
  });
  const ContentId = IDL.Text;
  const Decision = IDL.Variant({
    'approved' : IDL.Null,
    'rejected' : IDL.Null,
  });
  const ModClub = IDL.Service({
    'addContentRules' : IDL.Func([IDL.Vec(IDL.Text)], [], ['oneway']),
    'addToWaitList' : IDL.Func([IDL.Text], [IDL.Text], []),
    'checkUsernameAvailable' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    'deregisterProvider' : IDL.Func([], [IDL.Text], []),
    'getAllContent' : IDL.Func(
        [ContentStatus],
        [IDL.Vec(ContentPlus)],
        ['query'],
      ),
    'getContent' : IDL.Func([IDL.Text], [IDL.Opt(Content)], ['query']),
    'getContentRules' : IDL.Func([], [IDL.Vec(Rule)], ['query']),
    'getImage' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Vec(IDL.Nat8))], ['query']),
    'getMyVotes' : IDL.Func([], [IDL.Vec(Vote)], ['query']),
    'getProfile' : IDL.Func([], [Profile], []),
    'getProviderContent' : IDL.Func([], [IDL.Vec(ContentPlus)], ['query']),
    'getWaitList' : IDL.Func([], [IDL.Vec(IDL.Text)], []),
    'registerModerator' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Text)],
        [Profile],
        [],
      ),
    'registerProvider' : IDL.Func([IDL.Text], [IDL.Text], []),
    'removeContentRules' : IDL.Func([IDL.Vec(RuleId)], [], ['oneway']),
    'sendImage' : IDL.Func(
        [IDL.Text, IDL.Vec(IDL.Nat8), IDL.Text],
        [IDL.Text],
        [],
      ),
    'submitImage' : IDL.Func(
        [IDL.Text, IDL.Vec(IDL.Nat8), IDL.Text, IDL.Opt(IDL.Text)],
        [IDL.Text],
        [],
      ),
    'submitText' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Opt(IDL.Text)],
        [IDL.Text],
        [],
      ),
    'subscribe' : IDL.Func([SubscribeMessage], [], []),
    'updateProfile' : IDL.Func([IDL.Text, IDL.Opt(IDL.Text)], [Profile], []),
    'updateSettings' : IDL.Func([ProviderSettings], [], ['oneway']),
    'vote' : IDL.Func(
        [ContentId, Decision, IDL.Opt(IDL.Vec(RuleId))],
        [IDL.Text],
        [],
      ),
  });
  return ModClub;
};
export const init = ({ IDL }) => { return []; };
