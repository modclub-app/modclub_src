import { useEffect } from "react";
import {
  modclub_types,
  rs_types,
  vesting_types,
  wallet_types,
} from "../declarations_by_env";

import { useCanister } from "./useCanister";

export interface IActors {
  modclub: modclub_types.ModClub;
  rs: rs_types.RSManager;
  vesting: vesting_types.Vesting;
  wallet: wallet_types._SERVICE;
}

export function useActors(): IActors {
  const [modclub] = useCanister("modclub", { mode: "connected" }) as [
    ModClub,
    { signedIn: boolean }
  ];
  const [rs] = useCanister("rs") as [RSManager];
  const [vesting] = useCanister("vesting") as [Vesting];
  const [wallet] = useCanister("wallet") as [Wallet];

  return { modclub, rs, vesting, wallet };
}
