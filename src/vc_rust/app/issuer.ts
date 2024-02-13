import { Actor, ActorSubclass, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

import { idlFactory as vc_issuer_idl } from "./generated/vc_issuer_idl";
import { _SERVICE } from "./generated/vc_issuer_types";

/** A class for accessing the Issuer API */
export class VcIssuer {
  protected agent = null;
  public constructor(readonly canisterId: string) {}

  getAgent = async () => {
    if (!this.agent) {
      this.agent = await this.createActor();
    }
    console.log("GET_ACTOR::ACTOR::", this.agent);
    return this.agent;
  };

  createActor = async (): Promise<ActorSubclass<_SERVICE>> => {
    const agent = new HttpAgent();

    await agent.fetchRootKey();

    const actor = Actor.createActor<_SERVICE>(vc_issuer_idl, {
      agent,
      canisterId: this.canisterId,
    });
    console.log("CREATE_ACTOR::ACTOR::", actor);
    return actor;
  };

  registerCertificationPlatform = async (
    origin: string,
    canisterId: string
  ): Promise<string> => {
    console.log(
      "registerCertificationPlatform::PARAMS::",
      origin,
      Principal.fromText(canisterId)
    );
    return (await this.getAgent()).register_certification_platform(
      origin,
      Principal.fromText(canisterId)
    );
  };

  checkCertificate = async (
    origin: string,
    userId: string
  ): Promise<string> => {
    return (await this.getAgent()).check_certificate(
      origin,
      Principal.fromText(userId)
    );
  };
}
