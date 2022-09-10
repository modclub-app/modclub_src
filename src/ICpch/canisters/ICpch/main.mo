import NNSLedger   "./NNSLedger";
import ArchiveNode "./ArchiveNode";
import Account     "./Account";
import Types       "./Types";
import Utils       "./Utils";
import Principal   "mo:base/Principal";
import Prelude     "mo:base/Prelude";
import Error       "mo:base/Error";
import Text        "mo:base/Text";
import Option      "mo:base/Option";
import Nat64       "mo:base/Nat64";
import Nat32       "mo:base/Nat32";
import Hex         "./Hex";
import Blob        "mo:base/Blob";
import HashMap     "mo:base/HashMap";
import Iter        "mo:base/Iter";
import Float       "mo:base/Float";

shared ({caller = initializer}) actor class ICpch() = this {

    stable let password = "K@+^BQsJYZXS_AknvL5zpKEuyQK6Ha_sxARA";
    stable var subaccountCount : Types.SubaccountIndex = 0;
    stable var principalToSubaccountDetailsStable : [( Principal, Types.UserSubaccountDetails )] = [];

    let Ledger = actor "ryjl3-tyaaa-aaaaa-aaaba-cai" : NNSLedger.Self;

    private var principalToSubaccountDetails = HashMap.HashMap<Principal, Types.UserSubaccountDetails>(Nat32.toNat(subaccountCount), Principal.equal, Principal.hash);

    private func canisterDefaultAccountIdentifier() : Account.AccountIdentifier {
        
        return Account.accountIdentifier(Principal.fromActor(this), Account.defaultSubaccount());
    };

    public shared(msg) func getCanisterDefaultAccountIdentifier() : async Text {
       
        return Utils.blobToHex(canisterDefaultAccountIdentifier());
    };

    public shared(msg) func getCanisterPrincipal() : async Text {
       
        return Principal.toText(Principal.fromActor(this));
    };

    public shared(msg) func getTransferFeeImposedByNNSLedger() : async NNSLedger.Tokens {

        return (await Ledger.transfer_fee({})).transfer_fee;
    };

    // Get default account balance of the canister
    public shared(msg) func getCanisterBalance() : async NNSLedger.Tokens {

        return await Ledger.account_balance({ account = canisterDefaultAccountIdentifier() });
    };

    // Get subaccount balance of the canister
    public shared(msg) func getCanisterSubaccountBalance(subaccountIndex : Types.SubaccountIndex) : async NNSLedger.Tokens {

        return await Ledger.account_balance({ account = Account.getAccountIdentifierFromAccountIndex(Principal.fromActor(this), subaccountIndex) });
    };

    // Transfer from canister account to provided account details 
    public shared(msg) func transferFromCanister(transferDetails : Types.TransferDetails, subaccountIndex : Types.SubaccountIndex, attemptPassword: Text) : async NNSLedger.TransferResult {
        
        if (Text.notEqual(password, attemptPassword)) {
            throw Error.reject("Attempted password is wrong");
        };

        return await Ledger.transfer({ 
            to = Account.accountIdentifier(Principal.fromText(transferDetails.to_principal), Account.defaultSubaccount());
            fee = Option.get(transferDetails.fee, await getTransferFeeImposedByNNSLedger() );
            memo = transferDetails.memo;
            from_subaccount = ?Account.getSubAccountIdentifierFromAccountIndex(Principal.fromActor(this), subaccountIndex);
            created_at_time = transferDetails.created_at_time;
            amount = transferDetails.amount;
        });
    };

    // Transfer from internal subaccount to default account of the canister 
    public shared(msg) func transferFromSubaccountToDefaultAccount(userPrincipal : Text, attemptPassword: Text) : async NNSLedger.TransferResult {
        
        if (Text.notEqual(password, attemptPassword)) {
            throw Error.reject("Attempted password is wrong");
        };
        var principal = msg.caller;
        if(Principal.toText(principal) == "2vxsx-fae") {
            principal := Principal.fromText(userPrincipal);
        };
        let subaccountIndex = getUserSubaccountIdentifierDetailsInternal(principal).subaccount_index;
        let subaccountBalance = await getCanisterSubaccountBalance(subaccountIndex);
        let txFee = await getTransferFeeImposedByNNSLedger();

        return await Ledger.transfer({ 
            to = canisterDefaultAccountIdentifier();
            fee = txFee;
            memo = Nat64.fromNat(Nat32.toNat(subaccountIndex));
            from_subaccount = ?Account.getSubAccountIdentifierFromAccountIndex(Principal.fromActor(this), subaccountIndex);
            created_at_time = null;
            amount = { e8s = subaccountBalance.e8s - txFee.e8s; };
        });
    };

    public shared(msg) func verifyTransferToCanister(blockIndex : NNSLedger.BlockIndex) : async Types.TransactionVerificationResponse {

        let queryBlocksResponse = await Ledger.query_blocks({ start = blockIndex; length = 1; });
        let archivedBlocks = queryBlocksResponse.archived_blocks;
        if (blockIndex >= queryBlocksResponse.first_block_index) {
            let requiredBlock = queryBlocksResponse.blocks[Nat64.toNat(blockIndex - queryBlocksResponse.first_block_index)];
            return await verifyTransactionBlock(requiredBlock, blockIndex);
        };

        for (archivedBlock in archivedBlocks.vals()) {
            if (archivedBlock.start <= blockIndex and blockIndex < archivedBlock.start + archivedBlock.length) {
                let blocksArrayIndex = Nat64.toNat(blockIndex - archivedBlock.start);
                let queryArchiveResult = await archivedBlock.callback({ start = blockIndex; length = 1 });

                switch (queryArchiveResult) {
                    case (#Ok(blockRange)) {
                        let requiredBlock = blockRange.blocks[blocksArrayIndex];
                        return await verifyTransactionBlock(requiredBlock, blockIndex);
                    };
                    case (#Err(queryArchiveError)) { 
                        
                        switch (queryArchiveError) {
                            case (#BadFirstBlockIndex(badFirstBlockIndex)) {
                                throw Error.reject("Got query archive error due to bad first block-index");
                            };
                            case (#Other(other)) {
                                throw Error.reject("Got query archive error with message: " # other.error_message # ", error-code: " # Nat64.toText(other.error_code));
                            };
                        }
                    };
                };
            };
        };

        throw Error.reject("Block-Index " # Nat64.toText(blockIndex) # " not found!");
    };

    private func verifyTransactionBlock(block : NNSLedger.Block, blockIndex : NNSLedger.BlockIndex) : async Types.TransactionVerificationResponse {

        let transaction = block.transaction;
        let operation = transaction.operation;
        switch(operation) {
            case (?#Transfer(transferDetails)) {
                return {
                    tx_block_index = blockIndex;
                    is_verified = if (transferDetails.to == canisterDefaultAccountIdentifier()) { true } else { false };
                    details = {
                        to = Utils.blobToHex(transferDetails.to);
                        from = Utils.blobToHex(transferDetails.from);
                        tx_amount_in_icp = Utils.nat64ToFloat(transferDetails.amount.e8s) / 100_000_000;
                        tx_fee_in_icp = Utils.nat64ToFloat(transferDetails.fee.e8s) / 100_000_000;
                        memo = transaction.memo;
                        created_at_time = transaction.created_at_time;
                    }
                };
            };
            case (_) {
                throw Error.reject("The operation type is not 'Transfer'");
            };
        };
    };

    // Get subaccount details for external user-principal or create one if does not exist
    public shared(msg) func getUserSubaccountIdentifierDetails(userPrincipal : Text) : async Types.UserSubaccountDetails {

        var principal = msg.caller;
        if(Principal.toText(principal) == "2vxsx-fae") {
            principal := Principal.fromText(userPrincipal);
        };
        return getUserSubaccountIdentifierDetailsInternal(principal);
    };

    private func getUserSubaccountIdentifierDetailsInternal(principal : Principal) : Types.UserSubaccountDetails {

        switch (principalToSubaccountDetails.get(principal)) {
            case (?subaccountDetails) {
                return subaccountDetails;
            };
            case (null) {
                subaccountCount := subaccountCount + 1;
                let userAccountIdentifier = Account.getAccountIdentifierFromAccountIndex(Principal.fromActor(this), subaccountCount);
                let userSubAccountIdentifier = Account.getSubAccountIdentifierFromAccountIndex(Principal.fromActor(this), subaccountCount);
                let subaccountDetails = {
                    account_id = Utils.blobToHex(userAccountIdentifier);
                    subaccount_id = Utils.blobToHex(userSubAccountIdentifier);
                    subaccount_index = subaccountCount;
                    principal_id = Principal.toText(principal);
                };
                principalToSubaccountDetails.put(principal, subaccountDetails);
                return subaccountDetails;
            };
        };
    };

    system func preupgrade() {
        principalToSubaccountDetailsStable := Iter.toArray(principalToSubaccountDetails.entries());
    };

    system func postupgrade() {
        principalToSubaccountDetails := HashMap.fromIter(principalToSubaccountDetailsStable.vals(), Nat32.toNat(subaccountCount), Principal.equal, Principal.hash);
    };

};