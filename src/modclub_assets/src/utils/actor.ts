import { Actor, HttpAgent, Identity } from "@dfinity/agent";
// Imports and re-exports candid interface
import { idlFactory, modclub } from "../../../declarations/modclub/index";
import { _SERVICE } from "./types";
import dfxConfig from "../../../../dfx.json";

const DFX_NETWORK = process.env.DFX_NETWORK || "local";
const isLocalEnv = DFX_NETWORK === "local";
let host_url = "ljyte-qiaaa-aaaah-qaiva-cai.ic0.app";
if (process.env.DEV_ENV == "dev") {
  host_url = "ocbvi-5yaaa-aaaah-qcopa-cai.ic0.app";
} else if (process.env.DEV_ENV == "qa") {
  host_url = "ftuce-kiaaa-aaaah-qc3fa-cai.raw.ic0.app";
}

function getHost() {
  // Setting host to undefined will default to the window location 👍🏻
  return isLocalEnv ? dfxConfig.networks.local.bind : host_url;
}

const host = getHost();

function createActor(identity?: Identity, canisterId?: any) {
  const agent = new HttpAgent({ host, identity });
  const actor = Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId: canisterId,
  });
  return { actor, agent };
}

const createPlugOrISActor = async function (walletToUse, canisterId) {
  const actor = await window['ic'][walletToUse].createActor({
    canisterId: canisterId,
    interfaceFactory: idlFactory,
  });
  return actor;
};

/*
 * Responsible for keeping track of the actor, whether the user has logged
 * in again or not. A logged in user uses a different actor with their
 * Identity, to ensure their Principal is passed to the backend.
 */
class ActorController {
  _actor: Promise<_SERVICE>;
  _isAuthenticated: boolean = false;

  constructor() {
    this._actor = this.initBaseActor();
  }

  async initBaseActor(
    identity?: Identity,
    authenticatorToUse?: String,
    canisterId?: String
  ) {
    //Probably should use the same method because once the identity is passed the actor is going to get created using
    //the identity so should not be using different method for plug
    switch (authenticatorToUse) {
      case "ii":
        const { agent, actor } = createActor(identity, canisterId);
        // The root key only has to be fetched for local development environments
        if (isLocalEnv) {
          await agent.fetchRootKey();
        }
        console.log("ACTOR", actor);
        return actor;
      case "infinityWallet":
      case "plug":
        const plugIWActor = createPlugOrISActor(authenticatorToUse, canisterId);
        return plugIWActor;
      case "stoic":
        const stoicActorAgent = createActor(identity, canisterId);
        return stoicActorAgent.actor;
      default:
        break;
    }
  }

  /*
   * Get the actor instance to run commands on the canister.
   */
  get actor() {
    // console.log("Fetching Actor");
    return this._actor;
  }

  /*
   * Once a user has authenticated and has an identity pass this identity
   * to create a new actor with it, so they pass their Principal to the backend.
   */
  async authenticateActor(
    identity: Identity,
    authenticatorToUse: String,
    canisterId: String
  ) {
    this._actor = this.initBaseActor(identity, authenticatorToUse, canisterId);
    this._isAuthenticated = true;
  }

  /*
   * If a user unauthenticates, recreate the actor without an identity.
   */
  unauthenticateActor() {
    this._actor = this.initBaseActor();
    this._isAuthenticated = false;
  }
}

export const actorController = new ActorController();
