import { useEffect } from "react";
import {
  modclub_types,
  rs_types,
  vesting_types,
  wallet_types,
  airdrop_types,
} from "../declarations_by_env";

import { useCanister } from "./useCanister";

export interface IActors {
  modclub: modclub_types.ModClub;
  rs: rs_types.RSManager;
  vesting: vesting_types.Vesting;
  wallet: wallet_types._SERVICE;
  airdrop: airdrop_types._SERVICE;
}

export function useActors(): IActors {
  const [modclub] = useCanister("modclub", { mode: "connected" }) as [
    ModClub,
    { signedIn: boolean }
  ];
  const [rs] = useCanister("rs", { mode: "connected" }) as [
    RSManager,
    { signedIn: boolean }
  ];
  const [vesting] = useCanister("vesting", { mode: "connected" }) as [
    Vesting,
    { signedIn: boolean }
  ];
  const [wallet] = useCanister("wallet", { mode: "connected" }) as [
    Wallet,
    { signedIn: boolean }
  ];
  const [airdrop] = useCanister("airdrop", { mode: "connected" }) as [
    Airdrop,
    { signedIn: boolean }
  ];
  // console.log("MODCLUB_CANISTER_ACTOR::", modclub);
  // window["_actors"] = { modclub, rs, vesting, wallet, airdrop };
  return { modclub, rs, vesting, wallet, airdrop };
}
