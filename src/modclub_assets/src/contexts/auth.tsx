import React, { createContext, useContext, useEffect, useState } from "react";
import { Identity } from "@dfinity/agent";
import type { IDL } from "@dfinity/candid";
import * as modclub from "../../../declarations/modclub_qa";
import * as rs from "../../../declarations/rs_qa";
import * as vesting from "../../../declarations/vesting_qa";
import * as wallet from "../../../declarations/wallet_qa";

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

let env = process.env.DFX_NETWORK || "local";

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
      customDomain: "https://modclub.dev",
      derivationOrigin:
        env == "local"
          ? undefined
          : "https://h433y-uqaaa-aaaah-qdbja-cai.icp0.io",
    },
  });
  return <Connect2ICProvider client={client}>{children}</Connect2ICProvider>;
}
