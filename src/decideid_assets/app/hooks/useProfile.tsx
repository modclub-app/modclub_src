import React, { useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationResult,
  UseQueryResult,
} from "react-query";
import { useActors } from "./actors";
import { useConnect } from "@connect2icmodclub/react";
import { decideid_types } from "../canister_types";

export function useProfile() {
  const queryClient = useQueryClient();
  const { decideid } = useActors();
  const { isConnected } = useConnect();

  async function fetchProfile(): Promise<decideid_types.Profile> {
    if (decideid) {
      const result = await decideid.getAccByCaller();
      if ("err" in result) {
        throw new Error(result.err);
      } else if ("ok" in result) {
        return result.ok.profile;
      }
    }
    throw new Error("decideid is not ready");
  }

  async function updateProfileOnServer(
    newProfile: decideid_types.Profile
  ): Promise<decideid_types.Profile> {
    // Replace with your actual update logic
    throw new Error("updateProfileOnServer function is not implemented.");
  }

  const {
    data: profile,
    error,
    isError,
    isLoading,
    isSuccess,
  }: UseQueryResult<decideid_types.Profile, Error> = useQuery(
    "profile",
    fetchProfile,
    {
      retry: false, // Do not retry on failure
    }
  );

  const updateProfileMutation: UseMutationResult<
    decideid_types.Profile,
    Error,
    decideid_types.Profile
  > = useMutation(updateProfileOnServer, {
    onSuccess: () => {
      queryClient.invalidateQueries("profile");
    },
  });

  async function createProfileOnServer(userData: {
    firstName: string;
    lastName: string;
    email: string;
  }): Promise<string> {
    const { firstName, lastName, email } = userData;
    try {
      const result = await decideid.registerAccount(firstName, lastName, email);
      // Process result
      if ("ok" in result) {
        const decideID: string = result.ok; // decideid
        return decideID;
      } else if ("err" in result) {
        throw new Error(result.err);
      } else {
        throw new Error("Unexpected result from registerAccount");
      }
    } catch (error) {
      console.error("Failed to create profile on server:", error);
      throw error;
    }
  }

  // TODO: should consider optimistic mutations
  const createProfileMutation = useMutation(createProfileOnServer, {
    onSuccess: () => {
      queryClient.invalidateQueries("profile");
    },
  });

  const refreshProfile = () => {
    queryClient.invalidateQueries("profile");
  };

  const clearProfile = () => {
    queryClient.clear();
    queryClient.setQueryData("profile", null);
  };

  useEffect(() => {
    if (isConnected && decideid) {
      refreshProfile();
    }
  }, [decideid, isConnected]);

  return {
    profile,
    // If there's no cached data and no query attempt was finished yet.
    isLoading,
    // If the query has received a response with no errors and is ready to display its data.
    isSuccess,
    // If the query attempt resulted in an error.
    // The corresponding error property has the error received from the attempted fetch
    isError,
    error,
    updateProfile: updateProfileMutation.mutate,
    createProfile: createProfileMutation.mutate,
    refreshProfile,
    clearProfile,
  };
}
