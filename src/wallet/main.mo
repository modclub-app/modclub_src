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
import AuthManager "../modclub/service/auth/auth";

shared ({ caller = deployer }) actor class Wallet(env: Text) = this {

  type SubAccount = Text;
  let MILLION: Float = 1000000;
  let MINT_WALLET_ID = Principal.fromText("aaaaa-aa");
  // Keep this as local modclub id
  var MODCLUB_WALLET_PRINCIPAL = Principal.fromText("rkp4c-7iaaa-aaaaa-aaaca-cai");
  if(env == "prod") {
    MODCLUB_WALLET_PRINCIPAL := Principal.fromText("la3yy-gaaaa-aaaah-qaiuq-cai");
  } else if(env == "dev") {
    MODCLUB_WALLET_PRINCIPAL := Principal.fromText("olc6u-lqaaa-aaaah-qcooq-cai");
  } else if(env == "qa") {
    MODCLUB_WALLET_PRINCIPAL := Principal.fromText("f2xjy-4aaaa-aaaah-qc3eq-cai");
  };

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
  
  var allWallets: HashMap.HashMap<Principal, HashMap.HashMap<SubAccount, Float>> = HashMap.HashMap<Principal, HashMap.HashMap<SubAccount, Float>>(1, Principal.equal, Principal.hash);
  stable var allWalletsStable: [(Principal, [(SubAccount, Float)])] = [];
  //----------------------- END All modclub owned Wallets ----------------------------
  stable var admins : List.List<Principal> = List.nil<Principal>();

  public query ({caller}) func queryBalancePr(pr: Principal, from: ?SubAccount) : async Float {
    // default subaccount is 0
    let fromWallet = Option.get(from, DEFAULT_SUB_ACCOUNT);
    let allSubAccountWallets = Option.get(allWallets.get(pr), HashMap.HashMap<SubAccount, Float>(1, Text.equal, Text.hash));
    Option.get(allSubAccountWallets.get(fromWallet), 0: Float);
  };

  public query ({caller}) func queryBalance(from: ?SubAccount) : async Float {
    // default subaccount is 0
    let fromWallet = Option.get(from, DEFAULT_SUB_ACCOUNT);
    let allSubAccountWallets = Option.get(allWallets.get(caller), HashMap.HashMap<SubAccount, Float>(1, Text.equal, Text.hash));
    Option.get(allSubAccountWallets.get(fromWallet), 0: Float);
  };

  public shared ({caller}) func transfer(fromSA: ?SubAccount, toOwner: Principal, toSA: ?SubAccount, amount: Float) : async () {
    await transferFromTo(caller, Option.get(fromSA, DEFAULT_SUB_ACCOUNT), toOwner, Option.get(toSA, DEFAULT_SUB_ACCOUNT), amount);
  };

  public shared ({caller}) func transferBulk(userAndAmounts: [Types.UserAndAmount]) : async () {
    for(userAndAmount in userAndAmounts.vals()) {
      let _ = await transferFromTo(caller, Option.get(userAndAmount.fromSA, DEFAULT_SUB_ACCOUNT), userAndAmount.toOwner, Option.get(userAndAmount.toSA, DEFAULT_SUB_ACCOUNT), userAndAmount.amount);
    };
  };

  public shared ({ caller }) func stakeTokens(amount : Float) : async () {
    await transferFromTo(caller, DEFAULT_SUB_ACCOUNT, MODCLUB_WALLET_PRINCIPAL, (Principal.toText(caller) # STAKE_SA), amount);
  };

   public shared ({caller}) func transferToProvider(fromOwner: Principal, fromSA: ?SubAccount, toOwner: Principal, toSA: ?SubAccount, amount: Float) : async () {
    if (not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    await transferFromTo(fromOwner, Option.get(fromSA, DEFAULT_SUB_ACCOUNT), toOwner, Option.get(toSA, DEFAULT_SUB_ACCOUNT), amount);
  };

  public shared ({caller}) func burn(fromSA: ?SubAccount, amount: Float) : async () {
    await transferFromTo(caller, Option.get(fromSA, DEFAULT_SUB_ACCOUNT), MINT_WALLET_ID, DEFAULT_SUB_ACCOUNT, amount);
  };

  public shared ({caller}) func tge() : async () {
    if (not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    creditWallet(MODCLUB_WALLET_PRINCIPAL, RESERVE_SA, 367.5 * MILLION);
    creditWallet(MODCLUB_WALLET_PRINCIPAL, AIRDROP_SA, 10 * MILLION);
    creditWallet(MODCLUB_WALLET_PRINCIPAL, MARKETING_SA, 50 * MILLION);
    creditWallet(MODCLUB_WALLET_PRINCIPAL, ADVISORS_SA, 50 * MILLION);
    creditWallet(MODCLUB_WALLET_PRINCIPAL, PRESEED_SA, 62.5 * MILLION);
    creditWallet(MODCLUB_WALLET_PRINCIPAL, PUBLICSALE_SA, 100 * MILLION);
    creditWallet(MODCLUB_WALLET_PRINCIPAL, MAIN_SA, 100 * MILLION);
    creditWallet(MODCLUB_WALLET_PRINCIPAL, SEED_SA, 100 * MILLION);
    creditWallet(MODCLUB_WALLET_PRINCIPAL, TEAM_SA, 160 * MILLION);
  };

  private func transferFromTo(fromOwner: Principal, fromSA: SubAccount, toOwner: Principal, toSA: SubAccount, amount: Float): async () {
    let _ = await debitWallet(fromOwner, fromSA, amount);
    creditWallet(toOwner, toSA, amount);
  };

  private func creditWallet(toOwner: Principal, toSA: SubAccount, amount: Float) : () {
    initializeWalletIfAbsent(toOwner);

    let _ = do ? {
      let subAccountMap = allWallets.get(toOwner)!;
      subAccountMap.put(toSA, Option.get(subAccountMap.get(toSA), 0.0) + amount);
    };
  };

  private func debitWallet(fromOwner : Principal, fromSA: SubAccount, amount : Float) : async () {
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
    allWallets.put(toOwner, Option.get(allWallets.get(toOwner), HashMap.HashMap<SubAccount, Float>(1, Text.equal, Text.hash)));
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
    // Reinitializing storage Solution to add "this" actor as a controller
    admins := AuthManager.setUpDefaultAdmins(
      admins,
      deployer,
      Principal.fromActor(this),
    );
    allWallets := HashMap.HashMap<Principal, HashMap.HashMap<SubAccount, Float>>(1, Principal.equal, Principal.hash);
    for((owner: Principal, subAccounts: [(Text, Float)]) in allWalletsStable.vals()) {
      let subAccountMap = HashMap.fromIter<Text, Float>(subAccounts.vals(), subAccounts.size(), Text.equal, Text.hash);
      allWallets.put(owner, subAccountMap);
    };
  };


  public shared query ({ caller }) func getAdmins() : async Result.Result<[Principal], Text> {
    if (not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    AuthManager.getAdmins(caller, admins);
  };

  public shared query ({ caller }) func isUserAdmin() : async Bool {
    if (not AuthManager.isAdmin(caller, admins)) {
      return false;
    };
    return true;
  };

  //This function should be invoked immediately after the canister is deployed via script.
  public shared ({ caller }) func registerAdmin(id : Principal) : async Result.Result<(), Text> {
    await resolveAdminResponse(AuthManager.registerAdmin(caller, admins, id));
  };

  public shared ({ caller }) func unregisterAdmin(id : Text) : async Result.Result<(), Text> {
    await resolveAdminResponse(AuthManager.unregisterAdmin(caller, admins, id));
  };

  func resolveAdminResponse(
    adminListResponse : Result.Result<List.List<Principal>, Text>,
  ) : async Result.Result<(), Text> {
    switch (adminListResponse) {
      case (#err(Unauthorized)) {
        return #err(Unauthorized);
      };
      case (#ok(adminList)) {
        admins := adminList;
        #ok();
      };
    };
  };

};

