import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Error "mo:base/Error";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Debug "mo:base/Debug";

import Types "types";

module ModclubICRC = {

  public class Ledger(init : Types.LedgerInitParams) {
    let permittedDriftNanos : Types.Duration = 60_000_000_000;
    let transactionWindowNanos : Types.Duration = 24 * 60 * 60 * 1_000_000_000;
    let defaultSubaccount : Types.Subaccount = Blob.fromArrayMut(Array.init(32, 0 : Nat8));

    // The list of all transactions.
    var txLog : Types.TxLog = Buffer.Buffer<Types.Transaction>(100);

    // Checks whether two accounts are semantically equal.
    public func accountsEqual(lhs : Types.Account, rhs : Types.Account) : Bool {
      let lhsSubaccount = Option.get(lhs.subaccount, defaultSubaccount);
      let rhsSubaccount = Option.get(rhs.subaccount, defaultSubaccount);

      Principal.equal(lhs.owner, rhs.owner) and Blob.equal(
        lhsSubaccount,
        rhsSubaccount
      );
    };

    // Computes the balance of the specified account.
    public func balance(account : Types.Account) : Nat {
      var sum = 0;
      for (tx in txLog.vals()) {
        switch (tx.operation) {
          case (#Burn(args)) {
            if (accountsEqual(args.from, account)) { sum -= args.amount };
          };
          case (#Mint(args)) {
            if (accountsEqual(args.to, account)) { sum += args.amount };
          };
          case (#Transfer(args)) {
            if (accountsEqual(args.from, account)) {
              sum -= args.amount + tx.fee;
            };
            if (accountsEqual(args.to, account)) { sum += args.amount };
          };
          case (#Approve(_)) {};
        };
      };
      sum;
    };

    // Computes the total token supply.
    public func totalSupply() : Types.Tokens {
      Debug.print("Calculating Total Supply ...");
      var total = 0;
      for (tx in txLog.vals()) {
        switch (tx.operation) {
          case (#Burn(args)) { total -= args.amount };
          case (#Mint(args)) { total += args.amount };
          case (#Transfer(_)) { total -= tx.fee };
          case (#Approve(_)) {};
        };
      };
      total;
    };

    // Finds a transaction in the transaction log.
    public func findTransfer(transfer : Types.Transfer) : ?Types.TxIndex {
      var i = 0;
      for (tx in txLog.vals()) {
        switch (tx.operation) {
          case (#Burn(args)) { if (args == transfer) { return ?i } };
          case (#Mint(args)) { if (args == transfer) { return ?i } };
          case (#Transfer(args)) { if (args == transfer) { return ?i } };
          case (_) {};
        };
        i += 1;
      };
      null;
    };

    // Finds an approval in the transaction log.
    public func findApproval(approval : Types.Approve) : ?Types.TxIndex {
      var i = 0;
      for (tx in txLog.vals()) {
        switch (tx.operation) {
          case (#Approve(args)) { if (args == approval) { return ?i } };
          case (_) {};
        };
        i += 1;
      };
      null;
    };

    // Computes allowance of the spender for the specified account.
    public func allowance(account : Types.Account, spender : Principal, now : Nat64) : Types.Allowance {
      var i = 0;
      var allowance : Int = 0;
      var lastApprovalTs : ?Nat64 = null;

      for (tx in txLog.vals()) {
        // Reset expired approvals, if any.
        switch (lastApprovalTs) {
          case (?expires_at) {
            if (expires_at < tx.timestamp) {
              allowance := 0;
              lastApprovalTs := null;
            };
          };
          case (null) {};
        };
        // Add pending approvals.
        switch (tx.operation) {
          case (#Approve(args)) {
            if (args.from == account and args.spender == spender) {
              allowance := Int.max(0, allowance + args.amount);
              lastApprovalTs := args.expires_at;
            };
          };
          case (#Transfer(args)) {
            if (args.from == account and args.spender == spender) {
              allowance -= args.amount + tx.fee;
            };
          };
          case (_) {};
        };
      };

      switch (lastApprovalTs) {
        case (?expires_at) {
          if (expires_at < now) { { allowance = 0; expires_at = null } } else {
            {
              allowance = Int.abs(allowance);
              expires_at = ?expires_at;
            };
          };
        };
        case (null) { { allowance = Int.abs(allowance); expires_at = null } };
      };
    };

    // Constructs the transaction log corresponding to the init argument.
    public func makeGenesisChain() : () {
      Debug.print("Creating GENESIS ...");
      validateSubaccount(init.minting_account.subaccount);

      let now = Nat64.fromNat(Int.abs(Time.now()));
      let log = Buffer.Buffer<Types.Transaction>(100);
      for ({ account; amount } in Array.vals(init.initial_mints)) {
        validateSubaccount(account.subaccount);
        let tx : Types.Transaction = {
          operation = #Mint({
            spender = init.minting_account.owner;
            source = #Init;
            from = init.minting_account;
            to = account;
            amount = amount;
            fee = null;
            memo = null;
            created_at_time = ?now;
          });
          fee = 0;
          timestamp = now;
        };
        log.add(tx);
      };
      txLog := log;
    };

    // Traps if the specified blob is not a valid subaccount.
    public func validateSubaccount(s : ?Types.Subaccount) {
      let subaccount = Option.get(s, defaultSubaccount);
      assert (subaccount.size() == 32);
    };

    func validateMemo(m : ?Types.Memo) {
      switch (m) {
        case (null) {};
        case (?memo) { assert (memo.size() <= 32) };
      };
    };

    public func checkTxTime(created_at_time : ?Types.Timestamp, now : Types.Timestamp) : Types.Result<(), Types.DeduplicationError> {
      let txTime : Types.Timestamp = Option.get(created_at_time, now);

      if ((txTime > now) and (txTime - now > permittedDriftNanos)) {
        return #Err(#CreatedInFuture { ledger_time = now });
      };

      if ((txTime < now) and (now - txTime > transactionWindowNanos + permittedDriftNanos)) {
        return #Err(#TooOld);
      };

      #Ok(());
    };

    public func recordTransaction(tx : Types.Transaction) : Types.TxIndex {
      let idx = txLog.size();
      txLog.add(tx);
      idx;
    };

    public func classifyTransfer(transfer : Types.Transfer) : Types.Result<(Types.Operation, Types.Tokens), Types.TransferError> {
      let minter = init.minting_account;

      if (Option.isSome(transfer.created_at_time)) {
        switch (findTransfer(transfer)) {
          case (?txid) { return #Err(#Duplicate { duplicate_of = txid }) };
          case null {};
        };
      };

      let result = if (accountsEqual(transfer.from, minter)) {
        if (Option.get(transfer.fee, 0) != 0) {
          return #Err(#BadFee { expected_fee = 0 });
        };
        (#Mint(transfer), 0);
      } else if (accountsEqual(transfer.to, minter)) {
        if (Option.get(transfer.fee, 0) != 0) {
          return #Err(#BadFee { expected_fee = 0 });
        };

        if (transfer.amount < init.transfer_fee) {
          return #Err(#BadBurn { min_burn_amount = init.transfer_fee });
        };

        let debitBalance = balance(transfer.from);
        if (debitBalance < transfer.amount) {
          return #Err(#InsufficientFunds { balance = debitBalance });
        };

        (#Burn(transfer), 0);
      } else {
        let effectiveFee = init.transfer_fee;
        if (Option.get(transfer.fee, effectiveFee) != effectiveFee) {
          return #Err(#BadFee { expected_fee = init.transfer_fee });
        };

        let debitBalance = balance(transfer.from);
        if (debitBalance < transfer.amount + effectiveFee) {
          return #Err(#InsufficientFunds { balance = debitBalance });
        };

        (#Transfer(transfer), effectiveFee);
      };
      #Ok(result);
    };

    public func applyTransfer(args : Types.Transfer) : Types.Result<Types.TxIndex, Types.TransferError> {
      validateSubaccount(args.from.subaccount);
      validateSubaccount(args.to.subaccount);
      validateMemo(args.memo);

      let now = Nat64.fromNat(Int.abs(Time.now()));

      switch (checkTxTime(args.created_at_time, now)) {
        case (#Ok(_)) {};
        case (#Err(e)) { return #Err(e) };
      };

      switch (classifyTransfer(args)) {
        case (#Ok((operation, effectiveFee))) {
          #Ok(recordTransaction({ operation = operation; fee = effectiveFee; timestamp = now }));
        };
        case (#Err(e)) { #Err(e) };
      };
    };

    public func approve({
      approver : Principal;
      from_subaccount : ?Types.Subaccount;
      spender : Principal;
      amount : Int;
      expires_at : ?Nat64;
      memo : ?Types.Memo;
      fee : ?Types.Tokens;
      created_at_time : ?Types.Timestamp;
    }) : Types.Result<Types.TxIndex, Types.ApproveError> {
      validateSubaccount(from_subaccount);
      validateMemo(memo);

      let now = Nat64.fromNat(Int.abs(Time.now()));

      switch (checkTxTime(created_at_time, now)) {
        case (#Ok(_)) {};
        case (#Err(e)) { return #Err(e) };
      };

      let approverAccount = { owner = approver; subaccount = from_subaccount };
      let approval = {
        from = approverAccount;
        spender = spender;
        amount = amount;
        expires_at = expires_at;
        fee = fee;
        created_at_time = created_at_time;
        memo = memo;
      };

      if (Option.isSome(created_at_time)) {
        switch (findApproval(approval)) {
          case (?txid) { return #Err(#Duplicate { duplicate_of = txid }) };
          case (null) {};
        };
      };

      switch (expires_at) {
        case (?expires_at) {
          if (expires_at < now) { return #Err(#Expired { ledger_time = now }) };
        };
        case (null) {};
      };

      let effectiveFee = init.transfer_fee;

      if (Option.get(fee, effectiveFee) != effectiveFee) {
        return #Err(#BadFee({ expected_fee = effectiveFee }));
      };

      let approverBalance = balance(approverAccount);
      if (approverBalance < init.transfer_fee) {
        return #Err(#InsufficientFunds { balance = approverBalance });
      };

      let txid = recordTransaction({
        operation = #Approve(approval);
        fee = effectiveFee;
        timestamp = now;
      });

      assert (balance(approverAccount) == overflowOk(approverBalance - effectiveFee));

      #Ok(txid);
    };

    public func transfer_from({
      spender : Principal;
      from : Types.Account;
      to : Types.Account;
      amount : Types.Tokens;
      fee : ?Types.Tokens;
      memo : ?Types.Memo;
      created_at_time : ?Types.Timestamp;
    }) : Types.Result<Types.TxIndex, Types.TransferFromError> {
      let transfer : Types.Transfer = {
        spender = spender;
        source = #Icrc2TransferFrom;
        from = from;
        to = to;
        amount = amount;
        fee = fee;
        memo = memo;
        created_at_time = created_at_time;
      };

      if (spender == from.owner) {
        return applyTransfer(transfer);
      };

      validateSubaccount(from.subaccount);
      validateSubaccount(to.subaccount);
      validateMemo(memo);

      let now = Nat64.fromNat(Int.abs(Time.now()));

      switch (checkTxTime(created_at_time, now)) {
        case (#Ok(_)) {};
        case (#Err(e)) { return #Err(e) };
      };

      let (operation, effectiveFee) = switch (classifyTransfer(transfer)) {
        case (#Ok(result)) { result };
        case (#Err(err)) { return #Err(err) };
      };

      let preTransferAllowance = allowance(from, spender, now);
      if (preTransferAllowance.allowance < amount + effectiveFee) {
        return #Err(#InsufficientAllowance { allowance = preTransferAllowance.allowance });
      };

      let txid = recordTransaction({
        operation = operation;
        fee = effectiveFee;
        timestamp = now;
      });

      let postTransferAllowance = allowance(from, spender, now);
      assert (postTransferAllowance.allowance == overflowOk(preTransferAllowance.allowance - (amount + effectiveFee)));

      #Ok(txid);
    };

    public func overflowOk(x : Nat) : Nat {
      x;
    };

    public func fromPersistedStorage(persistedData : [Types.Transaction]) : () {
      var newTxLog = Buffer.Buffer<Types.Transaction>(persistedData.size());
      for (tx in Array.vals<Types.Transaction>(persistedData)) {
        newTxLog.add(tx);
      };

      txLog := newTxLog;
    };

    public func toPersistedStorage() : [Types.Transaction] {
      txLog.toArray();
    };

    public func txLogSize() : Nat {
      txLog.size();
    };
  };
};
