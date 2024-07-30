import { useEffect, useState } from "react";
import { useAppState } from "../../../../app/state_mgmt/context/state";
import { useActors } from "../../../../../hooks/actors";

type ProviderSummariesTypes = {
  totalApproved: bigint;
  totalCost: bigint;
  totalRejected: bigint;
};

const useGetProviderSummaries = () => {
  const appState = useAppState();
  const { modclub } = useActors();
  const [providerSummaries, setProviderSummaries] =
    useState<ProviderSummariesTypes | null>();

  const getProviderSummaries = async () => {
    try {
      const providerSummariesData = await modclub.getProviderSummaries(
        appState.selectedProvider.id
      );
      if (providerSummariesData.ok) {
        setProviderSummaries({ ...providerSummariesData.ok });
      }
    } catch (e) {
      console.log("Error in getProviderSummaries function:: ", e);
    }
  };

  useEffect(() => {
    if (appState.selectedProvider) {
      getProviderSummaries();
    }
  }, [appState.selectedProvider]);

  return { providerSummaries };
};

const useGetProviderPendingSummaries = () => {
  const appState = useAppState();
  const { modclub } = useActors();
  const [providerSummaries, setProviderSummaries] =
    useState<ProviderSummariesTypes | null>();

  const getProviderPendingSummaries = async () => {
    try {
      const providerPendingSummaries = await modclub.getProviderPendingSummaries(
        appState.selectedProvider.id
      );
      if (providerPendingSummaries.ok) {
        setProviderSummaries({ ...providerPendingSummaries.ok });
      }
    } catch (e) {
      console.log("Error in getProviderSummaries function:: ", e);
    }
  };

  useEffect(() => {
    if (appState.selectedProvider) {
      getProviderPendingSummaries();
    }
  }, [appState.selectedProvider]);

  return { getProviderPendingSummaries };
};

export default useGetProviderSummaries;
