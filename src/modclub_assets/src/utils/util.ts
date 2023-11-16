import { Optional } from "./api";
import { Profile } from "./types";
import * as Constants from "./constant";
import { isValid, formatDistanceStrict, isSameDay, format } from "date-fns";

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

export function setUserToStorage(
  storage = window.localStorage,
  key: string,
  user: Profile
): Profile | null {
  storage.setItem(
    key,
    JSON.stringify({ ...user }, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
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
  const current_date = new Date();
  if (!isValid(date)) return "invalid date";
  const same = isSameDay(current_date, date);

  return same
    ? formatDistanceStrict(current_date, date) + " ago"
    : format(date, dateformate ? dateformate : Constants.DEFAULT_DATE_FORMAT);
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
      "https://" + canisterId + ".raw.icp0.io/storage?contentId=" + contentId
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
      value != "scoreAwarenessConfirmation" &&
      value != "confirm"
    ) {
      result.push(key);
    }
  }
  return result;
}

export function getUrlFromArray(imgData: any, imgType: any): string {
  const arrayBufferView = new Uint8Array(imgData);
  const blob = new Blob([arrayBufferView], { type: imgType });
  const urlCreator = window.URL || window.webkitURL;
  const imageUrl = urlCreator.createObjectURL(blob);
  return imageUrl;
}

export function format_token(amount: number): string {
  if (amount >= 1000 && amount < 1000000) {
    return `${String(amount / 1000).slice(0, 5)}k`;
  } else if (amount >= 1000000 && amount < 1000000000) {
    return `${String(amount / 1000000).slice(0, 5)}m`;
  } else if (amount >= 1000000000) {
    return `${String(amount / 1000000000).slice(0, 5)}b`;
  } else {
    return `${String(amount).slice(0, 6)}`;
  }
}

export function convert_to_mod(
  amount: bigint,
  digit: bigint,
  preceision = 4
): number {
  const tokens = Number(amount) / Math.pow(10, Number(digit));
  const preceisionFactor = Math.pow(10, preceision);
  return Math.floor(tokens * preceisionFactor) / preceisionFactor;
}

export function convert_from_mod(amount: bigint, digit: bigint): number {
  return Number(amount) * Math.pow(10, Number(digit));
}

export function timestampToDate(timestamp: number): any {
  const date = new Date(timestamp / 1000000);
  const formattedDate = date.toDateString();
  const formattedTime = date.toLocaleTimeString();
  return `${formattedDate}/${formattedTime}`;
}

export function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function getErrorMessage(value) {
  if (isObject(value)) {
    return Object.keys(value);
  } else {
    return value;
  }
}

export function microsecondToSecond(microsec: bigint): number {
  return Number(microsec) / Constants.MICROSECONDS_IN_SECOND;
}

export function nanoTimeStrToMilli(nano: bigint): bigint {
  return nano / BigInt(1000000);
}
