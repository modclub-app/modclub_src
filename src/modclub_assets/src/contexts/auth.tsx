import React, { createContext, useContext, useEffect, useState } from "react";
import { Identity } from "@dfinity/agent";
import type { IDL } from "@dfinity/candid";
import * as modclub from "../../../declarations/modclub_qa";
import * as rs from "../../../declarations/rs_qa";
import * as vesting from "../../../declarations/vesting_qa";
import * as wallet from "../../../declarations/wallet_qa";
import canisterIds from '../../../../canister_ids.json';


/*
 * Connect2ic provides essential utilities for IC app development
 */
import { createClient } from "@connect2icmodclub/core";
import {
  InternetIdentity,
  PlugWallet,
  StoicWallet,
} from "@connect2icmodclub/core/providers";
import { Connect2ICProvider } from "@connect2icmodclub/react";

const env = process.env.DFX_NETWORK || "local";
const qaAssetsCanisterId = canisterIds.modclub_qa_assets.ic;
const prodAssetsCanisterId = canisterIds.modclub_assets.ic;

const derivationOrigins = {
  dev: undefined,
  qa: `https://${qaAssetsCanisterId}.icp0.io`,
  production: `https://${prodAssetsCanisterId}.icp0.io`,
};

const customDomains = {
  dev: undefined,
  qa: "https://modclub.dev",
  production: "https://modclub.app",
};

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const providers_cb = (config) => {
  const II_config = deepCopy(config);
  II_config["providerUrl"] = process.env.LOCAL_II_CANISTER;
  return [
    new InternetIdentity(II_config),
    new PlugWallet(config),
    new StoicWallet(config),
  ];
};

export function AuthProvider({ children }) {
  const client = createClient({
    canisters: {
      modclub,
      rs,
      vesting,
      wallet,
    },
    providers: providers_cb,
    globalProviderConfig: {
      host: env == "local" ? undefined : "https://icp-api.io",
      //dev: true,
      appName: "ModClub",
      customDomain:
        env !== "local" ? customDomains[process.env.DEV_ENV] : undefined,
      derivationOrigin:
        env !== "local" ? derivationOrigins[process.env.DEV_ENV] : undefined,
    },
  });
  return <Connect2ICProvider client={client}>{children}</Connect2ICProvider>;
}
