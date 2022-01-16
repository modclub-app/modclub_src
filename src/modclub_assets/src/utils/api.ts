import { /* convertImage, */ convertObj, unwrap } from "./util";
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
  ProviderSettings,
  PohChallengeStatus,
  PohUniqueToken,
  PohChallengeSubmissionRequest,
  PohChallengeSubmissionResponse,
  Result,
  PohTaskPlus,
  PohRulesViolated,
  ModeratorLeaderboard,
} from "./types";
import { Principal } from "@dfinity/principal";

export type Optional<Type> = [Type] | [];

var actor: _SERVICE = null;

function getMC(): Promise<_SERVICE> {
  return actorController.actor;
}

export async function registerModerator(
  username: string,
  email: string,
  imageData?: ImageData
): Promise<Profile> {
  // const imgResult: Image = imageData
  //   ? { data: await convertImage(imageData), imageType: imageData.type }
  //   : undefined;

  const imgResult = null;
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

export async function getProfileById(userId: Principal): Promise<Profile> {
  return (await getMC()).getProfileById(userId);
}

export async function getModeratorLeaderboard(
  pageSize: number,
  page: number
): Promise<ModeratorLeaderboard[]> {
  return (await getMC()).getModeratorLeaderboard(
    BigInt((page - 1) * pageSize),
    BigInt(page * pageSize)
  );
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

// Admin API's / Need to be a provider admin to call these
export async function addRules(rules: string[]): Promise<void> {
  return (await getMC()).addRules(rules);
}

export async function removeRules(rules: RuleId[]): Promise<void> {
  return (await getMC()).removeRules(rules);
}

export async function updateProviderSettings(
  settings: ProviderSettings
): Promise<void> {
  return (await getMC()).updateSettings(settings);
}

// POH Methods
export async function verifyUserHumanity(): Promise<
  [PohChallengeStatus, [] | [PohUniqueToken]]
> {
  return (await getMC()).verifyUserHumanity();
}

export async function retrieveChallengesForUser(
  token: string
): Promise<Result> {
  return (await getMC()).retrieveChallengesForUser(token);
}

export async function submitChallengeData(
  pohDataRequest: PohChallengeSubmissionRequest
): Promise<PohChallengeSubmissionResponse> {
  console.log("pohDataRequest", pohDataRequest);
  return (await getMC()).submitChallengeData(pohDataRequest);
}

export async function getPohTasks(
  status: ContentStatus
): Promise<PohTaskPlus[]> {
  return (await getMC()).getPohTasks(status);
}

export async function votePohContent(
  packageId: string,
  decision: Decision,
  violatedRules: [PohRulesViolated]
): Promise<void> {
  console.log("votePohContent");
  return (await getMC()).votePohContent(packageId, decision, violatedRules);
}
export async function getPerformance(): Promise<number> {
  return (await getMC()).getVotePerformance();
}
