import Array "mo:base/Array";
import Arrays "mo:base/Array";
import AuthManager "./service/auth/auth";
import Base32 "mo:encoding/Base32";
import Blob "mo:base/Blob";
import Bool "mo:base/Bool";
import Buffer "mo:base/Buffer";
import Canistergeek "./canistergeek/canistergeek";
import ContentManager "./service/content/content";
import ContentVotingManager "./service/content/vote";
import Debug "mo:base/Debug";
import DownloadUtil "downloadUtil";
import Error "mo:base/Error";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import Trie "mo:base/Trie";
import Helpers "./helpers";
import IC "./remote_canisters/IC";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import List "mo:base/List";
import LoggerTypesModule "./canistergeek/logger/typesModule";
import ModClubParam "service/parameters/params";
import ModeratorManager "./service/moderator/moderator";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Order "mo:base/Order";
import POH "./service/poh/poh";
import PohStateV2 "./service/poh/statev2";
import PohTypes "./service/poh/types";
import VoteTypes "./service/vote/types";
import Prim "mo:prim";
import Principal "mo:base/Principal";
import Cycles "mo:base/ExperimentalCycles";
import JSON "mo:json/JSON";
import ProviderManager "./service/provider/provider";
import QueueManager "./service/queue/queue";
import QueueState "./service/queue/state";
import Random "mo:base/Random";
import Rel "./data_structures/Rel";
import RelObj "./data_structures/RelObj";
import Result "mo:base/Result";
import StateV1 "./statev1";
import StateV2 "./statev2";
import StorageSolution "./service/storage/storage";
import StorageState "./service/storage/storageState";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Token "./token";
import Types "./types";
import MsgInspectTypes "./msgInspectTypes";
import EmailManager "./service/email/email";
import EmailState "./service/email/state";
import VoteManager "./service/vote/vote";
import VoteState "./service/vote/statev2";
import VoteStateV2 "./service/vote/statev2";
import DownloadSupport "./downloadSupport";
import ModWallet "./remote_canisters/ModWallet";
import RSManager "./remote_canisters/RSManager";
import RSTypes "../rs/types";
import WalletTypes "../wallet/types";
import Utils "../common/utils";
import CommonTypes "../common/types";
import ModSecurity "../common/security/guard";
import Auth "../common/security/AuthCanister";

