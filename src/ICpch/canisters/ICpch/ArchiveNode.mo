module {
  public type AccountIdentifier = Blob;
  public type Block = {
    transaction : Transaction;
    timestamp : Timestamp;
    parent_hash : ?Blob;
  };
  public type BlockIndex = Nat64;
  public type BlockRange = { blocks : [Block] };
  public type GetBlocksArgs = { start : BlockIndex; length : Nat64 };
  public type GetBlocksError = {
    #BadFirstBlockIndex : {
      requested_index : BlockIndex;
      first_valid_index : BlockIndex;
    };
    #Other : { error_message : Text; error_code : Nat64 };
  };
  public type GetBlocksResult = { #Ok : BlockRange; #Err : GetBlocksError };
  public type Memo = Nat64;
  public type Operation = {
    #Burn : { from : AccountIdentifier; amount : Tokens };
    #Mint : { to : AccountIdentifier; amount : Tokens };
    #Transfer : {
      to : AccountIdentifier;
      fee : Tokens;
      from : AccountIdentifier;
      amount : Tokens;
    };
  };
  public type Timestamp = { timestamp_nanos : Nat64 };
  public type Tokens = { e8s : Nat64 };
  public type Transaction = {
    memo : Memo;
    operation : ?Operation;
    created_at_time : Timestamp;
  };
  public type Self = actor {
    get_blocks : shared query GetBlocksArgs -> async GetBlocksResult;
  }
}