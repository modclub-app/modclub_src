import React, { createContext, useContext, useEffect, useState } from "react";
import { StoicIdentity } from "ic-stoic-identity";
import { authClient as authenticationClient } from "./authClient";
import { Usergeek } from "usergeek-ic-js";

import { actorController } from "./actor";
import { Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { getUserFromStorage } from "./util";
import { Profile } from "./types";
import { getUserFromCanister } from "./api";


export interface AuthContext {
  isAuthenticated: boolean;
  isAuthReady: boolean;
  hasAccount: boolean;
  identity?: Identity;
  requiresSignUp: boolean;
  logIn: (logInMethodToUse: string) => Promise<void>;
  logOut: () => void;
  user: Profile;
  setUser: (user: Profile) => void;
}

const KEY_LOCALSTORAGE_USER = "user";
let walletToUse = localStorage.getItem('_loginType') || "ii";
const DFX_NETWORK = process.env.DFX_NETWORK || "local";
const canisterId =
  process.env.DEV_ENV == "dev"
    ? process.env.MODCLUB_DEV_CANISTER_ID
    : process.env.MODCLUB_CANISTER_ID;
const whitelist = [canisterId];
const host = window.location.hostname;

if (process.env.DEV_ENV == "dev") {
  console.log("CanisterID:", canisterId);
}

// Provider hook that creates auth object and handles state
export function useProvideAuth(authClient): AuthContext {
  const [user, setUser] = useState<Profile | undefined>();
  const [isAuthenticatedLocal, setIsAuthenticatedLocal] = useState<boolean>(
    false
  );
  const [_identity, _setIdentity] = useState<Identity | undefined>();
  const [isAuthClientReady, setAuthClientReady] = useState(false);
  const [shouldSignup, setShouldSignup] = useState(false);


  // Creating the auth client is async and no auth related checks can happen
  // until it's ready so we set a state variable to keep track of it
  if (!authClient.ready) {
    authClient.create().then(() => setAuthClientReady(true));
  }

  // Use the user from local storage if it is set so the flow doesn't have to
  // make an async query.
  const setUserFromLocalStorage = () => {
    console.log("setUserFromLocalStorage");
    const lsUser = getUserFromStorage(localStorage, KEY_LOCALSTORAGE_USER);
    console.log("lsUser", lsUser);
    if (lsUser && !user && !isAuthenticatedLocal) {
      console.log('Setting User from local storage!!!!');
      setUser(lsUser);
      setIsAuthenticatedLocal(true);
      // Check to make sure your local storage user exists on the backend, and
      // log out if it doesn't (this is when you have your user stored in local
      // storage but the user was cleared from the backend)
      getUserFromCanister().then((user_) => {
        // console.log("getUserFromCanister user_", user_);
        !user_ && logOut()
      });
      return () => void 0;
    } else {
      console.log("no lsUser, fetching and setting from backend");
      // If there is no user in local storage, retrieve from the backend
      getUserFromCanister().then((user_) => {
        console.log("getUserFromCanister user_", user_);
        // If the user doesn't exist on the backend then we need to sign up
        if (user_) {
          setUser(user_);
        } else {
          setShouldSignup(true);
        }
      });
    }
  };

  // Once the auth client is initialized, get the identity and check that they
  // are authenticated, then set them to be fully logged in.
  useEffect(() => {
    if (!authClient.ready) return;
    if (walletToUse) {
      switch (walletToUse) {
        case 'ii':
          Promise.all([authClient.getIdentity(), authClient.isAuthenticated()]).then(
            ([identity, isAuthenticated]) => {
              setIsAuthenticatedLocal(isAuthenticated || false);
              _setIdentity(identity);
              if (isAuthenticated) {
                setUserFromLocalStorage();
              }
              setAuthClientReady(true);
            }
          );
          break;
        case 'plug':
          checkAndConnectToPlug();
          break;
        case 'stoic':
          checkAndConnectToStoic();
          break;
        default:
          break;
      }
    };
  }, [isAuthClientReady]);

  async function checkAndConnectToPlug() {
    if (walletToUse) {
      const connected = await window['ic'].plug.isConnected();
      let identity;
      if (connected) {
        if (!window['ic'].plug.agent) {
          await window['ic'].plug.createAgent({ whitelist, host });
          identity = await window['ic'].plug.agent._identity;
        };
        setIsAuthenticatedLocal(true);
        setWalletIdentity(identity, 'plug');
        setUserFromLocalStorage();
        setAuthClientReady(true);
      }
    }
  }

  async function checkAndConnectToStoic() {
    // following needs to change and need to use from webpack config
    if (walletToUse) {
      const stcIdentityFromLocalStrg = await StoicIdentity.load();
      if (stcIdentityFromLocalStrg) {
        setIsAuthenticatedLocal(true);
        if (!_identity) {
          setWalletIdentity(stcIdentityFromLocalStrg, 'stoic');
        }
        setUserFromLocalStorage();
      }
    }
  }

  // For testing environments only, this bypasses the authentication with an
  // identity provider for testing purposes.
  //const DFX_NETWORK = process.env.DFX_NETWORK || "local";

  // When user is set, and is not in local storage yet store the user object
  // from the canister in local storage so the user doesn't need to be fetched
  // every load. Then insure user is correctly logged in with identity service,
  // and set them to not logged in if not.
  useEffect(() => {
    // console.log({check: true, user })
    if (user && !getUserFromStorage(localStorage, KEY_LOCALSTORAGE_USER)) {
      localStorage.setItem(
        KEY_LOCALSTORAGE_USER,
        JSON.stringify({ ...user }, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );
      if (!authClient.ready) return;
      (async () => {
        const identity = await authClient.getIdentity();
        if (identity && !identity.getPrincipal().isAnonymous()) {
          _setIdentity(identity);
        }
      })();
    }
  }, [user]);

  useEffect(() => {
    if (_identity && !_identity.getPrincipal().isAnonymous()) {
      // The auth client isn't ready to make requests until it's completed the
      // async authenticate actor method.
      setAuthClientReady(false);
      actorController.authenticateActor(_identity, walletToUse, canisterId).then(() => {
        console.log("USER AUTHENTICATED");
        setAuthClientReady(true);
      });
      const principal: Principal = _identity.getPrincipal();
      Usergeek.setPrincipal(principal);
      Usergeek.trackSession()
    } else {
      console.log(" setting not authenticated");
      actorController.unauthenticateActor();
      Usergeek.setPrincipal(null);
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

      case 'ii':
        await authClient.login();
        const identity = await authClient.getIdentity();
        if (identity) {
          setWalletIdentity(identity, walletToUse);
        } else {
          console.error("Could not get identity from internet identity");
        }
        break;
      case 'plug':
        try {
          if (!window['ic']) { console.error("Can not find Plug wallet extention. Please Install on the browser"); return; }
          const result = await window['ic'].plug.requestConnect({
            whitelist,
            host
          });
          if (result) {
            if (!window['ic'].plug.agent) {
              await window['ic'].plug.createAgent({ whitelist });
            }
          }
          const identity = await window['ic'].plug.agent._identity;//.getPrincipal();
          setWalletIdentity(identity, walletToUse);
        } catch (error) {
          console.log("user declined connect request", error);
        };
        break;
      case 'stoic':
        let stcIdentity = await StoicIdentity.load();
        if (!stcIdentity) {
          stcIdentity = await StoicIdentity.connect();
        }
        setWalletIdentity(stcIdentity, walletToUse);
        break;

      default:
        console.log("default");
        break;
    }
  };

  function setWalletIdentity(identity, wallet) {
    if (identity) {
      setIsAuthenticatedLocal(true);
      _setIdentity(identity);
      localStorage.setItem('_loginType', wallet);
    };
  }

  // Clears the authClient of any cached data, and redirects user to root.
  function logOut() {
    switch (walletToUse) {
      case 'ii':
        if (!authClient.ready) return;
        authClient.logout();
        break;
      case 'plug':
        window['ic'].plug.disconnect();
        break;
      case 'stoic':
        StoicIdentity.disconnect();
        break;
      default:
        break;
    }
    setUser(undefined);
    setIsAuthenticatedLocal(false);
    localStorage.removeItem(KEY_LOCALSTORAGE_USER);
    localStorage.removeItem('_loginType');
    Usergeek.setPrincipal(null);
    console.log("User Logged Out");
  }

  return {
    isAuthenticated,
    isAuthReady: isAuthClientReady,
    hasAccount: user !== undefined,
    logIn,
    logOut,
    user,
    identity,
    setUser,
    requiresSignUp: shouldSignup,
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