// this file is a modified version of https://github.com/Connect2IC/connect2ic/blob/main/packages/react/src/hooks/useCanister.ts

import { useContext, useState } from "react";
import { useSelector } from "@xstate/react";
import { useConnect } from "@connect2icmodclub/react";
import { Connect2ICContext } from "@connect2icmodclub/react";
import type { ActorSubclass, Actor } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";

// TODO: ??
// @ts-ignore
export const useCanister: <T>(
  canisterName: string,
  options?: { mode: string }
) => readonly [
  ActorSubclass,
  { canisterDefinition: any; error: any; loading: boolean }
] = <T>(
  canisterName: string,
  options: { mode: string } = {
    mode: "auto", // "anonymous" | "connected"
  }
) => {
  const { mode } = options;
  const { client } = useContext(Connect2ICContext);

  const anonymousActorResult = useSelector(
    client._service,
    (state) => state.context.anonymousActors[canisterName]
  );
  const actorResult = useSelector(
    client._service,
    (state) => state.context.actors[canisterName]
  );
  const canisterDefinition = useSelector(
    client._service,
    (state) => state.context.canisters[canisterName]
  );
  const { isConnected } = useConnect();

  const signedIn = isConnected && actorResult && mode !== "anonymous";
  // if (canisterName == "modclub") {
  //   console.log("[DEBUG]::[MODCLUB_instance]::", signedIn);
  // }
  let result;
  if (mode === "connected") {
    // only provide signed-in actor if it is connected mode
    result = signedIn ? actorResult : null;
  } else {
    //
    result = signedIn ? actorResult : anonymousActorResult;
  }

  return [
    result && result.isOk() ? result.value : undefined,
    {
      error: result && result.isErr() ? result.error : undefined,
      loading: !result,
      canisterDefinition,
    },
  ] as const;
};
