import {
  modclub_types,
  rs_types,
  vesting_types,
  wallet_types,
  airdrop_types,
} from "../../src/declarations_by_env";
export { modclub_types, rs_types, vesting_types, wallet_types, airdrop_types };

export interface ImageData {
  src: string;
  picUInt8Arr: Array<Number>;
  type: string;
}

export interface UserHoldings {
  stake: number;
  wallet: number;
  pendingRewards: number;
}
