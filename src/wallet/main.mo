import Canistergeek "../modclub/canistergeek/canistergeek";
import Error "mo:base/Error";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Float "mo:base/Float";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Int "mo:base/Int";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Blob "mo:base/Blob";
import Types "./types";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Timer "mo:base/Timer";
import Utils "../common/utils";
import CommonTypes "../common/types";
import ModSecurity "../common/security/guard";
import Constants "../common/constants";
import ICRCLedger "ICRC/ledger";
import ICRCTypes "ICRC/types";

shared ({ caller = deployer }) actor class Wallet({
  env : CommonTypes.ENV;
  ledgerInit : ICRCTypes.LedgerInitParams;
}) = this {

  let authGuard = ModSecurity.Guard(env, "WALLET_CANISTER");
  authGuard.subscribe("admins");
  let vestingActor = authGuard.getVestingActor();

  let MILLION : Float = 1000000;
  let MINT_WALLET_ID = Principal.fromText("aaaaa-aa");
  var MODCLUB_WALLET_PRINCIPAL : ?Principal = ?authGuard.getCanisterId(#modclub);

  let DEFAULT_SUB_ACCOUNT = "0";

  let TREASURY_SA = "TREASURY";
  let RESERVE_SA = "RESERVE";
  let AIRDROP_SA = "AIRDROP";
  let MARKETING_SA = "MARKETING";
  let ADVISORS_SA = "ADVISORS";
  let PRESEED_SA = "PRESEED";
  let PUBLICSALE_SA = "PUBLICSALE";
  let MAIN_SA = "MAIN";
  let SEED_SA = "SEED";
  let TEAM_SA = "TEAM";
  let ACCOUNT_PAYABLE = "AP";
  let STAKE_SA = "STAKE";

  //----------------------- All modclub owned Wallets ----------------------------
  var allWallets : HashMap.HashMap<Principal, HashMap.HashMap<Types.SubAccount, Float>> = HashMap.HashMap<Principal, HashMap.HashMap<Types.SubAccount, Float>>(1, Principal.equal, Principal.hash);
  stable var allWalletsStable : [(Principal, [(Types.SubAccount, Float)])] = [];
  //----------------------- END All modclub owned Wallets ----------------------------
  stable var admins : List.List<Principal> = List.nil<Principal>();

  public shared ({ caller }) func handleSubscription(payload : CommonTypes.ConsumerPayload) : async () {
    authGuard.handleSubscription(payload);
  };

  stable var persistedLedgerStorage : [ICRCTypes.Transaction] = [];
  var ledger = ICRCLedger.Ledger(ledgerInit);
  if (ledger.txLogSize() == 0) {
    ledger.makeGenesisChain();
  };

  public shared ({ caller }) func icrc1_transfer({
    from_subaccount : ?ICRCTypes.Subaccount;
    to : ICRCTypes.Account;
    amount : ICRCTypes.Tokens;
    fee : ?ICRCTypes.Tokens;
    memo : ?ICRCTypes.Memo;
    created_at_time : ?ICRCTypes.Timestamp;
  }) : async ICRCTypes.Result<ICRCTypes.TxIndex, ICRCTypes.TransferError> {
    ledger.applyTransfer({
      spender = caller;
      source = #Icrc1Transfer;
      from = {
        owner = caller;
        subaccount = from_subaccount;
      };
      to = to;
      amount = amount;
      fee = fee;
      memo = memo;
      created_at_time = created_at_time;
    });
  };

  public query func icrc1_balance_of(account : ICRCTypes.Account) : async ICRCTypes.Tokens {
    ledger.balance(account);
  };

  public query func icrc1_total_supply() : async ICRCTypes.Tokens {
    ledger.totalSupply();
  };

  public query func icrc1_minting_account() : async ?ICRCTypes.Account {
    ?ledgerInit.minting_account;
  };

  public query func icrc1_name() : async Text {
    ledgerInit.token_name;
  };

  public query func icrc1_symbol() : async Text {
    ledgerInit.token_symbol;
  };

  public query func icrc1_decimals() : async Nat8 {
    ledgerInit.decimals;
  };

  public query func icrc1_fee() : async Nat {
    ledgerInit.transfer_fee;
  };

  public query func icrc1_metadata() : async [(Text, ICRCTypes.Value)] {
    [
      ("icrc1:name", #Text(ledgerInit.token_name)),
      ("icrc1:symbol", #Text(ledgerInit.token_symbol)),
      ("icrc1:decimals", #Nat(Nat8.toNat(ledgerInit.decimals))),
      ("icrc1:fee", #Nat(ledgerInit.transfer_fee))
    ];
  };

  public query func icrc1_supported_standards() : async [{
    name : Text;
    url : Text;
  }] {
    [
      {
        name = "ICRC-1";
        url = "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-1";
      },
      {
        name = "ICRC-2";
        url = "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-2";
      }
    ];
  };

  public shared ({ caller }) func icrc2_approve(args : ICRCTypes.ApproveArgs) : async ICRCTypes.Result<ICRCTypes.TxIndex, ICRCTypes.ApproveError> {
    ledger.approve({
      approver = caller;
      from_subaccount = args.from_subaccount;
      spender = args.spender;
      amount = args.amount;
      expires_at = args.expires_at;
      memo = args.memo;
      fee = args.fee;
      created_at_time = args.created_at_time;
    });
  };

  public shared ({ caller }) func icrc2_transfer_from(args : ICRCTypes.TransferFromArgs) : async ICRCTypes.Result<ICRCTypes.TxIndex, ICRCTypes.TransferFromError> {
    ledger.transfer_from({
      spender = caller;
      from = args.from;
      to = args.to;
      amount = args.amount;
      fee = args.fee;
      memo = args.memo;
      created_at_time = args.created_at_time;
    });
  };

  public query func icrc2_allowance(args : ICRCTypes.AllowanceArgs) : async ICRCTypes.Allowance {
    ledger.allowance(args.account, args.spender, Nat64.fromNat(Int.abs(Time.now())));
  };

  public query ({ caller }) func ledger_account() : async ICRCTypes.Account {
    Utils.mod_assert(authGuard.isAdmin(caller) or authGuard.isModclubCanister(caller), ModSecurity.AccessMode.NotPermitted);
    ledgerInit.ledger_account;
  };

  public shared ({ caller }) func transferToProvider(args : Types.TransferToProviderArgs) : async ICRCTypes.Result<ICRCTypes.TxIndex, ICRCTypes.TransferError> {
    ledger.applyTransfer({
      spender = caller;
      source = #Icrc1Transfer;
      from = args.from;
      to = args.to;
      amount = args.amount;
      created_at_time = null;
      fee = null;
      memo = null;
    });
  };

  public shared ({ caller }) func burn(fromSA : ?ICRCTypes.Subaccount, amount : Nat) : async () {
    let _ = ledger.applyTransfer({
      spender = caller;
      source = #Icrc1Transfer;
      from = {
        owner = caller;
        subaccount = fromSA;
      };
      to = ledgerInit.minting_account;
      amount = amount;
      created_at_time = null;
      fee = null;
      memo = null;
    });
  };

  public shared ({ caller }) func stakeTokens(amount : Nat) : async ICRCTypes.Result<ICRCTypes.TxIndex, ICRCTypes.TransferError> {
    let moderatorAcc = { owner = caller; subaccount = null };
    let modclubPrincipal = authGuard.getCanisterId(#modclub);
    let modclubStakingAcc = {
      owner = modclubPrincipal;
      subaccount = ?ICRCLedger.ICRC_STAKING_SA;
    };

    let stakeTransfer = ledger.applyTransfer({
      spender = caller;
      source = #Icrc1Transfer;
      from = moderatorAcc;
      to = modclubStakingAcc;
      amount = amount;
      created_at_time = null;
      fee = null;
      memo = null;
    });
    switch (stakeTransfer) {
      case (#Ok(txIndex)) {
        let stakeRes = await vestingActor.stake(moderatorAcc, amount);
        switch (stakeRes) {
          case (#ok(_)) {
            #Ok(txIndex);
          };
          case (#err(e)) { return throw Error.reject(e) };
        };
      };
      case (#Err(e)) {
        return throw Error.reject("Can't stake necessary amount of tokens: InsufficientAllowance.");
      };
    };
  };

  public shared ({ caller }) func releaseTokens(amount : ICRCTypes.Tokens) : async ICRCTypes.Result<ICRCTypes.TxIndex, ICRCTypes.TransferError> {
    let moderatorAcc = { owner = caller; subaccount = null };
    let modclubPrincipal = authGuard.getCanisterId(#modclub);
    let modclubStakingAcc = {
      owner = modclubPrincipal;
      subaccount = ?ICRCLedger.ICRC_STAKING_SA;
    };
    let unlockedAmount = await vestingActor.unlocked_stakes_for(moderatorAcc);
    if (unlockedAmount < amount) {
      return throw Error.reject("Withdraw amount cant be more than unlocked amount of tokens.");
    };

    let release = await vestingActor.release_staking(moderatorAcc, amount);
    switch (release) {
      case (#Ok(res)) {
        let releaseTransfer = ledger.applyTransfer({
          spender = modclubPrincipal;
          source = #Icrc1Transfer;
          from = modclubStakingAcc;
          to = moderatorAcc;
          amount = amount;
          created_at_time = null;
          fee = null;
          memo = null;
        });
        switch (releaseTransfer) {
          case (#Ok(txIndex)) {
            #Ok(txIndex);
          };
          case (#Ok(txIndex)) {
            return throw Error.reject("Can't withdraw unlocked amount of tokens.");
          };
        };
      };
      case (#Err(e)) {
        return throw Error.reject("Can't withdraw unlocked amount of tokens.");
      };
    };
  };

  public shared ({ caller }) func claimStakedTokens(amount : ICRCTypes.Tokens) : async Result.Result<Nat, Text> {
    let moderatorAcc = { owner = caller; subaccount = null };
    let stakedAmount = await vestingActor.staked_for(moderatorAcc);
    if (stakedAmount < amount) {
      return throw Error.reject("Amount can't be more than staked amount of tokens.");
    };

    let claimStaked = await vestingActor.claim_staking(moderatorAcc, amount);

    ignore Timer.setTimer(
      #seconds(Constants.VESTING_DISSOLVE_DELAY_SECONDS + 10),
      func() : async () {
        let releaseStaked = await vestingActor.unlock_staking(moderatorAcc, amount);
      }
    );

    claimStaked;
  };

  system func preupgrade() {
    persistedLedgerStorage := ledger.toPersistedStorage();
    allWalletsStable := [];
  };

  system func postupgrade() {
    ledger.fromPersistedStorage(persistedLedgerStorage);
    authGuard.subscribe("admins");
    admins := authGuard.setUpDefaultAdmins(
      admins,
      deployer,
      Principal.fromActor(this)
    );
    allWallets := HashMap.HashMap<Principal, HashMap.HashMap<Types.SubAccount, Float>>(1, Principal.equal, Principal.hash);
    for ((owner : Principal, subAccounts : [(Text, Float)]) in allWalletsStable.vals()) {
      let subAccountMap = HashMap.fromIter<Text, Float>(subAccounts.vals(), subAccounts.size(), Text.equal, Text.hash);
      allWallets.put(owner, subAccountMap);
    };
  };

  public shared query ({ caller }) func getAdmins() : async Result.Result<[Principal], Text> {
    Utils.mod_assert(authGuard.isAdmin(caller), ModSecurity.AccessMode.NotPermitted);
    #ok(authGuard.getAdmins());
  };

  system func inspect({
    arg : Blob;
    caller : Principal;
    msg : Types.WalletCanisterMethods;
  }) : Bool {
    switch (msg) {
      case (#transferToProvider _) { authGuard.isAdmin(caller) };
      case (#handleSubscription _) { authGuard.isModclubAuth(caller) };
      case _ { not Principal.isAnonymous(caller) };
    };
  };

};
