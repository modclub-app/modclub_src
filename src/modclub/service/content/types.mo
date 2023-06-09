import Principal "mo:base/Principal";
import Types "../../types";
import QueueManager "../queue/queue";
import ContentState "./state";
import GlobalState "../../statev2";
import Canistergeek "../../canistergeek/canistergeek";
import CommonTypes "../../../common/types";
import HashMap "mo:base/HashMap";

module {
  public type ReservedArg = {
    caller : Principal;
    profileId : Text;
    now : ?Types.Timestamp;
    reservedExpiryTime : ?Types.Timestamp;
  };

  public type CommonArg = {
    caller : Principal;
    globalState : GlobalState.State;
    contentState : ContentState.ContentStateStable;
  };

  public type TextOrHtmlContentArg = {
    sourceId : Text;
    text : Text;
    title : ?Text;
    voteParam : Types.VoteParameters;
    contentType : Types.ContentType;
    contentQueueManager : QueueManager.QueueManager;
  };
  public type ImageContentArg = {
    sourceId : Text;
    image : [Nat8];
    imageType : Text;
    title : ?Text;
    voteParam : Types.VoteParameters;
    contentQueueManager : QueueManager.QueueManager;
  };
  public type ContentArg = {
    sourceId : Text;
    caller : Principal;
    contentType : Types.ContentType;
    title : ?Text;
    voteParam : Types.VoteParameters;
  };

  public type TasksArg = {
    caller : Principal;
    getVoteCount : (Types.ContentId, ?Principal) -> Types.VoteCount;
    globalState : GlobalState.State;
    start : Nat;
    end : Nat;
    filterVoted : Bool;
    logger : Canistergeek.Logger;
    contentQueueManager : QueueManager.QueueManager;
    randomizationEnabled : Bool;
  };

  public type ProviderContentArg = {
    providerId : Principal;
    getVoteCount : (Types.ContentId, ?Principal) -> Types.VoteCount;
    globalState : GlobalState.State;
    status : Types.ContentStatus;
    start : Nat;
    end : Nat;
    contentQueueManager : QueueManager.QueueManager;
  };

  public type VoteArg = {
    userId : Principal;
    env : CommonTypes.ENV;
    contentId : Types.ContentId;
    decision : Types.Decision;
    violatedRules : ?[Types.RuleId];
    voteCount : Types.VoteCount;
    state : GlobalState.State;
    logger : Canistergeek.Logger;
    contentQueueManager : QueueManager.QueueManager;
    randomizationEnabled : Bool;
    modclubCanisterId : Principal;
  };

  public type EvaluateVoteArg = {
    content : Types.Content;
    env : CommonTypes.ENV;
    aCount : Nat;
    rCount : Nat;
    modclubCanisterId : Principal;
    violatedRulesCount : HashMap.HashMap<Text, Nat>;
    state : GlobalState.State;
    logger : Canistergeek.Logger;
    contentQueueManager : QueueManager.QueueManager;
  };

  public type RewardCalculationArg = {
    content : Types.Content;
    env : CommonTypes.ENV;
    state : GlobalState.State;
    logger : Canistergeek.Logger;
    modclubCanisterId : Principal;
    decision : Types.Decision;
    requiredVotes : Nat;
  };
};
