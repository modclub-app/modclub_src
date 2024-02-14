import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, UseMutationResult, UseQueryResult } from 'react-query';
import { useActors } from './actors';
import { useConnect } from "@connect2icmodclub/react";
import { decideid_types} from "../canister_types";



export function useProfile() {

  const queryClient = useQueryClient();
  const { decideid } = useActors();
  const { isConnected } = useConnect();


  async function fetchProfile(): Promise<decideid_types.Profile> {
    if (decideid) {
      const result = await decideid.getAccByCaller();
      if ('err' in result) {
        throw new Error(result.err)
      } else if ('ok' in result) {
        return result.ok.profile;
      }
    } 
    throw new Error('decideid is not ready');
  }

  async function updateProfileOnServer(newProfile: decideid_types.Profile): Promise<decideid_types.Profile> {
    // Replace with your actual update logic
    throw new Error('updateProfileOnServer function is not implemented.');
  }



  const { data: profile, error, isError, isLoading }: UseQueryResult<decideid_types.Profile, Error> = useQuery('profile', fetchProfile, {
    retry: false, // Do not retry on failure
  });

  const updateProfileMutation: UseMutationResult<decideid_types.Profile, Error, decideid_types.Profile> = useMutation(updateProfileOnServer, {
    onSuccess: () => {
      queryClient.invalidateQueries('profile');
    },
  });

  async function createProfileOnServer(
    userData: { firstName: string; lastName: string; email: string }
  ): Promise<string> {
    const { firstName, lastName, email } = userData;
    try {
      const result = await decideid.registerAccount(firstName, lastName, email);
      // Process result
      if ('ok' in result) {
        const decideID: string = result.ok; // decideid
        return decideID;
      } else if ('err' in result) {
        throw new Error(result.err);
      } else {
        throw new Error('Unexpected result from registerAccount');
      }
    } catch (error) {
      console.error('Failed to create profile on server:', error);
      throw error;
    }
  }
  
  const createProfileMutation = useMutation(createProfileOnServer, {
    onMutate: async (newUserData) => {
      // Optionally, show a loading state

      queryClient.setQueryData('profile', {
        ...newUserData, // Assume the new user data will be successfully added
        message: `Hey ${newUserData.firstName} ${newUserData.lastName}, welcome to use DecideID. We are creating your profile...`,
      });
  
      return {};
    },
    onError: (err, newUserData, context) => {
      // Roll back to the previous state in case of error
      queryClient.setQueryData('profile', context.previousProfile);
    },
    onSuccess: () => {
      // Invalidate and refetch after success to make sure we have the latest data
      queryClient.invalidateQueries('profile');
    },
  });

  const refreshProfile = () => {
    queryClient.invalidateQueries('profile');
  };

  const clearProfile = () => {
    queryClient.clear();
    queryClient.setQueryData('profile', null);
  };

  useEffect(()=>{
    if (isConnected && decideid) {
      refreshProfile();
    }
  }, [decideid, isConnected])

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