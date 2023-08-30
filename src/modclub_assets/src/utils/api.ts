import { InternetIdentity, StoicWallet } from "@connect2icmodclub/core/providers";
import { encodeArrayBuffer } from "./util";
import { Principal } from "@dfinity/principal";
import { canisterId as ModCanisterId } from "../../../declarations/modclub/index";
import { canisterId as ModDevCanisterId } from "../../../declarations/modclub_dev/index";
import { canisterId as ModQACanisterId } from "../../../declarations/modclub_qa/index";
import {
  canisterId as RSCanisterID,
  createActor as RSCreateActor,
  idlFactory as RSIdl,
} from "../../../declarations/rs";
import {
  canisterId as RSQACanisterID,
  createActor as RSQACreateActor,
  idlFactory as RSQAIdl,
} from "../../../declarations/rs_qa";
import {
  canisterId as RSDEVCanisterID,
  createActor as RSDEVCreateActor,
  idlFactory as RSDEVIdl,
} from "../../../declarations/rs_dev";
import {
  canisterId as WalletCanisterID,
  createActor as WalletCreateActor,
  idlFactory as WalletIdl,
} from "../../../declarations/wallet/index";
import {
  canisterId as WalletQACanisterID,
  createActor as WalletQACreateActor,
  idlFactory as WalletQAIdl,
} from "../../../declarations/wallet_qa";
import {
  canisterId as VestingCanisterID,
  createActor as VestingCreateActor,
  idlFactory as VestingIdl,
} from "../../../declarations/vesting";
import {
  canisterId as VestingQACanisterID,
  createActor as VestingQACreateActor,
  idlFactory as VestingQAIdl,
} from "../../../declarations/vesting_qa";
import {
  canisterId as VestingDEVCanisterID,
  createActor as VestingDEVCreateActor,
  idlFactory as VestingDEVIdl,
} from "../../../declarations/vesting_dev";
import {
  canisterId as WalletDEVCanisterID,
  createActor as WalletDEVCreateActor,
  idlFactory as WalletDEVIdl,
} from "../../../declarations/wallet_dev";

import { modclub_types, wallet_types } from "../../src/declarations_by_env";

export type Optional<Type> = [Type] | [];

export function getEnvironmentSpecificValues(env: string) {
  switch (env) {
    case "dev":
      return {
        CanisterId: ModDevCanisterId,
        walletCanisterId: WalletDEVCanisterID,
        walletIDL: WalletDEVIdl,
        walletActor: WalletDEVCreateActor,
        vestingCanisterID: VestingDEVCanisterID,
        vestingIDL: VestingDEVIdl,
        vestingActor: VestingDEVCreateActor,
        rsCanisterID: RSDEVCanisterID,
        rsIDL: RSDEVIdl,
        rsActor: RSDEVCreateActor,
      };
    case "qa":
      return {
        CanisterId: ModQACanisterId,
        walletCanisterId: WalletQACanisterID,
        walletIDL: WalletQAIdl,
        walletActor: WalletQACreateActor,
        vestingCanisterID: VestingQACanisterID,
        vestingIDL: VestingQAIdl,
        vestingActor: VestingQACreateActor,
        rsCanisterID: RSQACanisterID,
        rsIDL: RSQAIdl,
        rsActor: RSQACreateActor,
      };
    default:
      return {
        CanisterId: ModCanisterId,
        walletCanisterId: WalletCanisterID,
        walletIDL: WalletIdl,
        walletActor: WalletCreateActor,
        vestingCanisterID: VestingCanisterID,
        vestingIDL: VestingIdl,
        vestingActor: VestingCreateActor,
        rsCanisterID: RSCanisterID,
        rsIDL: RSIdl,
        rsActor: RSCreateActor,
      };
  }
}

async function trace_error(_trace: any) {
  try {
    return Promise.resolve(_trace());
  } catch (e) {
    console.error(e);
    return Promise.reject(e);
  }
}

export async function getAccAssocMetadata(
  modclub: modclub_types.ModClub
): Promise<String> {
  try {
    const data = await modclub.generateAssocMetadata();
    return data;
  } catch (e) {
    console.log("ERROR in generateAssocMetadata", e);
    return Promise.reject(e);
  }
}

export async function addProviderAdmin(
  modclub: modclub_types.ModClub,
  userId,
  principalId,
  userName
): Promise<boolean> {
  try {
    let result = await modclub.addProviderAdmin(userId, userName, [
      principalId,
    ]);
    return result.hasOwnProperty("ok") ? true : false;
  } catch (e) {
    console.error("error", e);
    return false;
  }
}

