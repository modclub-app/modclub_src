module {
  public type DataCanisterId = Principal;
  public type ChunkData = Blob;
  public type ChunkId = Text;

  public type ContentInfo = {
    contentId : Text;
    numOfChunks : Nat;
    contentType : Text;
  };
};
