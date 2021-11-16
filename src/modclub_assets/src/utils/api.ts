import { convertImage, imageToUint8Array, unwrap } from "./util";
import { actorController } from "./actor";
import {
  ContentPlus,
  ContentStatus,
  Decision,
  Profile,
  RuleId,
  Rule,
  ProviderPlus,
  Activity,
  ImageData,
  Image,
} from "./types";
import { modclub as MC } from "../../../declarations/modclub/index";
import { Principal } from "@dfinity/principal";

export type Optional<Type> = [Type] | [];

const modclub = actorController.actor;

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

export async function registerModerator(
  username: string,
  email: string,
  imageData?: ImageData
): Promise<Profile> {
  const imgResult: Image = imageData
    ? { data: await convertImage(imageData), imageType: imageData.type }
    : undefined;
  const response = await (
    await modclub
  ).registerModerator(username, email, imgResult ? [imgResult] : []);
  console.log(response);
  return response;
}

export async function getUserFromCanister(): Promise<Profile | null> {
  try {
    const icUser = await (await modclub).getProfile();
    if (icUser) {
      return icUser;
    } else {
      return null;
    }
  } catch (e) {
    console.log(e);
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

export async function getRules(providerId: string): Promise<Rule[]> {
  return (await modclub).getRules(Principal.fromText(providerId));
}

export async function getProvider(providerId: string): Promise<ProviderPlus> {
  return (await modclub).getProvider(Principal.fromText(providerId));
}

export async function getProviderRules(providerId: Principal): Promise<Rule[]> {
  console.log("getProviderRules");
  console.log(providerId);
  return (await modclub).getRules(providerId);
}

export async function getActivity(): Promise<Activity[]> {
  return (await modclub).getActivity();
}
