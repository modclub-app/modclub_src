import { Optional } from "./api";
import { ImageData, Profile } from "./types";
import { formatDistanceStrict, isSameDay, format } from "date-fns";

export async function convertImage(imageData: ImageData): Promise<number[]> {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = imageData.src;
    image.onload = async () => {
      resolve(imageToUint8Array(image, imageData.type));
    };
  });
}

export async function imageToUint8Array(image, imageType): Promise<number[]> {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0);
  return toBlob(context.canvas, imageType);
}

function toBlob(
  canvas: HTMLCanvasElement,
  type: string = "image/png",
  quality: number = 1
): Promise<number[]> {
  return new Promise((resolve) =>
    canvas.toBlob(
      (canvasBlob) => {
        canvasBlob!.arrayBuffer().then((arrayBuffer) => {
          resolve([...new Uint8Array(arrayBuffer)]);
        });
      },
      type,
      quality
    )
  );
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
  console.log(obj);
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

export function formatDate(date: bigint) {
  const same = isSameDay(new Date(), new Date(Number(date)));
  return same
    ? formatDistanceStrict(new Date(), new Date(Number(date))) + " ago"
    : format(new Date(Number(date)), "PP");
}
