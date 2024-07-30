import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Float "mo:base/Float";
import Canistergeek "../../../common/canistergeek/canistergeek";
import Debug "mo:base/Debug";
import GlobalState "../../statev2";
import Helpers "../../../common/helpers";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Order "mo:base/Order";
import Principal "mo:base/Principal";
import QueueManager "../queue/queue";
import Rel "../../data_structures/Rel";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Blob "mo:base/Blob";
import Text "mo:base/Text";
import Types "../../types";
import ContentState "./state";
import Utils "../../../common/utils";
import Constants "../../../common/constants";
import ContentTypes "types";
import Reserved "reserved";
import Error "mo:base/Error";
import StorageSolution "../storage/storage";
import ModClubParams "../parameters/params";

module ContentModule {

  public func getContent(
    userId : Principal,
    contentId : Text,
    voteCount : Types.VoteCount,
    globalState : GlobalState.State,
    storage : StorageSolution.StorageSolution,
    content2Category : HashMap.HashMap<Types.ContentId, Types.CategoryId>
  ) : ?Types.ContentPlus {
    switch (globalState.content.get(contentId)) {
      case (?content) {
        switch (globalState.providers.get(content.providerId)) {
          case (?provider) {
            let result : Types.ContentPlus = {
              id = content.id;
              providerName = provider.name;
              minStake = provider.settings.minStaked;
              requiredVotes = provider.settings.requiredVotes;
              voteCount = Nat.max(
                voteCount.approvedCount,
                voteCount.rejectedCount
              );
              hasVoted = ?voteCount.hasVoted;
              providerId = content.providerId;
              contentType = content.contentType;
              contentCategory = Option.get<Types.CategoryId>(content2Category.get(content.id), "");
              status = content.status;
              sourceId = content.sourceId;
              title = content.title;
              createdAt = content.createdAt;
              updatedAt = content.updatedAt;
              text = ?"";
              image = ?{ data = []; imageType = "" };
              contentCanisterId = storage.dataCanisterId(content.id);
              voteParameters = content.voteParameters;
              reservedList = content.reservedList;
              receipt = content.receipt;
            };
            return ?result;
          };
          case (_) null;
        };
      };
      case (_) null;
    };
  };

