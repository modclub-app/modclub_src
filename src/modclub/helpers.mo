import Array "mo:base/Array";
import Base32 "mo:encoding/Base32";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Canistergeek "./canistergeek/canistergeek";
import Char "mo:base/Char";
import GlobalState "statev1";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Int64 "mo:base/Int64";
import Iter "mo:base/Iter";
import LFSR "mo:rand/LFSR";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Nat8 "mo:base/Nat8";
import Nat16 "mo:base/Nat16";
import Prim "mo:prim";
import Principal "mo:base/Principal";
import SHA256 "mo:crypto/SHA/SHA256";
import Source "mo:uuid/async/SourceV4";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Types "./types";
import UUID "mo:uuid/UUID";

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

  public func generateRandomList(size: Nat, wordList: [Text], randomFeed: LFSR.LFSR32) : [Text] {
      if(wordList.size() <= size) {
        return wordList;
      };
      let randomWords = Buffer.Buffer<Text>(size);

      // using hashmap since hashset is not available
      let allAvailableWordIndices  = HashMap.HashMap<Nat, Nat>(1, Int.equal, Int.hash);
      for(i in Iter.range(0, wordList.size() - 1)) {
          allAvailableWordIndices.put(i, 1); //value is useless here
      };
      // using abs to convert Int to Nat
      var seed = Int.abs(Time.now()) % 255;
      var wordListLength = wordList.size();
      // let feed = LFSR.LFSR8(?Nat8.fromNat(seed));
      while(randomWords.size() < size) {
          seed := Nat32.toNat(randomFeed.next().0) % allAvailableWordIndices.size();
          // same word index shouldn't be chosen again
          let selectedIndex = Iter.toArray(allAvailableWordIndices.keys()).get(seed);
          allAvailableWordIndices.delete(selectedIndex);
          randomWords.add(wordList.get(selectedIndex));
      };
      randomWords.toArray();
  };

  public func getRandomFeedGenerator() : LFSR.LFSR32 {
      var seed = Int.abs(Time.now()) % 65536;
      let feed = LFSR.LFSR32(?Nat32.fromNat(seed));
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

  public func allowedCanistergeekCaller(caller: Principal): Bool {
    let authorizedCallers : [Principal] = [
      Principal.fromText("hqyof-lxrze-ezy5y-bys4t-dm4bq-7i57t-uisji-lsnmt-5jdma-4ujdb-5qe"),
      Principal.fromText("mni5w-twhal-we6re-mvbh2-r3e6x-2djsc-nubmb-hw2ra-avyuu-mu2gj-5qe")
      ];
      var exists = Array.find<Principal>(
        authorizedCallers,
        func(val: Principal) : Bool {
          Principal.equal(val, caller) 
      });
      exists != null;
  };

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