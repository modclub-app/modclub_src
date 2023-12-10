import Int "mo:base/Int";
import Array "mo:base/Array";
import Backup "mo:backup";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Error "mo:base/Error";
import Helpers "../../../common/helpers";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import StateV2 "../../statev2";
import Types "../../types";
import Text "mo:base/Text";
import BackupUtil "../../../common/backup/backup_util";
import D "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";

module ModclubBackup {

  public class ModclubBackup(
    backupState : Backup.State,
    stateV2 : StateV2.State
  ) {
    let backupUtil = BackupUtil.BackupUtil(backupState);

    public func backup(fieldName : Text, tag : Text) : async Nat {
      // Backup the data to "backup" canister.
      let _tag : Text = "" # fieldName # "-" # tag;
      switch (fieldName) {
        case ("stateV2") {
          await _backup_stateV2(stateV2, tag);
        };
        case _ {
          throw Error.reject("Unsupported field name: " # fieldName);
        };
      };
    };

    public func getBackupCanisterId() : async Principal {
      backupUtil.backupManager.getCanisterId();
    };

    // TODO: not sure if we could use sharable generics.
    // https://forum.dfinity.org/t/motoko-sharable-generics/9021

    // backup/restore stateV2
    func _backup_stateV2(stateV2 : StateV2.State, tag : Text) : async Nat {
      let stateSharedV2 : StateV2.StateShared = StateV2.fromState(stateV2);
      let blob = to_candid (stateSharedV2);
      await backupUtil.backup_blob(blob, tag);
    };

    public func restore_stateV2(backupId : Nat, cbSetRestoredVar : (StateV2.State) -> ()) : async Result.Result<Text, Text> {
      let blob = await backupUtil.restore_blob(backupId);
      let stateShared : ?StateV2.StateShared = from_candid (blob);

      backupUtil.restore_helper<StateV2.StateShared, StateV2.State>(
        backupId,
        stateShared,
        func(s : StateV2.StateShared) {
          StateV2.toState(s);
        },
        cbSetRestoredVar
      );
    };

  };
};
