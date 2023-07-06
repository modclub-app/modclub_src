import type { Principal } from "@dfinity/principal";
import type { ActorMethod } from "@dfinity/agent";

export type AdminsList = [] | [[Principal, List]];
export type ConsumerPayload = { admins: Array<Principal> };
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
export type List = [] | [[Principal, List]];
export interface ModclubAuth {
  getAdmins: ActorMethod<[], Result_2>;
  getSubscriptions: ActorMethod<[], Result_1>;
  isAdmin: ActorMethod<[Principal], boolean>;
  registerAdmin: ActorMethod<[Principal], Result>;
  subscribe: ActorMethod<[string], undefined>;
  unregisterAdmin: ActorMethod<[string], Result>;
}
export type Result = { ok: AdminsList } | { err: string };
export type Result_1 = { ok: Array<Subscriber> } | { err: string };
export type Result_2 = { ok: Array<Principal> } | { err: string };
export interface Subscriber {
  topic: string;
  _actor: SubscriberCanisterType;
  consumer: Principal;
}
export interface SubscriberCanisterType {
  handleSubscription: ActorMethod<[ConsumerPayload], undefined>;
}
export interface _SERVICE extends ModclubAuth {}
