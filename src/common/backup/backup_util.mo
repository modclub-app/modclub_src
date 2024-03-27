import Backup "./lib";
import Buffer "mo:base/Buffer";
import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Result "mo:base/Result";

module BackupUtil {
  public let ChunkSizeByte = 1000000;

  public class BackupUtil(backupState : Backup.State) {
    public let backupManager = Backup.BackupManager(backupState, {maxBackups=100});

    public func backup_blob(blob : Blob, tag : Text) : async Nat {
      let bak = backupManager.NewBackup(tag);
      await bak.startBackup();
      let dataBuf = Buffer.fromArray<Nat8>(Blob.toArray(blob));
      let chunks = Buffer.chunk<Nat8>(dataBuf, ChunkSizeByte);
      for (chunk in chunks.vals()) {
        await bak.uploadChunk(to_candid (Buffer.toArray(chunk)));
      };
      await bak.finishBackup();
      return bak.backupId;

    };

    public func restore_blob(backupId : Nat) : async Blob {
      // restore chunks
      let bytesBuf : Buffer.Buffer<Nat8> = Buffer.Buffer<Nat8>(ChunkSizeByte);
      await backupManager.restore(
        backupId,
        func _restoreBlob(blob : Blob) {
          let chunkBytes : ?[Nat8] = from_candid (blob);
          if (Option.isSome(chunkBytes)) {
            let chunkBuf = Buffer.fromArray<Nat8>(Option.get(chunkBytes, []));
            bytesBuf.append(chunkBuf);
          };
        }
      );

      let byteArr = Buffer.toArray(bytesBuf);
      return Blob.fromArray(byteArr);
    };

    public func restore_helper<S, V>(
      backup_id : Nat,
      sharedVar : ?S,
      cbShardVarToVar : (S) -> V,
      cbSetRestoredVar : (V) -> ()
    ) : Result.Result<Text, Text> {
      switch (sharedVar) {
        case (?sharedVar) {
          let v = cbShardVarToVar(sharedVar);
          cbSetRestoredVar(v);
          return #ok("Restoration Completed: " # Nat.toText(backup_id));
        };
        case (_) {
          return #err("Restoration Failed: empty blob.");
        };
      };
    };
  };
};
