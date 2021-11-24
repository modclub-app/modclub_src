import { convertImage, convertObj, imageToUint8Array, unwrap } from "./util";
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
  Holdings,
  UserHoldings,
  _SERVICE,
  AirdropUser,
} from "./types";
import { Principal } from "@dfinity/principal";

export type Optional<Type> = [Type] | [];

var actor: _SERVICE = null;

function getMC(): Promise<_SERVICE> {
  return actorController.actor;
}
export async function sendImage(imageData: number[]) {
  const response = await (
    await getMC()
  ).sendImage("id_1", imageData, "image/png");
  console.log("Send Image Response " + response);
}

export async function getImage(imageId: string): Promise<number[]> {
  const icResponse = await (await getMC()).getImage(imageId);
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
    await getMC()
  ).registerModerator(username, email, imgResult ? [imgResult] : []);
  console.log(response);
  return response;
}

export async function getUserFromCanister(): Promise<Profile | null> {
  try {
    const icUser = await (await getMC()).getProfile();
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
  return (await getMC()).getAllContent(status);
}

export async function getContent(
  contentId: string
): Promise<ContentPlus | null> {
  return unwrap<ContentPlus>(await (await getMC()).getContent(contentId));
}

export async function vote(
  contentId: string,
  decision: Decision,
  rules?: RuleId[]
): Promise<string> {
  return (await getMC()).vote(contentId, decision, [rules]);
}

export async function getProvider(
  providerId: Principal
): Promise<ProviderPlus> {
  return (await getMC()).getProvider(providerId);
}

export async function getProviderRules(providerId: Principal): Promise<Rule[]> {
  console.log("getProviderRules");
  console.log(providerId);
  return (await getMC()).getRules(providerId);
}

export async function getActivity(isComplete: boolean): Promise<Activity[]> {
  return (await getMC()).getActivity(isComplete);
}

export async function getTokenHoldings(): Promise<UserHoldings> {
  return convertObj(await (await getMC()).getTokenHoldings());
}

export async function stakeTokens(amount: number): Promise<string> {
  return (await getMC()).stakeTokens(BigInt(amount));
}

export async function unStakeTokens(amount: number): Promise<string> {
  return (await getMC()).unStakeTokens(BigInt(amount));
}

export async function getAllProfiles(): Promise<Profile[]> {
  return (await getMC()).getAllProfiles();
}

export async function airdropRegister(): Promise<AirdropUser> {
  return (await getMC()).airdropRegister();
}

export async function isAirdropRegistered(): Promise<AirdropUser> {
  return (await getMC()).isAirdropRegistered();
}

export async function updateMC(): Promise<void> {
  await actorController.actor;
}
