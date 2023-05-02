import type { Principal } from "@dfinity/principal";
import type { ActorMethod } from "@dfinity/agent";

export type ENV =
  | { qa: null }
  | { dev: null }
  | { prod: null }
  | { local: string };
export interface RSAndLevel {
  level: UserLevel;
  score: number;
}
export interface RSManager {
  getAdmins: ActorMethod<[], Result_1>;
  isUserAdmin: ActorMethod<[], boolean>;
  queryRSAndLevel: ActorMethod<[], RSAndLevel>;
  queryRSAndLevelByPrincipal: ActorMethod<[Principal], RSAndLevel>;
  registerAdmin: ActorMethod<[Principal], Result>;
  setRS: ActorMethod<[Principal, number], undefined>;
  topUsers: ActorMethod<[bigint, bigint], Array<UserAndRS>>;
  unregisterAdmin: ActorMethod<[string], Result>;
  updateRS: ActorMethod<[Principal, boolean], UserAndRS>;
  updateRSBulk: ActorMethod<[Array<UserAndVote>], Array<UserAndRS>>;
}
export type Result = { ok: null } | { err: string };
export type Result_1 = { ok: Array<Principal> } | { err: string };
export interface UserAndRS {
  userId: Principal;
  score: number;
}
export interface UserAndVote {
  votedCorrect: boolean;
  userId: Principal;
}
export type UserLevel =
  | { junior: null }
  | { novice: null }
  | { senior1: null }
  | { senior2: null }
  | { senior3: null };
export interface _SERVICE extends RSManager {}
