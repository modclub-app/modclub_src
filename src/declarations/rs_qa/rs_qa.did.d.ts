import type { Principal } from "@dfinity/principal";
import type { ActorMethod } from "@dfinity/agent";

export type ConsumerPayload = { admins: Array<Principal> };
export type Decision = { approved: null } | { rejected: null };
export type ENV =
  | { qa: null }
  | { dev: null }
  | { prod: null }
  | {
      local: {
        wallet_canister_id: Principal;
        modclub_canister_id: Principal;
        rs_canister_id: Principal;
        auth_canister_id: Principal;
      };
    };
export interface RSAndLevel {
  level: UserLevel;
  score: bigint;
}
export interface RSManager {
  handleSubscription: ActorMethod<[ConsumerPayload], undefined>;
  queryRSAndLevel: ActorMethod<[], RSAndLevel>;
  queryRSAndLevelByPrincipal: ActorMethod<[Principal], RSAndLevel>;
  setRS: ActorMethod<[Principal, bigint], undefined>;
  showAdmins: ActorMethod<[], Array<Principal>>;
  topUsers: ActorMethod<[bigint, bigint], Array<UserAndRS>>;
  updateRS: ActorMethod<[Principal, boolean, Decision], UserAndRS>;
  updateRSBulk: ActorMethod<[Array<UserAndVote>], Array<UserAndRS>>;
}
export interface UserAndRS {
  userId: Principal;
  score: bigint;
}
export interface UserAndVote {
  votedCorrect: boolean;
  decision: Decision;
  userId: Principal;
}
export type UserLevel =
  | { junior: null }
  | { novice: null }
  | { senior1: null }
  | { senior2: null }
  | { senior3: null };
export interface _SERVICE extends RSManager {}
