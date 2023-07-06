import type { Principal } from "@dfinity/principal";
import type { ActorMethod } from "@dfinity/agent";

export interface ChallengeResponse {
  status: PohChallengeStatus;
  completedAt: [] | [bigint];
  submittedAt: [] | [bigint];
  challengeId: string;
  requestedAt: [] | [bigint];
}
export type PohChallengeStatus =
  | { notSubmitted: null }
  | { verified: null }
  | { expired: null }
  | { pending: null }
  | { rejected: null };
export interface PohVerificationResponsePlus {
  status: PohVerificationStatus;
  completedAt: [] | [bigint];
  token: [] | [string];
  rejectionReasons: Array<string>;
  submittedAt: [] | [bigint];
  isFirstAssociation: boolean;
  providerId: Principal;
  challenges: Array<ChallengeResponse>;
  requestedAt: [] | [bigint];
  providerUserId: string;
}
export type PohVerificationStatus =
  | { notSubmitted: null }
  | { verified: null }
  | { expired: null }
  | { pending: null }
  | { startPoh: null }
  | { rejected: null };
export interface Provider {
  pohCallback: ActorMethod<[PohVerificationResponsePlus], undefined>;
  registerPohCallbackForModclubForDev: ActorMethod<[], undefined>;
  registerPohCallbackForModclubForProd: ActorMethod<[], undefined>;
  registerPohCallbackForModclubForQA: ActorMethod<[], undefined>;
  verifyUserHumanityForProviderForDev: ActorMethod<
    [Principal],
    PohVerificationResponsePlus
  >;
  verifyUserHumanityForProviderForProd: ActorMethod<
    [Principal],
    PohVerificationResponsePlus
  >;
  verifyUserHumanityForProviderForQA: ActorMethod<
    [Principal],
    PohVerificationResponsePlus
  >;
}
export interface _SERVICE extends Provider {}
