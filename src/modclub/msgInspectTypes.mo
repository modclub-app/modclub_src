import LoggerTypesModule "../common/canistergeek/logger/typesModule";
import Canistergeek "../common/canistergeek/canistergeek";
import CommonTypes "../common/types";
import PohTypes "./service/poh/types";
import ICRCTypes "../common/ICRCTypes";
import Types "./types";
import Principal "mo:base/Principal";

module {

  public type ModclubCanisterMethods = {
    #burn : () -> (?ICRCTypes.Subaccount, Nat);
    #subscribeOnAdmins : () -> ();
    #showAdmins : () -> ();
    #handleSubscription : () -> CommonTypes.ConsumerPayload;
    #AdminCheckPohVerificationResp : () -> (Text, Principal);
    #addProviderAdmin : () -> (Principal, Text, ?Principal);
    #topUpProviderReserve : () -> ({ providerId : ?Principal; amount : Nat });
    #providerSaBalance : () -> (Text, ?Principal);
    #addRules : () -> ([Text], ?Principal);
    #addToApprovedUser : () -> Principal;
    #addToAllowList : () -> Principal;
    #adminInit : () -> ();
    #adminUpdateEmail : () -> (Principal, Text);
    #canClaimLockedReward : () -> ?ICRCTypes.Tokens;
    #checkIfUserOptToReciveAlerts : () -> ();
    #claimLockedReward : () -> (ICRCTypes.Tokens, ?Principal);
    #claimStakedTokens : () -> ICRCTypes.Tokens;
    #collectCanisterMetrics : () -> ();
    #configurePohForProvider : () -> (Principal, [Text], Nat, Bool);
    #createPohVoteReservation : () -> (Text);
    #isReservedPOHContent : () -> (Text);
    #deregisterProvider : () -> ();
    #downloadSupport : () -> (Text, Text, Nat, Nat);
    #editProviderAdmin : () -> (Principal, Principal, Text);
    #generateSigningKey : () -> ();
    #getActivity : () -> Bool;
    #getAdminProviderIDs : () -> ();
    #getAdmins : () -> ();
    #getAllContent : () -> Types.ContentStatus;
    #getAllDataCanisterIds : () -> ();
    #getAllPohTasksForAdminUsers : () -> (Types.ContentStatus, Nat, Nat, [Text], Int, Int);
    #getAllProfiles : () -> ();
    #getAllUsersWantToReceiveAlerts : () -> ();
    #getCanisterLog : () -> ?LoggerTypesModule.CanisterLogRequest;
    #getCanisterMetrics : () -> Canistergeek.GetMetricsParameters;
    #getContent : () -> Text;
    #getContentResult : () -> Text;
    #getDeployer : () -> ();
    #getModeratorEmailsForPOHAndSendEmail : () -> Text;
    #getModeratorLeaderboard : () -> (Nat, Nat);
    #getPohAttempts : () -> ();
    #getPohTaskData : () -> Text;
    #getPohTaskDataForAdminUsers : () -> Text;
    #getPohTasks : () -> (Types.ContentStatus, Nat, Nat);
    #getProfile : () -> ();
    #getProfileById : () -> Principal;
    #getProvider : () -> Principal;
    #getProviderAdmins : () -> Principal;
    #getProviderContent : () -> (Principal, Types.ContentStatus, Nat, Nat);
    #getProviderRules : () -> ();
    #getProviderSa : () -> (Text, ?Principal);
    #getReservedByContentId : () -> Text;
    #getRules : () -> Principal;
    #getTaskStats : () -> Int;
    #getTasks : () -> (Nat, Nat, Bool);
    #getVotePerformance : () -> ();
    #http_request : () -> Types.HttpRequest;
    #http_request_update : () -> Types.HttpRequest;
    #isUserAdmin : () -> ();
    #canReserveContent : () -> Text;
    #issueJwt : () -> ();
    #pohCallbackForModclub : () -> PohTypes.PohVerificationResponsePlus;
    #populateChallenges : () -> ();
    #registerAdmin : () -> Principal;
    #registerModerator : () -> (Text, ?Text);
    #setLambdaToken : () -> (Text);
    #registerProvider : () -> (Text, Text, ?Types.Image);
    #registerUserToReceiveAlerts : () -> (Principal, Bool);
    #releaseTokens : () -> ICRCTypes.Tokens;
    #removeProviderAdmin : () -> (Principal, Principal);
    #removeRules : () -> ([Types.RuleId], ?Principal);
    #resetUserChallengeAttempt : () -> Text;
    #retiredDataCanisterIdForWriting : () -> Text;
    #retrieveChallengesForUser : () -> Text;
    #sendVerificationEmail : () -> Text;
    #setRandomization : () -> Bool;
    #reserveContent : () -> Text;
    #setVoteParamsForLevel : () -> (Int, Types.Level);
    #shuffleContent : () -> ();
    #shufflePohContent : () -> ();
    #stakeTokens : () -> Nat;
    #submitChallengeData : () -> PohTypes.PohChallengeSubmissionRequest;
    #submitHtmlContent : () -> (Text, Text, ?Text);
    #submitImage : () -> (Text, [Nat8], Text, ?Text);
    #submitText : () -> (Text, Text, ?Text);
    #subscribe : () -> Types.SubscribeMessage;
    #subscribePohCallback : () -> PohTypes.SubscribePohMessage;
    #toggleAllowSubmission : () -> Bool;
    #transform : () -> Types.TransformArgs;
    #unregisterAdmin : () -> Text;
    #updateProvider : () -> (Principal, Types.ProviderMeta);
    #updateProviderLogo : () -> (Principal, [Nat8], Text);
    #updateRules : () -> ([Types.Rule], ?Principal);
    #updateSettings : () -> (Principal, Types.ProviderSettings);
    #verifyHumanity : () -> Text;
    #verifyUserHumanityForModclub : () -> ();
    #vote : () -> (Types.ContentId, Types.Decision, ?[Types.RuleId]);
    #votePohContent : () -> (Text, Types.Decision, [Types.PohRulesViolated]);
    #whoami : () -> ();
    #importAccounts : () -> Types.AccountsImportPayload;
    #translateUserPoints : () -> ();
    #getImportedUsersStats : () -> ();
    #withdrawModeratorReward : () -> (ICRCTypes.Tokens, ?Principal);
    #validate : () -> Any;
    #setModclubBuckets : () -> ();
    #associateAccount : () -> (Text, Types.ImportProfile, Int);
    #generateAssocMetadata : () -> ();
    #validateAssocHash : () -> (Principal, Text, Text);
  };

};
