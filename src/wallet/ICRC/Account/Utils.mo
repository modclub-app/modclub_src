import Blob  "mo:base/Blob";
import Text  "mo:base/Text";
import Iter  "mo:base/Iter";
import Nat8  "mo:base/Nat8";
import Nat32  "mo:base/Nat32";
import Float "mo:base/Float";
import Int64 "mo:base/Int64";
import Account "./Account";
import SHA224 "./SHA224";
import CRC32 "./CRC32";
import Buffer "mo:base/Buffer";
import Principal  "mo:base/Principal";
import Array "mo:base/Array";

module {

    private func charToHex(char : Nat) : Text {
        let hexCharMapping = [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f" ];
        hexCharMapping[ char ]
    };

    public func blobToHex(blob : Blob) : Text {
        Text.join("", Iter.map<Nat8, Text>(Iter.fromArray(Blob.toArray(blob)), func (x: Nat8) : Text { 
            let a = Nat8.toNat(x / 16);
            let b = Nat8.toNat(x % 16);
            charToHex(a) # charToHex(b)
        }))
    };

    public func nat64ToFloat(nat64 : Nat64) : Float {
        Float.fromInt64(Int64.fromNat64(nat64))
    };

}