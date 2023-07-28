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
  Result_5,
  Result_4,
  ProfileStable,
  Subaccount,
  Account,
} from "./types";
import { Principal } from "@dfinity/principal";
import { canisterId as ModCanisterId } from "../../../declarations/modclub/index";
import { canisterId as ModDevCanisterId } from "../../../declarations/modclub_dev/index";
import { canisterId as ModQACanisterId } from "../../../declarations/modclub_qa/index";
import {
  canisterId as RSCanisterID,
  createActor as RSCreateActor,
  idlFactory as RSIdl,
} from "../../../declarations/rs";
import {
  canisterId as RSQACanisterID,
  createActor as RSQACreateActor,
  idlFactory as RSQAIdl,
} from "../../../declarations/rs_qa";
import {
  canisterId as RSDEVCanisterID,
  createActor as RSDEVCreateActor,
  idlFactory as RSDEVIdl,
} from "../../../declarations/rs_dev";
import {
  canisterId as WalletCanisterID,
  createActor as WalletCreateActor,
  idlFactory as WalletIdl,
} from "../../../declarations/wallet/index";
import {
  canisterId as WalletQACanisterID,
  createActor as WalletQACreateActor,
  idlFactory as WalletQAIdl,
} from "../../../declarations/wallet_qa";
import {
  canisterId as WalletDEVCanisterID,
  createActor as WalletDEVCreateActor,
  idlFactory as WalletDEVIdl,
} from "../../../declarations/wallet_dev";
import { RSAndLevel } from "../../../declarations/rs/rs.did";
import {
  canisterId as VestingCanisterID,
  createActor as VestingCreateActor,
  idlFactory as VestingIdl,
} from "../../../declarations/vesting";
import {
  canisterId as VestingQACanisterID,
  createActor as VestingQACreateActor,
  idlFactory as VestingQAIdl,
} from "../../../declarations/vesting_qa";
import {
  canisterId as VestingDEVCanisterID,
  createActor as VestingDEVCreateActor,
  idlFactory as VestingDEVIdl,
} from "../../../declarations/vesting_dev";

import { HttpAgent, Identity } from "@dfinity/agent";
import { authClient } from "./authClient";
import { StoicIdentity } from "ic-stoic-identity";
export type Optional<Type> = [Type] | [];

var actor: _SERVICE = null;
var Vesting: _SERVICE = null;
var Wallet: _SERVICE = null;
var RS: _SERVICE = null;
let walletToUse = localStorage.getItem("_loginType") || "ii";

export function getEnvironmentSpecificValues(env: string) {
  switch (env) {
    case "dev":
      return {
        CanisterId: ModDevCanisterId,
        walletCanisterId: WalletDEVCanisterID,
        walletIDL: WalletDEVIdl,
        walletActor: WalletDEVCreateActor,
        vestingCanisterID: VestingDEVCanisterID,
        vestingIDL: VestingDEVIdl,
        vestingActor: VestingDEVCreateActor,
        rsCanisterID: RSDEVCanisterID,
        rsIDL: RSDEVIdl,
        rsActor: RSDEVCreateActor,
      };
    case "qa":
      return {
        CanisterId: ModQACanisterId,
        walletCanisterId: WalletQACanisterID,
        walletIDL: WalletQAIdl,
        walletActor: WalletQACreateActor,
        vestingCanisterID: VestingQACanisterID,
        vestingIDL: VestingQAIdl,
        vestingActor: VestingQACreateActor,
        rsCanisterID: RSQACanisterID,
        rsIDL: RSQAIdl,
        rsActor: RSQACreateActor,
      };
    default:
      return {
        CanisterId: ModCanisterId,
        walletCanisterId: WalletCanisterID,
        walletIDL: WalletIdl,
        walletActor: WalletCreateActor,
        vestingCanisterID: VestingCanisterID,
        vestingIDL: VestingIdl,
        vestingActor: VestingCreateActor,
        rsCanisterID: RSCanisterID,
        rsIDL: RSIdl,
        rsActor: RSCreateActor,
      };
  }
}
const { CanisterId, walletCanisterId } = getEnvironmentSpecificValues(
  process.env.DEV_ENV
);

