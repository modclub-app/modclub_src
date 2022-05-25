import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Canistergeek "../../canistergeek/canistergeek";
import Debug "mo:base/Debug";
import GlobalState "../../state";
import Helpers "../../helpers";
import Nat "mo:base/Nat";
import Order "mo:base/Order";
import Principal "mo:base/Principal";
import QueueManager "../queue/queue";
import Rel "../../data_structures/Rel";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Types "../../types";

module ContentModule {

    public func getContent(userId: Principal, contentId: Text, voteCount: Types.VoteCount, state: GlobalState.State) : ?Types.ContentPlus {
        return getContentPlus(contentId, ?userId, voteCount, state);  
    };

    public func submitTextOrHtmlContent(caller: Principal, sourceId: Text, text: Text, title: ?Text, contentType: Types.ContentType, contentQueueManager: QueueManager.QueueManager, state: GlobalState.State) : Text {
        let content = createContentObj(sourceId, caller, contentType, title, state);
        let textContent : Types.TextContent = {
        id = content.id;
        text = text;
        };
        // Store and update relationships
        state.content.put(content.id, content);
        state.textContent.put(content.id, textContent);
        state.provider2content.put(caller, content.id);
        contentQueueManager.changeContentStatus(content.id, #new);
        return content.id;
    };

    public func submitImage(caller: Principal, sourceId: Text, image: [Nat8], imageType: Text, title: ?Text, contentQueueManager: QueueManager.QueueManager, state: GlobalState.State) : Text {
        let content = createContentObj(sourceId, caller, #imageBlob, title, state);
        let imageContent : Types.ImageContent = {
            id = content.id;
            image  = {
                data = image;
                imageType = imageType;
            }
        };
        // Store and update relationships
        state.content.put(content.id, content);
        state.imageContent.put(content.id, imageContent);
        state.provider2content.put(caller, content.id);
        contentQueueManager.changeContentStatus(content.id, #new);
        return content.id;
    };

    public func getProviderContent(providerId: Principal, getVoteCount : (Types.ContentId, ?Principal) -> Types.VoteCount, state: GlobalState.State) : [Types.ContentPlus] {
      let buf = Buffer.Buffer<Types.ContentPlus>(0);
      for (cid in state.provider2content.get0(providerId).vals()) {
        let voteCount = getVoteCount(cid, ?providerId);
        switch(getContentPlus(cid, ?providerId, voteCount, state)) {
          case (?result) {
            buf.add(result);
          };
          case (_) ();
        };
      };
      buf.toArray();
    };

    public func getAllContent(
            caller: Principal,
            status: Types.ContentStatus,
            getVoteCount : (Types.ContentId, ?Principal) -> Types.VoteCount,
            contentQueueManager: QueueManager.QueueManager,
            logger: Canistergeek.Logger,
            state: GlobalState.State,
            randomizationEnabled: Bool
        ) : [Types.ContentPlus] {
        let buf = Buffer.Buffer<Types.ContentPlus>(0);
        var count = 0;
        let contentQueue = contentQueueManager.getUserContentQueue(caller, status, randomizationEnabled);

        for(cid in contentQueue.keys()) {
            if( count < 11) {
                let voteCount = getVoteCount(cid, ?caller);
                switch(getContentPlus(cid, ?caller, voteCount, state)) {
                    case (?result) {
                        buf.add(result);
                        count := count + 1;
                    };
                    case (_) ();
                };
            };
        };
        return Array.sort(buf.toArray(), compareContent);
    };

    func sortAsc(a : Types.Content, b: Types.Content) : Order.Order {
      if(a.updatedAt > b.updatedAt) {
        #greater;
      } else if ( a.updatedAt < b.updatedAt) {
        #less;
      } else {
        #equal;
      }
    };

    func sortDesc(a : Types.Content, b: Types.Content) : Order.Order {
      if(a.updatedAt < b.updatedAt) {
        #greater;
      } else if ( a.updatedAt > b.updatedAt) {
        #less;
      } else {
        #equal;
      }
    };


    func compareContentPlus(a : Types.ContentPlus, b: Types.ContentPlus) : Order.Order {
      if(a.updatedAt > b.updatedAt) {
        #greater;
      } else if ( a.updatedAt < b.updatedAt) {
        #less;
      } else {
        #equal;
      }
    };

    func createContentObj(sourceId: Text, caller: Principal, contentType: Types.ContentType, title: ?Text, state: GlobalState.State): Types.Content {
        let now = Helpers.timeNow();
        let content  = {
            id = Helpers.generateId(caller, "content", state);
            providerId = caller;
            contentType = contentType;
            status = #new;
            sourceId = sourceId;
            title = title;
            createdAt= now;
            updatedAt= now;
        };
        return content;
    };

    func getContentPlus(contentId: Types.ContentId, caller: ?Principal, voteCount: Types.VoteCount, state: GlobalState.State) : ?Types.ContentPlus {
        switch(state.content.get(contentId)) {
            case (?content) {
                switch (state.providers.get(content.providerId)){
                case(?provider) {
                    let result : Types.ContentPlus = {
                            id = content.id;
                            providerName = provider.name;
                            minStake = provider.settings.minStaked;
                            minVotes = provider.settings.minVotes;
                            voteCount = Nat.max(voteCount.approvedCount, voteCount.rejectedCount);
                            hasVoted = ?voteCount.hasVoted;
                            providerId = content.providerId;
                            contentType = content.contentType;
                            status = content.status;
                            sourceId = content.sourceId;
                            title = content.title;
                            createdAt = content.createdAt; 
                            updatedAt = content.updatedAt; 
                            text = do  ?{
                            switch(state.textContent.get(content.id)) {
                                case(?x) x.text;
                                case(_) "";
                            };
                            };
                            image = do  ?{
                            switch(state.imageContent.get(content.id)) {
                                case(?x) x.image;
                                case(null) { 
                                    { data = []; imageType = ""};
                                };
                            };
                            };
                        };
                    return ?result;
                };
                case(_) null;
                };
            };
            case (_) null;
        };
    };

    // Retrieves only new content that needs to be approved ( i.e tasks )
    public func getTasks(
        caller: Principal,
        getVoteCount : (Types.ContentId, ?Principal) -> Types.VoteCount,
        state: GlobalState.State,
        start: Nat,
        end: Nat,
        filterVoted: Bool,
        logger: Canistergeek.Logger,
        contentQueueManager: QueueManager.QueueManager,
        randomizationEnabled: Bool
    ): Result.Result<[Types.ContentPlus], Text>  {
        if( start < 0 or end < 0 or start > end) {
            return #err("Invalid range");
        };
        let result = Buffer.Buffer<Types.ContentPlus>(0);
        let items =  Buffer.Buffer<Types.Content>(0); 
        var count: Nat = 0;
        let maxReturn: Nat = end - start;
        Debug.print( "Retrieveing #new Queue for user: " # Principal.toText(caller));
        Helpers.logMessage(logger, "Retrieveing #new Queue for user: " # Principal.toText(caller), #info);
        let contentQueue = contentQueueManager.getUserContentQueue(caller, #new, randomizationEnabled);
        Helpers.logMessage(logger, "Retrieved #new Queue for user: " # Principal.toText(caller), #info);
        Debug.print( "Retrieved #new Queue for user: " # Principal.toText(caller));


            // TODO: When we have randomized task generation, fetch tasks from the users task queue instead of fetching all new content
        for(cid in contentQueue.keys()) {
            switch(state.content.get(cid)) {
                case (?content) {
                    if ( filterVoted ) {
                        let voteCount = getVoteCount(cid, ?caller);
                        if(voteCount.hasVoted != true) {
                            items.add(content);
                        };
                    } else {
                        items.add(content);
                    };
                };
                case (_) ();
            };
        };

        var index: Nat = 0;
        for(content in Array.sort(items.toArray(), sortAsc).vals()) {
            if(index >= start and index <= end  and count < maxReturn) {
                let voteCount = getVoteCount(content.id, ?caller);
                switch(getContentPlus(content.id, ?caller, voteCount, state)) {
                    case (?content) {
                        result.add(content);
                        count := count + 1;
                    };
                    case (_) ();
                };
            };
            index := index + 1;
        };
        Debug.print( "Sending getTasks Resposnse for user: " # Principal.toText(caller));
        return #ok(result.toArray());
    };

    public func checkIfAlreadySubmitted(
        sourceId: Text,
        providerId: Principal,
        state: GlobalState.State ): Bool {
        for (cid in state.provider2content.get0(providerId).vals()) {
             switch(state.content.get(cid)) {
                 case (?content) {
                     if ( content.sourceId == sourceId ) {
                         return true;
                     };
                 };
                case (_) ();
            };
        };
        return false;
    };
};