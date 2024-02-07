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

interface Profile {
  id: string;
  email?: string;
  // add other profile properties here
}

export function useProfile() {
  const queryClient = useQueryClient();
  const { decideid } = useActors();
  const { isConnected } = useConnect();

  async function fetchProfile(): Promise<Profile> {
    if (decideid) {
      const server_hello = await decideid.hello();
      const res = {
        id: "random",
        email: server_hello,
      };
      console.log(res);
      return res;
    }
    throw new Error("decideid is not ready");
  }

  async function updateProfileOnServer(newProfile: Profile): Promise<Profile> {
    // Replace with your actual update logic
    throw new Error("updateProfileOnServer function is not implemented.");
  }

  async function createProfileOnServer(newProfile: Profile): Promise<Profile> {
    throw new Error("createProfileOnServer function is not implemented.");
  }

  const {
    data: profile,
    error,
    isError,
    isLoading,
  }: UseQueryResult<Profile, Error> = useQuery("profile", fetchProfile);

  const updateProfileMutation: UseMutationResult<Profile, Error, Profile> =
    useMutation(updateProfileOnServer, {
      onSuccess: () => {
        queryClient.invalidateQueries("profile");
      },
    });

  const createProfileMutation: UseMutationResult<Profile, Error, Profile> =
    useMutation(createProfileOnServer, {
      onSuccess: () => {
        queryClient.invalidateQueries("profile");
      },
    });

  const refreshProfile = () => {
    queryClient.invalidateQueries("profile");
  };

  const clearProfile = () => {
    queryClient.setQueryData("profile", null);
  };

  useEffect(() => {
    if (isConnected && decideid) {
      refreshProfile();
    }
  }, [decideid, isConnected]);

  return {
    profile,
    isLoading,
    isError,
    error,
    updateProfile: updateProfileMutation.mutate,
    createProfile: createProfileMutation.mutate,
    refreshProfile,
    clearProfile,
  };
}