  public func submitTextOrHtmlContent(
    arg : ContentTypes.TextOrHtmlContentArg,
    common : ContentTypes.CommonArg
  ) : async Text {
    let content = createContentObj(
      {
        sourceId = arg.sourceId;
        caller = common.caller;
        contentType = arg.contentType;
        title = arg.title;
        voteParam = arg.voteParam;
      },
      common.globalState,
      common.contentState
    );
    let chunks = Utils.textToBChunks(arg.text);
    var offset = 0;
    for (chunk in Buffer.toArray<Blob>(chunks).vals()) {
      offset += 1;
      ignore await common.storageSolution.putBlobsInDataCanister(
        content.id,
        chunk,
        offset,
        chunks.size(),
        Constants.DATA_TYPE_PLAIN_TEXT,
        Array.size(Blob.toArray(chunk))
      );
    };

    let textContent : Types.TextContent = {
      id = content.id;
      text = ""; // For backward compatibility in StableState
    };

    // Store and update relationships
    common.globalState.content.put(content.id, content);
    common.globalState.provider2content.put(common.caller, content.id);
    common.globalState.textContent.put(content.id, textContent);

    arg.contentQueueManager.changeContentStatus(content.id, #new);
    return content.id;
  };

  public func submitImage(
    arg : ContentTypes.ImageContentArg,
    common : ContentTypes.CommonArg
  ) : async Text {
    let contentT : Types.ContentType = #imageBlob;
    let content = createContentObj(
      {
        sourceId = arg.sourceId;
        caller = common.caller;
        contentType = contentT;
        title = arg.title;
        voteParam = arg.voteParam;
      },
      common.globalState,
      common.contentState
    );
    let imageContent : Types.ImageContent = {
      id = content.id;
      image = {
        data = []; // For backward compatibility in StableState
        imageType = arg.imageType;
      };
    };

    let chunks = Utils.bytesToBChunks(arg.image);
    var offset = 0;
    for (chunk in Buffer.toArray<Blob>(chunks).vals()) {
      offset += 1;
      ignore await common.storageSolution.putBlobsInDataCanister(
        content.id,
        chunk,
        offset,
        chunks.size(),
        arg.imageType,
        Array.size(Blob.toArray(chunk))
      );
    };

    // Store and update relationships
    common.globalState.content.put(content.id, content);
    common.globalState.imageContent.put(content.id, imageContent);
    common.globalState.provider2content.put(common.caller, content.id);
    arg.contentQueueManager.changeContentStatus(content.id, #new);
    return content.id;
  };

  public func getProviderContent(
    arg : ContentTypes.ProviderContentArg,
    content2Category : HashMap.HashMap<Types.ContentId, Types.CategoryId>
  ) : Buffer.Buffer<Types.ContentPlus> {
    let buf = Buffer.Buffer<Types.ContentPlus>(0);
    let maxReturn : Nat = arg.end - arg.start;
    var count : Nat = 0;
    var index : Nat = 0;
    for (cid in arg.globalState.provider2content.get0(arg.providerId).vals()) {
      if ((index >= arg.start and index <= arg.end and count < maxReturn)) {
        switch (arg.contentQueueManager.getContentQueueByStatus(arg.status).get(cid)) {
          case (null)();
          case (?result) {
            let voteCount = arg.getVoteCount(cid, ?arg.providerId);
            switch (getContentPlus(cid, ?arg.providerId, voteCount, arg.globalState, content2Category)) {
              case (?cp) {
                if (cp.status == arg.status) {
                  buf.add(cp);
                  count := count + 1;
                };
              };
              case (_)();
            };
          };
        };
      };
      index := index + 1;
    };
    buf;
  };

  public func getProviderContentSummaries(
    providerId : Principal,
    globalState : GlobalState.State,
    content2Category : HashMap.HashMap<Types.ContentId, Types.CategoryId>,
    getVoteCount : (Types.ContentId, ?Principal) -> Types.VoteCount
  ) : Types.ProviderSummaries {
    var totalRejected : Nat = 0;
    var totalApproved : Nat = 0;
    var totalCost : Nat = 0;

    for (cid in globalState.provider2content.get0(providerId).vals()) {
      let voteCount = getVoteCount(cid, ?providerId);
      switch (getContentPlus(cid, ?providerId, voteCount, globalState, content2Category)) {
        case (?cp) {
          let taskCost = cp.receipt.cost;
          let requiredVotes = cp.voteParameters.requiredVotes;
          let oneVoteCost = Option.get(Nat.fromText(Int.toText(taskCost / requiredVotes)), 0);
          switch (cp.status) {
            case (#approved) {
              totalCost += oneVoteCost * cp.voteCount;
              totalApproved += 1;
            };
            case (#rejected) {
              totalCost += oneVoteCost * cp.voteCount;
              totalRejected += 1;
            };
            case (_) {};
          };
        };
        case (_) {};
      };
    };
    return {
      totalApproved;
      totalRejected;
      totalCost;
    };
  };

  public func getProviderPendingContentSummaries(
    providerId : Principal,
    globalState : GlobalState.State,
    content2Category : HashMap.HashMap<Types.ContentId, Types.CategoryId>,
    getVoteCount : (Types.ContentId, ?Principal) -> Types.VoteCount
  ) : Types.ProviderPendingSummaries {
    var totalPending : Nat = 0;
    var totalCost : Nat = 0;

    for (cid in globalState.provider2content.get0(providerId).vals()) {
      let voteCount = getVoteCount(cid, ?providerId);
      switch (getContentPlus(cid, ?providerId, voteCount, globalState, content2Category)) {
        case (?cp) {
          let taskCost = cp.receipt.cost;
          switch (cp.status) {
            case (#new) {
              totalCost += taskCost;
              totalPending += 1;
            };
            case (_) {};
          };
        };
        case (_) {};
      };
    };
    return {
      totalPending;
      totalCost;
    };
  };

  public func getAllContent(
    caller : Principal,
    status : Types.ContentStatus,
    getVoteCount : (Types.ContentId, ?Principal) -> Types.VoteCount,
    contentQueueManager : QueueManager.QueueManager,
    logger : Canistergeek.Logger,
    globalState : GlobalState.State,
    randomizationEnabled : Bool,
    storage : StorageSolution.StorageSolution,
    content2Category : HashMap.HashMap<Types.ContentId, Types.CategoryId>
  ) : async [Types.ContentPlus] {
    let buf = Buffer.Buffer<Types.ContentPlus>(0);
    var count = 0;
    let contentQueue = contentQueueManager.getUserContentQueue(
      caller,
      status,
      randomizationEnabled
    );

    for (cid in contentQueue.keys()) {
      if (count < 11) {
        let voteCount = getVoteCount(cid, ?caller);
        let cp = getContentPlus(cid, ?caller, voteCount, globalState, content2Category);
        switch (cp) {
          case (?result) {
            buf.add(result);
            count := count + 1;
          };
          case (_)();
        };
      };
    };

    return Array.sort(buf.toArray(), sortAscPlus);
  };

  func compareContent(a : Types.Content, b : Types.Content) : Order.Order {
    if (a.updatedAt > b.updatedAt) {
      #greater;
    } else if (a.updatedAt < b.updatedAt) {
      #less;
    } else {
      #equal;
    };
  };
  func sortAsc(a : Types.Content, b : Types.Content) : Order.Order {
    if (a.updatedAt > b.updatedAt) {
      #greater;
    } else if (a.updatedAt < b.updatedAt) {
      #less;
    } else {
      #equal;
    };
  };
  func sortAscPlus(a : Types.ContentPlus, b : Types.ContentPlus) : Order.Order {
    if (a.updatedAt > b.updatedAt) {
      #greater;
    } else if (a.updatedAt < b.updatedAt) {
      #less;
    } else {
      #equal;
    };
  };
  func sortDesc(a : Types.Content, b : Types.Content) : Order.Order {
    if (a.updatedAt < b.updatedAt) {
      #greater;
    } else if (a.updatedAt > b.updatedAt) {
      #less;
    } else {
      #equal;
    };
  };

  func compareContentPlus(a : Types.ContentPlus, b : Types.ContentPlus) : Order.Order {
    if (a.updatedAt > b.updatedAt) {
      #greater;
    } else if (a.updatedAt < b.updatedAt) {
      #less;
    } else {
      #equal;
    };
  };

  func createContentObj(
    arg : ContentTypes.ContentArg,
    globalState : GlobalState.State,
    contentState : ContentState.ContentStateStable
  ) : Types.Content {
    let now = Helpers.timeNow();
    let reserved : [Types.Reserved] = [];
    let cost = ModClubParams.CS * Float.fromInt(arg.voteParam.requiredVotes);
    let rp : Types.Receipt = createReceipt({ caller = arg.caller; globalState; contentState }, Float.toInt(cost));
    let content : Types.Content = {
      id = Helpers.generateId(arg.caller, "content", globalState);
      providerId = arg.caller;
      contentType = arg.contentType;
      status = #new;
      sourceId = arg.sourceId;
      title = arg.title;
      createdAt = now;
      updatedAt = now;
      voteParameters = arg.voteParam;
      reservedList = reserved;
      receipt = rp;
    };
    return content;
  };
  public func getReservation(profileId : Text, reservedsList : [Types.Reserved]) : async ?Types.Reserved {
    let list = Array.filter<Types.Reserved>(reservedsList, func x = x.profileId == profileId);
    let now = Helpers.timeNow();
    return Array.find<Types.Reserved>(list, func x = x.reservedExpiryTime > now);
  };

  public func createReservation(
    contentId : Text,
    voteCount : Types.VoteCount,
    arg : ContentTypes.CommonArg,
    content2Category : HashMap.HashMap<Types.ContentId, Types.CategoryId>
  ) : async Types.Reserved {
    switch (arg.globalState.content.get(contentId)) {
      case (?content) {
        switch (getContentPlus(contentId, ?arg.caller, voteCount, arg.globalState, content2Category)) {
          case (?contentPlus) {
            let oldReserved : [Types.Reserved] = contentPlus.reservedList;
            let rid = Helpers.getContentReservationId(arg.caller, contentId);
            let reserved = Utils.isReserved(rid, oldReserved);
            if (reserved == true) {
              throw Error.reject("Already create");
            };
            let now = Helpers.timeNow();
            let spot = contentPlus.voteParameters.requiredVotes - (voteCount.approvedCount + voteCount.rejectedCount);
            let isReservationsAvailable = hasAvailableSpot(oldReserved, now, spot);
            if (isReservationsAvailable == false) {
              throw Error.reject("No more reservations available, please try again later"); // Debug for future bug resolve
            };
            let reservation = takeReservation(
              {
                caller = arg.caller;
                globalState = arg.globalState;
                contentState = arg.contentState;
                storageSolution = arg.storageSolution;
              },
              contentId
            );
            let newReserved = Array.append<Types.Reserved>(oldReserved, [reservation]);
            let result : Types.ContentPlus = {
              id = contentPlus.id;
              providerName = contentPlus.providerName;
              minStake = contentPlus.minStake;
              requiredVotes = contentPlus.requiredVotes;
              voteCount = contentPlus.voteCount;
              hasVoted = ?voteCount.hasVoted;
              providerId = contentPlus.providerId;
              contentType = contentPlus.contentType;
              contentCategory = Option.get<Types.CategoryId>(content2Category.get(contentId), "");
              status = contentPlus.status;
              sourceId = contentPlus.sourceId;
              title = contentPlus.title;
              createdAt = contentPlus.createdAt;
              updatedAt = contentPlus.updatedAt;
              text = contentPlus.text;
              image = contentPlus.image;
              contentCanisterId = contentPlus.contentCanisterId;
              voteParameters = contentPlus.voteParameters;
              reservedList = newReserved;
              receipt = contentPlus.receipt;
            };
            arg.globalState.content.put(content.id, result);
            return reservation;
          };
          case (_) throw Error.reject("No ContentPlus found");
        };
      };
      case (_) throw Error.reject("Content Incorrect");
    };

  };

  private func takeReservation(
    arg : ContentTypes.CommonArg,
    contentId : Text
  ) : Types.Reserved {
    let state = Reserved.ContentStateManager(arg.contentState);
    let rid = Helpers.getContentReservationId(arg.caller, contentId);
    let reserved = state.takeReservation(rid, arg.caller, Constants.RESERVE_EXPIRE_TIME);
    return reserved;
  };

  public func createReceipt(
    arg : ContentTypes.CreateReceiptArg,
    cost : Int
  ) : Types.Receipt {
    let state = Reserved.ContentStateManager(arg.contentState);
    let receipt = state.createReceipt(arg.caller, arg.globalState, cost);
    return receipt;
  };

  public func hasAvailableSpot(reservedsList : [Types.Reserved], now : Types.Timestamp, requiredVote : Int) : Bool {
    let list = Utils.getNonExpiredList(reservedsList, now);
    if (list.size() == requiredVote) {
      return false;
    };
    return true;
  };

  func getContentPlus(
    contentId : Types.ContentId,
    caller : ?Principal,
    voteCount : Types.VoteCount,
    globalState : GlobalState.State,
    content2Category : HashMap.HashMap<Types.ContentId, Types.CategoryId>
  ) : ?Types.ContentPlus {
    switch (globalState.content.get(contentId)) {
      case (?content) {
        switch (globalState.providers.get(content.providerId)) {
          case (?provider) {
            let cost = switch (content.receipt.cost == 10) {
              // workaround for wrong cost calculation on old-tasks
              case (true) {
                Float.toInt(ModClubParams.CS * Float.fromInt(content.voteParameters.requiredVotes));
              };
              case (false) { content.receipt.cost };
            };
            let result : Types.ContentPlus = {
              id = content.id;
              providerName = provider.name;
              minStake = provider.settings.minStaked;
              requiredVotes = provider.settings.requiredVotes;
              voteCount = Nat.max(
                voteCount.approvedCount,
                voteCount.rejectedCount
              );
              hasVoted = ?voteCount.hasVoted;
              providerId = content.providerId;
              contentType = content.contentType;
              contentCategory = Option.get<Types.CategoryId>(content2Category.get(content.id), "");
              status = content.status;
              sourceId = content.sourceId;
              title = content.title;
              createdAt = content.createdAt;
              updatedAt = content.updatedAt;
              text = ?"";
              image = ?{ data = []; imageType = "" };
              contentCanisterId = null;
              voteParameters = content.voteParameters;
              reservedList = content.reservedList;
              receipt = {
                id = content.receipt.id;
                cost;
                createdAt = content.receipt.createdAt;
              };
            };
            return ?result;
          };
          case (_) null;
        };
      };
      case (_) null;
    };
  };

  // Retrieves only new content that needs to be approved ( i.e tasks )
  public func getTasks(
    arg : ContentTypes.TasksArg,
    filters : Types.ModerationTasksFilter,
    indexes : HashMap.HashMap<Text, Buffer.Buffer<Types.ContentId>>,
    content2Category : HashMap.HashMap<Types.ContentId, Types.CategoryId>
  ) : Result.Result<[Types.ContentPlus], Text> {
    if (arg.start < 0 or arg.end < 0 or arg.start > arg.end) {
      return #err("Invalid range");
    };
    let hasFilters = Option.isSome(filters.categories) or Option.isSome(filters.providers);
    let whitelist = Helpers.getContentFilteringWhitelist(filters, indexes);

    let result = Buffer.Buffer<Types.ContentPlus>(0);
    let items = Buffer.Buffer<Types.Content>(0);
    var count : Nat = 0;
    let maxReturn : Nat = arg.end - arg.start;
    let contentQueue = arg.contentQueueManager.getUserContentQueue(
      arg.caller,
      #new,
      arg.randomizationEnabled
    );

    for (cid in contentQueue.keys()) {
      if (not hasFilters or Helpers.isWhitelisted(whitelist, cid)) {
        switch (arg.globalState.content.get(cid)) {
          case (?content) {
            if (arg.filterVoted) {
              let voteCount = arg.getVoteCount(cid, ?arg.caller);
              if (voteCount.hasVoted != true) {
                items.add(content);
              };
            } else {
              items.add(content);
            };
          };
          case (_)();
        };
      };
    };

    var index : Nat = 0;
    for (content in Array.sort(Buffer.toArray<Types.Content>(items), sortAsc).vals()) {
      if (index >= arg.start and index <= arg.end and count < maxReturn) {
        let voteCount = arg.getVoteCount(content.id, ?arg.caller);
        switch (getContentPlus(content.id, ?arg.caller, voteCount, arg.globalState, content2Category)) {
          case (?content) {
            result.add(content);
            count := count + 1;
          };
          case (_)();
        };
      };
      index := index + 1;
    };
    return #ok(Buffer.toArray<Types.ContentPlus>(result));
  };

  public func canReserveContent(contentId : Text, caller : Principal, globalState : GlobalState.State) : async Result.Result<Bool, Text> {
    switch (globalState.content.get(contentId)) {
      case (null) { return #err("Invalid Content") };
      case (?content) {
        let requiredVote = content.voteParameters.requiredVotes;
        let activeReservations = Utils.getNonExpiredList(content.reservedList, Helpers.timeNow());
        let rid = Helpers.getContentReservationId(caller, contentId);
        let isReserved = Utils.isReserved(rid, activeReservations);
        if (activeReservations.size() == requiredVote or isReserved) {
          return #ok(false);
        };
        return #ok(true);
      };
    };

  };

  public func checkIfAlreadySubmitted(
    sourceId : Text,
    providerId : Principal,
    globalState : GlobalState.State
  ) : Bool {
    for (cid in globalState.provider2content.get0(providerId).vals()) {
      switch (globalState.content.get(cid)) {
        case (?content) {
          if (content.sourceId == sourceId) {
            return true;
          };
        };
        case (_)();
      };
    };
    return false;
  };

};
