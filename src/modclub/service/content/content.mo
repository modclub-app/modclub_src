import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Canistergeek "../../../common/canistergeek/canistergeek";
import Debug "mo:base/Debug";
import GlobalState "../../statev2";
import Helpers "../../../common/helpers";
import Nat "mo:base/Nat";
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

module ContentModule {

  public func getContent(
    userId : Principal,
    contentId : Text,
    voteCount : Types.VoteCount,
    globalState : GlobalState.State,
    storage : StorageSolution.StorageSolution
  ) : async ?Types.ContentPlus {
    switch (globalState.content.get(contentId)) {
      case (?content) {
        switch (globalState.providers.get(content.providerId)) {
          case (?provider) {
            let chunkedContent = await storage.getChunkedContent(content.id);
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
                  case (?entry) {
                    var textContent = "";
                    for (blobChunk in Option.get(chunkedContent, []).vals()) {
                      textContent #= Option.get(Text.decodeUtf8(blobChunk), "");
                    };
                    textContent;
                  };
                  case (_) "";
                };
              };
              image = do ? {
                switch (globalState.imageContent.get(content.id)) {
                  case (?entry) {
                    let imageContent = Buffer.Buffer<Nat8>(1);
                    for (blobChunk in Option.get(chunkedContent, []).vals()) {
                      imageContent.append(Buffer.fromArray(Blob.toArray(blobChunk)));
                    };
                    {
                      data = Buffer.toArray(imageContent);
                      imageType = entry.image.imageType;
                    };
                  };
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
    arg : ContentTypes.ProviderContentArg
  ) : async [Types.ContentPlus] {
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
            switch (getContentPlus(cid, ?arg.providerId, voteCount, arg.globalState)) {
              case (?result) {
                if (result.status == arg.status) {
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
    randomizationEnabled : Bool,
    storage : StorageSolution.StorageSolution
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
        let cp = getContentPlus(cid, ?caller, voteCount, globalState);
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
    let rp : Types.Receipt = createReceipt({ caller = arg.caller; globalState; contentState }, 10);
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
    arg : ContentTypes.CommonArg
  ) : async () {
    switch (arg.globalState.content.get(contentId)) {
      case (?content) {
        let contentPlus : ?Types.ContentPlus = getContentPlus(contentId, ?arg.caller, voteCount, arg.globalState);
        switch (contentPlus) {
          case (?provider) {
            let oldReserved : [Types.Reserved] = provider.reservedList;
            let rid = Helpers.generateId(arg.caller, "Reservations", arg.globalState);
            let reserved = Utils.isReserved(rid, oldReserved);
            if (reserved == true) {
              throw Error.reject("Already create");
            };
            let now = Helpers.timeNow();
            let spot = provider.voteParameters.requiredVotes - (voteCount.approvedCount + voteCount.rejectedCount);
            let checkExpire = hasAvailableSpot(oldReserved, now, spot);
            if (checkExpire == false) {
              throw Error.reject("No spot left");
            };
            let reservation = await takeReservation(
              {
                caller = arg.caller;
                globalState = arg.globalState;
                contentState = arg.contentState;
                storageSolution = arg.storageSolution;
              },
              Constants.EXPIRE_TIME
            );
            let newReserved = Array.append<Types.Reserved>(oldReserved, [reservation]);
            let chunkedContent = await arg.storageSolution.getChunkedContent(content.id);
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
                switch (arg.globalState.textContent.get(content.id)) {
                  case (?entry) {
                    var textContent = "";
                    for (blobChunk in Option.get(chunkedContent, []).vals()) {
                      textContent #= Option.get(Text.decodeUtf8(blobChunk), "");
                    };
                    textContent;
                  };
                  case (_) "";
                };
              };
              image = do ? {
                switch (arg.globalState.imageContent.get(content.id)) {
                  case (?entry) {
                    let imageContent = Buffer.Buffer<Nat8>(1);
                    for (blobChunk in Option.get(chunkedContent, []).vals()) {
                      imageContent.append(Buffer.fromArray(Blob.toArray(blobChunk)));
                    };
                    {
                      data = Buffer.toArray(imageContent);
                      imageType = entry.image.imageType;
                    };
                  };
                  case (null) {
                    { data = []; imageType = "" };
                  };
                };
              };
              voteParameters = provider.voteParameters;
              reservedList = newReserved;
              receipt = provider.receipt;
            };
            arg.globalState.content.put(content.id, result);
          };
          case (_) throw Error.reject("Provider incorrect");
        };
      };
      case (_) throw Error.reject("Content Incorrect");
    };

  };

  private func takeReservation(
    arg : ContentTypes.CommonArg,
    expireTime : Types.Timestamp
  ) : async Types.Reserved {
    let state = Reserved.ContentStateManager(arg.contentState);
    let reserved = await state.takeReservation(arg.caller, arg.globalState, expireTime);
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
              text = ?"";
              image = ?{ data = []; imageType = "" };
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
    arg : ContentTypes.TasksArg
  ) : Result.Result<[Types.ContentPlus], Text> {
    if (arg.start < 0 or arg.end < 0 or arg.start > arg.end) {
      return #err("Invalid range");
    };
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

    var index : Nat = 0;
    for (content in Array.sort(Buffer.toArray<Types.Content>(items), sortAsc).vals()) {
      if (index >= arg.start and index <= arg.end and count < maxReturn) {
        let voteCount = arg.getVoteCount(content.id, ?arg.caller);
        switch (getContentPlus(content.id, ?arg.caller, voteCount, arg.globalState)) {
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
        let rid = Helpers.generateId(caller, "Reservations", globalState);
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
