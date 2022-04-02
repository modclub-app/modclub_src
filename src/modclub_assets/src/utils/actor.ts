import { Actor, HttpAgent, Identity } from "@dfinity/agent";
// Imports and re-exports candid interface
import { idlFactory, modclub } from "../../../declarations/modclub/index";
export { idlFactory, modclub } from "../../../declarations/modclub/index";
import { _SERVICE } from "./types";
// CANISTER_ID is replaced by webpack based on node environment
export const canisterId =
  process.env.DEV_ENV == "dev"
    ? process.env.MODCLUB_DEV_CANISTER_ID
    : process.env.MODCLUB_CANISTER_ID;

console.log("Canister ID:", canisterId);
import dfxConfig from "../../../../dfx.json";

const DFX_NETWORK = process.env.DFX_NETWORK || "local";
const isLocalEnv = DFX_NETWORK === "local";

function getHost() {
  // Setting host to undefined will default to the window location 👍🏻
  return isLocalEnv ? dfxConfig.networks.local.bind : undefined;
}

const host = getHost();

function createActor(identity?: Identity) {
  const agent = new HttpAgent({ host, identity });
  const actor = Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId: canisterId,
  });
  return { actor, agent };
}

const createPlugActor = async function (identity) {

  //if (isLocalEnv) {
  const agent = new HttpAgent({ host, identity });
  const actor = Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId: canisterId,
  });
  return actor;
  /* } else {
    const actor = await window["ic"].plug.createActor({
      canisterId: canisterId,
      interfaceFactory: idlFactory,
    });
    return actor;
  } */
}

function createStoicActor(identity?: Identity) {
  const agent = new HttpAgent({ identity });
  console.log("STOIC AGENT", agent);
  console.log("STOIC AGENT", agent['_host']);
  const actor = Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId: canisterId,
  });
  return actor;
}
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

  async initBaseActor(identity?: Identity, authenticatorToUse?: String) {
    //Probably should use the same method because once the identity is passed the actor is going to get created using
    //the identity so should not be using different method for plug
    switch (authenticatorToUse) {
      case 'ii':
        const { agent, actor } = createActor(identity);
        // The root key only has to be fetched for local development environments
        if (isLocalEnv) {
          await agent.fetchRootKey();
        }
        return actor;
      case 'plug':
        const plugActor = createPlugActor(identity);
        return plugActor;
      case 'stoic':
        const stoicActor = createStoicActor(identity);
        return stoicActor;
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
  async authenticateActor(identity: Identity, authenticatorToUse: String) {
    this._actor = this.initBaseActor(identity, authenticatorToUse);
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
