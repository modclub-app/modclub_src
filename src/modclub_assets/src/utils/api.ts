import {
  InternetIdentity,
  StoicWallet,
} from "@connect2icmodclub/core/providers";
import { encodeArrayBuffer } from "./util";
import { Principal } from "@dfinity/principal";
import { modclub_types, wallet_types } from "../../src/declarations_by_env";

export type Optional<Type> = [Type] | [];

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