shared ({ caller = deployer }) actor class ModClub(env : CommonTypes.ENV) = this {

  // Constants
  let MAX_WAIT_LIST_SIZE = 20000;

  // In case someone spams us, limit the waitlist
  private stable var startTimeForPOHEmail = Helpers.timeNow();
  private var ranPOHUserEmailsOnce : Bool = false;
  stable var signingKey = "";
  // Airdrop Flags
  stable var allowSubmissionFlag : Bool = true;
  // Global Objects
  var state = StateV1.empty();
  var stateV2 = StateV2.empty();

  // Delete this and all token files if code runs fine.
  stable var tokensStableV1 : Token.TokensStableV1 = Token.emptyStableV1(
    ModClubParam.getModclubWallet()
  );
  var tokens = Token.Tokens(
    tokensStableV1
  );

  stable var storageStateStable = StorageState.emptyStableState();
  stable var retiredDataCanisterId : [Text] = [];

  stable var pohStableStateV2 = PohStateV2.emptyStableState();
  // time when callback was sent by provider, then by provider user, then by status
  stable var pohCallbackDataByProvider : [(Principal, [(Text, [(Text, Int)])])] = [];
  stable var provider2ProviderUserId2Ip : [(Principal, [(Text, Text)])] = [];
  stable var provider2Ip2Wallet : [(Principal, Rel.RelShared<Text, Principal>)] = [];
  var pohEngine = POH.PohEngine(
    pohStableStateV2,
    pohCallbackDataByProvider,
    provider2ProviderUserId2Ip,
    provider2Ip2Wallet
  );

  stable var pohVoteStableState = VoteState.emptyStableState();
  stable var pohVoteStableStateV2 = VoteStateV2.emptyStableState();
  var voteManager = VoteManager.VoteManager(pohVoteStableState);

  stable var emailStableState = EmailState.emptyStableState();
  var emailManager = EmailManager.EmailManager(emailStableState);

  stable var _canistergeekMonitorUD : ?Canistergeek.UpgradeData = null;
  private let canistergeekMonitor = Canistergeek.Monitor();

  stable var _canistergeekLoggerUD : ?Canistergeek.LoggerUpgradeData = null;
  private let canistergeekLogger = Canistergeek.Logger();

  stable var contentQueueStateStable : ?QueueState.QueueStateStable = null;
  private let contentQueueManager = QueueManager.QueueManager();
  stable var randomizationEnabled = true;

  stable var pohContentQueueStateStable : ?QueueState.QueueStateStable = null;
  private let pohContentQueueManager = QueueManager.QueueManager();

  stable var admins : List.List<Principal> = List.nil<Principal>();
  // Will be updated with "this" in postupgrade. Motoko not allowing to use "this" here
  var storageSolution = StorageSolution.StorageSolution(
    storageStateStable,
    retiredDataCanisterId,
    admins,
    signingKey
  );

  private var authGuard = ModSecurity.Guard(env, "MODCLUB_CANISTER");
  authGuard.subscribe("admins");

  public shared ({ caller }) func handleSubscription(payload : CommonTypes.ConsumerPayload) : async () {
    Debug.print("[MODCLUB_CANISTER] [SUBSCRIPTION HANDLER] ==> Payload received from AUTH_CANISTER");
    authGuard.handleSubscription(payload);
  };

  public shared ({ caller }) func toggleAllowSubmission(allow : Bool) : async () {
    allowSubmissionFlag := allow;
  };

  // TODO: Transfer to Auth canister.
  public shared ({ caller }) func generateSigningKey() : async () {
    switch (Helpers.encodeNat8ArraytoBase32(Blob.toArray(await Random.blob()))) {
      case (null) { throw Error.reject("Couldn't generate key") };
      case (?key) {
        signingKey := key;
        await storageSolution.setSigningKey(signingKey);
      };
    };
  };

  // ---------------------- Email Methods------------------------------
  public shared ({ caller }) func registerUserToReceiveAlerts(
    id : Principal,
    wantsToGetAlerts : Bool
  ) : async Bool {
    return await emailManager.registerUserToReceiveAlerts(id, wantsToGetAlerts);
  };

  public shared query ({ caller }) func getAllUsersWantToReceiveAlerts() : async [Text] {
    return emailManager.getAllUsersWantToReceiveAlerts();
  };

  public shared query ({ caller }) func checkIfUserOptToReciveAlerts() : async Bool {
    return emailManager.checkIfUserOptToReciveAlerts(caller);
  };

  public shared ({ caller }) func sendVerificationEmail(
    envForBaseURL : Text
  ) : async Bool {
    var userEmail = await emailManager.sendVerificationEmail(
      caller,
      envForBaseURL,
      stateV2
    );
    var callResult : Bool = false;
    var pid = Principal.toText(caller);
    if (userEmail == "") {
      throw Error.reject("User has not provided email id");
    };
    // send Verification email to receive alerts
    callResult := await callLambdaToSendEmail(
      userEmail,
      envForBaseURL,
      pid,
      "v",
      0
    );
    return callResult;
  };
  // ---------------------- END Email Methods------------------------------

  // ----------------------Provider Methods------------------------------
  // TODO: REFACTOR AND CUT OFF PERMISSION-CHECK LAYER FROM ProviderManager!!!
  // todo: Require cylces on provider registration, add provider imageURl, description
  public shared ({ caller }) func registerProvider(
    name : Text,
    description : Text,
    image : ?Types.Image
  ) : async Text {
    Debug.print("registerProvider caller: " # Principal.toText(caller));
    switch (stateV2.providersWhitelist.get(caller)) {
      case (null) {
        Helpers.logMessage(
          canistergeekLogger,
          "registerProvider - Provider not in allow list with provider ID: " # Principal.toText(
            caller
          ),
          #info
        );
        return "Caller " # Principal.toText(caller) # " not in allow list";
      };
      case (?_)();
    };
    ProviderManager.registerProvider(
      caller,
      name,
      description,
      image,
      stateV2,
      canistergeekLogger
    );
  };

  public shared ({ caller }) func updateProvider(
    providerId : Principal,
    updatedProviderVal : Types.ProviderMeta
  ) : async Types.ProviderMetaResult {
    Debug.print(
      "updateProvider caller: " # Principal.toText(caller) # ", providerId: " # Principal.toText(
        providerId
      )
    );
    return await ProviderManager.updateProviderMetaData(
      providerId,
      updatedProviderVal,
      caller,
      stateV2,
      canistergeekLogger
    );
  };

  public shared ({ caller }) func updateProviderLogo(
    providerId : Principal,
    logoToUpload : [Nat8],
    logoType : Text
  ) : async Text {

    return await ProviderManager.updateProviderLogo(
      providerId,
      logoToUpload,
      logoType,
      caller,
      stateV2,
      canistergeekLogger
    );
  };

  public shared ({ caller }) func deregisterProvider() : async Text {
    ProviderManager.deregisterProvider(caller, stateV2, canistergeekLogger);
  };

  public shared ({ caller }) func updateSettings(
    providerId : Principal,
    updatedSettings : Types.ProviderSettings
  ) : async Types.ProviderSettingResult {
    Debug.print(
      "updateSettings caller: " # Principal.toText(caller) # ", providerId: " # Principal.toText(
        providerId
      )
    );
    return await ProviderManager.updateProviderSettings(
      providerId,
      updatedSettings,
      caller,
      stateV2,
      canistergeekLogger
    );
  };

  public shared ({ caller }) func getProvider(providerId : Principal) : async Types.ProviderPlus {
    Debug.print(
      "getProvider caller: " # Principal.toText(caller) # ", providerId: " # Principal.toText(
        providerId
      )
    );
    await ProviderManager.getProvider(providerId, stateV2);
  };

  public shared ({ caller }) func addRules(
    rules : [Text],
    providerId : ?Principal
  ) : async () {
    // checkProviderPermission will return either the caller or the passed in providerId depending if the caller is the provider or not
    switch (AuthManager.checkProviderPermission(caller, providerId, stateV2)) {
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p)) {
        ProviderManager.addRules(p, rules, stateV2, canistergeekLogger);
      };
    };
  };

  public shared ({ caller }) func removeRules(
    ruleIds : [Types.RuleId],
    providerId : ?Principal
  ) : async () {
    switch (AuthManager.checkProviderPermission(caller, providerId, stateV2)) {
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p)) {
        ProviderManager.removeRules(p, ruleIds, stateV2, canistergeekLogger);
      };
    };
  };

  public shared ({ caller }) func updateRules(
    rulesList : [Types.Rule],
    providerId : ?Principal
  ) : async () {
    switch (AuthManager.checkProviderPermission(caller, providerId, stateV2)) {
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p)) {
        ProviderManager.updateRules(p, rulesList, stateV2);
      };
    };
  };

  public query ({ caller }) func getProviderRules() : async [Types.Rule] {
    ProviderManager.getProviderRules(caller, stateV2);
  };

  public query func getRules(providerId : Principal) : async [Types.Rule] {
    ProviderManager.getProviderRules(providerId, stateV2);
  };

  // Subscribe function for providers to register their callback after a vote decision has been made
  public shared ({ caller }) func subscribe(sub : Types.SubscribeMessage) : async () {
    switch (AuthManager.checkProviderPermission(caller, null, stateV2)) {
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p))();
    };
    ProviderManager.subscribe(caller, sub, stateV2, canistergeekLogger);
  };

  public shared ({ caller }) func subscribePohCallback(
    sub : PohTypes.SubscribePohMessage
  ) : async () {
    switch (AuthManager.checkProviderPermission(caller, null, stateV2)) {
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p))();
    };
    pohEngine.subscribe(caller, sub);
  };

  public shared ({ caller }) func addToAllowList(providerId : Principal) : async () {
    await ProviderManager.addToAllowList(providerId, stateV2, canistergeekLogger);
  };

  // ----------------------Content Related Methods------------------------------
  public query ({ caller }) func getContent(id : Text) : async ?Types.ContentPlus {
    let voteCount = getVoteCount(id, ?caller);
    return ContentManager.getContent(caller, id, voteCount, stateV2);
  };

  public query ({ caller }) func getContentResult(
    id : Text
  ) : async Types.ContentResult {
    let voteCount = getVoteCount(id, ?caller);
    switch (ContentManager.getContent(caller, id, voteCount, stateV2)) {
      case (?result) {
        switch (AuthManager.checkProviderPermission(caller, ?result.providerId, stateV2)) {
          case (#err(error)) return throw Error.reject("Unauthorized");
          case (#ok(p)) {
            let cr = ContentVotingManager.getContentResult(
              result.id,
              result.sourceId,
              result.status,
              voteCount
            );
            return cr;
          };
        };
      };
      case (_) {
        throw Error.reject("Content not found");
      };
    };

    return throw Error.reject("Unknown error when fetching content results");
  };

  public shared ({ caller }) func submitText(
    sourceId : Text,
    text : Text,
    title : ?Text
  ) : async Text {
    if (allowSubmissionFlag == false) {
      throw Error.reject("Submissions are disabled");
    };
    if (ContentManager.checkIfAlreadySubmitted(sourceId, caller, stateV2)) {
      throw Error.reject("Content already submitted");
    };
    switch (AuthManager.checkProviderPermission(caller, null, stateV2)) {
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p))();
    };
    await ProviderManager.checkIfProviderHasEnoughBalance(caller, env, Principal.fromActor(this), stateV2, canistergeekLogger);
    return ContentManager.submitTextOrHtmlContent(
      caller,
      sourceId,
      text,
      title,
      #text,
      contentQueueManager,
      stateV2
    );
  };

  public shared ({ caller }) func submitHtmlContent(
    sourceId : Text,
    htmlContent : Text,
    title : ?Text
  ) : async Text {
    if (allowSubmissionFlag == false) {
      throw Error.reject("Submissions are disabled");
    };
    switch (AuthManager.checkProviderPermission(caller, null, stateV2)) {
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p))();
    };
    if (ContentManager.checkIfAlreadySubmitted(sourceId, caller, stateV2)) {
      throw Error.reject("Content already submitted");
    };
    await ProviderManager.checkIfProviderHasEnoughBalance(caller, env, Principal.fromActor(this), stateV2, canistergeekLogger);
    var contentID = ContentManager.submitTextOrHtmlContent(
      caller,
      sourceId,
      htmlContent,
      title,
      #htmlContent,
      contentQueueManager,
      stateV2
    );
    return contentID;
  };

  public shared ({ caller }) func submitImage(
    sourceId : Text,
    image : [Nat8],
    imageType : Text,
    title : ?Text
  ) : async Text {
    if (allowSubmissionFlag == false) {
      throw Error.reject("Submissions are disabled");
    };
    if (ContentManager.checkIfAlreadySubmitted(sourceId, caller, stateV2)) {
      throw Error.reject("Content already submitted");
    };
    switch (AuthManager.checkProviderPermission(caller, null, stateV2)) {
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p))();
    };
    await ProviderManager.checkIfProviderHasEnoughBalance(caller, env, Principal.fromActor(this), stateV2, canistergeekLogger);
    return ContentManager.submitImage(
      caller,
      sourceId,
      image,
      imageType,
      title,
      contentQueueManager,
      stateV2
    );
  };

  // Retrieve all content for the calling Provider
  public query ({ caller }) func getProviderContent(
    providerId : Principal,
    status : Types.ContentStatus,
    start : Nat,
    end : Nat
  ) : async [Types.ContentPlus] {
    switch (AuthManager.checkProviderPermission(caller, ?providerId, stateV2)) {
      case (#err(error)) return throw Error.reject("Unauthorized");
      case (#ok(p))();
    };
    if (start < 0 or end < 0 or start > end) {
      throw Error.reject("Invalid range");
    };
    return ContentManager.getProviderContent(
      providerId,
      getVoteCount,
      stateV2,
      status,
      start,
      end,
      contentQueueManager
    );
  };

  public query ({ caller }) func getAllContent(status : Types.ContentStatus) : async [
    Types.ContentPlus
  ] {
    switch (AuthManager.checkProfilePermission(caller, #getContent, stateV2)) {
      case (#err(e)) {
        throw Error.reject("Unauthorized");
      };
      case (_)();
    };
    switch (
      pohVerificationRequestHelper(
        Principal.toText(caller),
        Principal.fromActor(this)
      )
    ) {
      case (#ok(verificationResponse)) {
        if (verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user");
        };
      };
      case (#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case (_)();
    };
    return ContentManager.getAllContent(
      caller,
      status,
      getVoteCount,
      contentQueueManager,
      canistergeekLogger,
      stateV2,
      randomizationEnabled
    );
  };

  public query ({ caller }) func getTasks(
    start : Nat,
    end : Nat,
    filterVoted : Bool
  ) : async [Types.ContentPlus] {
    Helpers.logMessage(
      canistergeekLogger,
      "getTasks - provider called with provider ID: " # Principal.toText(caller),
      #info
    );
    switch (AuthManager.checkProfilePermission(caller, #getContent, stateV2)) {
      case (#err(e)) {
        throw Error.reject("Unauthorized");
      };
      case (_)();
    };
    switch (
      pohVerificationRequestHelper(
        Principal.toText(caller),
        Principal.fromActor(this)
      )
    ) {
      case (#ok(verificationResponse)) {
        if (verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user");
        };
      };
      case (#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case (_)();
    };
    switch (
      ContentManager.getTasks(
        caller,
        getVoteCount,
        stateV2,
        start,
        end,
        filterVoted,
        canistergeekLogger,
        contentQueueManager,
        randomizationEnabled
      )
    ) {
      case (#err(e)) {
        throw Error.reject(e);
      };
      case (#ok(tasks)) {
        Helpers.logMessage(
          canistergeekLogger,
          "getTasks - FINISHED - provider called with provider ID: " # Principal.toText(
            caller
          ),
          #info
        );
        return tasks;
      };
    };
  };

  // ----------------------Moderator Methods------------------------------
  public shared ({ caller }) func registerModerator(
    userName : Text,
    email : ?Text,
    pic : ?Types.Image
  ) : async Types.Profile {
    // throw Error.reject("Sign ups are turned off.");

    let profile = await ModeratorManager.registerModerator(
      caller,
      userName,
      email,
      pic,
      stateV2
    );
    // Todo: Remove this after testnet
    await ModWallet.getActor(env).transfer(?ModClubParam.TREASURY_SA, caller, null, ModClubParam.DEFAULT_TEST_TOKENS);
    await storageSolution.registerModerators([caller]);
    contentQueueManager.assignUserIds2QueueId([caller]);
    pohContentQueueManager.assignUserIds2QueueId([caller]);
    return profile;
  };

  public query ({ caller }) func getProfile() : async Types.Profile {
    switch (ModeratorManager.getProfile(caller, stateV2)) {
      case (#ok(p)) {
        return p;
      };
      case (_) {
        throw Error.reject("profile not found");
      };
    };
  };

  public query ({ caller }) func getProfileById(pid : Principal) : async Types.Profile {
    switch (AuthManager.checkProfilePermission(caller, #vote, stateV2)) {
      case (#err(e)) { throw Error.reject("Unauthorized") };
      case (_)();
    };
    switch (ModeratorManager.getProfile(pid, stateV2)) {
      case (#ok(p)) {
        return {
          id = p.id;
          userName = p.userName;
          email = "";
          pic = p.pic;
          role = p.role;
          createdAt = p.createdAt;
          updatedAt = p.updatedAt;
        };
      };
      case (_) {
        throw Error.reject("profile not found");
      };
    };
  };

  public query ({ caller }) func getAllProfiles() : async [Types.Profile] {
    Utils.mod_assert(authGuard.isAdmin(caller), ModSecurity.AccessMode.NotPermitted);
    return ModeratorManager.getAllProfiles(stateV2);
  };

  public shared ({ caller }) func adminUpdateEmail(pid : Principal, email : Text) : async Types.Profile {
    switch (ModeratorManager.adminUpdateEmail(pid, email, stateV2)) {
      case (#ok(moderator)) {
        return moderator;
      };
      case (_) {
        throw Error.reject("profile not found");
      };
    };
  };

  public shared func getModeratorLeaderboard(start : Nat, end : Nat) : async [
    Types.ModeratorLeaderboard
  ] {

    let topUsers = await RSManager.getActor(env).topUsers(start, end);

    switch (
      ModeratorManager.formModeratorLeaderboard(
        topUsers,
        stateV2
      )
    ) {
      case (#ok(leaderboard)) {
        return leaderboard;
      };
      case (#err(#contentNotFound)) {
        throw Error.reject("Content does not exist");
      };
      case (#err(#voteNotFound)) {
        throw Error.reject("Vote does not exist");
      };
      case (_) {
        throw Error.reject("Something went wrong");
      };
    };
  };

  public query ({ caller }) func getActivity(isComplete : Bool) : async [
    Types.Activity
  ] {
    switch (AuthManager.checkProfilePermission(caller, #getActivity, stateV2)) {
      case (#err(e)) { throw Error.reject("Unauthorized") };
      case (_)();
    };
    switch (
      pohVerificationRequestHelper(
        Principal.toText(caller),
        Principal.fromActor(this)
      )
    ) {
      case (#ok(verificationResponse)) {
        if (verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user");
        };
      };
      case (#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case (_)();
    };
    switch (
      ModeratorManager.getActivity(caller, isComplete, getVoteCount, stateV2)
    ) {
      case (#ok(activity)) return activity;
      case (#err(#providerNotFound)) throw Error.reject(
        "Provider does not exist"
      );
      case (#err(#contentNotFound)) throw Error.reject("Content does not exist");
      case (#err(#voteNotFound)) throw Error.reject("Vote does not exist");
      case (_) throw Error.reject("Something went wrong");
    };
  };

  // ----------------------Content Voting Methods------------------------------
  public query ({ caller }) func getVotePerformance() : async Float {
    switch (ContentVotingManager.getVotePerformance(caller, stateV2)) {
      case (#ok(vp)) {
        return vp;
      };
      case (#err(#contentNotFound)) {
        throw Error.reject("Content does not exist");
      };
      case (#err(#voteNotFound)) {
        throw Error.reject("Vote does not exist");
      };
    };
  };

  // Hard coded array of blocked principal IDs
  let blocklist : [Principal] = [
    Principal.fromText("vwg5x-m3nk4-7yemy-scctx-bsh4a-xnkaf-pmomf-2v7ip-worm6-iqlau-oae"),
    Principal.fromText("urbvy-cpagg-qe5fh-fakx4-4kyk5-qajvp-zttg5-bfem2-hcga4-smscd-dqe"),
    Principal.fromText("o6nlf-g3xwf-yocnk-rmssc-vp7pa-j632v-4vbpu-kthme-3ks6w-yb3xz-lqe")
  ];

  public shared ({ caller }) func vote(
    contentId : Types.ContentId,
    decision : Types.Decision,
    violatedRules : ?[Types.RuleId]
  ) : async Text {

    // Temporary solution to block voting
    let blockedCaller = Array.find<Principal>(
      blocklist,
      func(val : Principal) : Bool {
        Principal.equal(val, caller);
      }
    );

    if (blockedCaller != null) {
      throw Error.reject("You are blocked from voting, due to multiple violations of the rules.");
    };

    switch (AuthManager.checkProfilePermission(caller, #vote, stateV2)) {
      case (#err(e)) { throw Error.reject("Unauthorized") };
      case (_)();
    };
    switch (
      pohVerificationRequestHelper(
        Principal.toText(caller),
        Principal.fromActor(this)
      )
    ) {
      case (#ok(verificationResponse)) {
        if (verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user");
        };
      };
      case (#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case (_)();
    };

    var voteCount = getVoteCount(contentId, ?caller);
    Helpers.logMessage(
      canistergeekLogger,
      "vote - User ID: " # Principal.toText(caller) # " approved: " # Bool.toText(
        decision == #approved
      ) # " voting on content ID : " # contentId # " approve count : " # Nat.toText(
        voteCount.approvedCount
      ) # " rejected count : " # Nat.toText(voteCount.rejectedCount),
      #info
    );
    await ContentVotingManager.vote(
      caller,
      env,
      contentId,
      decision,
      violatedRules,
      voteCount,
      stateV2,
      canistergeekLogger,
      contentQueueManager,
      randomizationEnabled,
      Principal.fromActor(this)
    );
  };

  // ----------------------Token Methods------------------------------
  public shared ({ caller }) func unStakeTokens(amount : Nat) : async Text {
    await ModWallet.getActor(env).transfer(?(Principal.toText(caller) # ModClubParam.STAKE_SA), caller, null, Float.fromInt(amount));
    "Unstaked " # Nat.toText(amount) # " tokens";
  };
  //----------------------POH Methods For Providers------------------------------
  public shared ({ caller }) func verifyHumanity(providerUserId : Text) : async PohTypes.PohVerificationResponsePlus {
    switch (pohVerificationRequestHelper(providerUserId, caller)) {
      case (#ok(verificationResponse)) {
        return verificationResponse;
      };
      case (_) {
        throw Error.reject(
          "Either Poh is not configured or POH Callback is not registered for provider."
        );
      };
    };
  };

  private func pohVerificationRequestHelper(
    providerUserId : Text,
    providerId : Principal
  ) : Result.Result<PohTypes.PohVerificationResponsePlus, PohTypes.PohError> {
    if (
      Principal.equal(providerId, Principal.fromActor(this)) and voteManager.isAutoApprovedPOHUser(
        Principal.fromText(providerUserId)
      )
    ) {
      return #ok(
        {
          providerUserId = providerUserId;
          providerId = providerId;
          status = #verified;
          challenges = [];
          requestedAt = null;
          submittedAt = null;
          completedAt = null;
          token = null;
          rejectionReasons = [];
          isFirstAssociation = true;
        }
      );
    };
    let pohVerificationRequest : PohTypes.PohVerificationRequestV1 = {
      requestId = Helpers.generateId(providerId, "pohRequest", stateV2);
      providerUserId = providerUserId;
      providerId = providerId;
    };
    switch (pohEngine.getPohCallback(providerId)) {
      case (#err(er)) {
        return #err(er);
      };
      case (_)();
    };
    // validity and rules needs to come from admin dashboard here
    switch (pohEngine.getProviderPohConfiguration(providerId, stateV2)) {
      case (#ok(providerPohConfig)) {
        let verificationResponse = pohEngine.pohVerificationRequest(
          pohVerificationRequest,
          providerPohConfig.expiry,
          providerPohConfig.challengeIds,
          voteManager.getAllUniqueViolatedRules,
          pohContentQueueManager.getContentStatus
        );
        #ok(verificationResponse);
      };
      case (#err(er)) {
        return #err(er);
      };
    };
  };

  private func findRejectionReasons(userId : Principal, challengeIds : [Text]) : [
    Text
  ] {
    let rejectedPackageId = pohEngine.retrieveRejectedPackageId(
      userId,
      challengeIds,
      pohContentQueueManager.getContentStatus
    );
    switch (rejectedPackageId) {
      case (null) {
        return [];
      };
      case (?id) {
        let violatedRules = voteManager.getAllUniqueViolatedRules(id);
        return pohEngine.resolveViolatedRulesById(violatedRules);
      };
    };
  };

  //----------------------POH Methods For ModClub------------------------------
  // for modclub only

  public shared ({ caller }) func AdminCheckPohVerificationResp(
    providerUserId : Text,
    providerId : Principal
  ) : async PohTypes.PohVerificationResponsePlus {
    switch (pohVerificationRequestHelper(providerUserId, providerId)) {
      case (#ok(verificationResponse)) {
        return verificationResponse;
      };
      case (_) {
        throw Error.reject(
          "Either Poh is not configured or POH Callback is not registered for provider."
        );
      };
    };
  };

  public shared ({ caller }) func verifyUserHumanityForModclub() : async PohTypes.VerifyHumanityResponse {
    // if Modclub hasn't subscribed for POHcallback, subscribe it
    switch (pohEngine.getPohCallback(Principal.fromActor(this))) {
      case (#err(er)) {
        pohEngine.subscribe(
          Principal.fromActor(this),
          { callback = pohCallbackForModclub }
        );
      };
      case (_)();
    };
    let _ = pohEngine.associateProviderUserId2ModclubUserId(
      Principal.fromActor(this),
      Principal.toText(caller),
      caller
    );
    let response = await verifyHumanity(Principal.toText(caller));
    return {
      status = response.status;
      token = response.token;
      rejectionReasons = response.rejectionReasons;
    };
  };

  public shared ({ caller }) func pohCallbackForModclub(
    message : PohTypes.PohVerificationResponsePlus
  ) : () {
    if (caller != Principal.fromActor(this)) {
      throw Error.reject("Unauthorized");
    };
    Helpers.logMessage(
      canistergeekLogger,
      "pohCallbackForModclub - status:  " # pohEngine.statusToString(
        message.status
      ) # " submittedAt: " # Int.toText(Option.get(message.submittedAt, -1)) # " requestedAt: " # Int.toText(
        Option.get(message.requestedAt, -1)
      ) # " completedAt: " # Int.toText(Option.get(message.completedAt, -1)) # "isFirstAssociation: " # Bool.toText(
        message.isFirstAssociation
      ) # "providerUserId: " # message.providerUserId,
      #info
    );
  };

  public shared ({ caller }) func retrieveChallengesForUser(token : Text) : async Result.Result<[PohTypes.PohChallengesAttempt], PohTypes.PohError> {
    switch (pohEngine.decodeToken(token)) {
      case (#err(err)) {
        return #err(err);
      };
      case (#ok(tokenResponse)) {
        let ipRestrictionConfigured = Option.get(
          Trie.get(
            provider2IpRestriction,
            key(tokenResponse.providerId),
            Principal.equal
          ),
          false
        );
        if (ipRestrictionConfigured) {
          let registered = pohEngine.registerIPWithWallet(
            tokenResponse.providerUserId,
            tokenResponse.providerId,
            caller
          );
          if (not registered) {
            return #err(#attemptToCreateMultipleWalletsWithSameIp);
          };
        };
        switch (pohEngine.getProviderPohConfiguration(tokenResponse.providerId, stateV2)) {
          case (#ok(pohConfigForProvider)) {

            switch (
              pohEngine.associateProviderUserId2ModclubUserId(
                tokenResponse.providerId,
                tokenResponse.providerUserId,
                caller
              )
            ) {
              case (#err(err)) {
                return #err(err);
              };
              case (_)();
            };

            let attempts = await pohEngine.retrieveChallengesForUser(
              caller,
              pohConfigForProvider.challengeIds,
              pohConfigForProvider.expiry,
              false
            );
            switch (attempts) {
              case (#ok(atts)) {
                var atleastOneInNotSubmittedStatus = false;
                label l for (att in atts.vals()) {
                  if (att.status == #notSubmitted) {
                    atleastOneInNotSubmittedStatus := true;
                    break l;
                  };
                };
                if (not atleastOneInNotSubmittedStatus) {

                  await pohEngine.issueCallbackToProviders(
                    caller,
                    stateV2,
                    voteManager.getAllUniqueViolatedRules,
                    pohContentQueueManager.getContentStatus,
                    canistergeekLogger
                  );
                };
              };
              case (_)();
            };
            return attempts;
          };
          case (#err(er)) {
            return #err(er);
          };
        };
      };
    };
  };

  public shared ({ caller }) func submitChallengeData(
    pohDataRequest : PohTypes.PohChallengeSubmissionRequest
  ) : async PohTypes.PohChallengeSubmissionResponse {
    // let caller = Principal.fromText("2vxsx-fae");
    let isValid = pohEngine.validateChallengeSubmission(pohDataRequest, caller);
    if (isValid == #ok) {
      let _ = do ? {
        let attemptId = pohEngine.getAttemptId(
          pohDataRequest.challengeId,
          caller
        );
        try {
          let dataCanisterId = await storageSolution.putBlobsInDataCanister(
            attemptId,
            pohDataRequest.challengeDataBlob!,
            pohDataRequest.offset,
            pohDataRequest.numOfChunks,
            pohDataRequest.mimeType,
            pohDataRequest.dataSize
          );
          if (pohDataRequest.offset == pohDataRequest.numOfChunks) {
            //last Chunk coming in
            let _ = pohEngine.changeChallengeTaskStatus(
              pohDataRequest.challengeId,
              caller,
              #pending
            );
            pohEngine.updateDataCanisterId(
              pohDataRequest.challengeId,
              caller,
              dataCanisterId
            );

            let challengePackages = pohEngine.createChallengePackageForVoting(
              caller,
              pohContentQueueManager.getContentStatus,
              stateV2,
              canistergeekLogger
            );
            for (package in challengePackages.vals()) {
              pohContentQueueManager.changeContentStatus(package.id, #new);
              switch (pohEngine.getPohChallengePackage(package.id)) {
                case (null)();
                case (?package) {
                  await pohEngine.issueCallbackToProviders(
                    package.userId,
                    stateV2,
                    voteManager.getAllUniqueViolatedRules,
                    pohContentQueueManager.getContentStatus,
                    canistergeekLogger
                  );
                };
              };
            };
          };
        } catch e {
          if (
            Text.equal(
              Error.message(e),
              ModClubParam.PER_CONTENT_SIZE_EXCEEDED_ERROR
            )
          ) {
            return {
              challengeId = pohDataRequest.challengeId;
              submissionStatus = #submissionDataLimitExceeded;
            };
          } else {
            throw e;
          };
        };
      };
    };
    return {
      challengeId = pohDataRequest.challengeId;
      submissionStatus = isValid;
    };
  };

  // Admin method to create new attempts
  public shared ({ caller }) func resetUserChallengeAttempt(packageId : Text) : async Result.Result<[PohTypes.PohChallengesAttempt], PohTypes.PohError> {
    switch (pohEngine.getPohChallengePackage(packageId)) {
      case (null) {
        throw Error.reject("Package doesn't exist");
      };
      case (?package) {
        let _ = pohEngine.changeChallengePackageStatus(packageId, #rejected);
        pohContentQueueManager.changeContentStatus(packageId, #rejected);
        // when true is passed, validity is not used in the function. so passing 0
        await pohEngine.retrieveChallengesForUser(
          package.userId,
          package.challengeIds,
          0,
          true
        );
      };
    };
  };

  public shared ({ caller }) func populateChallenges() : async () {
    Debug.print("Populating challenges called by: " # Principal.toText(caller));
    pohEngine.populateChallenges();
  };

  public shared ({ caller }) func configurePohForProvider(
    providerId : Principal,
    challengeId : [Text],
    expiry : Nat,
    ipRestriction : Bool
  ) : async () {
    let challengeBuffer = Buffer.Buffer<Text>(challengeId.size());
    for (id in challengeId.vals()) {
      challengeBuffer.add(id);
    };
    stateV2.provider2PohChallengeIds.put(providerId, challengeBuffer);
    stateV2.provider2PohExpiry.put(providerId, expiry);
    provider2IpRestriction := Trie.put(
      provider2IpRestriction,
      key(providerId),
      Principal.equal,
      ipRestriction
    ).0;
  };

  func key(t : Principal) : Trie.Key<Principal> {
    { key = t; hash = Principal.hash(t) };
  };

  public query ({ caller }) func getPohTasks(
    status : Types.ContentStatus,
    start : Nat,
    end : Nat
  ) : async [PohTypes.PohTaskPlus] {
    switch (AuthManager.checkProfilePermission(caller, #getContent, stateV2)) {
      case (#err(e)) {
        throw Error.reject("Unauthorized");
      };
      case (_)();
    };
    switch (
      pohVerificationRequestHelper(
        Principal.toText(caller),
        Principal.fromActor(this)
      )
    ) {
      case (#ok(verificationResponse)) {
        if (verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user");
        };
      };
      case (#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case (_)();
    };

    let pohTaskIds = pohContentQueueManager.getContentIds(
      caller,
      #new,
      randomizationEnabled
    );
    var count : Nat = 0;
    let maxReturn : Nat = end - start + 1;

    // Filter items already voted on
    let items = Buffer.Buffer<Text>(0);
    for (id in pohTaskIds.vals()) {
      var isVoted = voteManager.getVoteCountForPoh(caller, id).hasVoted;
      if (not isVoted) {
        items.add(id);
      };
    };

    let itemsArr = pohEngine.sortPackagesByCreatedDate(items);

    let tasks = Buffer.Buffer<PohTypes.PohTaskPlus>(0);
    var index : Nat = 0;
    for (id in itemsArr.vals()) {
      if (index >= start and index <= end and count < maxReturn) {
        let voteCount = voteManager.getVoteCountForPoh(caller, id);
        let taskDataWrapper = pohEngine.getPohTasks([id]);
        var profileImageUrlSuffix : ?Text = null;
        for (wrapper in taskDataWrapper.vals()) {
          for (data in wrapper.pohTaskData.vals()) {
            if (
              data.challengeType == #selfPic and data.dataCanisterId != null and data.contentId != null
            ) {
              profileImageUrlSuffix := do ? {
                (
                  "canisterId=" # Principal.toText(data.dataCanisterId!) # "&contentId=" # data.contentId!
                );
              };
            };
          };
        };
        let pohPackage = pohEngine.getPohChallengePackage(id);
        switch (pohPackage) {
          case (null)();
          case (?package) {
            let taskPlus = {
              packageId = id;
              status = pohContentQueueManager.getContentStatus(id);
              profileImageUrlSuffix = profileImageUrlSuffix;
              // TODO: change these vote settings
              voteCount = Nat.max(
                voteCount.approvedCount,
                voteCount.rejectedCount
              );
              minVotes = ModClubParam.MIN_VOTE_POH;
              minStake = 0;
              title = null;
              hasVoted = ?voteCount.hasVoted;
              reward = 0.0;
              createdAt = package.createdAt;
              updatedAt = package.updatedAt;
            };
            tasks.add(taskPlus);
            count := count + 1;
          };
        };
      };
      index := index + 1;
    };
    return Buffer.toArray<PohTypes.PohTaskPlus>(tasks);
  };

  public query ({ caller }) func getPohTaskData(packageId : Text) : async Result.Result<PohTypes.PohTaskDataWrapperPlus, PohTypes.PohError> {
    switch (AuthManager.checkProfilePermission(caller, #getContent, stateV2)) {
      case (#err(e)) {
        throw Error.reject("Unauthorized");
      };
      case (_)();
    };
    switch (
      pohVerificationRequestHelper(
        Principal.toText(caller),
        Principal.fromActor(this)
      )
    ) {
      case (#ok(verificationResponse)) {
        if (verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user");
        };
      };
      case (#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case (_)();
    };
    let pohTasks = pohEngine.getPohTasks([packageId]);
    if (pohTasks.size() == 0) {
      return #err(#invalidPackageId);
    };
    let voteCount = voteManager.getVoteCountForPoh(caller, packageId);
    #ok(
      {
        packageId = pohTasks[0].packageId;
        pohTaskData = pohTasks[0].pohTaskData;
        votes = Nat.max(voteCount.approvedCount, voteCount.rejectedCount);
        minVotes = ModClubParam.MIN_VOTE_POH;
        minStake = 0;
        reward = 0.0;
        createdAt = pohTasks[0].createdAt;
        updatedAt = pohTasks[0].updatedAt;
      }
    );
  };

  public query ({ caller }) func getAllPohTasksForAdminUsers(
    status : Types.ContentStatus,
    start : Nat,
    end : Nat,
    userToFetchPOHFor : [Text],
    startDate : Int,
    endDate : Int
  ) : async [PohTypes.PohTaskPlusForAdmin] {
    Utils.mod_assert(authGuard.isAdmin(caller), ModSecurity.AccessMode.NotPermitted);

    // Add item id to buffer
    let items = Buffer.Buffer<Text>(0);
    var useIndexes = true;
    if (userToFetchPOHFor.size() == 0) {
      if (startDate == 0 and endDate == 0) {
        let pohTaskIds = pohContentQueueManager.getContentIds(
          caller,
          status,
          randomizationEnabled
        );
        for (id in pohTaskIds.vals()) {
          items.add(id);
        };
      } else {
        let pohTaskIdsForDateRange = pohEngine.getAllPohIDsForDateRange(
          startDate,
          endDate
        );
        for (id in pohTaskIdsForDateRange.vals()) {
          items.add(id);
        };
      };
    } else {
      let userPrincipalBuff = Buffer.Buffer<Principal>(0);
      for (user in userToFetchPOHFor.vals()) {
        userPrincipalBuff.add(Principal.fromText(user));
      };
      let pohTaskIds = pohEngine.getPohPackageIDForUserList(
        Buffer.toArray<Principal>(userPrincipalBuff)
      );
      for (id in pohTaskIds.vals()) {
        items.add(id);
      };
      useIndexes := false;
    };
    var count : Nat = 0;
    let maxReturn : Nat = end - start + 1;
    let itemsArr = pohEngine.sortPackagesByCreatedDate(items);

    let tasks = Buffer.Buffer<PohTypes.PohTaskPlusForAdmin>(0);
    var index : Nat = 0;
    for (id in itemsArr.vals()) {
      if (
        (useIndexes == false) or (
          index >= start and index <= end and count < maxReturn
        )
      ) {
        let voteCount = voteManager.getVoteCountForPoh(caller, id);
        let taskDataWrapper = pohEngine.getPohTasks([id]);
        var profileImageUrlSuffix : ?Text = null;
        var userModClubId : Text = "";
        var userUserName : Text = "";
        var userEmailId : Text = "";
        var submittedAt : Int = 0;
        var completedOn : Int = 0;
        var pohTaskData = taskDataWrapper[0].pohTaskData;
        for (wrapper in taskDataWrapper.vals()) {
          for (data in wrapper.pohTaskData.vals()) {
            submittedAt := data.submittedAt;
            completedOn := data.completedOn;
            switch (stateV2.profiles.get(data.userId)) {
              case (null)();
              case (?result) {
                userModClubId := Principal.toText(result.id);
                userUserName := result.userName;
                userEmailId := result.email;
              };
            };
            if (
              data.challengeType == #dl and data.dataCanisterId != null and data.contentId != null
            ) {
              profileImageUrlSuffix := do ? {
                (
                  "canisterId=" # Principal.toText(data.dataCanisterId!) # "&contentId=" # data.contentId!
                );
              };
            };
          };
        };
        let pohPackage = pohEngine.getPohChallengePackage(id);
        switch (pohPackage) {
          case (null)();
          case (?package) {
            let taskPlus = {
              packageId = id;
              status = pohContentQueueManager.getContentStatus(id);
              // TODO: change these vote settings
              voteCount = Nat.max(
                voteCount.approvedCount,
                voteCount.rejectedCount
              );
              profileImageUrlSuffix = profileImageUrlSuffix;
              userModClubId = userModClubId;
              userUserName = userUserName;
              userEmailId = userEmailId;
              submittedAt = submittedAt;
              completedOn = completedOn;
              pohTaskData = pohTaskData;
            };
            tasks.add(taskPlus);
            count := count + 1;
          };
        };
      };
      index := index + 1;
    };
    return Buffer.toArray<PohTypes.PohTaskPlusForAdmin>(tasks);
  };

  public query ({ caller }) func getPohTaskDataForAdminUsers(packageId : Text) : async Result.Result<PohTypes.PohTaskDataAndVotesWrapperPlus, PohTypes.PohError> {
    Utils.mod_assert(authGuard.isAdmin(caller), ModSecurity.AccessMode.NotPermitted);

    let pohTasks = pohEngine.getPohTasks([packageId]);
    if (pohTasks.size() == 0) {
      return #err(#invalidPackageId);
    };
    let voteDetails = voteManager.getVotesForPOHBasedOnPackageId(
      packageId,
      stateV2
    );
    #ok(
      {
        packageId = pohTasks[0].packageId;
        pohTaskData = pohTasks[0].pohTaskData;
        voteUserDetails = voteDetails;
        minVotes = ModClubParam.MIN_VOTE_POH;
        minStake = 0;
        reward = 0.0;
        createdAt = pohTasks[0].createdAt;
        updatedAt = pohTasks[0].updatedAt;
      }
    );
  };

  public shared ({ caller }) func getModeratorEmailsForPOHAndSendEmail(emailType : Text) : async () {
    // As email is going to send to all the users who opted in to receive at the time of content submission
    var emailIDsHash = HashMap.HashMap<Text, Nat>(1, Text.equal, Text.hash);
    var voteStateToSend = voteManager.getVoteState();
    if (emailType == "shc") {
      // Sends content email
      var queueStateToSend = contentQueueManager.getQueueState();
      emailIDsHash := emailManager.getModeratorEmailsForContent(
        voteStateToSend,
        queueStateToSend,
        stateV2
      );
    } else {
      // Sends POH email
      var pohContentState = pohContentQueueManager.getQueueState();
      var pohStateToSend = pohEngine.getPOHState();
      emailIDsHash := emailManager.getModeratorEmailsForPOH(
        voteStateToSend,
        pohContentState,
        stateV2,
        pohStateToSend
      );
    };
    for ((email, totalCount) in emailIDsHash.entries()) {
      // "prod" and principal are just place holders to prevent idempotency
      let callResult = await callLambdaToSendEmail(
        email,
        "prod",
        Principal.toText(caller),
        emailType,
        totalCount
      );
    };
  };

  public query ({ caller }) func getCanisterMetrics(
    parameters : Canistergeek.GetMetricsParameters
  ) : async ?Canistergeek.CanisterMetrics {
    if (not Helpers.allowedCanistergeekCaller(caller)) {
      throw Error.reject("Unauthorized");
    };
    canistergeekMonitor.getMetrics(parameters);
  };

  public shared ({ caller }) func collectCanisterMetrics() : async () {
    if (not Helpers.allowedCanistergeekCaller(caller)) {
      throw Error.reject("Unauthorized");
    };
    canistergeekMonitor.collectMetrics();
  };

  public query ({ caller }) func getCanisterLog(
    request : ?LoggerTypesModule.CanisterLogRequest
  ) : async ?LoggerTypesModule.CanisterLogResponse {
    if (not Helpers.allowedCanistergeekCaller(caller)) {
      throw Error.reject("Unauthorized");
    };
    Helpers.logMessage(
      canistergeekLogger,
      "Log from canister Log method.",
      #info
    );
    canistergeekLogger.getLog(request);
  };

  public shared ({ caller }) func votePohContent(
    packageId : Text,
    decision : Types.Decision,
    violatedRules : [Types.PohRulesViolated]
  ) : async () {

    switch (AuthManager.checkProfilePermission(caller, #vote, stateV2)) {
      case (#err(e)) {
        throw Error.reject("Unauthorized");
      };
      case (_)();
    };
    switch (
      pohVerificationRequestHelper(
        Principal.toText(caller),
        Principal.fromActor(this)
      )
    ) {
      case (#ok(verificationResponse)) {
        if (verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user.");
        };
      };
      case (#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case (_)();
    };
    // let holdings = tokens.getHoldings(caller);
    // if (holdings.stake < ModClubParam.MIN_STAKE_POH) {
    //   throw Error.reject("Not enough tokens staked");
    // };
    if (voteManager.checkPohUserHasVoted(caller, packageId)) {
      throw Error.reject("You have already voted");
    };
    if (pohContentQueueManager.getContentStatus(packageId) != #new) {
      throw Error.reject("Vote has been finalized.");
    };

    if (pohEngine.validateRules(violatedRules) == false) {
      throw Error.reject("Valid rules not provided.");
    };

    let finishedVoting = await voteManager.votePohContent(
      caller,
      env,
      packageId,
      decision,
      violatedRules,
      pohContentQueueManager
    );
    if (finishedVoting == #ok(true)) {
      Helpers.logMessage(
        canistergeekLogger,
        "Voting completed for packageId: " # packageId,
        #info
      );
      let finalDecision = pohContentQueueManager.getContentStatus(packageId);
      let votesId = voteManager.getPOHVotesId(packageId);
      var contentIds : [Text] = [];
      if (finalDecision == #approved) {
        contentIds := pohEngine.changeChallengePackageStatus(
          packageId,
          #verified
        );
        Helpers.logMessage(
          canistergeekLogger,
          "Voting completed for packageId: " # packageId # " Final decision: approved",
          #info
        );
      } else {
        contentIds := pohEngine.changeChallengePackageStatus(
          packageId,
          #rejected
        );
        Helpers.logMessage(
          canistergeekLogger,
          "Voting completed for packageId: " # packageId # " Final decision: rejected",
          #info
        );
      };
      // mark content not accessible
      for (cId in contentIds.vals()) {
        await storageSolution.markContentNotAccessible(cId);
      };
      // should be taken out to some job
      // TODO: Take out to helper function as it's used twice in the codebase
      let rewardingVotes = Buffer.Buffer<VoteTypes.VoteV2>(1);
      let usersToRewardRS = Buffer.Buffer<RSTypes.UserAndVote>(1);
      for (id in votesId.vals()) {
        switch (voteManager.getPOHVote(id)) {
          case (null)();
          case (?v) {
            var votedCorrect = false;
            if (
              (v.decision == #approved and finalDecision == #approved) or (
                v.decision == #rejected and finalDecision == #rejected
              )
            ) {
              if (v.level != #novice) {
                rewardingVotes.add(v);
              };
              votedCorrect := true;
            } else {
              votedCorrect := false;
            };
            usersToRewardRS.add({
              userId = v.userId;
              votedCorrect = votedCorrect;
              decision = v.decision;
            });
          };
        };
      };

      var sumRS = 0.0;
      for (userVote in rewardingVotes.vals()) {
        sumRS := sumRS + userVote.rsBeforeVoting;
      };

      let usersToRewardMOD = Buffer.Buffer<WalletTypes.UserAndAmount>(1);
      let CT : Float = ModClubParam.CS * Float.fromInt(ModClubParam.MIN_VOTE_POH);
      for (userVote in rewardingVotes.vals()) {
        usersToRewardMOD.add({
          fromSA = ?(Principal.toText(Principal.fromActor(this)) # ModClubParam.ACCOUNT_PAYABLE);
          toOwner = userVote.userId;
          toSA = null;
          amount = (userVote.rsBeforeVoting * ModClubParam.GAMMA_M * CT) / sumRS;
        });
      };
      let _ = await RSManager.getActor(env).updateRSBulk(Buffer.toArray<RSTypes.UserAndVote>(usersToRewardRS));
      // moderator dist and treasury dist
      usersToRewardMOD.add({
        fromSA = ?(Principal.toText(Principal.fromActor(this)) # ModClubParam.ACCOUNT_PAYABLE);
        toOwner = Principal.fromActor(this);
        toSA = ?ModClubParam.TREASURY_SA;
        amount = (ModClubParam.GAMMA_T * CT);
      });
      let _ = await ModWallet.getActor(env).transferBulk(Buffer.toArray<WalletTypes.UserAndAmount>(usersToRewardMOD));
      // burn
      let _ = await ModWallet.getActor(env).burn(
        ?(Principal.toText(Principal.fromActor(this)) # ModClubParam.ACCOUNT_PAYABLE),
        (ModClubParam.GAMMA_B * CT)
      );

      // inform all providers
      switch (pohEngine.getPohChallengePackage(packageId)) {
        case (null)();
        case (?package) {
          await pohEngine.issueCallbackToProviders(
            package.userId,
            stateV2,
            voteManager.getAllUniqueViolatedRules,
            pohContentQueueManager.getContentStatus,
            canistergeekLogger
          );
        };
      };
    };
  };

  public shared ({ caller }) func issueJwt() : async Text {
    Debug.print("Issue JWT called by " # Principal.toText(caller));
    switch (AuthManager.checkProfilePermission(caller, #vote, stateV2)) {
      case (#err(e)) {
        throw Error.reject("Unauthorized");
      };
      case (_)();
    };
    Debug.print("Issue JWT Check user humanity " # Principal.toText(caller));
    switch (
      pohVerificationRequestHelper(
        Principal.toText(caller),
        Principal.fromActor(this)
      )
    ) {
      case (#ok(verificationResponse)) {
        if (verificationResponse.status != #verified) {
          throw Error.reject("Proof of Humanity not completed user");
        };
      };
      case (#err(#pohNotConfiguredForProvider)) {
        throw Error.reject("Poh Not configured for provider.");
      };
      case (_)();
    };
    let message = Principal.toText(caller) # "." # Int.toText(Helpers.timeNow());
    let signature = Helpers.generateHash(message # signingKey);
    let base32Message = Helpers.encodeBase32(message);
    switch (base32Message) {
      case (null) {
        throw Error.reject("Jwt creation failed");
      };
      case (?b32Message) {
        return b32Message # "." # signature;
      };
    };
  };

  // Helpers
  public shared ({ caller }) func adminInit() : async () {
    await generateSigningKey();
    await populateChallenges();
  };

  public shared ({ caller }) func retiredDataCanisterIdForWriting(
    canisterId : Text
  ) {
    storageSolution.retiredDataCanisterId(canisterId);
  };

  public shared ({ caller }) func getAllDataCanisterIds() : async (
    [Principal],
    [Text]
  ) {
    let allDataCanisterId = storageSolution.getAllDataCanisterIds();
    let retired = storageSolution.getRetiredDataCanisterIdsStable();
    (allDataCanisterId, retired);
  };

  // Return the principal identifier of this canister.
  public func whoami() : async Principal {
    Principal.fromActor(this);
  };

  public query func getDeployer() : async Principal {
    return deployer;
  };

  public shared ({ caller }) func addProviderAdmin(
    userId : Principal,
    userName : Text,
    providerId : ?Principal
  ) : async Types.ProviderResult {
    Debug.print("addProviderAdmin caller: " # Principal.toText(caller));

    let result = await ProviderManager.addProviderAdmin(
      userId,
      userName,
      caller,
      providerId,
      stateV2,
      authGuard.isAdmin(caller),
      canistergeekLogger
    );
    return result;
  };

  public shared ({ caller }) func getProviderAdmins(providerId : Principal) : async [
    Types.Profile
  ] {
    Debug.print("getProviderAdmins caller: " # Principal.toText(caller));
    return ProviderManager.getProviderAdmins(providerId, stateV2);
  };

  public shared ({ caller }) func removeProviderAdmin(
    providerId : Principal,
    providerAdminPrincipalIdToBeRemoved : Principal
  ) : async Types.ProviderResult {

    return await ProviderManager.removeProviderAdmin(
      providerId,
      providerAdminPrincipalIdToBeRemoved,
      caller,
      stateV2,
      authGuard.isAdmin(caller),
      canistergeekLogger
    );
  };

  public shared ({ caller }) func editProviderAdmin(
    providerId : Principal,
    providerAdminPrincipalIdToBeEdited : Principal,
    newUserName : Text
  ) : async Types.ProviderResult {

    return await ProviderManager.editProviderAdmin(
      providerId,
      providerAdminPrincipalIdToBeEdited,
      newUserName,
      caller,
      authGuard.isAdmin(caller),
      stateV2
    );
  };

  public query ({ caller }) func getAdminProviderIDs() : async [Principal] {
    return ProviderManager.getAdminProviderIDs(
      caller,
      stateV2,
      canistergeekLogger
    );
  };

  public shared ({ caller }) func getPohAttempts() : async PohStateV2.PohStableState {
    pohEngine.getStableStateV2().0;
  };

  public shared ({ caller }) func shuffleContent() : async () {
    contentQueueManager.shuffleContent();
    contentQueueManager.assignUserIds2QueueId(
      Iter.toArray(stateV2.profiles.keys())
    );
  };

  public shared ({ caller }) func shufflePohContent() : async () {
    pohContentQueueManager.shuffleContent();
    pohContentQueueManager.assignUserIds2QueueId(
      Iter.toArray(stateV2.profiles.keys())
    );
  };

  private func createContentObj(
    sourceId : Text,
    caller : Principal,
    contentType : Types.ContentType,
    title : ?Text
  ) : Types.Content {
    let now = Helpers.timeNow();
    let content : Types.Content = {
      id = Helpers.generateId(caller, "content", stateV2);
      providerId = caller;
      contentType = contentType;
      status = #new;
      sourceId = sourceId;
      title = title;
      createdAt = now;
      updatedAt = now;
    };
    return content;
  };

  private func getVoteCount(contentId : Types.ContentId, caller : ?Principal) : Types.VoteCount {
    var voteApproved : Nat = 0;
    var voteRejected : Nat = 0;
    var hasVoted : Bool = false;
    let violatedRulesCount = HashMap.HashMap<Types.RuleId, Nat>(
      1,
      Text.equal,
      Text.hash
    );
    for (vid in stateV2.content2votes.get0(contentId).vals()) {
      switch (stateV2.votes.get(vid)) {
        case (?v) {
          if (v.level != #novice) {
            if (v.decision == #approved) {
              voteApproved += 1;
            } else {
              voteRejected += 1;
            };
          };
          // if caller is null, consider it as modclub calling it so that operation evaluates to false
          // simplifies switch braches
          if (not hasVoted) {
            hasVoted := Principal.equal(
              Option.get(caller, Principal.fromActor(this)),
              v.userId
            );
          };
          for (vRuleId in Option.get(v.violatedRules, []).vals()) {
            violatedRulesCount.put(
              vRuleId,
              Option.get(violatedRulesCount.get(vRuleId), 0) + 1
            );
          };
        };
        case (_)();
      };
    };

    return {
      approvedCount = voteApproved;
      rejectedCount = voteRejected;
      hasVoted = hasVoted;
      violatedRulesCount = violatedRulesCount;
    };
  };

  public shared ({ caller }) func setRandomization(isRandom : Bool) : async () {
    randomizationEnabled := isRandom;
  };

  public shared ({ caller }) func getTaskStats(from : Int) : async (
    Nat,
    Nat,
    Nat,
    Nat
  ) {
    let approvedStats = getContentCountFrom(
      contentQueueManager.getUserContentQueue(caller, #approved, false),
      from
    );
    let rejectedStats = getContentCountFrom(
      contentQueueManager.getUserContentQueue(caller, #rejected, false),
      from
    );
    let newStats = getContentCountFrom(
      contentQueueManager.getUserContentQueue(caller, #new, false),
      from
    );

    for (userId in rejectedStats.1. keys()) {
      approvedStats.1. put(userId, null);
    };
    for (userId in newStats.1. keys()) {
      approvedStats.1. put(userId, null);
    };

    (approvedStats.0, rejectedStats.0, newStats.0, approvedStats.1. size());
  };

  func getContentCountFrom(
    contentQueue : HashMap.HashMap<Text, ?Text>,
    from : Int
  ) : (Nat, HashMap.HashMap<Principal, ?Text>) {
    var count = 0;
    let distinctUsersVoted = HashMap.HashMap<Principal, ?Text>(
      1,
      Principal.equal,
      Principal.hash
    );
    for (cid in contentQueue.keys()) {
      switch (stateV2.content.get(cid)) {
        case (null)();
        case (?con) {
          if (con.createdAt >= from) {
            count := count + 1;
            for (vId in stateV2.content2votes.get0(con.id).vals()) {
              switch (stateV2.votes.get(vId)) {
                case (null)();
                case (?v) {
                  distinctUsersVoted.put(v.userId, null);
                };
              };
            };
          };
        };
      };
    };
    return (count, distinctUsersVoted);
  };

  // For testing purposes
  public query ({ caller }) func showAdmins() : async [Principal] {
    Utils.mod_assert(authGuard.isAdmin(caller), ModSecurity.AccessMode.NotPermitted);
    authGuard.getAdmins();
  };

  // Upgrade logic / code
  stable var provider2IpRestriction : Trie.Trie<Principal, Bool> = Trie.empty();
  // Delete here after deployment
  stable var stateSharedV1 : StateV1.StateShared = StateV1.emptyShared();
  stable var stateSharedV2 : StateV2.StateShared = StateV2.emptyShared();

  system func preupgrade() {
    Debug.print("MODCLUB PREUPGRRADE");
    stateSharedV2 := StateV2.fromState(stateV2);
    tokensStableV1 := tokens.getStableV1();

    storageStateStable := storageSolution.getStableState();
    retiredDataCanisterId := storageSolution.getRetiredDataCanisterIdsStable();
    let pohCombinedStableState = pohEngine.getStableStateV2();
    pohStableStateV2 := pohCombinedStableState.0;
    pohCallbackDataByProvider := pohCombinedStableState.1;
    provider2ProviderUserId2Ip := pohCombinedStableState.2;
    provider2Ip2Wallet := pohCombinedStableState.3;
    pohVoteStableStateV2 := voteManager.getStableState();
    emailStableState := emailManager.getStableState();
    _canistergeekMonitorUD := ?canistergeekMonitor.preupgrade();
    _canistergeekLoggerUD := ?canistergeekLogger.preupgrade();
    contentQueueStateStable := ?contentQueueManager.preupgrade();
    pohContentQueueStateStable := ?pohContentQueueManager.preupgrade();
    Debug.print("MODCLUB PREUPGRRADE FINISHED");
  };

  stable var migrationDone = false;
  stable var globalStateMigrationDone = false;
  system func postupgrade() {

    authGuard.subscribe("admins");

    // Reinitializing storage Solution to add "this" actor as a controller
    // Refactor after deploy and state migrated.
    admins := authGuard.setUpDefaultAdmins(
      admins,
      deployer,
      Principal.fromActor(this)
    );
    storageSolution := StorageSolution.StorageSolution(
      storageStateStable,
      retiredDataCanisterId,
      admins,
      signingKey
    );
    Debug.print("MODCLUB POSTUPGRADE");

    // Delete from here after deployment
    if (not globalStateMigrationDone) {
      stateSharedV2 := migrateStateV1toV2(stateSharedV1, stateSharedV2);
      globalStateMigrationDone := true;
    };
    stateSharedV1 := StateV1.emptyShared();
    // Delete upto here
    stateV2 := StateV2.toState(stateSharedV2);
    stateSharedV2 := StateV2.emptyShared();

    tokensStableV1 := Token.emptyStableV1(ModClubParam.getModclubWallet());
    storageStateStable := StorageState.emptyStableState();
    retiredDataCanisterId := [];

    pohStableStateV2 := PohStateV2.emptyStableState();
    // Delete from here after deployment
    if (not migrationDone) {
      pohVoteStableStateV2 := voteManager.migrateV1ToV2(pohVoteStableState, pohVoteStableStateV2);
      voteManager := VoteManager.VoteManager(pohVoteStableStateV2);
      migrationDone := true;
    };
    pohVoteStableState := VoteState.emptyStableState();
    // Delete upto here
    pohVoteStableStateV2 := VoteStateV2.emptyStableState();
    emailStableState := EmailState.emptyStableState();

    // This statement should be run after the storagestate gets restored from stable stateV2
    storageSolution.setInitialModerators(ModeratorManager.getModerators(stateV2));
    canistergeekMonitor.postupgrade(_canistergeekMonitorUD);
    _canistergeekMonitorUD := null;
    canistergeekLogger.postupgrade(_canistergeekLoggerUD);
    _canistergeekLoggerUD := null;

    contentQueueManager.postupgrade(contentQueueStateStable, canistergeekLogger);
    pohContentQueueManager.postupgrade(
      pohContentQueueStateStable,
      canistergeekLogger
    );
    contentQueueStateStable := null;
    canistergeekLogger.setMaxMessagesCount(3000);
    Debug.print("MODCLUB POSTUPGRADE FINISHED");
  };

  var nextRunTime = Time.now();
  let FIVE_MIN_NANO_SECS = 300000000000;

  var nextTokenReleaseTime = Time.now();
  let TWENTY_FOUR_HOUR_NANO_SECS = 86400000000000;

  // TODO: change heartbeat to timer
  system func heartbeat() : async () {
    if (Time.now() > nextRunTime) {
      Debug.print("Running Metrics Collection");
      canistergeekMonitor.collectMetrics();
      nextRunTime := Time.now() + FIVE_MIN_NANO_SECS;
      var pohEmailSend = getModeratorEmailsForPOHAndSendEmail("p");
      var contentEmailSend = getModeratorEmailsForPOHAndSendEmail("shc");
    };

    // TODO: reduce Token release every x year as per tokenomics
    if (Time.now() > nextTokenReleaseTime) {
      let _ = await ModWallet.getActor(env).transfer(?ModClubParam.RESERVE_SA, Principal.fromActor(this), ?ModClubParam.TREASURY_SA, ModClubParam.MOD_RELEASE_PER_DAY);
      nextTokenReleaseTime := Time.now() + TWENTY_FOUR_HOUR_NANO_SECS;
    };
  };

  system func inspect({
    arg : Blob;
    caller : Principal;
    msg : MsgInspectTypes.ModclubCanisterMethods;
  }) : Bool {
    switch (msg) {
      case (#toggleAllowSubmission _) { authGuard.isAdmin(caller) };
      case (#generateSigningKey _) { authGuard.isAdmin(caller) };
      case (#addToAllowList _) { authGuard.isAdmin(caller) };
      case (#adminUpdateEmail _) { authGuard.isAdmin(caller) };
      case (#AdminCheckPohVerificationResp _) { authGuard.isAdmin(caller) };
      case (#resetUserChallengeAttempt _) { authGuard.isAdmin(caller) };
      case (#populateChallenges _) { authGuard.isAdmin(caller) };
      case (#configurePohForProvider _) { authGuard.isAdmin(caller) };
      case (#adminInit _) { authGuard.isAdmin(caller) };
      case (#retiredDataCanisterIdForWriting _) { authGuard.isAdmin(caller) };
      case (#getAllDataCanisterIds _) { authGuard.isAdmin(caller) };
      case (#getPohAttempts _) { authGuard.isAdmin(caller) };
      case (#shuffleContent _) { authGuard.isAdmin(caller) };
      case (#shufflePohContent _) { authGuard.isAdmin(caller) };
      case (#getTaskStats _) { authGuard.isAdmin(caller) };
      case (#setRandomization _) { authGuard.isAdmin(caller) };
      case (#sendVerificationEmail _) { not authGuard.isAnonymous(caller) };
      case (#registerModerator _) { not authGuard.isAnonymous(caller) };
      case (#handleSubscription _) { authGuard.isModclubAuth(caller) };
      case _ { not Principal.isAnonymous(caller) };
    };
  };

  public query ({ caller }) func http_request(request : Types.HttpRequest) : async Types.HttpResponse {
    return {
      status_code = 200;
      headers = [];
      body = Text.encodeUtf8("Upgrading");
      streaming_strategy = null;
      upgrade = ?true;
    };
  };

  public shared ({ caller }) func http_request_update(request : Types.HttpRequest) : async Types.HttpResponse {
    var ip = "";
    for ((name, value) in request.headers.vals()) {
      if (name == "x-real-ip") {
        ip := value;
      };
    };

    var token = "";

    switch (Text.stripStart(request.url, #text("/ipRegister?"))) {
      case (null)();
      case (?params) {
        let fields : Iter.Iter<Text> = Text.split(params, #text("&"));
        for (field : Text in fields) {
          let kv : [Text] = Iter.toArray<Text>(Text.split(field, #text("=")));
          if (kv[0] == "token") {
            token := kv[1];
          };
        };
      };
    };
    if (ip == "" or token == "") {
      return {
        status_code = 400;
        headers = [];
        body = Text.encodeUtf8("IP or token couldn't be found");
        streaming_strategy = null;
        upgrade = null;
      };
    };
    Debug.print(ip);
    Debug.print(token);
    var ipRestrictionConfigured = false;
    var providerId = Principal.fromText("aaaaa-aa");
    var providerUserId = "";
    switch (pohEngine.decodeToken(token)) {
      case (#err(err)) {
        return {
          status_code = 400;
          headers = [];
          body = Text.encodeUtf8("Invalid token.");
          streaming_strategy = null;
          upgrade = null;
        };
      };
      case (#ok(providerAndUserData)) {
        providerId := providerAndUserData.providerId;
        providerUserId := providerAndUserData.providerUserId;
        ipRestrictionConfigured := Option.get(
          Trie.get(
            provider2IpRestriction,
            key(providerId),
            Principal.equal
          ),
          false
        );
      };
    };
    if (ipRestrictionConfigured) {
      let registed = pohEngine.registerIPWithProviderUser(
        providerUserId,
        ip,
        providerId
      );
      if (not registed) {
        return {
          status_code = 500;
          headers = [];
          body = Text.encodeUtf8("Token is already associated.");
          streaming_strategy = null;
          upgrade = null;
        };
      };
    };
    {
      status_code = 200;
      headers = [];
      body = Text.encodeUtf8("Token Associated with IP.");
      streaming_strategy = null;
      upgrade = null;
    };
  };

  public query ({ caller }) func downloadSupport(
    stateName : Text,
    varName : Text,
    start : Nat,
    end : Nat
  ) : async [[Text]] {
    if (Principal.toText(caller) == "edc6a-bltzx-3jexk-vn7wo-xrpzh-hazpe-fibv6-gqgqx-gkff6-la6uj-gae") {
      switch (stateName) {
        case ("pohState") {
          return pohEngine.downloadSupport(varName, start, end);
        };
        case ("contentQueueState") {
          return contentQueueManager.downloadSupport(varName, start, end);
        };
        case ("pohContentQueueState") {
          return pohContentQueueManager.downloadSupport(varName, start, end);
        };
        case ("pohVoteState") {
          return voteManager.downloadSupport(varName, start, end);
        };
        case ("storageState") {
          return storageSolution.downloadSupport(varName, start, end);
        };
        case ("stateV2") {
          return DownloadSupport.download(stateV2, varName, start, end);
        };
        case (_) {
          throw Error.reject("Invalid stateV2");
        };
      };
    };
    throw Error.reject("Unauthorized");
  };

  public query func transform(raw : Types.TransformArgs) : async Types.CanisterHttpResponsePayload {
    let transformed : Types.CanisterHttpResponsePayload = {
      status = raw.response.status;
      body = raw.response.body;
      headers = [
        {
          name = "Content-Security-Policy";
          value = "default-src 'self'";
        },
        { name = "Referrer-Policy"; value = "strict-origin" },
        { name = "Permissions-Policy"; value = "geolocation=(self)" },
        {
          name = "Strict-Transport-Security";
          value = "max-age=63072000";
        },
        { name = "X-Frame-Options"; value = "DENY" },
        { name = "X-Content-Type-Options"; value = "nosniff" }
      ];
    };
    transformed;
  };

  private func callLambdaToSendEmail(
    userEmail : Text,
    envForBaseURL : Text,
    userPrincipalText : Text,
    emailType : Text,
    totalContents : Nat
  ) : async Bool {

    let host : Text = "bgl2dihq47pqfjtth2odwdakcm0cislr.lambda-url.us-east-1.on.aws";
    var minCycles : Nat = 210244050000;
    // prepare system http_request call

    let request_headers = [
      { name = "Content-Type"; value = "application/json" },
      {
        name = "Authorization";
        value = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MRs";
      }
    ];
    let url = "https://" # host # "/";

    let body : JSON.JSON = #Object([
      ("userEmail", #String(userEmail)),
      ("emailType", #String(emailType)),
      ("envForURL", #String(envForBaseURL)),
      ("count", #String(Nat.toText(totalContents))),
      ("userPrincipalText", #String(userPrincipalText))
    ]);
    let DATA_POINTS_PER_API : Nat64 = 200;
    let MAX_RESPONSE_BYTES : Nat64 = 10 * 6 * DATA_POINTS_PER_API;

    let transform_context : Types.TransformContext = {
      function = transform;
      context = Blob.fromArray([]);
    };

    let request : Types.CanisterHttpRequestArgs = {
      url = url;
      headers = request_headers;
      body = ?Blob.toArray(Text.encodeUtf8(JSON.show(body)));
      method = #post;
      max_response_bytes = ?MAX_RESPONSE_BYTES;
      transform = ?transform_context;
    };
    try {
      // Dynamically add cycles based on the useremail characters
      minCycles += (100000 * Text.size(userEmail));
      Cycles.add(minCycles);
      let ic : Types.IC = actor ("aaaaa-aa");
      let response : Types.CanisterHttpResponsePayload = await ic.http_request(request);
      switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
        case null {
          throw Error.reject("Remote response had no body.");
        };
        case (?body) {
          return true;
        };
      };
      return false;
    } catch (err) {
      throw Error.reject(Error.message(err));
    };
  };

  // Delete after deployment
  private func migrateStateV1toV2(stateSharedV1 : StateV1.StateShared, stateSharedV2 : StateV2.StateShared) : StateV2.StateShared {

    let buff = Buffer.Buffer<(Text, Types.VoteV2)>(pohVoteStableState.pohVotes.size());
    for ((voteId, vote) in stateSharedV1.votes.vals()) {
      buff.add((
        voteId,
        {
          id = vote.id;
          contentId = vote.contentId;
          userId = vote.userId;
          decision = vote.decision;
          rsBeforeVoting = 0;
          level = #novice;
          violatedRules = vote.violatedRules;
          createdAt = vote.createdAt;
        }
      ));
    };

    return {
      GLOBAL_ID_MAP = stateSharedV1.GLOBAL_ID_MAP;
      providers = stateSharedV1.providers;
      providerSubs = stateSharedV1.providerSubs;
      providersWhitelist = stateSharedV1.providersWhitelist;
      providerAdmins = stateSharedV1.providerAdmins;
      airdropUsers = stateSharedV1.airdropUsers;
      airdropWhitelist = stateSharedV1.airdropWhitelist;
      profiles = stateSharedV1.profiles;
      usernames = stateSharedV1.usernames;
      content = stateSharedV1.content;
      rules = stateSharedV1.rules;
      votes = Buffer.toArray<(Text, Types.VoteV2)>(buff);
      textContent = stateSharedV1.textContent;
      imageContent = stateSharedV1.imageContent;
      content2votes = stateSharedV1.content2votes;
      mods2votes = stateSharedV1.mods2votes;
      provider2content = stateSharedV1.provider2content;
      provider2rules = stateSharedV1.provider2rules;
      admin2Provider = stateSharedV1.admin2Provider;
      appName = stateSharedV1.appName;
      providerAllowedForAIFiltering = stateSharedV1.providerAllowedForAIFiltering;
      provider2PohChallengeIds = stateSharedV1.provider2PohChallengeIds;
      provider2PohExpiry = stateSharedV1.provider2PohExpiry;
    };
  };

};
