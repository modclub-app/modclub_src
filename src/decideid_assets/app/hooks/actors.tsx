import { useEffect } from "react";
import { decideid_types, modclub_types } from "../canister_types";

import { useCanister } from "./useCanister";

export interface IActors {
  modclub: modclub_types.ModClub;
  decideid: decideid_types._SERVICE;
}

export function useActors(): IActors {
  const [modclub] = useCanister("modclub", { mode: "connected" }) as [
    modclub_types.ModClub,
    { signedIn: boolean }
  ];

  const [decideid] = useCanister("decideid", { mode: "connected" }) as [
    decideid_types.DecideID,
    { signedIn: boolean }
  ];

  if (process.env.DEV_ENV != "prod" || process.env.DEV_ENV != "production") {
    // debug only

    useEffect(() => {
      window["_actors"] = { modclub, decideid };
    }, [modclub, decideid]);
  }
  return { modclub, decideid };
}
