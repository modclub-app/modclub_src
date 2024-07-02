import { modclub, rs, vesting, wallet, airdrop, modclub_assets } from "./actors_by_env";
import { detectBrowser } from "./utils/util";
import canisterIds from "../../../canister_ids.json";

/*
 * Connect2ic provides essential utilities for IC app development
 */
import { createClient } from "@connect2icmodclub/core";
import {
  InternetIdentity,
  PlugWallet,
  StoicWallet,
} from "@connect2icmodclub/core/providers";


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

export const canistersClient = createClient({
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
    appName: "Modclub",
    customDomain:
      env !== "local" ? customDomains[process.env.DEV_ENV] : undefined,
    derivationOrigin:
      env !== "local"
        ? derivationOrigins[process.env.DEV_ENV]
        : undefined,
    // dev: false,
  },
});
