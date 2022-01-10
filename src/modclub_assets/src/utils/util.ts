import { Optional } from "./api";
import { ImageData, Profile } from "./types";
import { formatDistanceStrict, isSameDay, format } from "date-fns";

import { submitChallengeData } from "./api";

// import { FileExtension, FileInfo } from './declarations/backend/backend.did';


// const getReverseFileExtension = (type: { string: null }) : string => {
export function getReverseFileExtension(type: { string: null }): string {
  switch(Object.keys(type)[0]) {
    case 'jpeg':
      return  'image/jpeg';
    case 'gif':
      return  'image/gif'; 
    case 'jpg':
      return  'image/jpg';       
    case 'png':
      return  'image/png';
    case 'svg':
      return  'image/svg';
    case 'avi':
      return  'video/avi';
    case 'mp4':
      return  'video/mp4';
    case 'aac':
      return  'video/aac';
    case 'wav':
      return  'audio/wav';
    case 'mp3':
      return  'audio/mp3';                                                                                                              
    default :
    return "";
  }
};

export function getFileExtension(type: string): any | null {
  switch(type) {
    case 'image/jpeg':
      return { 'jpeg' : null };
    case 'image/gif':
      return { 'gif' : null };
    case 'image/jpg':
      return { 'jpg' : null };
    case 'image/png':
      return { 'png' : null };          
    case 'image/svg':
      return { 'svg' : null };          
    case 'video/avi':
      return { 'avi' : null };                            
    case 'video/aac':
      return { 'aac' : null };
    case 'video/mp4':
      return { 'mp4' : null };        
    case 'audio/wav':
      return { 'wav' : null };                         
    case 'audio/mp3':
      return { 'mp3' : null };
    default :
    return null;
  }
};

export function b64toBlob(b64Data: string, contentType = '', sliceSize = 512) {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  const blob = new Blob(byteArrays, { type: contentType } );
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
) : Promise<any> {
  const blobSlice = blob.slice(
    byteStart,
    Math.min(Number(fileSize), byteStart + MAX_CHUNK_SIZE),
    blob.type,
  );
 
  const bsf = await blobSlice.arrayBuffer();

  const res = await submitChallengeData({
    challengeId: challengeId,
    challengeDataBlob: [encodeArrayBuffer(bsf)],
    userName: [],
    email: [],
    fullName: [],
    aboutUser: [],
    offset: BigInt(chunk),
    numOfChunks: BigInt(Number(Math.ceil(fileSize / MAX_CHUNK_SIZE))),
    mimeType: fileExtension,
    dataSize: BigInt(fileSize),
  });
  console.log("res", res)
}









// export async function convertImage(imageData: ImageData): Promise<number[]> {
//   return new Promise((resolve) => {
//     const image = new Image();
//     image.src = imageData.src;
//     image.onload = async () => {
//       resolve(imageToUint8Array(image, imageData.type));
//     };
//   });
// }

// export async function imageToUint8Array(image, imageType): Promise<number[]> {
//   const canvas = document.createElement("canvas");
//   const context = canvas.getContext("2d");
//   canvas.width = image.width;
//   canvas.height = image.height;
//   context.drawImage(image, 0, 0);
//   return toBlob(context.canvas, imageType);
// }

// function toBlob(
//   canvas: HTMLCanvasElement,
//   type: string = "image/png",
//   quality: number = 1
// ): Promise<number[]> {
//   return new Promise((resolve) =>
//     canvas.toBlob(
//       (canvasBlob) => {
//         canvasBlob!.arrayBuffer().then((arrayBuffer) => {
//           resolve([...new Uint8Array(arrayBuffer)]);
//         });
//       },
//       type,
//       quality
//     )
//   );
// }




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
