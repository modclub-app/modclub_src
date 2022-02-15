import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Cycles "mo:base/ExperimentalCycles";
import Iter "mo:base/Iter";
import StorageTypes "./types";
import Bucket "./buckets";
import StorageState "./storageState";
import IC "../../remote_canisters/IC";
import Types "./types";


module StorageModule {


public class StorageSolution(storageStableState : StorageState.DataCanisterStateStable, mainCanisterInitializer: Principal, 
          mainCanisterActorPrincipal: Principal, signingKeyFromMain: Text) {

    let DATA_CANISTER_MAX_STORAGE_LIMIT = 2147483648; //  ~2GB

    let storageState = StorageState.getState(storageStableState);
    var signingKey = signingKeyFromMain;
    public func getBlob(contentId: Text, offset:Nat): async ?Blob {
      do? {
        let contentCanisterId = storageState.contentIdToCanisterId.get(contentId)!;
        let b : ?Bucket.Bucket = storageState.dataCanisters.get(contentCanisterId);
        (await b!.getChunks(contentId, offset))!;
      };
    };

    public func dataCanisterId(contentId: Text): async ?Types.DataCanisterId {
      storageState.contentIdToCanisterId.get(contentId);
    };

    public func registerModerators(moderatorIds: [Principal]): async () {
      for(modId in moderatorIds.vals()) {
        storageState.moderatorsId.put(modId, modId);
      };

      for((bucketId, bucket) in storageState.dataCanisters.entries()) {
        bucket.registerModerators(moderatorIds);
      };
    };

    public func setSigningKey(signingKey1: Text): async () {
      signingKey := signingKey1;
      for((bucketId, bucket) in storageState.dataCanisters.entries()) {
        await bucket.setSigningKey(signingKey1);
      };
    };

    public func deRegisterModerators(moderatorIds: [Principal]): async () {
      for(modId in moderatorIds.vals()) {
        storageState.moderatorsId.delete(modId);
      };

      for((bucketId, bucket) in storageState.dataCanisters.entries()) {
        bucket.deRegisterModerators(moderatorIds);
      };
    };

    public func setInitialModerators(moderatorIds: [Principal]) : () {
      for(modId in moderatorIds.vals()) {
        storageState.moderatorsId.put(modId, modId);
      };
    };

    // persist chunks in bucket
    public func putBlobsInDataCanister(contentId: Text, chunkData : Blob, offset: Nat, numOfChunks: Nat, mimeType: Text, dataSize: Nat) : async ?Principal {
      let contentCanisterId = storageState.contentIdToCanisterId.get(contentId);
      switch(contentCanisterId) {
        case(null) {
          let b : Bucket.Bucket = await getEmptyBucket(?dataSize);
          let a = await b.putChunks(contentId, offset, chunkData, numOfChunks, mimeType);
          storageState.contentIdToCanisterId.put(contentId, Principal.fromActor(b));
        };
        case(?canisterId) {
          switch(storageState.dataCanisters.get(canisterId)) {
            case(null)();
            case(?bucket) {
              if((await bucket.getSize()) + chunkData.size() < DATA_CANISTER_MAX_STORAGE_LIMIT) {
                let a = await bucket.putChunks(contentId, offset, chunkData, numOfChunks, mimeType);
              } else {
                // Todo Chunk Migration into new bucket
                // Once done change the return statement accordingly
              }
            };
          }
        };
      };
      return storageState.contentIdToCanisterId.get(contentId);
    };

    // check if there's an empty bucket we can use
    // create a new one in case none's available or have enough space 
    private func getEmptyBucket(s : ?Nat): async Bucket.Bucket {
      let fs: Nat = switch (s) {
        case null { 0 };
        case (?s) { s }
      };

      for((pId, bucket) in storageState.dataCanisters.entries()) {
        let size = await bucket.getSize();
        if(size + fs < DATA_CANISTER_MAX_STORAGE_LIMIT) {
          return bucket;
        }
      };
      await newEmptyBucket();
    };

    // dynamically install a new Bucket
    private func newEmptyBucket(): async Bucket.Bucket {
    
      Cycles.add(400000000000);
      let b = await Bucket.Bucket(Iter.toArray(storageState.moderatorsId.entries()), signingKey);
      let _ = await updateCanister(b); // update canister permissions and settings
      let s = await b.getSize();
      Debug.print("new canister principal is " # debug_show(Principal.toText(Principal.fromActor(b))) );
      Debug.print("initial size is " # debug_show(s));
      storageState.dataCanisters.put(Principal.fromActor(b), b);
      return b;
    };

    // canister memory is set to 4GB and compute allocation to 5 as the purpose 
    // of this canisters is mostly storage
    // set canister owners to the wallet canister and the container canister ie: this
    private func updateCanister(a: actor {}) : async () {
      Debug.print("balance before: " # Nat.toText(Cycles.balance()));
      let cid = { canister_id = Principal.fromActor(a)};
      Debug.print("IC status..."  # debug_show(await IC.IC.canister_status(cid)));
      // let cid = await IC.create_canister(  {
      //    settings = ?{controllers = [?(owner)]; compute_allocation = null; memory_allocation = ?(4294967296); freezing_threshold = null; } } );
      
      await (IC.IC.update_settings( {
        canister_id = cid.canister_id; 
        settings = { 
          controllers = ?[mainCanisterInitializer, mainCanisterActorPrincipal]; 
          compute_allocation = null;
          //  memory_allocation = ?4_294_967_296; // 4GB
          memory_allocation = null; // 4GB
          freezing_threshold = ?31_540_000} })
      );
    };

    public func getStableState() : StorageState.DataCanisterStateStable {
      return StorageState.getStableState(storageState);
    };

};

    

};