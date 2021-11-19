export * from "../../../declarations/modclub/modclub.did.d";

export interface ImageData {
  src: string;
  type: string;
}

export interface UserHoldings {
  stake: number;
  wallet: number;
  pendingRewards: number;
}
