import Cycles "mo:base/ExperimentalCycles";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Blob "mo:base/Blob";

import CommonTypes "../../../common/types";
import Canistergeek "../../../common/canistergeek/canistergeek";
import LoggerTypesModule "../../../common/canistergeek/logger/typesModule";

module {
  public type DataCanisterId = Principal;
  public type ChunkData = Blob;
  public type ChunkId = Text;

  public type ContentInfo = {
    contentId : Text;
    numOfChunks : Nat;
    contentType : Text;
  };

  public type HttpRequest = {
    method : Text;
    url : Text;
    headers : [(Text, Text)];
    body : Blob;
  };

  public type HttpResponse = {
    status_code : Nat16;
    headers : [(Text, Text)];
    body : Blob;
    streaming_strategy : ?StreamingStrategy;
  };

  public type StreamingCallbackToken = {
    key : Text;
    content_encoding : Text;
    index : Nat;
    sha256 : ?[Nat8];
  };

  public type StreamingCallbackHttpResponse = {
    token : ?StreamingCallbackToken;
    body : Blob;
  };

  public type StreamingCallback = shared () -> async ();

  public type StreamingStrategy = {
    #Callback : {
      token : StreamingCallbackToken;
      callback : StreamingCallback;
    };
  };

  public type BucketCanisterMessageInspection = {
    #collectCanisterMetrics : () -> ();
    #getCanisterLog : () -> ?LoggerTypesModule.CanisterLogRequest;
    #getCanisterMetrics : () -> Canistergeek.GetMetricsParameters;
    #handleSubscription : () -> CommonTypes.ConsumerPayload;

    #availableCycles : () -> ();
    #deRegisterModerators : () -> [Principal];
    #getChunk : () -> (Text, Nat);
    #getChunkData : () -> ();
    #getContentInfo : () -> ();
    #getFileInfoData : () -> Text;
    #getSize : () -> ();
    #http_request : () -> HttpRequest;
    #markAllContentNotAccessible : () -> ();
    #markContentAccessible : () -> Text;
    #markContentNotAccessible : () -> Text;
    #putChunks : () -> (Text, Nat, Blob, Nat, Text);
    #registerModerators : () -> [Principal];
    #runDeleteContentJob : () -> ();
    #setParams : () -> ([Principal], Text);
    #setSigningKey : () -> Text;
    #streamingCallback : () -> StreamingCallbackToken;
    #showAdmins : () -> ();
    #subscribeOnAdmins : () -> ();
    #subscribeOnSecrets : () -> ();
  };

};
