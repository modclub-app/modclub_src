import Result    "mo:base/Result";
import NNSLedger "NNSLedger";
module {

    public type TransferDetails = {
        to_principal : Text;
        fee : ?NNSLedger.Tokens;
        memo : NNSLedger.Memo;
        created_at_time : ?NNSLedger.TimeStamp;
        amount : NNSLedger.Tokens;
    };

    public type DebugDetails = {
        userStoicAccount : Text;
        userCanisterSubAccount : Text;
        defauleCanId : Text;
        userCanisterSubToTransferInternal : Text;
        userStoicAccountBalance: NNSLedger.Tokens;
        userCanisterSubAccountBalance: NNSLedger.Tokens;
        defauleCanIdBalance: NNSLedger.Tokens;
        userCanisterSubToTransferInternalBalance: NNSLedger.Tokens;
    };

    public type TransactionVerificationResponse = {
        tx_block_index : NNSLedger.BlockIndex;
        is_verified : Bool;
        details : { 
            to : Text;
            from : Text;
            memo : NNSLedger.Memo;
            created_at_time : NNSLedger.TimeStamp;
            tx_amount_in_icp : Float;
            tx_fee_in_icp : Float;
        };
    };

    public type SubaccountIndex = Nat32;

    public type UserSubaccountDetails = { 
        subaccount_id: Text;
        account_id : Text;
        subaccount_index: SubaccountIndex;
        principal_id: Text;
    }; 

}