export const idlFactory = ({ IDL }) => {
  const PohVerificationStatus = IDL.Variant({
    'notSubmitted' : IDL.Null,
    'verified' : IDL.Null,
    'expired' : IDL.Null,
    'pending' : IDL.Null,
    'startPoh' : IDL.Null,
    'rejected' : IDL.Null,
  });
  const PohChallengeStatus = IDL.Variant({
    'notSubmitted' : IDL.Null,
    'verified' : IDL.Null,
    'expired' : IDL.Null,
    'pending' : IDL.Null,
    'rejected' : IDL.Null,
  });
  const ChallengeResponse = IDL.Record({
    'status' : PohChallengeStatus,
    'completedAt' : IDL.Opt(IDL.Int),
    'submittedAt' : IDL.Opt(IDL.Int),
    'challengeId' : IDL.Text,
    'requestedAt' : IDL.Opt(IDL.Int),
  });
  const PohVerificationResponsePlus = IDL.Record({
    'status' : PohVerificationStatus,
    'completedAt' : IDL.Opt(IDL.Int),
    'token' : IDL.Opt(IDL.Text),
    'rejectionReasons' : IDL.Vec(IDL.Text),
    'submittedAt' : IDL.Opt(IDL.Int),
    'isFirstAssociation' : IDL.Bool,
    'providerId' : IDL.Principal,
    'challenges' : IDL.Vec(ChallengeResponse),
    'requestedAt' : IDL.Opt(IDL.Int),
    'providerUserId' : IDL.Text,
  });
  const Provider = IDL.Service({
    'pohCallback' : IDL.Func([PohVerificationResponsePlus], [], ['oneway']),
    'registerPohCallbackForModclubForDev' : IDL.Func([], [], []),
    'registerPohCallbackForModclubForProd' : IDL.Func([], [], []),
    'registerPohCallbackForModclubForQA' : IDL.Func([], [], []),
    'verifyUserHumanityForProviderForDev' : IDL.Func(
        [IDL.Principal],
        [PohVerificationResponsePlus],
        [],
      ),
    'verifyUserHumanityForProviderForProd' : IDL.Func(
        [IDL.Principal],
        [PohVerificationResponsePlus],
        [],
      ),
    'verifyUserHumanityForProviderForQA' : IDL.Func(
        [IDL.Principal],
        [PohVerificationResponsePlus],
        [],
      ),
  });
  return Provider;
};
export const init = ({ IDL }) => { return []; };
