export const idlFactory = ({ IDL }) => {
  const ContentStatus = IDL.Variant({
    'new' : IDL.Null,
    'approved' : IDL.Null,
    'rejected' : IDL.Null,
  });
  const ContentType = IDL.Variant({
    'imageBlob' : IDL.Null,
    'text' : IDL.Null,
    'imageUrl' : IDL.Null,
    'multiText' : IDL.Null,
  });
  const Timestamp = IDL.Int;
  const VoteId = IDL.Text;
  const Decision__1 = IDL.Variant({
    'approved' : IDL.Null,
    'rejected' : IDL.Null,
  });
  const UserId = IDL.Principal;
  const RuleId = IDL.Text;
  const Vote = IDL.Record({
    'id' : VoteId,
    'contentId' : IDL.Text,
    'decision' : Decision__1,
    'userId' : UserId,
    'createdAt' : Timestamp,
    'violatedRules' : IDL.Opt(IDL.Vec(RuleId)),
  });
  const ProviderId = IDL.Principal;
  const Activity = IDL.Record({
    'status' : ContentStatus,
    'reward' : IDL.Nat,
    'title' : IDL.Opt(IDL.Text),
    'voteCount' : IDL.Nat,
    'contentType' : ContentType,
    'rewardRelease' : Timestamp,
    'minVotes' : IDL.Nat,
    'createdAt' : Timestamp,
    'vote' : Vote,
    'minStake' : IDL.Nat,
    'updatedAt' : Timestamp,
    'providerName' : IDL.Text,
    'providerId' : ProviderId,
  });
  const ContentId__1 = IDL.Text;
  const ContentPlus = IDL.Record({
    'id' : ContentId__1,
    'status' : ContentStatus,
    'title' : IDL.Opt(IDL.Text),
    'voteCount' : IDL.Nat,
    'contentType' : ContentType,
    'minVotes' : IDL.Nat,
    'createdAt' : Timestamp,
    'text' : IDL.Opt(IDL.Text),
    'sourceId' : IDL.Text,
    'minStake' : IDL.Nat,
    'updatedAt' : Timestamp,
    'providerName' : IDL.Text,
    'providerId' : IDL.Principal,
  });
  const Image__1 = IDL.Record({
    'imageType' : IDL.Text,
    'data' : IDL.Vec(IDL.Nat8),
  });
  const Role = IDL.Variant({
    'admin' : IDL.Null,
    'moderator' : IDL.Null,
    'owner' : IDL.Null,
  });
  const Profile = IDL.Record({
    'id' : UserId,
    'pic' : IDL.Opt(Image__1),
    'userName' : IDL.Text,
    'createdAt' : Timestamp,
    'role' : Role,
    'email' : IDL.Text,
    'updatedAt' : Timestamp,
  });
  const ProviderSettings = IDL.Record({
    'minVotes' : IDL.Nat,
    'minStaked' : IDL.Nat,
  });
  const Rule = IDL.Record({ 'id' : RuleId, 'description' : IDL.Text });
  const ProviderPlus = IDL.Record({
    'id' : IDL.Principal,
    'contentCount' : IDL.Nat,
    'rewardsSpent' : IDL.Nat,
    'name' : IDL.Text,
    'createdAt' : Timestamp,
    'description' : IDL.Text,
    'updatedAt' : Timestamp,
    'settings' : ProviderSettings,
    'activeCount' : IDL.Nat,
    'image' : IDL.Opt(Image__1),
    'rules' : IDL.Vec(Rule),
  });
  const Holdings = IDL.Record({
    'pendingRewards' : IDL.Int,
    'stake' : IDL.Int,
    'wallet' : IDL.Int,
  });
  const Image = IDL.Record({
    'imageType' : IDL.Text,
    'data' : IDL.Vec(IDL.Nat8),
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
    'addRules' : IDL.Func([IDL.Vec(IDL.Text)], [], ['oneway']),
    'checkUsernameAvailable' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    'deregisterProvider' : IDL.Func([], [IDL.Text], []),
    'getActivity' : IDL.Func([IDL.Bool], [IDL.Vec(Activity)], ['query']),
    'getAllContent' : IDL.Func(
        [ContentStatus],
        [IDL.Vec(ContentPlus)],
        ['query'],
      ),
    'getAllProfiles' : IDL.Func([], [IDL.Vec(Profile)], ['query']),
    'getContent' : IDL.Func([IDL.Text], [IDL.Opt(ContentPlus)], ['query']),
    'getImage' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Vec(IDL.Nat8))], ['query']),
    'getProfile' : IDL.Func([], [Profile], ['query']),
    'getProvider' : IDL.Func([IDL.Principal], [ProviderPlus], ['query']),
    'getProviderContent' : IDL.Func([], [IDL.Vec(ContentPlus)], ['query']),
    'getRules' : IDL.Func([IDL.Principal], [IDL.Vec(Rule)], ['query']),
    'getTokenHoldings' : IDL.Func([], [Holdings], ['query']),
    'registerModerator' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Opt(Image)],
        [Profile],
        [],
      ),
    'registerProvider' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Opt(Image)],
        [IDL.Text],
        [],
      ),
    'removeRules' : IDL.Func([IDL.Vec(RuleId)], [], ['oneway']),
    'sendImage' : IDL.Func(
        [IDL.Text, IDL.Vec(IDL.Nat8), IDL.Text],
        [IDL.Text],
        [],
      ),
    'stakeTokens' : IDL.Func([IDL.Nat], [IDL.Text], []),
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
    'unStakeTokens' : IDL.Func([IDL.Nat], [IDL.Text], []),
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