async function getMC(): Promise<_SERVICE> {
  if (!actor) {
    actor = await actorController.actor;
  }
  return actor;
}

async function fetchIdentity(): Promise<Identity> {
  let identity;
  if (walletToUse == "plug") {
    const result = await window["ic"][walletToUse].requestConnect({
      walletCanisterId,
    });
    const pID = await window["ic"][walletToUse]["agent"].getPrincipal();
    identity = {
      type: walletToUse,
      getPrincipal: () => pID,
    };
  } else if (walletToUse == "stoic") {
    identity = await StoicIdentity.load();
  } else {
    identity = authClient.getIdentity();
  }
  return identity;
}
async function getWallet(): Promise<_SERVICE> {
  if (!Wallet) {
    const identity = await fetchIdentity();
    const agent = new HttpAgent({ identity });
    if (process.env.DEV_ENV == "dev") {
      Wallet = await WalletDEVCreateActor(WalletDEVCanisterID, { agent });
    } else if (process.env.DEV_ENV == "qa") {
      Wallet = await WalletQACreateActor(WalletQACanisterID, { agent });
    } else {
      Wallet = await WalletCreateActor(WalletCanisterID, { agent });
    }
  }
  return Wallet;
}
async function getVesting(): Promise<_SERVICE> {
  if (!Vesting) {
    const identity = await fetchIdentity();
    const agent = new HttpAgent({ identity });
    if (process.env.DEV_ENV == "dev") {
      Vesting = await VestingDEVCreateActor(VestingDEVCanisterID, { agent });
    } else if (process.env.DEV_ENV == "qa") {
      Vesting = await VestingQACreateActor(VestingQACanisterID, { agent });
    } else {
      Vesting = await VestingCreateActor(VestingCanisterID, { agent });
    }
  }
  return Vesting;
}
async function getRS(): Promise<_SERVICE> {
  if (!RS) {
    const identity = await fetchIdentity();
    const agent = new HttpAgent({ identity });
    if (process.env.DEV_ENV == "dev") {
      RS = await RSDEVCreateActor(RSDEVCanisterID, { agent });
    } else if (process.env.DEV_ENV == "qa") {
      RS = await RSQACreateActor(RSQACanisterID, { agent });
    } else {
      RS = await RSCreateActor(RSCanisterID, { agent });
    }
  }
  return RS;
}
async function trace_error(_trace: any) {
  try {
    return Promise.resolve(_trace());
  } catch (e) {
    console.error(e);
    return Promise.reject(e);
  }
}
export async function registerModerator(
  username: string,
  email?: string,
  imageData?: ImageData
): Promise<ProfileStable> {
  const imgResult = null;
  try {
    const _mc = await getMC();
    const response = await _mc.registerModerator(
      username,
      email ? [email] : [],
      imgResult ? [imgResult] : []
    );
    return response;
  } catch (e) {
    console.log("ERROR in registerModerator", e);
    return Promise.reject(e);
  }
}
export async function registerProvider(
  username: string,
  email: string,
  imageData?: ImageData
): Promise<string> {
  const imgResult = null;
  const _mc = await getMC();
  const response = await _mc.registerProvider(
    username,
    email,
    imgResult ? [imgResult] : []
  );
  return response;
}

export async function getUserFromCanister(): Promise<ProfileStable | null> {
  try {
    const icUser = await (await getMC()).getProfile();
    if (icUser) {
      return icUser;
    } else {
      return null;
    }
  } catch (e) {
    console.error("error", e);
    return null;
  }
}

export async function getUserAlertOptInVal(): Promise<boolean> {
  try {
    return await (await getMC()).checkIfUserOptToReciveAlerts();
  } catch (e) {
    console.error("error", e);
    return false;
  }
}

