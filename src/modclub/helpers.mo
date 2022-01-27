import Array "mo:base/Array";
import Blob "mo:base/Blob";
import GlobalState "state";
import Prim "mo:prim";
import SHA256 "mo:crypto/SHA/SHA256";
import Source "mo:uuid/async/SourceV4";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
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