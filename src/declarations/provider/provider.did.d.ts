import type { Principal } from '@dfinity/principal';
export interface ChallengeResponse {
  'status' : PohChallengeStatus,
  'completedAt' : [] | [bigint],
  'submittedAt' : [] | [bigint],
  'challengeId' : string,
  'requestedAt' : [] | [bigint],
}
export type PohChallengeStatus = { 'notSubmitted' : null } |
  { 'verified' : null } |
  { 'expired' : null } |
  { 'pending' : null } |
  { 'rejected' : null };
export interface PohVerificationResponsePlus {
  'status' : PohVerificationStatus,
  'completedAt' : [] | [bigint],
  'token' : [] | [string],
  'rejectionReasons' : Array<string>,
  'submittedAt' : [] | [bigint],
  'isFirstAssociation' : boolean,
  'providerId' : Principal,
  'challenges' : Array<ChallengeResponse>,
  'requestedAt' : [] | [bigint],
  'providerUserId' : string,
}
export type PohVerificationStatus = { 'notSubmitted' : null } |
  { 'verified' : null } |
  { 'expired' : null } |
  { 'pending' : null } |
  { 'startPoh' : null } |
  { 'rejected' : null };
export interface Provider {
  'pohCallback' : (arg_0: PohVerificationResponsePlus) => Promise<undefined>,
  'registerPohCallbackForModclubForDev' : () => Promise<undefined>,
  'registerPohCallbackForModclubForProd' : () => Promise<undefined>,
  'registerPohCallbackForModclubForQA' : () => Promise<undefined>,
  'verifyUserHumanityForProviderForDev' : (arg_0: Principal) => Promise<
      PohVerificationResponsePlus
    >,
  'verifyUserHumanityForProviderForProd' : (arg_0: Principal) => Promise<
      PohVerificationResponsePlus
    >,
  'verifyUserHumanityForProviderForQA' : (arg_0: Principal) => Promise<
      PohVerificationResponsePlus
    >,
}
export interface _SERVICE extends Provider {}