export async function addProviderAdmin(
  userId,
  principalId,
  userName
): Promise<boolean> {
  try {
    let result = await (
      await getMC()
    ).addProviderAdmin(userId, userName, [principalId]);
    return result.hasOwnProperty("ok") ? true : false;
  } catch (e) {
    console.error("error", e);
    return false;
  }
}

export async function removeProviderAdmin(
  userId,
  principalId
): Promise<boolean> {
  try {
    let result = await (await getMC()).removeProviderAdmin(principalId, userId);
    return result.hasOwnProperty("ok") ? true : false;
  } catch (e) {
    console.error("error", e);
    return false;
  }
}

export async function editProviderAdmin(
  userId,
  principalId,
  userName
): Promise<boolean> {
  try {
    let result = await (
      await getMC()
    ).editProviderAdmin(principalId, userId, userName);
    return result.hasOwnProperty("ok") ? true : false;
  } catch (e) {
    console.error("error", e);
    return false;
  }
}

export async function getAllContent(
  status: ContentStatus
): Promise<ContentPlus[]> {
  return trace_error(async () => (await getMC()).getAllContent(status));
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

export async function getProviderSa(
  providerId: Principal,
  sub?: string
): Promise<ProviderPlus> {
  return (await getMC()).getProviderSa(sub ? sub : "RESERVE", [providerId]);
}

export async function getProviderRules(providerId: Principal): Promise<Rule[]> {
  return (await getMC()).getRules(providerId);
}

export async function getActivity(isComplete: boolean): Promise<Activity[]> {
  return (await getMC()).getActivity(isComplete);
}

export async function getAdminProviderIDs(): Promise<Principal[]> {
  return await (await getMC()).getAdminProviderIDs();
}

export async function getProviderAdmins(
  provider: Principal
): Promise<ProfileStable[]> {
  return await (await getMC()).getProviderAdmins(provider);
}

export async function stakeTokens(amount: number): Promise<Result> {
  return trace_error(async () => {
    await (await getWallet()).stakeTokens(BigInt(amount));
  });
}

export async function unStakeTokens(amount: number): Promise<any> {
  return trace_error(async () => {
    await (await getMC()).unStakeTokens(BigInt(amount));
  });
}

export async function getAllProfiles(): Promise<ProfileStable[]> {
  return (await getMC()).getAllProfiles();
}

export async function checkUserRole(uid: Principal): Promise<boolean> {
  try {
    let modclubActor = await getMC();
    let admins = await modclubActor.showAdmins();
    return admins.includes(uid);
  } catch (e) {
    !e.message.includes("Access denied") &&
      console.log("ERROR::checkUserRole::", e);
    return false;
  }
}

export async function getProfileById(
  userId: Principal
): Promise<ProfileStable> {
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

export async function updateMC(): Promise<void> {
  await actorController.actor;
}

// Admin API's / Need to be a provider admin to call these
export async function addRules(
  rules: string[],
  providerId: Principal
): Promise<void> {
  if (rules[0] != undefined)
    return (await getMC()).addRules(rules, [providerId]);
}

export async function updateRule(
  rules: Rule[],
  providerId: Principal
): Promise<void> {
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
  return (await getMC()).getAllPohTasksForAdminUsers(
    status,
    BigInt(start),
    BigInt(end),
    userPrincipal,
    startDateToProvide,
    endDateToProvide
  );
}

export async function getPohTaskData(packageId: string): Promise<any> {
  return (await getMC()).getPohTaskData(packageId);
}

export async function addUserToQueueAndSendVerificationEmail(
  environmentForBaseUrl: string
) {
  return (await getMC()).sendVerificationEmail(environmentForBaseUrl);
}

export async function registerUserToReceiveAlerts(
  userId: string,
  wantToReceiveAlerts: boolean
): Promise<boolean> {
  return await (
    await getMC()
  ).registerUserToReceiveAlerts(
    Principal.fromText(userId),
    wantToReceiveAlerts
  );
}

export async function getPohTaskDataForAdminUsers(
  packageId: string
): Promise<any> {
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
  return trace_error(async () =>
    (await getMC()).getTasks(BigInt(start), BigInt(end), filterVoted)
  );
}
export async function queryRSAndLevelByPrincipal(
  principalId: string
): Promise<RSAndLevel> {
  return trace_error(
    async () =>
      await (
        await getRS()
      ).queryRSAndLevelByPrincipal(Principal.fromText(principalId))
  );
}
export async function queryRSAndLevel(): Promise<RSAndLevel> {
  return trace_error(async () => await (await getRS()).queryRSAndLevel());
}
export async function queryBalance(subAcc?: string): Promise<number> {
  return trace_error(
    async () => await (await getWallet()).queryBalance(subAcc ? [subAcc] : [])
  );
}
export async function queryBalancePr(
  principalId: string,
  subAcc?: string
): Promise<number> {
  return trace_error(
    async () =>
      await (
        await getWallet()
      ).queryBalancePr(Principal.fromText(principalId), subAcc ? [subAcc] : [])
  );
}

// Reservation System
export async function reserveContent(contentId: string): Promise<void> {
  return trace_error(async () => (await getMC()).reserveContent(contentId));
}
export async function getReservedByContentId(contentId: string): Promise<void> {
  return trace_error(async () =>
    (await getMC()).getReservedByContentId(contentId)
  );
}
export async function canReserveContent(contentId: string): Promise<any> {
  return trace_error(async () => (await getMC()).canReserveContent(contentId));
}

//DEPOSIT PROVIDER
export async function icrc1Balance(
  userId: string,
  subAcc?: Subaccount
): Promise<bigint> {
  return trace_error(
    async () =>
      await (
        await getWallet()
      ).icrc1_balance_of({
        owner: Principal.fromText(userId),
        subaccount: subAcc && subAcc.length > 0 ? [subAcc] : [],
      })
  );
}
export async function icrc1Decimal(): Promise<bigint> {
  return trace_error(async () => await (await getWallet()).icrc1_decimals());
}

export async function icrc1Transfer(
  amount: bigint,
  userId: Principal,
  subAcc?: Subaccount
): Promise<any> {
  return trace_error(async () => {
    const acc: Account = { owner: userId, subaccount: subAcc ? [subAcc] : [] };
    const input: any = {
      to: acc,
      fee: [],
      memo: [],
      from_subaccount: [],
      created_at_time: [],
      amount: amount,
    };
    if (walletToUse === "ii" || walletToUse === "stoic") {
      const res = await (await getWallet()).icrc1_transfer(input);
      return res;
    } else {
      throw new Error(`Unsupported wallet: ${walletToUse}`);
    }
  });
}

export async function topUpProviderReserve(
  amount: number,
  providerId?: Principal
): Promise<any> {
  return trace_error(async () =>
    (await getMC()).topUpProviderReserve({
      amount: BigInt(amount),
      providerId: [providerId],
    })
  );
}

export async function providerSaBalanceById(
  provider: Principal,
  opt?: string
): Promise<any> {
  return trace_error(async () =>
    (await getMC()).providerSaBalance(opt ? opt : "RESERVE", [provider])
  );
}

export async function claimLockedReward(amount: number): Promise<Result_4> {
  return trace_error(async () =>
    (await getMC()).claimLockedReward(BigInt(amount), [])
  );
}

export async function canClaimLockedReward(amount: number): Promise<Result_5> {
  return trace_error(async () =>
    (await getMC()).canClaimLockedReward([BigInt(amount)])
  );
}

export async function stakeFor(userId: string): Promise<bigint> {
  return trace_error(async () => {
    let res = await (
      await getVesting()
    ).staked_for({ owner: Principal.fromText(userId), subaccount: [] });
    return res;
  });
}

export async function lockedFor(userId: string): Promise<bigint> {
  return trace_error(async () => {
    let res = await (
      await getVesting()
    ).locked_for({ owner: Principal.fromText(userId), subaccount: [] });
    return res;
  });
}
