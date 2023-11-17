import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Char "mo:base/Char";
import Iter "mo:base/Iter";
import Nat32 "mo:base/Nat32";
import Blob "mo:base/Blob";

module {

  public func joinArrOpt(array : ?[Text]) : Text {
    switch (array) {
      case (null)();
      case (?arr) {
        return joinArr(arr);
      };
    };
    return "";
  };

  public func joinArr(arr : [Text]) : Text {
    return Text.join(",", arr.vals());
  };

  // textFromBlob
  // reference: https://gist.github.com/gabrielnic/fa5dfd8af9928636dae2737a8de014db
  public func textFromBlob(blob : Blob) : Text {
    Text.join(",", Iter.map<Nat8, Text>(blob.vals(), Nat8.toText));
  };

  // blobFromText
  public func blobFromText(t : Text) : Blob {
    // textToNat8
    // turns "123" into 123
    func textToNat8(txt : Text) : Nat8 {
      var num : Nat32 = 0;
      for (v in txt.chars()) {
        num := num * 10 + (Char.toNat32(v) - 48); // 0 in ASCII is 48
      };
      Nat8.fromNat(Nat32.toNat(num));
    };

    let ts = Text.split(t, #char(','));
    let bytes = Array.map<Text, Nat8>(Iter.toArray(ts), textToNat8);
    Blob.fromArray(bytes);
  };

};
