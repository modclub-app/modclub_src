export const idlFactory = ({ IDL }) => {
  const ProviderError = IDL.Variant({
    'InvalidContentType' : IDL.Null,
    'NotFound' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'RequiresWhitelisting' : IDL.Null,
    'InvalidContentStatus' : IDL.Null,
    'InvalidProvider' : IDL.Null,
    'ProviderIsRegistered' : IDL.Null,
  });
  const ProviderResult = IDL.Variant({
    'ok' : IDL.Null,
    'err' : ProviderError,
  });
  const Timestamp = IDL.Int;
  const AirdropUser = IDL.Record({
    'id' : IDL.Principal,
    'createdAt' : Timestamp,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Text, 'err' : ProviderError });
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
  const Image__1 = IDL.Record({
    'imageType' : IDL.Text,
    'data' : IDL.Vec(IDL.Nat8),
  });
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
    'image' : IDL.Opt(Image__1),
    'providerId' : IDL.Principal,
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
  const Holdings = IDL.Record({
    'pendingRewards' : IDL.Int,
    'stake' : IDL.Int,
    'wallet' : IDL.Int,
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
  const ProviderSettingResult = IDL.Variant({
    'ok' : ProviderSettings,
    'err' : ProviderError,
  });
  const Image = IDL.Record({
    'imageType' : IDL.Text,
    'data' : IDL.Vec(IDL.Nat8),
  });
  const ProviderRegisterResult = IDL.Variant({
    'ok' : IDL.Text,
    'err' : ProviderError,
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
    'addProviderAdmin' : IDL.Func(
        [IDL.Text, IDL.Principal, IDL.Opt(IDL.Principal)],
        [ProviderResult],
        [],
      ),
    'addRules' : IDL.Func([IDL.Vec(IDL.Text)], [ProviderResult], []),
    'airdropRegister' : IDL.Func([], [AirdropUser], []),
    'checkUsernameAvailable' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    'deregisterProvider' : IDL.Func([], [Result], []),
    'getActivity' : IDL.Func([IDL.Bool], [IDL.Vec(Activity)], ['query']),
    'getAirdropUsers' : IDL.Func([], [IDL.Vec(AirdropUser)], []),
    'getAllContent' : IDL.Func(
        [ContentStatus],
        [IDL.Vec(ContentPlus)],
        ['query'],
      ),
    'getAllProfiles' : IDL.Func([], [IDL.Vec(Profile)], ['query']),
    'getContent' : IDL.Func([IDL.Text], [IDL.Opt(ContentPlus)], ['query']),
    'getModclubHoldings' : IDL.Func([], [Holdings], ['query']),
    'getProfile' : IDL.Func([], [Profile], ['query']),
    'getProvider' : IDL.Func([IDL.Principal], [ProviderPlus], ['query']),
    'getProviderContent' : IDL.Func([], [IDL.Vec(ContentPlus)], ['query']),
    'getProviders' : IDL.Func([], [IDL.Vec(ProviderPlus)], []),
    'getRules' : IDL.Func([IDL.Principal], [IDL.Vec(Rule)], ['query']),
    'getSettings' : IDL.Func([], [ProviderSettingResult], []),
    'getTokenHoldings' : IDL.Func([], [Holdings], ['query']),
    'isAirdropRegistered' : IDL.Func([], [AirdropUser], []),
    'registerModerator' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Opt(Image)],
        [Profile],
        [],
      ),
    'registerProvider' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Opt(Image)],
        [ProviderRegisterResult],
        [],
      ),
    'removeRules' : IDL.Func([IDL.Vec(RuleId)], [ProviderResult], []),
    'stakeTokens' : IDL.Func([IDL.Nat], [IDL.Text], []),
    'submitImage' : IDL.Func(
        [IDL.Text, IDL.Vec(IDL.Nat8), IDL.Text, IDL.Opt(IDL.Text)],
        [Result],
        [],
      ),
    'submitText' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Opt(IDL.Text)],
        [Result],
        [],
      ),
    'subscribe' : IDL.Func([SubscribeMessage], [ProviderResult], []),
    'unStakeTokens' : IDL.Func([IDL.Nat], [IDL.Text], []),
    'updateSettings' : IDL.Func([ProviderSettings], [ProviderResult], []),
    'vote' : IDL.Func(
        [ContentId, Decision, IDL.Opt(IDL.Vec(RuleId))],
        [IDL.Text],
        [],
      ),
    'whiteListProvider' : IDL.Func([IDL.Principal], [], []),
  });
  return ModClub;
};
export const init = ({ IDL }) => { return []; };
