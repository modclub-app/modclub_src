import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import GlobalState "state";
import Char "mo:base/Char";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Int64 "mo:base/Int64";
import Prim "mo:prim";
import SHA256 "mo:crypto/SHA/SHA256";
import Source "mo:uuid/async/SourceV4";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Types "./types";
import UUID "mo:uuid/UUID";
import Base32 "mo:encoding/Base32";
import Canistergeek "./canistergeek/canistergeek";

module Helpers {

    let NANOS_PER_MILLI = 1000000;
    private let symbols = [
    '0', '1', '2', '3', '4', '5', '6', '7',
    '8', '9', 'A', 'B', 'C', 'D', 'E', 'F',
    ];
    private let base : Nat8 = 0x10;

    public func timeNow() : Types.Timestamp {
      Time.now()  / NANOS_PER_MILLI; // Convert to milliseconds
    };

    public func generateUUID() : async  Text {
      let g = Source.Source();
      let uuid = await g.new();
      return UUID.toText(await g.new());
    };

    public func generateHash(content: Text) : Text {
      return encode(SHA256.sum(Blob.toArray(Text.encodeUtf8(content))));
    };

    // Generates a semi unique ID
  public func generateId(caller: Principal, category: Text, state: GlobalState.State): Text {
    var count : Nat = 0;
    switch(state.GLOBAL_ID_MAP.get(category)){
      case(?result){
        count := result;
      };
      case(_) ();
    };
    count := count + 1;
    state.GLOBAL_ID_MAP.put(category, count);
    return Principal.toText(caller) # "-" # category # "-" # (Nat.toText(count));
  };

  func psuedoRandom(seed: Nat, range: Nat) : Nat {
    // Every third number, first number decided by seed
    return (seed + 3) % range;
  };

  public func generateRandomWordList(size: Nat, wordList: [Text]) : [Text] {
      if(wordList.size() <= size) {
        return wordList;
      };
      let randomWords = Buffer.Buffer<Text>(size);

      // using hashmap since hashset is not available
      let allAvailableWordIndices  = HashMap.HashMap<Int, Nat>(1, Int.equal, Int.hash);
      for(i in Iter.range(0, wordList.size() - 1)) {
          allAvailableWordIndices.put(i, 1); //value is useless here
      };
      // using abs to convert Int to Nat
      var seed = Int.abs(Time.now());
      var wordListLength = wordList.size();
      while(randomWords.size() < size) {
          seed := psuedoRandom(seed, allAvailableWordIndices.size());
          // same word index shouldn't be chosen again
          allAvailableWordIndices.delete(seed);
          randomWords.add(wordList.get(seed));
      };
      randomWords.toArray();
  };
  
    public func encodeBase32(content: Text) : ?Text {
      return Text.decodeUtf8(Blob.fromArray(Base32.encode(Blob.toArray(Text.encodeUtf8(content)))));
    };
    public func encodeNat8ArraytoBase32(content: [Nat8]) : ?Text {
      return Text.decodeUtf8(Blob.fromArray(Base32.encode(content)));
    };

    public func decodeBase32(content: Text) : ?Text {
      let res = Base32.decode(Blob.toArray(Text.encodeUtf8(content)));
      switch(res) {
        case(#ok(r)) {
          return Text.decodeUtf8(Blob.fromArray(r));
        };
        case(_)();
      };
      return null;
    };

  public func textToNat( txt : Text) : Nat {
    assert(txt.size() > 0);
    let chars = txt.chars();

    var num : Nat = 0;
    for (v in chars){
        let charToNum = Nat32.toNat(Char.toNat32(v)-48);
        assert(charToNum >= 0 and charToNum <= 9);
        num := num * 10 +  charToNum;          
    };

    num;
  };

  public func intToNat(value: Int) : Nat { Nat64.toNat(Int64.toNat64(Int64.fromInt(value))) };

  public func logMessage(canistergeekLogger : Canistergeek.Logger, logMessage: Text, logLevel: {#info; #error; #warn; #debugLevel;}) {
    var level = "INFO: ";
    switch(logLevel) {
      case(#info) {
        level := "INFO: ";
      };
      case(#error) {
        level := "ERROR: ";
      };
      case(#warn) {
        level := "WARN: ";
      };
      case(#debugLevel) {
        level := "DEBUG: ";
      };
    };
    canistergeekLogger.logMessage(level # logMessage);
  };

    /**
   * Encode an array of unsigned 8-bit integers in hexadecimal format.
   */
   func encode(array : [Nat8]) : Text {
    Array.foldLeft<Nat8, Text>(array, "", func (accum, w8) {
      accum # encodeW8(w8);
    });
  };

  func encodeW8(w8 : Nat8) : Text {
    let c1 = symbols[Prim.nat8ToNat(w8 / base)];
    let c2 = symbols[Prim.nat8ToNat(w8 % base)];
    Prim.charToText(c1) # Prim.charToText(c2);
  };
    
}