import { fileToImgSrc, convertObj, unwrap } from "./util";
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
  PohChallengeSubmissionRequest,
  PohChallengeSubmissionResponse,
  Result,
  PohTaskPlus,
  PohTaskPlusForAdmin,
  PohRulesViolated,
  ModeratorLeaderboard,
  VerifyHumanityResponse,
  Result_1,
  ProviderMeta,
  ProviderMetaResult,
  ProviderSettingResult,
} from "./types";
import { Principal } from "@dfinity/principal";
import { modclub } from "../../../declarations/modclub/index";
import { modclub_dev } from "../../../declarations/modclub_dev/index";
import { modclub_qa } from "../../../declarations/modclub_qa/index";
import { fetchObjectUrl, formatDate, getUrlForData } from "./util";
export type Optional<Type> = [Type] | [];

var actor: _SERVICE = null;
let MCToUse=modclub;
if (process.env.DEV_ENV == "dev") {
  MCToUse = modclub_dev;
} else if (process.env.DEV_ENV == "qa") {
  MCToUse = modclub_qa;
}

async function getMC(): Promise<_SERVICE> {
  if (!actor) {
    actor = await actorController.actor;
  }
  return actor;
}

export async function registerModerator(
  username: string,
  email?: string,
  imageData?: ImageData
): Promise<Profile> {
  const imgResult = null;
  const _mc = await getMC();
  const response = await _mc.registerModerator(
    username,
    email ? [email] : [],
    imgResult ? [imgResult] : []
  );
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
    console.log("error", e);
    return null;
  }
}

export async function getUserAlertOptInVal(): Promise<boolean> {
  try {
    return (await (await getMC()).checkIfUserOptToReciveAlerts());
  } catch (e) {
    console.log("error", e);
    return false;
  }
}

export async function addProviderAdmin(
  userId,
  principalId,
  userName
): Promise<boolean> {
  try {
    console.log("USERID", userId, principalId);

    let result = await (
      await getMC()
    ).addProviderAdmin(userId, userName, [principalId]);
    return result.hasOwnProperty("ok") ? true : false;
  } catch (e) {
    console.log("error", e);
    return false;
  }
}

export async function removeProviderAdmin(
  userId,
  principalId
): Promise<boolean> {
  try {
    console.log("USERID", userId, principalId);

    let result = await (await getMC()).removeProviderAdmin(principalId, userId);
    return result.hasOwnProperty("ok") ? true : false;
  } catch (e) {
    console.log("error", e);
    return false;
  }
}

