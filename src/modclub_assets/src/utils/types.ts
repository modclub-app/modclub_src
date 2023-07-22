function getModTypesByEnv() {
  if (process.env.DEV_ENV == "qa") {
    export * from "../../../declarations/modclub_qa/modclub_qa.did.d";
  } else if (process.env.DEV_ENV == "dev") {
    export * from "../../../declarations/modclub_dev/modclub_dev.did.d";
  } else {
    export * from "../../../declarations/modclub/modclub.did.d";
  }
}

getModTypesByEnv();

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
