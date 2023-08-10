import React, { createContext, useContext, useEffect, useState } from "react";
import { StoicIdentity } from "ic-stoic-identity";
import { authClient as authenticationClient } from "./authClient";
import { Usergeek } from "usergeek-ic-js";

import { actorController } from "./actor";
import { HttpAgent, Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { getEnvironmentSpecificValues } from "./api";
import logger from "../utils/logger";
import { KEY_LOCALSTORAGE_USER } from "./profile";
export interface AuthContext {
  isAuthenticated: boolean; // if connected to identity provider, will be replaced by Connect2IC.isconnected
  isAuthReady: boolean; // deprecated
  identity?: Identity;
  userPrincipalText: string;
  isActorReady: boolean; // indicate if canister apis are ready to use
  logIn: (logInMethodToUse: string) => Promise<void>;
  logOut: () => void;
}

let walletToUse = localStorage.getItem("_loginType") || "ii";
const DFX_NETWORK = process.env.DFX_NETWORK || "local";

const { CanisterId } = getEnvironmentSpecificValues(process.env.DEV_ENV);
const whitelist = [CanisterId];
const host = window.location.origin;

// Safe hook to not connect multiple times using plugin
let checkAndConnectToPlugOrIWCounter = 0;
let checkAndConnectStoicCounter = 0;

// Provider hook that creates auth object and handles state
export function useProvideAuth(authClient): AuthContext {
  const [isAuthenticatedLocal, setIsAuthenticatedLocal] =
    useState<boolean>(false);
  const [_identity, _setIdentity] = useState<Identity | undefined>();
  const [isAuthClientReady, setAuthClientReady] = useState(false);
  const [userPrincipalText, setUserPrincipalText] = useState<string>("");
  const [isActorReady, setIsActorReady] = useState(false);
  // Creating the auth client is async and no auth related checks can happen
  // until it's ready so we set a state variable to keep track of it
  if (!authClient.ready) {
    authClient.create().then(() => setAuthClientReady(true));
  }

  // Once the auth client is initialized, get the identity and check that they
  // are authenticated, then set them to be fully logged in.
  useEffect(() => {
    if (!authClient.ready) return;
    if (walletToUse) {
      switch (walletToUse) {
        case "ii":
          Promise.all([
            authClient.getIdentity(),
            authClient.isAuthenticated(),
          ]).then(([identity, isAuthenticated]) => {
            setIsAuthenticatedLocal(isAuthenticated || false);
            _setIdentity(identity);
            setAuthClientReady(true);
          });
          break;
        case "infinityWallet":
        case "plug":
          if (checkAndConnectToPlugOrIWCounter == 0)
            checkAndConnectToPlugOrIW(walletToUse);
          break;
        case "stoic":
          if (checkAndConnectStoicCounter == 0) checkAndConnectToStoic();
          break;
        default:
          break;
      }
      logger.info(
        `IdentityProvider(${walletToUse}) isAuthenticated/identity set`
      );
    }
  }, [isAuthClientReady]);

  async function checkAndConnectToPlugOrIW(walletToUse) {
    checkAndConnectToPlugOrIWCounter++;
    if (walletToUse) {
      if (!window["ic"][walletToUse].agent) {
        if (walletToUse == "plug") {
          await window["ic"][walletToUse].createAgent({ whitelist, host });
        } else {
          await window["ic"][walletToUse].requestConnect({
            whitelist,
          });
        }
        const pID = await window["ic"][walletToUse]["agent"].getPrincipal();
        const identity = {
          type: walletToUse,
          getPrincipal: () => pID,
        };
        setIsAuthenticatedLocal(true);
        setWalletIdentity(identity, walletToUse);
        setAuthClientReady(true);
      } else {
        if (walletToUse == "infinityWallet") {
          logOut();
          logIn(walletToUse);
        }
      }
    }
  }

  async function checkAndConnectToStoic() {
    //Counter is to prevent multiple calls to stoic and then subsequent calls on useEffect.
    checkAndConnectStoicCounter++;
    // following needs to change and need to use from webpack config
    if (walletToUse) {
      const stcIdentityFromLocalStrg = await StoicIdentity.load();
      if (stcIdentityFromLocalStrg) {
        setIsAuthenticatedLocal(true);
        if (!_identity) {
          setWalletIdentity(stcIdentityFromLocalStrg, "stoic");
        }
      }
    }
  }

  useEffect(() => {
    if (_identity && !_identity.getPrincipal().isAnonymous()) {
      // The auth client isn't ready to make requests until it's completed the
      // async authenticate actor method.
      setAuthClientReady(false);
      actorController
        .authenticateActor(_identity, walletToUse, CanisterId)
        .then(() => {
          logger.log("USER AUTHENTICATED");
          setAuthClientReady(true);
          setIsActorReady(true);
        });
      const principal: Principal = _identity.getPrincipal();
      Usergeek.setPrincipal(principal);
      setUserPrincipalText(principal.toText());
      logger.log("Principal text:", principal.toText());
      Usergeek.trackSession();
    } else {
      logger.log("Setting not authenticated");
      actorController.unauthenticateActor();
      Usergeek.setPrincipal(null);
      setUserPrincipalText("");
    }
  }, [_identity]);

  // Just creating variables here so that it's pretty below
  const identity = _identity;
  const isAuthenticated = isAuthenticatedLocal;

  // Login to the identity provider by sending user to Internet Identity
  // and logging them in.
  const logIn = async function (logInMethodToUse): Promise<void> {
    walletToUse = logInMethodToUse;
    if (!authClient) return;
    switch (logInMethodToUse) {
      case "ii":
        await authClient.login();
        const identity = await authClient.getIdentity();
        if (identity) {
          setWalletIdentity(identity, walletToUse);
        } else {
          console.error("Could not get identity from internet identity");
        }
        break;
      case "infinityWallet":
      case "plug":
        try {
          if (walletToUse) {
            let result;
            const agent = new HttpAgent({ host });
            await agent.fetchRootKey();
            result = await window["ic"][walletToUse].requestConnect({
              whitelist,
            });

            if (result) {
              const p = await window["ic"][walletToUse]["agent"].getPrincipal();
              const identity = {
                type: "is",
                getPrincipal: () => p,
              };
              setWalletIdentity(identity, walletToUse);
            } else {
              throw new Error("Failed to connect to your wallet");
            }
          }
        } catch (error) {
          logger.log("user declined connect request", error);
        }
        break;
      case "stoic":
        let stcIdentity = await StoicIdentity.load();
        if (!stcIdentity) {
          stcIdentity = await StoicIdentity.connect();
        }
        setWalletIdentity(stcIdentity, walletToUse);
        break;

      default:
        break;
    }
  };

  function setWalletIdentity(identity, wallet) {
    if (identity) {
      setIsAuthenticatedLocal(true);
      _setIdentity(identity);
      localStorage.setItem("_loginType", wallet);
    }
  }

  // Clears the authClient of any cached data, and redirects user to root.
  function logOut() {
    setUserPrincipalText("");
    setIsAuthenticatedLocal(false);
    setIsActorReady(false);
    Usergeek.setPrincipal(null);
    localStorage.removeItem("_loginType");
    localStorage.removeItem(KEY_LOCALSTORAGE_USER);
    checkAndConnectToPlugOrIWCounter = 0;
    checkAndConnectStoicCounter = 0;
    switch (walletToUse) {
      case "ii":
        if (!authClient.ready) return;
        authClient.logout();
        break;
      case "infinityWallet":
      case "plug":
        window["ic"].plug.disconnect();
        break;
      case "stoic":
        StoicIdentity.disconnect();
        break;
      default:
        break;
    }
    logger.log("User Logged Out");
  }

  return {
    isAuthenticated,
    isAuthReady: isAuthClientReady,
    logIn,
    logOut,
    identity,
    userPrincipalText,
    isActorReady,
  };
}

const authContext = createContext<AuthContext>(null!);

export function ProvideAuth({ children }) {
  const auth = useProvideAuth(authenticationClient);
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export const useAuth = () => {
  return useContext(authContext);
};
