import { useEffect } from "react";
import {
  modclub_types,
  wallet_types,
} from "../canister_types";

import { useCanister } from "./useCanister";

export interface IActors {
  modclub: modclub_types.ModClub;
  wallet: wallet_types._SERVICE;
}

export function useActors(): IActors {
  const [modclub] = useCanister("modclub", { mode: "connected" }) as [
    ModClub,
    { signedIn: boolean }
  ];
  const [wallet] = useCanister("wallet", { mode: "connected" }) as [
    Wallet,
    { signedIn: boolean }
  ];

  if (process.env.DEV_ENV == 'qa' || process.env.DEV_ENV == 'dev') {
    // debug only
    window["_actors"] = { modclub, wallet };
  }
  return { modclub, wallet };
}
