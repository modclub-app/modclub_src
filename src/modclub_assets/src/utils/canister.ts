import { modclub } from "../../../declarations/modclub";

export type Optional<Type> = [Type] | [];

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

export async function imageToUint8Array(image): Promise<number[]> {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0);
  return await toBlob(context.canvas, "image/png");
}

export async function UploadImage(src: string) {
  const image = new Image();
  // stackoverflow logo
  image.src = src;

  image.onload = async () => {
    const data = await imageToUint8Array(image);
    const response = await modclub.sendImage("id_1", data, "image/png");
    console.log(response);
  };
}

export async function sendImage(imageData: number[]) {
  const response = await modclub.sendImage("id_1", imageData, "image/png");
  console.log("Send Image Response " + response);
}

export async function getImage(imageId: string): Promise<number[]> {
  const icResponse = await modclub.getImage(imageId);
  const imageData = unwrap<number[]>(icResponse);
  if (imageData !== null) {
    return imageData;
  } else {
    throw new Error("Image data does not exist");
  }
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