export async function editProviderAdmin(
  userId,
  principalId,
  userName
): Promise<boolean> {
  try {
    console.log("USERID", userId, principalId);

    let result = await (
      await getMC()
    ).editProviderAdmin(principalId, userId, userName);
    return result.hasOwnProperty("ok") ? true : false;
  } catch (e) {
    console.log("error", e);
    return false;
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
  return (await getMC()).getRules(providerId);
}

export async function getActivity(isComplete: boolean): Promise<Activity[]> {
  return (await getMC()).getActivity(isComplete);
}

export async function getTokenHoldings(): Promise<UserHoldings> {
  return convertObj(await (await getMC()).getTokenHoldings());
}

export async function getAdminProviderIDs(): Promise<Principal[]> {
  return await (await getMC()).getAdminProviderIDs();
}

export async function getProviderAdmins(
  provider: Principal
): Promise<Profile[]> {
  return await (await getMC()).getProviderAdmins(provider);
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

export async function checkUserRole(): Promise<boolean> {
  return (await getMC()).isUserAdmin();
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
export async function addRules(
  rules: string[],
  providerId: Principal
): Promise<void> {
  var testActor = await getMC();
  if (rules[0] != undefined)
    return (await getMC()).addRules(rules, [providerId]);
}

export async function updateRule(
  rules: Rule[],
  providerId: Principal
): Promise<void> {
  var testActor = await getMC();
  return (await getMC()).updateRules(rules, [providerId]);
}

export async function removeRules(
  rules: RuleId[],
  providerId: Principal
): Promise<void> {
  return (await getMC()).removeRules(rules, [providerId]);
}

export async function updateProviderSettings(
  providerId: Principal,
  settings: ProviderSettings
): Promise<ProviderSettingResult> {
  return (await getMC()).updateSettings(providerId, settings);
}

export async function updateProviderMetaData(
  providerId: Principal,
  providerData: ProviderMeta
): Promise<ProviderMetaResult> {
  return (await getMC()).updateProvider(providerId, providerData);
}

export async function updateProviderLogo(
  providerId: Principal,
  imageData?: ImageData
): Promise<void> {
  return;
  // return (await getMC()).updateProviderLogo(
  //   providerId,
  //   imageData.picUInt8Arr,
  //   imageData.type
  // );
}

export async function fetchProviderContent(
  providerId: Principal,
  status: any,
  startIndex: number,
  endIndex: number
): Promise<ContentPlus[]> {
  console.log(startIndex, endIndex, status);
  return (await getMC()).getProviderContent(
    providerId,
    status,
    BigInt(startIndex),
    BigInt(endIndex)
  );
}

// POH Methods
export async function verifyUserHumanity(): Promise<VerifyHumanityResponse> {
  let mc = await getMC();
  return mc.verifyUserHumanityForModclub();
}

export async function retrieveChallengesForUser(
  token: string
): Promise<Result_1> {
  return (await getMC()).retrieveChallengesForUser(token);
}

export async function submitChallengeData(
  pohDataRequest: PohChallengeSubmissionRequest
): Promise<PohChallengeSubmissionResponse> {
  console.log("pohDataRequest", pohDataRequest);
  return (await getMC()).submitChallengeData(pohDataRequest);
}

export async function getPohTasks(
  status: ContentStatus,
  start: number,
  end: number
): Promise<PohTaskPlus[]> {
  return (await getMC()).getPohTasks(status, BigInt(start), BigInt(end));
}

export async function getAllPohTasksForAdminUsers(
  status: ContentStatus,
  start: number,
  end: number,
  userPrincipal: any,
  startDate?: number,
  endDate?: number
): Promise<PohTaskPlusForAdmin[]> {
  const startDateToProvide = startDate ? startDate : 0;
  const endDateToProvide = endDate ? endDate : 0;
  return (await getMC()).getAllPohTasksForAdminUsers(status, BigInt(start), BigInt(end), userPrincipal, startDateToProvide, endDateToProvide);
}

export async function getPohTaskData(packageId: string): Promise<any> {
  return (await getMC()).getPohTaskData(packageId);
}

export async function addUserToQueueAndSendVerificationEmail(environmentForBaseUrl: string) {
  return (await getMC()).sendVerificationEmail(environmentForBaseUrl);
}

export async function registerUserToReceiveAlerts(
  userId: string,
  wantToReceiveAlerts: boolean
): Promise<boolean> {
  return (await MCToUse.registerUserToReceiveAlerts(Principal.fromText(userId), wantToReceiveAlerts));
}

export async function getPohTaskDataForAdminUsers(packageId: string): Promise<any> {
  return (await getMC()).getPohTaskDataForAdminUsers(packageId);
}

export async function votePohContent(
  packageId: string,
  decision: Decision,
  violatedRules: PohRulesViolated[]
): Promise<void> {
  return (await getMC()).votePohContent(packageId, decision, violatedRules);
}

export async function getPerformance(): Promise<number> {
  return (await getMC()).getVotePerformance();
}

export async function issueJwt(): Promise<string> {
  return (await getMC()).issueJwt();
}

export async function getTasks(
  start: number,
  end: number,
  filterVoted: boolean
): Promise<ContentPlus[]> {
  try {
    return (await getMC()).getTasks(BigInt(start), BigInt(end), filterVoted);
  } catch (e) {
    // Temp fix for the issue where the MC is not ready yet
    console.log(e);
    return [];
  }
}
