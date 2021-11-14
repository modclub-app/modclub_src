import { imageToUint8Array, unwrap } from "./util";
import { actorController } from "./actor";
import { ContentPlus, ContentStatus, Decision, Profile, RuleId } from "./types";
import { modclub as MC } from "../../../declarations/modclub/index";

export type Optional<Type> = [Type] | [];

const modclub = actorController.actor;
export async function UploadImage(src: string) {
  const image = new Image();
  image.src = src;

  image.onload = async () => {
    const data = await imageToUint8Array(image);
    const response = await (await modclub).sendImage("id_1", data, "image/png");
    console.log(response);
  };
}

export async function sendImage(imageData: number[]) {
  const response = await (
    await modclub
  ).sendImage("id_1", imageData, "image/png");
  console.log("Send Image Response " + response);
}

export async function getImage(imageId: string): Promise<number[]> {
  const icResponse = await (await modclub).getImage(imageId);
  const imageData = unwrap<number[]>(icResponse);
  if (imageData !== null) {
    return imageData;
  } else {
    throw new Error("Image data does not exist");
  }
}

export async function registerModerator(username: string): Promise<Profile> {
  const response = await (await modclub).registerModerator(username, []);
  console.log(response);
  return response;
}

export async function getUserFromCanister(): Promise<Profile | null> {
  const icUser = await (await modclub).getProfile();
  if (icUser) {
    return icUser;
  } else {
    return null;
  }
}

export async function getAllContent(
  status: ContentStatus
): Promise<ContentPlus[]> {
  return MC.getAllContent(status);
}

export async function getContent(
  contentId: string
): Promise<ContentPlus | null> {
  return unwrap<ContentPlus>(await MC.getContent(contentId));
}

export async function vote(
  contentId: string,
  decision: Decision,
  rules?: RuleId[]
): Promise<string> {
  return (await modclub).vote(contentId, decision, [rules]);
}
