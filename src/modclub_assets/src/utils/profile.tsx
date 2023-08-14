// ProfileContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth";
import { modclub_types } from "./types";
import { getUserFromStorage, setUserToStorage } from "./util";
import logger from "../utils/logger";

import {
  getUserFromCanister,
  checkUserRole,
  getAdminProviderIDs,
  getProvider,
} from "./api";

export interface IProfileContext {
  requiresSignUp: boolean;
  user: modclub_types.ProfileStable;
  hasAccount: boolean;
  isAdminUser: boolean;

  providers: Array<Object>;
  providerIdText: string;
  setSelectedProvider: (provider: Object) => void;
  selectedProvider: Object;

  userAlertVal: boolean;
  setUserAlertVal: (alerts: boolean) => void;

  updateProfile: (user: ProfileStable) => void;

  isProfileReady: boolean;
}

const ProfileContext = createContext<IProfileContext>(null!);

export const KEY_LOCALSTORAGE_USER = "user";

let fetchedProviders = false;

export function useProfile() {
  return useContext(ProfileContext);
}

export function ProfileProvider({ children }) {
  const { isAuthenticated, isActorReady } = useAuth();
  const [shouldSignup, setShouldSignup] = useState(false);
  const [providers, setProviders] = useState([]);
  const [isAdminUser, setAdminUser] = useState(false);
  const [providerIdText, setProviderIdText] = useState("");
  const [userAlertVal, setUserAlertVal] = useState(false);
  const [user, setUser] = useState<modclub_types.ProfileStable | undefined>();
  const [isProfileReady, setIsProfileReady] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<
    Object | undefined
  >();

  const updateProfile = async (user) => {
    logger.log("Updating profile provider..", user);
    setUser(user);
    const checkAdmin = await checkUserRole(user.id);
    setAdminUser(checkAdmin);

    setUserToStorage(localStorage, KEY_LOCALSTORAGE_USER, user);
  };

  // Function to fetch the user profile based on the authentication state
  const fetchUserProfile = async () => {
    if (isAuthenticated) {
      try {
        const lsUser = getUserFromStorage(localStorage, KEY_LOCALSTORAGE_USER);
        if (lsUser && !user) {
          // if local user
          setUser(lsUser);
          logger.log(
            "Succesfully fetched user profile from local storage",
            lsUser
          );
        } else {
          const icUser = await getUserFromCanister(); // getRemoteUser
          logger.log(
            "Succesfully fetched user profile from MC canister",
            icUser
          );

          if (icUser) {
            await updateProfile(icUser);
          } else {
            // todo: I think we should move this setShouldSignup out of this function
            setShouldSignup(true);
          }
        }
      } catch (error) {
        logger.error("Error fetching user profile:", error);
      }
      setIsProfileReady(true);
    }
  };

  // Call fetchUserProfile when the component mounts or when the isSignedIn state changes
  useEffect(() => {
    if (isAuthenticated && isActorReady) {
      fetchUserProfile();
    } else {
      // if log out
      setUser(undefined);
      setAdminUser(false);
      setProviders([]);
      fetchedProviders = false;
      setUserAlertVal(false);
      setSelectedProvider(undefined);
    }
  }, [isAuthenticated, isActorReady]);

  // For testing environments only, this bypasses the authentication with an
  // identity provider for testing purposes.
  //const DFX_NETWORK = process.env.DFX_NETWORK || "local";

  // When user is set, and is not in local storage yet store the user object
  // from the canister in local storage so the user doesn't need to be fetched
  // every load. Then insure user is correctly logged in with identity service,
  // and set them to not logged in if not.
  useEffect(() => {
    if (user && !fetchedProviders) {
      let adminInitProperties = async () => {
        fetchedProviders = true;
        let adminProviders = await getAdminProviderIDs();
        let providerListPromise = [];
        for (let provider of adminProviders) {
          providerListPromise.push(await getProvider(provider));
        }
        let providerListPrm = await Promise.all(providerListPromise);
        let providerList = providerListPrm.filter((provider) => provider);
        setProviders(providerList);
        if (adminProviders.length > 0) {
          setProviderIdText(adminProviders[0].toText());
        }
      };
      adminInitProperties();
    }
  }, [user]);

  return (
    <ProfileContext.Provider
      value={{
        requiresSignUp: shouldSignup,
        user,
        hasAccount: user !== undefined,
        isAdminUser,
        updateProfile,
        providers,
        providerIdText,
        setUserAlertVal,
        userAlertVal,
        setSelectedProvider,
        selectedProvider,
        isProfileReady,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
