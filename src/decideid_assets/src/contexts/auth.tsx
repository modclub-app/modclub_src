import React, { createContext, useContext, useEffect, useState } from "react";
import { modclub_actor, decidedid_actor } from "../actors_by_env";
import canisterIds from "../../../../canister_ids.json";
import { detectBrowser } from "../utils/util";

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
  qa: "https://decideid.dev",
  production: "https://decideid.app",
};

// @ts-ignore
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// @ts-ignore
const providers_cb = (config) => {
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
    const _canisters = {
      modclub: modclub_actor,
      decideid: decidedid_actor,
    };
    const initializeClient = () => {
      const newClient = createClient({
        canisters: _canisters,
        providers: providers_cb,
        globalProviderConfig: {
          host: env === "local" ? undefined : "https://icp-api.io",
          //dev: true,
          appName: "DecideID",
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
