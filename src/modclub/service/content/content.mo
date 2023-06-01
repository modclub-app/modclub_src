import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Canistergeek "../../canistergeek/canistergeek";
import Debug "mo:base/Debug";
import GlobalState "../../statev2";
import Helpers "../../helpers";
import Nat "mo:base/Nat";
import Order "mo:base/Order";
import Principal "mo:base/Principal";
import QueueManager "../queue/queue";
import Rel "../../data_structures/Rel";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Types "../../types";
import ContentState "./state";
import Utils "../../../common/utils";
import Constant "constant";
import ContentTypes "types";
import Reserved "reserved";
import Error "mo:base/Error";

module ContentModule {

  public func getContent(
    userId : Principal,
    contentId : Text,
    voteCount : Types.VoteCount,
    state : GlobalState.State
  ) : ?Types.ContentPlus {
    return getContentPlus(contentId, ?userId, voteCount, state);
  };

  public func submitTextOrHtmlContent(
    caller : Principal,
    sourceId : Text,
    text : Text,
    title : ?Text,
    voteParam : Types.VoteParameters,
    contentType : Types.ContentType,
    contentQueueManager : QueueManager.QueueManager,
    globalState : GlobalState.State,
    contentState : ContentState.ContentStateStable
  ) : Text {
    let content = createContentObj(sourceId, caller, contentType, title, voteParam, globalState, contentState);
    let textContent : Types.TextContent = {
      id = content.id;
      text = text;
    };
    // Store and update relationships
    globalState.content.put(content.id, content);
    globalState.textContent.put(content.id, textContent);
    globalState.provider2content.put(caller, content.id);
    contentQueueManager.changeContentStatus(content.id, #new);
    return content.id;
  };

  public func submitImage(
    caller : Principal,
    sourceId : Text,
    image : [Nat8],
    imageType : Text,
    title : ?Text,
    voteParam : Types.VoteParameters,
    contentQueueManager : QueueManager.QueueManager,
    globalState : GlobalState.State,
    contentState : ContentState.ContentStateStable
  ) : Text {
    let contentT : Types.ContentType = #imageBlob;
    let content = createContentObj(sourceId, caller, contentT, title, voteParam, globalState, contentState);
    let imageContent : Types.ImageContent = {
      id = content.id;
      image = {
        data = image;
        imageType = imageType;
      };
    };
    // Store and update relationships
    globalState.content.put(content.id, content);
    globalState.imageContent.put(content.id, imageContent);
    globalState.provider2content.put(caller, content.id);
    contentQueueManager.changeContentStatus(content.id, #new);
    return content.id;
  };

  public func getProviderContent(
    providerId : Principal,
    getVoteCount : (Types.ContentId, ?Principal) -> Types.VoteCount,
    globalState : GlobalState.State,
    status : Types.ContentStatus,
    start : Nat,
    end : Nat,
    contentQueueManager : QueueManager.QueueManager
  ) : [Types.ContentPlus] {
    let buf = Buffer.Buffer<Types.ContentPlus>(0);
    let maxReturn : Nat = end - start;
    var count : Nat = 0;
    var index : Nat = 0;
    for (cid in globalState.provider2content.get0(providerId).vals()) {
      if ((index >= start and index <= end and count < maxReturn)) {
        switch (contentQueueManager.getContentQueueByStatus(status).get(cid)) {
          case (null)();
          case (?result) {
            let voteCount = getVoteCount(cid, ?providerId);
            switch (getContentPlus(cid, ?providerId, voteCount, globalState)) {
              case (?result) {
                if (result.status == status) {
                  buf.add(result);
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
    Buffer.toArray<Types.ContentPlus>(buf);
  };

  public func getAllContent(
    caller : Principal,
    status : Types.ContentStatus,
    getVoteCount : (Types.ContentId, ?Principal) -> Types.VoteCount,
    contentQueueManager : QueueManager.QueueManager,
    logger : Canistergeek.Logger,
    globalState : GlobalState.State,
    randomizationEnabled : Bool
  ) : [Types.ContentPlus] {
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
        switch (getContentPlus(cid, ?caller, voteCount, globalState)) {
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
    sourceId : Text,
    caller : Principal,
    contentType : Types.ContentType,
    title : ?Text,
    voteParam : Types.VoteParameters,
    globalState : GlobalState.State,
    contentState : ContentState.ContentStateStable
  ) : Types.Content {
    let now = Helpers.timeNow();
    let reserved : [Types.Reserved] = [];
    let rp : Types.Receipt = createReceipt(caller, globalState, 10, contentState);
    let content : Types.Content = {
      id = Helpers.generateId(caller, "content", globalState);
      providerId = caller;
      contentType = contentType;
      status = #new;
      sourceId = sourceId;
      title = title;
      createdAt = now;
      updatedAt = now;
      voteParameters = voteParam;
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
    caller : Principal,
    contentId : Text,
    voteCount : Types.VoteCount,
    globalState : GlobalState.State,
    contentState : ContentState.ContentStateStable
  ) : async () {
    switch (globalState.content.get(contentId)) {
      case (?content) {
        let contentPlus : ?Types.ContentPlus = getContentPlus(contentId, ?caller, voteCount, globalState);
        switch (contentPlus) {
          case (?provider) {
            let oldReserved : [Types.Reserved] = provider.reservedList;
            let reserved = Utils.isReserved(Principal.toText(caller), oldReserved);
            if (reserved == true) {
              throw Error.reject("Already create");
            };
            let now = Helpers.timeNow();
            let checkExpire = hasAvailableSpot(oldReserved, now, provider.voteParameters.requiredVotes);
            if (checkExpire == false) {
              throw Error.reject("No spot left");
            };
            let reservation = await takeReservation(caller, globalState, Constant.EXPIRE_TIME, contentState);
            let newReserved = Array.append<Types.Reserved>(oldReserved, [reservation]);
            let result : Types.ContentPlus = {
              id = provider.id;
              providerName = provider.providerName;
              minStake = provider.minStake;
              requiredVotes = provider.requiredVotes;
              voteCount = provider.voteCount;
              hasVoted = ?voteCount.hasVoted;
              providerId = provider.providerId;
              contentType = provider.contentType;
              status = provider.status;
              sourceId = provider.sourceId;
              title = provider.title;
              createdAt = provider.createdAt;
              updatedAt = provider.updatedAt;
              text = do ? {
                switch (globalState.textContent.get(content.id)) {
                  case (?x) x.text;
                  case (_) "";
                };
              };
              image = do ? {
                switch (globalState.imageContent.get(content.id)) {
                  case (?x) x.image;
                  case (null) {
                    { data = []; imageType = "" };
                  };
                };
              };
              voteParameters = provider.voteParameters;
              reservedList = newReserved;
              receipt = provider.receipt;
            };
            globalState.content.put(content.id, result);
          };
          case (_) throw Error.reject("Provider incorrect");
        };
      };
      case (_) throw Error.reject("Content Incorrect");
    };

  };

  private func takeReservation(
    caller : Principal,
    globalState : GlobalState.State,
    expireTime : Types.Timestamp,
    contentState : ContentState.ContentStateStable
  ) : async Types.Reserved {
    let state = Reserved.ContentStateManager(contentState);
    let reserved = await state.takeReservation(caller, globalState, expireTime);
    return reserved;
  };

  public func createReceipt(
    caller : Principal,
    globalState : GlobalState.State,
    cost : Int,
    contentState : ContentState.ContentStateStable
  ) : Types.Receipt {
    let state = Reserved.ContentStateManager(contentState);
    let receipt = state.createReceipt(caller, globalState, cost);
    return receipt;
  };

  public func hasAvailableSpot(reservedsList : [Types.Reserved], now : Types.Timestamp, requiredVote : Int) : Bool {
    let list = Utils.getNonExpiredList(reservedsList, now);
    if (reservedsList.size() >= requiredVote) {
      return false;
    };
    return true;
  };

  func getContentPlus(
    contentId : Types.ContentId,
    caller : ?Principal,
    voteCount : Types.VoteCount,
    globalState : GlobalState.State
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
              status = content.status;
              sourceId = content.sourceId;
              title = content.title;
              createdAt = content.createdAt;
              updatedAt = content.updatedAt;
              text = do ? {
                switch (globalState.textContent.get(content.id)) {
                  case (?x) x.text;
                  case (_) "";
                };
              };
              image = do ? {
                switch (globalState.imageContent.get(content.id)) {
                  case (?x) x.image;
                  case (null) {
                    { data = []; imageType = "" };
                  };
                };
              };
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

  // Retrieves only new content that needs to be approved ( i.e tasks )
  public func getTasks(
    caller : Principal,
    getVoteCount : (Types.ContentId, ?Principal) -> Types.VoteCount,
    globalState : GlobalState.State,
    start : Nat,
    end : Nat,
    filterVoted : Bool,
    logger : Canistergeek.Logger,
    contentQueueManager : QueueManager.QueueManager,
    randomizationEnabled : Bool
  ) : Result.Result<[Types.ContentPlus], Text> {
    if (start < 0 or end < 0 or start > end) {
      return #err("Invalid range");
    };
    let result = Buffer.Buffer<Types.ContentPlus>(0);
    let items = Buffer.Buffer<Types.Content>(0);
    var count : Nat = 0;
    let maxReturn : Nat = end - start;
    let contentQueue = contentQueueManager.getUserContentQueue(
      caller,
      #new,
      randomizationEnabled
    );

    for (cid in contentQueue.keys()) {
      switch (globalState.content.get(cid)) {
        case (?content) {
          if (filterVoted) {
            let voteCount = getVoteCount(cid, ?caller);
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

    var index : Nat = 0;
    for (content in Array.sort(Buffer.toArray<Types.Content>(items), sortAsc).vals()) {
      if (index >= start and index <= end and count < maxReturn) {
        let voteCount = getVoteCount(content.id, ?caller);
        switch (getContentPlus(content.id, ?caller, voteCount, globalState)) {
          case (?content) {
            result.add(content);
            count := count + 1;
          };
          case (_)();
        };
      };
      index := index + 1;
    };
    Debug.print(
      "Sending getTasks Resposnse for user: " # Principal.toText(caller)
    );
    return #ok(Buffer.toArray<Types.ContentPlus>(result));
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
