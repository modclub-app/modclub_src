export const idlFactory = ({ IDL }) => {
  const Timestamp = IDL.Int;
  const AirdropUser = IDL.Record({
    'id' : IDL.Principal,
    'createdAt' : Timestamp,
  });
  const PohUniqueToken = IDL.Record({ 'token' : IDL.Text });
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
    'pohPackage' : IDL.Null,
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
    'reward' : IDL.Float64,
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
    'hasVoted' : IDL.Opt(IDL.Bool),
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
  const ModeratorLeaderboard = IDL.Record({
    'id' : UserId,
    'completedVoteCount' : IDL.Int,
    'userName' : IDL.Text,
    'rewardsEarned' : IDL.Int,
    'lastVoted' : IDL.Opt(Timestamp),
    'performance' : IDL.Float64,
  });
  const PohChallengeStatus = IDL.Variant({
    'notSubmitted' : IDL.Null,
    'verified' : IDL.Null,
    'expired' : IDL.Null,
    'pending' : IDL.Null,
    'rejected' : IDL.Null,
  });
  const ViolatedRules = IDL.Record({
    'ruleId' : IDL.Text,
    'ruleDesc' : IDL.Text,
  });
  const PohChallengeType = IDL.Variant({
    'dl' : IDL.Null,
    'ssn' : IDL.Null,
    'userName' : IDL.Null,
    'fullName' : IDL.Null,
    'email' : IDL.Null,
    'selfVideo' : IDL.Null,
    'selfPic' : IDL.Null,
  });
  const PohTaskData = IDL.Record({
    'dataCanisterId' : IDL.Opt(IDL.Principal),
    'status' : PohChallengeStatus,
    'userName' : IDL.Opt(IDL.Text),
    'contentId' : IDL.Opt(IDL.Text),
    'allowedViolationRules' : IDL.Vec(ViolatedRules),
    'userId' : IDL.Principal,
    'createdAt' : IDL.Int,
    'fullName' : IDL.Opt(IDL.Text),
    'email' : IDL.Opt(IDL.Text),
    'updatedAt' : IDL.Int,
    'challengeId' : IDL.Text,
    'challengeType' : PohChallengeType,
    'aboutUser' : IDL.Opt(IDL.Text),
    'wordList' : IDL.Opt(IDL.Vec(IDL.Text)),
  });
  const PohError = IDL.Variant({
    'invalidPackageId' : IDL.Null,
    'challengeNotPendingForSubmission' : IDL.Null,
    'invalidToken' : IDL.Null,
  });
  const Result_1 = IDL.Variant({
    'ok' : IDL.Vec(PohTaskData),
    'err' : PohError,
  });
  const PohTaskPlus = IDL.Record({
    'status' : ContentStatus,
    'reward' : IDL.Float64,
    'userName' : IDL.Opt(IDL.Text),
    'title' : IDL.Opt(IDL.Text),
    'profileImageUrlSuffix' : IDL.Opt(IDL.Text),
    'voteCount' : IDL.Nat,
    'minVotes' : IDL.Int,
    'createdAt' : IDL.Int,
    'fullName' : IDL.Opt(IDL.Text),
    'email' : IDL.Opt(IDL.Text),
    'minStake' : IDL.Int,
    'updatedAt' : IDL.Int,
    'aboutUser' : IDL.Opt(IDL.Text),
    'hasVoted' : IDL.Opt(IDL.Bool),
    'packageId' : IDL.Text,
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
  const Image = IDL.Record({
    'imageType' : IDL.Text,
    'data' : IDL.Vec(IDL.Nat8),
  });
  const PohChallengesAttempt = IDL.Record({
    'dataCanisterId' : IDL.Opt(IDL.Principal),
    'status' : PohChallengeStatus,
    'completedOn' : IDL.Int,
    'attemptId' : IDL.Opt(IDL.Text),
    'userId' : IDL.Principal,
    'createdAt' : IDL.Int,
    'updatedAt' : IDL.Int,
    'challengeId' : IDL.Text,
    'challengeDescription' : IDL.Text,
    'challengeName' : IDL.Text,
    'challengeType' : PohChallengeType,
    'wordList' : IDL.Opt(IDL.Vec(IDL.Text)),
  });
  const Result = IDL.Variant({
    'ok' : IDL.Vec(PohChallengesAttempt),
    'err' : PohError,
  });
  const PohChallengeSubmissionRequest = IDL.Record({
    'userName' : IDL.Opt(IDL.Text),
    'numOfChunks' : IDL.Nat,
    'mimeType' : IDL.Text,
    'fullName' : IDL.Opt(IDL.Text),
    'offset' : IDL.Nat,
    'email' : IDL.Opt(IDL.Text),
    'challengeId' : IDL.Text,
    'dataSize' : IDL.Nat,
    'aboutUser' : IDL.Opt(IDL.Text),
    'challengeDataBlob' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const PohChallengeSubmissionStatus = IDL.Variant({
    'ok' : IDL.Null,
    'notPendingForSubmission' : IDL.Null,
    'alreadySubmitted' : IDL.Null,
    'alreadyApproved' : IDL.Null,
    'alreadyRejected' : IDL.Null,
    'inputDataMissing' : IDL.Null,
    'incorrectChallenge' : IDL.Null,
  });
  const PohChallengeSubmissionResponse = IDL.Record({
    'submissionStatus' : PohChallengeSubmissionStatus,
    'challengeId' : IDL.Text,
  });
  const ContentResult = IDL.Record({
    'status' : ContentStatus,
    'sourceId' : IDL.Text,
  });
  const SubscribeMessage = IDL.Record({
    'callback' : IDL.Func([ContentResult], [], ['oneway']),
  });
  const ChallengeResponse = IDL.Record({
    'status' : PohChallengeStatus,
    'completedOn' : IDL.Opt(IDL.Int),
    'challengeId' : IDL.Text,
  });
  const PohVerificationResponse = IDL.Record({
    'requestId' : IDL.Text,
    'providerId' : IDL.Principal,
    'challenges' : IDL.Vec(ChallengeResponse),
    'requestedOn' : IDL.Int,
    'providerUserId' : IDL.Principal,
  });
  const ContentId = IDL.Text;
  const Decision = IDL.Variant({
    'approved' : IDL.Null,
    'rejected' : IDL.Null,
  });
  const PohRulesViolated = IDL.Record({
    'ruleId' : IDL.Text,
    'challengeId' : IDL.Text,
  });
  const ModClub = IDL.Service({
    'addRules' : IDL.Func([IDL.Vec(IDL.Text)], [], ['oneway']),
    'addToAirdropWhitelist' : IDL.Func([IDL.Vec(IDL.Principal)], [], []),
    'airdropRegister' : IDL.Func([], [AirdropUser], []),
    'checkUsernameAvailable' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    'deregisterProvider' : IDL.Func([], [IDL.Text], []),
    'generateUniqueToken' : IDL.Func([IDL.Principal], [PohUniqueToken], []),
    'getActivity' : IDL.Func([IDL.Bool], [IDL.Vec(Activity)], ['query']),
    'getAirdropUsers' : IDL.Func([], [IDL.Vec(AirdropUser)], []),
    'getAirdropWhitelist' : IDL.Func([], [IDL.Vec(IDL.Principal)], []),
    'getAllContent' : IDL.Func(
        [ContentStatus],
        [IDL.Vec(ContentPlus)],
        ['query'],
      ),
    'getAllProfiles' : IDL.Func([], [IDL.Vec(Profile)], ['query']),
    'getContent' : IDL.Func([IDL.Text], [IDL.Opt(ContentPlus)], ['query']),
    'getModclubHoldings' : IDL.Func([], [Holdings], ['query']),
    'getModeratorLeaderboard' : IDL.Func(
        [IDL.Nat, IDL.Nat],
        [IDL.Vec(ModeratorLeaderboard)],
        ['query'],
      ),
    'getPohTaskData' : IDL.Func([IDL.Text], [Result_1], []),
    'getPohTasks' : IDL.Func([ContentStatus], [IDL.Vec(PohTaskPlus)], []),
    'getProfile' : IDL.Func([], [Profile], ['query']),
    'getProfileById' : IDL.Func([IDL.Principal], [Profile], ['query']),
    'getProvider' : IDL.Func([IDL.Principal], [ProviderPlus], ['query']),
    'getProviderContent' : IDL.Func([], [IDL.Vec(ContentPlus)], ['query']),
    'getRules' : IDL.Func([IDL.Principal], [IDL.Vec(Rule)], ['query']),
    'getTokenHoldings' : IDL.Func([], [Holdings], ['query']),
    'getVotePerformance' : IDL.Func([], [IDL.Float64], ['query']),
    'isAirdropRegistered' : IDL.Func([], [AirdropUser], []),
    'populateChallenges' : IDL.Func([], [], []),
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
    'retrieveChallengesForUser' : IDL.Func([IDL.Text], [Result], []),
    'stakeTokens' : IDL.Func([IDL.Nat], [IDL.Text], []),
    'submitChallengeData' : IDL.Func(
        [PohChallengeSubmissionRequest],
        [PohChallengeSubmissionResponse],
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
    'toggleAllowSubmission' : IDL.Func([IDL.Bool], [], []),
    'unStakeTokens' : IDL.Func([IDL.Nat], [IDL.Text], []),
    'updateSettings' : IDL.Func([ProviderSettings], [], []),
    'verifyForHumanity' : IDL.Func(
        [IDL.Principal],
        [PohVerificationResponse],
        [],
      ),
    'verifyUserHumanity' : IDL.Func(
        [],
        [PohChallengeStatus, IDL.Opt(PohUniqueToken)],
        [],
      ),
    'vote' : IDL.Func(
        [ContentId, Decision, IDL.Opt(IDL.Vec(RuleId))],
        [IDL.Text],
        [],
      ),
    'votePohContent' : IDL.Func(
        [IDL.Text, Decision, IDL.Vec(PohRulesViolated)],
        [],
        [],
      ),
  });
  return ModClub;
};
export const init = ({ IDL }) => { return []; };
