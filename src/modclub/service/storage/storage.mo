import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Cycles "mo:base/ExperimentalCycles";
import StorageTypes "./types";
import Bucket "./buckets";
import StorageState "./storageState";
import IC "../../remote_canisters/IC";

module StorageModule {


public class StorageSolution(storageState : StorageState.DataCanisterState, mainCanisterInitializer: Principal, mainCanisterActorPrincipal: Principal) {

    let DATA_CANISTER_MAX_STORAGE_LIMIT = 2147483648; //  ~2GB


    public func getBlob(contentId: Text, bucketId: StorageTypes.DataCanisterId, offset:Nat): async ?Blob {
      let b : ?Bucket.Bucket = storageState.dataCanisters.get(bucketId);
      do? {
          (await b!.getChunks(contentId, offset))!;
      };
    };

    // persist chunks in bucket
    public func putBlobsInDataCanister(contentId: Text, chunkData : Blob, offset: Nat, numOfChunks: Nat, mimeType: Text) : async () {
      let contentCanisterId = storageState.contentIdToCanisterId.get(contentId);
      switch(contentCanisterId) {
        case(null) {
          let b : Bucket.Bucket = await getEmptyBucket(?chunkData.size());
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
              }
            };
          }
        };
      };
      // let b : Bucket.Bucket = await getEmptyBucket(?chunkData.size());
      // let a = await b.putChunks(contentId, offset, chunkData, numOfChunks, mimeType);
      // storageState.contentIdToCanisterId.put(contentId, Principal.fromActor(b));
      // Principal.fromActor(b);
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
      let b = await Bucket.Bucket();
      let _ = await updateCanister(b); // update canister permissions and settings
      let s = await b.getSize();
      Debug.print("new canister principal is " # debug_show(Principal.toText(Principal.fromActor(b))) );
      Debug.print("initial size is " # debug_show(s));
      // var newCanisterState : CanisterState<Bucket, Nat> = {
      //     bucket = b;
      //     var size = s;
      // };
      storageState.dataCanisters.put(Principal.fromActor(b), b);
      return b;
    };

    // canister memory is set to 4GB and compute allocation to 5 as the purpose 
    // of this canisters is mostly storage
    // set canister owners to the wallet canister and the container canister ie: this
    private func updateCanister(a: actor {}) : async () {
      Debug.print("balance before: " # Nat.toText(Cycles.balance()));
      // Cycles.add(Cycles.balance()/2);
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

};

    

};