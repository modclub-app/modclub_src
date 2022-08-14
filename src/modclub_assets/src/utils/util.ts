import { Principal } from "@dfinity/principal";
import { Optional } from "./api";
import { Profile } from "./types";
import { isValid, formatDistanceStrict, isSameDay, format } from "date-fns";
import { submitChallengeData } from "./api";
import { fetchWithJwt } from "./jwt";

export function getFileExtension(type: string): any | null {
  switch (type) {
    case "image/jpeg":
      return "jpeg";
    case "image/gif":
      return "gif";
    case "image/jpg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/svg":
      return "svg";
    default:
      return null;
  }
}

export function b64toBlob(b64Data: string, contentType = "", sliceSize = 512) {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }
  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
}

export async function processAndUploadChunk(
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

  const res = await submitChallengeData({
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

export function getUserFromStorage(
  storage = window.localStorage,
  key: string
): Profile | null {
  const lsUser = storage.getItem(key);
  if (lsUser) {
    return JSON.parse(lsUser, (k, v) => {
      if (k === "rewards") {
        return BigInt(v);
      }
      return v;
    }) as Profile;
  } else {
    return undefined;
  }
}

export function convertObj(obj: any): any {
  return Object.entries(obj).reduce((acc, [k, v]) => {
    if (typeof v === "object") {
      acc[k] = convertObj(v);
    } else if (typeof v === "bigint") {
      acc[k] = Number(v);
    } else {
      acc[k] = v;
    }
    return acc;
  }, {});
}

export function fileToImgSrc(file: number[], imgType = "png"): string {
  const bufferBlob = [Buffer.from(new Uint8Array(file))];
  const picBlob = new Blob(bufferBlob, { type: `image/{imgType}` });
  const picSrc = URL.createObjectURL(picBlob);
  return picSrc;
}

export function unwrap<T>(val: Optional<T>): T | null {
  if (val[0] === undefined) {
    return null;
  } else {
    return val[0];
  }
}

export const encodeArrayBuffer = (file: ArrayBuffer): number[] =>
  Array.from(new Uint8Array(file));

export function formatDate(integer: bigint, dateformate?: string) {
  const date = new Date(Number(integer));
  if (!isValid(date)) return "invalid date";
  const same = isSameDay(new Date(), date);
  return same
    ? formatDistanceStrict(new Date(), date) + " ago"
    : format(date, dateformate ? dateformate : "PP");
}

export function validateEmail(email: string) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export function getUrlForData(canisterId: String, contentId: String) {
  if (window.location.hostname.includes("localhost")) {
    return `http://localhost:8000/storage?canisterId=${canisterId}&contentId=${contentId}`;
  } else {
    return (
      "https://" + canisterId + ".raw.ic0.app/storage?contentId=" + contentId
    );
  }
}

export function getViolatedRules(values: { [key: string]: string }): string[] {
  const result: [string?] = [];
  for (const key in values) {
    const value = values[key];
    if (
      value &&
      value != "voteIncorrectlyConfirmation" &&
      value != "voteRulesConfirmation" &&
      value != "confirm"
    ) {
      result.push(key);
    }
  }
  return result;
}

export async function fetchObjectUrl(url: string): Promise<string> {
  const res = await fetchWithJwt(url);
  const imageBlob = await res.blob();
  return URL.createObjectURL(imageBlob);
}
