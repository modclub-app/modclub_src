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
import Types "./types";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import AuthManager "../modclub/service/auth/auth";
import Utils "../common/utils";
import CommonTypes "../common/types";
import Timer "mo:base/Timer";
import ModSecurity "../common/security/guard";

shared ({ caller = deployer }) actor class Wallet(env : CommonTypes.ENV) = this {

  let authGuard = ModSecurity.Guard(env, "WALLET_CANISTER");
  ignore Timer.setTimer(
    #seconds(0),
    func() : async () {
      Debug.print("SUBSCRIBING WALLET CANISTER on ADMINS");
      await authGuard.subscribe("admins");
    }
  );

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
  // Modclub's main wallets - kind of sub accounts owned by modclub

  var allWallets : HashMap.HashMap<Principal, HashMap.HashMap<Types.SubAccount, Float>> = HashMap.HashMap<Principal, HashMap.HashMap<Types.SubAccount, Float>>(1, Principal.equal, Principal.hash);
  stable var allWalletsStable : [(Principal, [(Types.SubAccount, Float)])] = [];
  //----------------------- END All modclub owned Wallets ----------------------------
  stable var admins : List.List<Principal> = List.nil<Principal>();

  public shared ({ caller }) func handleSubscription(payload : CommonTypes.ConsumerPayload) : async () {
    Debug.print("[WALLET_CANISTER] [SUBSCRIPTION HANDLER] ==> Payload received");
    authGuard.handleSubscription(payload);
  };

  public query ({ caller }) func queryBalancePr(pr : Principal, from : ?Types.SubAccount) : async Float {
    // default subaccount is 0
    let fromWallet = Option.get(from, DEFAULT_SUB_ACCOUNT);
    let allSubAccountWallets = Option.get(allWallets.get(pr), HashMap.HashMap<Types.SubAccount, Float>(1, Text.equal, Text.hash));
    Option.get(allSubAccountWallets.get(fromWallet), 0 : Float);
  };

  public query ({ caller }) func queryBalance(from : ?Types.SubAccount) : async Float {
    // default subaccount is 0
    let fromWallet = Option.get(from, DEFAULT_SUB_ACCOUNT);
    let allSubAccountWallets = Option.get(allWallets.get(caller), HashMap.HashMap<Types.SubAccount, Float>(1, Text.equal, Text.hash));
    Option.get(allSubAccountWallets.get(fromWallet), 0 : Float);
  };

  public shared ({ caller }) func transfer(fromSA : ?Types.SubAccount, toOwner : Principal, toSA : ?Types.SubAccount, amount : Float) : async () {
    await transferFromTo(caller, Option.get(fromSA, DEFAULT_SUB_ACCOUNT), toOwner, Option.get(toSA, DEFAULT_SUB_ACCOUNT), amount);
  };

  public shared ({ caller }) func transferBulk(userAndAmounts : [Types.UserAndAmount]) : async () {
    for (userAndAmount in userAndAmounts.vals()) {
      let _ = await transferFromTo(caller, Option.get(userAndAmount.fromSA, DEFAULT_SUB_ACCOUNT), userAndAmount.toOwner, Option.get(userAndAmount.toSA, DEFAULT_SUB_ACCOUNT), userAndAmount.amount);
    };
  };

  public shared ({ caller }) func stakeTokens(amount : Float) : async () {
    await transferFromTo(caller, DEFAULT_SUB_ACCOUNT, Utils.unwrap(MODCLUB_WALLET_PRINCIPAL), (Principal.toText(caller) # STAKE_SA), amount);
  };

  public shared ({ caller }) func transferToProvider(fromOwner : Principal, fromSA : ?Types.SubAccount, toOwner : Principal, toSA : ?Types.SubAccount, amount : Float) : async () {
    await transferFromTo(fromOwner, Option.get(fromSA, DEFAULT_SUB_ACCOUNT), toOwner, Option.get(toSA, DEFAULT_SUB_ACCOUNT), amount);
  };

  public shared ({ caller }) func burn(fromSA : ?Types.SubAccount, amount : Float) : async () {
    await transferFromTo(caller, Option.get(fromSA, DEFAULT_SUB_ACCOUNT), MINT_WALLET_ID, DEFAULT_SUB_ACCOUNT, amount);
  };

  public shared ({ caller }) func tge() : async () {
    creditWallet(Utils.unwrap(MODCLUB_WALLET_PRINCIPAL), RESERVE_SA, 367.5 * MILLION);
    creditWallet(Utils.unwrap(MODCLUB_WALLET_PRINCIPAL), AIRDROP_SA, 10 * MILLION);
    creditWallet(Utils.unwrap(MODCLUB_WALLET_PRINCIPAL), MARKETING_SA, 50 * MILLION);
    creditWallet(Utils.unwrap(MODCLUB_WALLET_PRINCIPAL), ADVISORS_SA, 50 * MILLION);
    creditWallet(Utils.unwrap(MODCLUB_WALLET_PRINCIPAL), PRESEED_SA, 62.5 * MILLION);
    creditWallet(Utils.unwrap(MODCLUB_WALLET_PRINCIPAL), PUBLICSALE_SA, 100 * MILLION);
    creditWallet(Utils.unwrap(MODCLUB_WALLET_PRINCIPAL), MAIN_SA, 100 * MILLION);
    creditWallet(Utils.unwrap(MODCLUB_WALLET_PRINCIPAL), SEED_SA, 100 * MILLION);
    creditWallet(Utils.unwrap(MODCLUB_WALLET_PRINCIPAL), TEAM_SA, 160 * MILLION);
  };

  private func transferFromTo(fromOwner : Principal, fromSA : Types.SubAccount, toOwner : Principal, toSA : Types.SubAccount, amount : Float) : async () {
    let _ = await debitWallet(fromOwner, fromSA, amount);
    creditWallet(toOwner, toSA, amount);
  };

  private func creditWallet(toOwner : Principal, toSA : Types.SubAccount, amount : Float) : () {
    initializeWalletIfAbsent(toOwner);

    let _ = do ? {
      let subAccountMap = allWallets.get(toOwner)!;
      subAccountMap.put(toSA, Option.get(subAccountMap.get(toSA), 0.0) + amount);
    };
  };

  private func debitWallet(fromOwner : Principal, fromSA : Types.SubAccount, amount : Float) : async () {
    initializeWalletIfAbsent(fromOwner);

    let _ = do ? {
      let subAccountMap = allWallets.get(fromOwner)!;

      let existingBalance = Option.get(subAccountMap.get(fromSA), 0.0);
      if (existingBalance < amount) {
        throw Error.reject("Insufficient Funds.");
      } else {
        subAccountMap.put(fromSA, existingBalance - amount);
      };
    };
  };

  private func initializeWalletIfAbsent(toOwner : Principal) {
    allWallets.put(toOwner, Option.get(allWallets.get(toOwner), HashMap.HashMap<Types.SubAccount, Float>(1, Text.equal, Text.hash)));
  };

  system func preupgrade() {
    allWalletsStable := [];
    // let walletStableBuff = Buffer.Buffer<(Principal, [(SubAccount, Float)])>(allWallets.size());
    // for((owner, subAccount) in allWallets.entries()) {
    //   walletStableBuff.add(owner, Iter.toArray(subAccount.entries()));
    // };
    // allWalletsStable := walletStableBuff.toArray();
  };

  system func postupgrade() {
    ignore Timer.setTimer(
      #seconds(0),
      func() : async () {
        Debug.print("SUBSCRIBING WALLET CANISTER on ADMINS");
        await authGuard.subscribe("admins");
      }
    );

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

  public shared query ({ caller }) func isUserAdmin() : async Bool {
    Utils.mod_assert(authGuard.isAdmin(caller), ModSecurity.AccessMode.NotPermitted);
    authGuard.isAdmin(caller);
  };

  system func inspect({
    arg : Blob;
    caller : Principal;
    msg : Types.WalletCanisterMethods;
  }) : Bool {
    switch (msg) {
      case (#transferToProvider _) { authGuard.isAdmin(caller) };
      case (#tge _) { authGuard.isAdmin(caller) };
      case (#handleSubscription _) { authGuard.isModclubAuth(caller) };
      case _ { not Principal.isAnonymous(caller) };
    };
  };

};
