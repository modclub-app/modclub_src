import React, { createContext, useContext, useEffect, useState } from "react";
import { Identity } from "@dfinity/agent";
import type { IDL } from "@dfinity/candid";
import { modclub, rs, vesting, wallet, airdrop, modclub_assets } from "../actors_by_env";
import canisterIds from "../../../../canister_ids.json";
import { detectBrowser } from "../utils/util";
import { defaultProviders } from "@connect2icmodclub/core/providers";

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
  console.log("[DEBUG]::[PROVIDERS_CB_CONFIG]::", config);
  const II_config = deepCopy(config);
  const browser = detectBrowser();
  if (browser === "Safari") {
    II_config["providerUrl"] = process.env.LOCAL_II_CANISTER_SAFARI;
  } else {
    II_config["providerUrl"] = process.env.LOCAL_II_CANISTER;
  }

  II_config["ii_auth_config"] = {
    idleOptions: {
      disableIdle: true,
      disableDefaultIdleCallback: true,
    },
  };
  return [
    new InternetIdentity(II_config),
    new PlugWallet(config),
    new StoicWallet(config),
  ];
};

export function AuthProvider({ children }) {
  const [client, setClient] = useState(null);

  useEffect(() => {
    // This function will be called only once when the component mounts
    const initializeClient = () => {
      const newClient = createClient({
        canisters: {
          modclub,
          modclub_assets,
          rs,
          vesting,
          wallet,
          airdrop,
        },
        providers: providers_cb,
        globalProviderConfig: {
          host: env === "local" ? undefined : "https://icp-api.io",
          //dev: true,
          appName: "Modclub",
          customDomain:
            env !== "local" ? customDomains[process.env.DEV_ENV] : undefined,
          derivationOrigin:
            env !== "local"
              ? derivationOrigins[process.env.DEV_ENV]
              : undefined,
        },
      });

      setClient(newClient);
    };

    initializeClient();
  }, []);

  if (!client) {
    return null; // or <LoadingSpinner />;
  }

  return <Connect2ICProvider client={client}>{children}</Connect2ICProvider>;
}