export async function removeProviderAdmin(
  modclub: modclub_types.ModClub,
  userId,
  principalId
): Promise<boolean> {
  try {
    let result = await modclub.removeProviderAdmin(principalId, userId);
    return result.hasOwnProperty("ok") ? true : false;
  } catch (e) {
    console.error("error", e);
    return false;
  }
}

export async function editProviderAdmin(
  modclub: modclub_types.ModClub,
  userId,
  principalId,
  userName
): Promise<boolean> {
  try {
    let result = modclub.editProviderAdmin(principalId, userId, userName);
    return result.hasOwnProperty("ok") ? true : false;
  } catch (e) {
    console.error("error", e);
    return false;
  }
}

export async function getModeratorLeaderboard(
  modclub: modclub_types.ModClub,
  pageSize: number,
  page: number
): Promise<modclub_types.ModeratorLeaderboard[]> {
  return modclub.getModeratorLeaderboard(
    BigInt((page - 1) * pageSize),
    BigInt(page * pageSize)
  );
}

export async function getAllPohTasksForAdminUsers(
  modclub: modclub_types.ModClub,
  status: modclub_types.ContentStatus,
  start: number,
  end: number,
  userPrincipal: any,
  startDate?: number,
  endDate?: number
): Promise<modclub_types.PohTaskPlusForAdmin[]> {
  const startDateToProvide = startDate ? startDate : 0;
  const endDateToProvide = endDate ? endDate : 0;
  return modclub.getAllPohTasksForAdminUsers(
    status,
    BigInt(start),
    BigInt(end),
    userPrincipal,
    startDateToProvide,
    endDateToProvide
  );
}

export async function claimStake(
  modclub: modclub_types.ModClub,
  amount: bigint
): Promise<bigint> {
  return trace_error(async () => {
    let res = await modclub.claimStakedTokens(amount).catch((e) => {
      console.log("Unstake Claim error:", e);
    });
    return res;
  });
}

export async function releaseStake(
  modclub: modclub_types.ModClub,
  amount: bigint
): Promise<bigint> {
  return trace_error(async () => {
    let res = await modclub.releaseTokens(amount).catch((e) => {
      console.log("Unstake Release error:", e);
    });
    return res;
  });
}

export async function withdrawModeratorReward(
  modclub: modclub_types.ModClub,
  amount: bigint,
  receiver?: string
): Promise<bigint> {
  return trace_error(async () => {
    let res = await modclub.withdrawModeratorReward(
      amount,
      receiver ? [Principal.fromText(receiver)] : []
    );
    return res;
  });
}

export async function icrc1Transfer(
  wallet: wallet_types._SERVICE,
  wallet_name: string,
  amount: bigint,
  userId: Principal,
  subAcc?: modclub_types.Subaccount,
  from?: modclub_types.Subaccount
): Promise<any> {
  let walletToUse = "ii";
  if (wallet_name === InternetIdentity.name) {
    walletToUse = "ii";
  } else if (wallet_name === StoicWallet.name) {
    walletToUse = "stoic";
  }

  const acc: wallet_types.Account = {
    owner: userId,
    subaccount: subAcc ? [subAcc] : [],
  };
  const input: any = {
    to: acc,
    fee: [],
    memo: [],
    from_subaccount: from ? [from] : [],
    created_at_time: [],
    amount: amount,
  };
  if (walletToUse === "ii" || walletToUse === "stoic") {
    try {
      const res = await wallet.icrc1_transfer(input);
      return res;
    } catch (error) {
      console.error("Transfer Failed:", error);
      return;
    }
  } else {
    try {
      const res = await wallet.icrc1_transfer(input);
      return res;
    } catch (error) {
      console.error("Transfer Failed:", error);
      return;
    }
  }
}

export async function processAndUploadChunk(
  modclub: modclub_types.ModClub,
  challengeId: string,
  MAX_CHUNK_SIZE: number,
  blob: Blob,
  byteStart: number,
  chunk: number,
  fileSize: number,
  fileExtension: string
): Promise<any> {
  const blobSlice = blob.slice(
    byteStart,
    Math.min(Number(fileSize), byteStart + MAX_CHUNK_SIZE),
    blob.type
  );

  const bsf = await blobSlice.arrayBuffer();
  const res = await modclub.submitChallengeData({
    challengeId: challengeId,
    challengeDataBlob: [encodeArrayBuffer(bsf)],
    offset: BigInt(chunk),
    numOfChunks: BigInt(Number(Math.ceil(fileSize / MAX_CHUNK_SIZE))),
    mimeType: fileExtension,
    dataSize: BigInt(fileSize),
  });
  console.log("res", res);

  if (res && res.submissionStatus && !("ok" in res.submissionStatus)) {
    return Object.keys(res.submissionStatus)[0];
  }
  return null;
}
