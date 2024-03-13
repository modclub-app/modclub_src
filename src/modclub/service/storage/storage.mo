import Bucket "./buckets";
import Buffer "mo:base/Buffer";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import List "mo:base/List";
import Error "mo:base/Error";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import StorageState "./storageState";
import StorageTypes "./types";
import Text "mo:base/Text";
import Types "./types";
import ModSecurity "../../../common/security/guard";

module StorageModule {

  public class StorageSolution(
    storageStableState : StorageState.DataCanisterStateStable,
    retiredDataCanisterIds : [Text],
    admins : List.List<Principal>,
    signingKeyFromMain : Text,
    guard : ModSecurity.Guard
  ) {

    let DATA_CANISTER_MAX_STORAGE_LIMIT = 51_539_607_552; // ~48GB
    let DATA_CANISTER_CYCLE_TOPUP = 60_000_000_000_000; // 60T cycles

    let storageState = StorageState.getState(storageStableState);
    var signingKey = signingKeyFromMain;
    let retiredDataCanisterIdMap = HashMap.HashMap<Text, Text>(
      1,
      Text.equal,
      Text.hash
    );
    var adminList = admins;
    let icRoot = guard.getICRootActor();

    for (id in retiredDataCanisterIds.vals()) {
      retiredDataCanisterIdMap.put(id, id);
    };

    public func updateAdmins(admins : [Principal]) : () {
      for (admin in admins.vals()) {
        if (not List.some<Principal>(adminList, func(ca : Principal) { Principal.equal(ca, admin) })) {
          adminList := List.push<Principal>(admin, adminList);
        };
      };
    };

    public func getBlob(contentId : Text, offset : Nat) : async ?Blob {
      do ? {
        let contentCanisterId = storageState.contentIdToCanisterId.get(
          contentId
        )!;
        let b : ?Bucket.Bucket = storageState.dataCanisters.get(
          contentCanisterId
        );
        (await b!.getChunk(contentId, offset))!;
      };
    };

    public func getChunkedContent(contentId : Text) : async ?[Blob] {
      do ? {
        let canId = storageState.contentIdToCanisterId.get(contentId)!;
        let b : ?Bucket.Bucket = storageState.dataCanisters.get(canId);
        switch (await b!.getFileInfoData(contentId)) {
          case (?info) {
            let content = Buffer.Buffer<Blob>(1);
            var offset = 0;
            while (info.numOfChunks > offset) {
              offset += 1;
              switch (await getBlob(contentId, offset)) {
                case (?chunk) { content.add(chunk) };
                case (_) { throw Error.reject("Unable to get content chunk!") };
              };
            };
            return ?Buffer.toArray<Blob>(content);
          };
          case (_) { return null };
        };
      };
    };

    public func dataCanisterId(contentId : Text) : ?Types.DataCanisterId {
      storageState.contentIdToCanisterId.get(contentId);
    };

    public func registerModerators(moderatorIds : [Principal]) : async () {
      for (modId in moderatorIds.vals()) {
        storageState.moderatorsId.put(modId, modId);
      };

      for ((bucketId, bucket) in storageState.dataCanisters.entries()) {
        bucket.registerModerators(moderatorIds);
      };
    };

    public func retiredDataCanisterId(canisterId : Text) {
      retiredDataCanisterIdMap.put(canisterId, canisterId);
    };

    public func getRetiredDataCanisterIdsStable() : [Text] {
      let buff = Buffer.Buffer<Text>(retiredDataCanisterIdMap.size());
      for ((id, _) in retiredDataCanisterIdMap.entries()) {
        buff.add(id);
      };
      return Buffer.toArray<Text>(buff);
    };

    public func getAllDataCanisterIds() : [Principal] {
      let buff = Buffer.Buffer<Principal>(retiredDataCanisterIdMap.size());
      for ((id, _) in storageState.dataCanisters.entries()) {
        buff.add(id);
      };
      return Buffer.toArray<Principal>(buff);
    };

    public func updateBucketControllers(admins : List.List<Principal>) : async () {
      adminList := admins;
      for ((_, bucket) in storageState.dataCanisters.entries()) {
        await updateCanister(bucket);
      };
    };

    public func setSigningKey(signingKey1 : Text) : async () {
      signingKey := signingKey1;
      for ((bucketId, bucket) in storageState.dataCanisters.entries()) {
        await bucket.setSigningKey(signingKey1);
      };
    };

    public func deRegisterModerators(moderatorIds : [Principal]) : async () {
      for (modId in moderatorIds.vals()) {
        storageState.moderatorsId.delete(modId);
      };

      for ((bucketId, bucket) in storageState.dataCanisters.entries()) {
        bucket.deRegisterModerators(moderatorIds);
      };
    };

    public func setInitialModerators(moderatorIds : [Principal]) : () {
      for (modId in moderatorIds.vals()) {
        storageState.moderatorsId.put(modId, modId);
      };
    };

    public func markContentNotAccessible(contentId : Text) : async () {
      switch (storageState.contentIdToCanisterId.get(contentId)) {
        case (null)();
        case (?dataCanisterId) {
          switch (storageState.dataCanisters.get(dataCanisterId)) {
            case (null)();
            case (?bucket) {
              await bucket.markContentNotAccessible(contentId);
            };
          };
        };
      };
    };

    public func markContentAccessible(contentId : Text) : async () {
      switch (storageState.contentIdToCanisterId.get(contentId)) {
        case (null)();
        case (?dataCanisterId) {
          switch (storageState.dataCanisters.get(dataCanisterId)) {
            case (null)();
            case (?bucket) {
              await bucket.markContentAccessible(contentId);
            };
          };
        };
      };
    };

    public func putBlobsInDataCanister(
      contentId : Text,
      chunkData : Blob,
      offset : Nat,
      numOfChunks : Nat,
      mimeType : Text,
      dataSize : Nat
    ) : async ?Principal {
      let contentCanisterId = storageState.contentIdToCanisterId.get(contentId);
      switch (contentCanisterId) {
        case (null) {
          let b : Bucket.Bucket = await getEmptyBucket(?dataSize);
          let a = await b.putChunks(
            contentId,
            offset,
            chunkData,
            numOfChunks,
            mimeType
          );
          storageState.contentIdToCanisterId.put(
            contentId,
            Principal.fromActor(b)
          );
        };
        case (?canisterId) {
          switch (storageState.dataCanisters.get(canisterId)) {
            case (null)();
            case (?bucket) {
              if (
                (await bucket.getSize()) + chunkData.size() < DATA_CANISTER_MAX_STORAGE_LIMIT
              ) {
                let a = await bucket.putChunks(
                  contentId,
                  offset,
                  chunkData,
                  numOfChunks,
                  mimeType
                );
              } else {
                // Todo Chunk Migration into new bucket
                // Once done change the return statement accordingly
              };
            };
          };
        };
      };
      return storageState.contentIdToCanisterId.get(contentId);
    };

    private func getEmptyBucket(s : ?Nat) : async Bucket.Bucket {
      let fs : Nat = Option.get(s, 0);

      for ((pId, bucket) in storageState.dataCanisters.entries()) {
        switch (retiredDataCanisterIdMap.get(Principal.toText(pId))) {
          case (null) {
            let size = await bucket.getSize();
            if (size + fs < DATA_CANISTER_MAX_STORAGE_LIMIT) {
              return bucket;
            };
          };
          case (_)();
        };
      };
      await newEmptyBucket();
    };

    private func newEmptyBucket() : async Bucket.Bucket {
      Cycles.add(DATA_CANISTER_CYCLE_TOPUP);
      let b = await Bucket.Bucket(guard.getEnvs());
      let _ = await updateCanister(b);
      b.setParams(Iter.toArray(storageState.moderatorsId.keys()), signingKey);
      storageState.dataCanisters.put(Principal.fromActor(b), b);
      let allBuckets = getAllDataCanisterIds();
      await guard.getAuthActor().setModclubBuckets(allBuckets);
      return b;
    };

    private func updateCanister(a : actor {}) : async () {
      let cid = { canister_id = Principal.fromActor(a) };

      let adminListWithCanister = List.push(cid.canister_id, adminList);
      await (
        icRoot.update_settings(
          {
            canister_id = cid.canister_id;
            settings = {
              controllers = ?List.toArray(adminListWithCanister);
              compute_allocation = null;
              memory_allocation = ?DATA_CANISTER_MAX_STORAGE_LIMIT; // 48GB
              freezing_threshold = ?2_676_000; // 30 days
            };
          }
        )
      );
    };

    public func getStableState() : StorageState.DataCanisterStateStable {
      return StorageState.getStableState(storageState);
    };

  };

};
