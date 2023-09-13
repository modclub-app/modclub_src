// ProfileContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { modclub_types } from "../utils/types";
import { getUserFromStorage, setUserToStorage } from "../utils/util";
import logger from "../utils/logger";
import { useActors } from "../hooks/actors";
import { useConnect } from "@connect2icmodclub/react";

export interface IProfileContext {
  hasAccount: boolean;
  providers: Array<Object>;
  providerIdText: string;
  setSelectedProvider: (provider: Object) => void;
  selectedProvider: Object;

  userAlertVal: boolean;
  setUserAlertVal: (alerts: boolean) => void;

  updateProfile: (user: modclub_types.ProfileStable) => void;
}

const ProfileContext = createContext<IProfileContext>(null!);

export const KEY_LOCALSTORAGE_USER = "user";

let fetchedProviders = false;

export function useProfile() {
  return useContext(ProfileContext);
}

export function ProfileProvider({ children }) {
  const { isConnected, principal } = useConnect();
  const { modclub } = useActors();
  const [shouldSignup, setShouldSignup] = useState(false);
  const [providers, setProviders] = useState([]);
  const [providerIdText, setProviderIdText] = useState("");
  const [userAlertVal, setUserAlertVal] = useState(false);
  const [user, setUser] = useState<modclub_types.ProfileStable | undefined>();
  const [selectedProvider, setSelectedProvider] = useState<
    Object | undefined
  >();

  const updateProfile = async (user) => {
    logger.log("Updating profile provider..", user);
    // setUser(user);
    setUserToStorage(localStorage, KEY_LOCALSTORAGE_USER, user);
  };

  // Function to fetch the user profile based on the authentication state
  const fetchUserProfile = async () => {
    logger.info("User's principal: ", principal);
    if (isConnected && modclub) {
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
          try {
            const icUser: modclub_types.ProfileStable =
              await modclub.getProfile();
            if (icUser) {
              logger.log(
                "Succesfully fetched user profile from MC canister",
                icUser
              );
              updateProfile(icUser);
            } else {
              // todo: I think we should move this setShouldSignup out of this function
              setShouldSignup(true);
              logger.warn("fetchUserProfile: return empty");
            }
          } catch (error) {
            if (error.result.reject_message === "profile not found") {
              logger.warn("fetchUserProfile:", error);
              setShouldSignup(true);
            } else {
              logger.error("unknow error from fetchUserProfile:", error);
              throw error;
            }
          }
        }
      } catch (error) {
        logger.error("Error fetching user profile:", error);
      }
    }
  };

  // Call fetchUserProfile when the component mounts or when the isSignedIn state changes
  useEffect(() => {
    if (isConnected && modclub) {
      // make sure it is already signed in before fetching profile
      fetchUserProfile();
    } else {
      // if log out
      setUser(undefined);
      localStorage.removeItem(KEY_LOCALSTORAGE_USER);
      setProviders([]);
      fetchedProviders = false;
      setUserAlertVal(false);
      setSelectedProvider(undefined);
    }
  }, [isConnected, modclub]);

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
        let adminProviders = await modclub.getAdminProviderIDs();
        let providerListPromise = [];
        for (let provider of adminProviders) {
          providerListPromise.push(modclub.getProvider(provider));
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
        hasAccount: user !== undefined,
        updateProfile,
        providers,
        providerIdText,
        setUserAlertVal,
        userAlertVal,
        setSelectedProvider,
        selectedProvider,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
