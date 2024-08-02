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

export default useGetProviderSummaries;
