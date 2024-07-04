import P "mo:base/Prelude";
import Types "../modclub/types";
import Array "mo:base/Array";
import Option "mo:base/Option";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Float "mo:base/Float";
import Text "mo:base/Text";
import Bool "mo:base/Bool";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Char "mo:base/Char";
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import CommonTypes "types";
import Constants "constants";
import Helpers "helpers";

module {
  public type Timestamp = Int;
  public func unwrap<T>(x : ?T) : T = switch x {
    case null { P.unreachable() };
    case (?x_) { x_ };
  };

  public func isReserved(rId : Text, reservedList : [Types.Reserved]) : Bool {
    let now = Helpers.timeNow();
    let reservation = Array.filter<Types.Reserved>(reservedList, func x = x.id == rId and x.reservedExpiryTime > now);
    return reservation.size() > 0;
  };

  public func getReserved(rId : Text, reservedList : [Types.Reserved]) : ?Types.Reserved {
    let now = Helpers.timeNow();
    let reservation = Array.find<Types.Reserved>(reservedList, func x = x.id == rId and x.reservedExpiryTime > now);
    return reservation;
  };

  public func getNonExpiredList(reservedList : [Types.Reserved], now : Timestamp) : [Types.Reserved] {
    return Array.filter<Types.Reserved>(reservedList, func x = x.reservedExpiryTime > now);
  };

  public func getUserReservationList(reservedList : [Types.Reserved], userId : Text) : [Types.Reserved] {
    return Array.filter<Types.Reserved>(reservedList, func x = x.profileId == userId);
  };

  public func mod_assert(success_test : Bool, message : Text) {
    if (not success_test) {
      Debug.trap(message);
    };
  };

  public func blobToText(b : Blob) : Text {
    var res = "";
    for (byte : Nat8 in b.vals()) {
      res := res # Nat8.toText(byte);
    };
    res;
  };

  public func floatToTokens(f : Float) : Nat {
    switch (Nat.fromText(Int.toText(Float.toInt(Float.abs(f * Float.pow(10.0, Constants.TOKENS_DECIMAL)))))) {
      case (?n) n;
      case (_) { 0 };
    };
  };

  public func getStakingAmountForRewardWithdraw(rs : Nat) : Nat {
    Option.get(
      Nat.fromText(
        Int.toText(Constants.SENIOR_STAKING_MULTIPLYER * Int.pow(rs, Constants.SENIOR_STAKING_EXPONENT))
      ),
      0
    );
  };

  public func textToBChunks(t : Text) : Buffer.Buffer<Blob> {
    let chunks = Buffer.Buffer<Blob>(1);
    switch (Text.size(t) <= Constants.CONTENT_CHUNK_LIMIT) {
      case (true) {
        chunks.add(Text.encodeUtf8(t));
      };
      case (false) {
        var chunk = "";
        for (c in Text.toIter(t)) {
          if (Text.size(chunk) == Constants.CONTENT_CHUNK_LIMIT) {
            chunks.add(Text.encodeUtf8(chunk));
            chunk := "";
          };
          chunk #= Char.toText(c);
        };
        chunks.add(Text.encodeUtf8(chunk));
        chunk := "";
      };
    };
    chunks;
  };

  public func bytesToBChunks(bytes : [Nat8]) : Buffer.Buffer<Blob> {
    let chunks = Buffer.Buffer<Blob>(1);
    switch (Array.size(bytes) <= Constants.CONTENT_CHUNK_LIMIT) {
      case (true) {
        chunks.add(Blob.fromArray(bytes));
      };
      case (false) {
        var chunk = Buffer.Buffer<Nat8>(1);
        for (b in bytes.vals()) {
          if (chunk.size() == Constants.CONTENT_CHUNK_LIMIT) {
            chunks.add(Blob.fromArray(Buffer.toArray(chunk)));
            chunk.clear();
          };
          chunk.add(b);
        };
        chunks.add(Blob.fromArray(Buffer.toArray(chunk)));
        chunk.clear();
      };
    };
    chunks;
  };
};
