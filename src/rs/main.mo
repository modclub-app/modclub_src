import Canistergeek "../modclub/canistergeek/canistergeek";
import Error "mo:base/Error";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Float "mo:base/Float";
import Buffer "mo:base/Buffer";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Order "mo:base/Order";
import Array "mo:base/Array";
import Result "mo:base/Result";
import List "mo:base/List";
import Debug "mo:base/Debug";
import Types "./types";
import AuthManager "../modclub/service/auth/auth";
import Utils "../common/utils";
import CommonTypes "../common/types";
import Timer "mo:base/Timer";
import ModSecurity "../common/security/guard";
import Int "mo:base/Int";
import Constants "constants";

shared ({ caller = deployer }) actor class RSManager(env : CommonTypes.ENV) = this {

  stable var rsByUserIdStable : [(Principal, Int)] = [];
  var rsByUserId = HashMap.HashMap<Principal, Int>(1, Principal.equal, Principal.hash);
  var MODCLUB_WALLET_PRINCIPAL : ?Principal = null;

  stable var admins : List.List<Principal> = List.nil<Principal>();
  let authGuard = ModSecurity.Guard(env, "RS_CANISTER");
  ignore Timer.setTimer(
    #seconds(0),
    func() : async () {
      Debug.print("SUBSCRIBING RS CANISTER on ADMINS");
      await authGuard.subscribe("admins");
    }
  );

  public shared ({ caller }) func handleSubscription(payload : CommonTypes.ConsumerPayload) : async () {
    // Debug.print("[RS_CANISTER] [SUBSCRIPTION HANDLER] ==> Payload received");
    authGuard.handleSubscription(payload);
  };

  // For testing purposes
  public query ({ caller }) func showAdmins() : async [Principal] {
    Utils.mod_assert(authGuard.isAdmin(caller), ModSecurity.AccessMode.NotPermitted);
    authGuard.getAdmins();
  };

  public query ({ caller }) func topUsers(start : Nat, end : Nat) : async [Types.UserAndRS] {
    // Utils.mod_assert(authGuard.isAdmin(caller), ModSecurity.AccessMode.NotPermitted);

    let allUsers : [(Principal, Int)] = Iter.toArray(rsByUserId.entries());
    let topUsers = Array.sort(allUsers, sortTopUser);
    let topK = Buffer.Buffer<Types.UserAndRS>(end - start);
    var i : Nat = start;
    while (i < end and i < topUsers.size()) {
      topK.add({
        userId = topUsers[i].0;
        score = topUsers[i].1;
      });
      i := i + 1;
    };
    topK.toArray();
  };

  public query ({ caller }) func queryRSAndLevel() : async Types.RSAndLevel {
    // Utils.mod_assert(authGuard.isAdmin(caller), ModSecurity.AccessMode.NotPermitted);

    let rs = Option.get(rsByUserId.get(caller), 0);
    {
      score = rs;
      level = determineLevel(rs);
    };
  };

  public query ({ caller }) func queryRSAndLevelByPrincipal(user : Principal) : async Types.RSAndLevel {
    // Utils.mod_assert(authGuard.isAdmin(caller), ModSecurity.AccessMode.NotPermitted);
    let rs = Option.get(rsByUserId.get(user), 0);
    {
      score = rs;
      level = determineLevel(rs);
    };
  };

  public shared ({ caller }) func updateRSBulk(userVotes : [Types.UserAndVote]) : async [Types.UserAndRS] {
    let buff = Buffer.Buffer<Types.UserAndRS>(userVotes.size());
    for (userVote in userVotes.vals()) {
      buff.add(await _updateRS(userVote.userId, userVote.votedCorrect, userVote.decision));
    };
    buff.toArray();
  };

  public shared ({ caller }) func updateRS(userId : Principal, votedCorrect : Bool, decision : Types.Decision) : async Types.UserAndRS {
    await _updateRS(userId, votedCorrect, decision);
  };

  public shared ({ caller }) func setRS(userId : Principal, rs : Int) : async () {
    rsByUserId.put(userId, rs);
  };

  private func _updateRS(userId : Principal, votedCorrect : Bool, decision : Types.Decision) : async Types.UserAndRS {
    var point : Int = Constants.DEFAULT_RS;
    var pointMultiplier : Int = 1;
    let isNovice = (await queryRSAndLevelByPrincipal(userId)).level == #novice;

    if (isNovice) {
      pointMultiplier := 10;
    };
    if (not votedCorrect) {
      if (decision == #approved) {
        point := -2 * pointMultiplier * point;
      } else {
        point := -1 * pointMultiplier * point;
      };
    } else {
      point := pointMultiplier * point;
    };
    let currentRS : Int = Option.get(rsByUserId.get(userId), 0);
    let updateRS = currentRS + point;

    let clampedRS = Int.min(Int.max(updateRS, 0), Constants.MAX_RS);
    rsByUserId.put(userId, clampedRS);

    return {
      userId = userId;
      score = currentRS;
    };
  };
  private func sortTopUser(user1 : (Principal, Int), user2 : (Principal, Int)) : Order.Order {
    Int.compare(user2.1, user1.1);
  };

  private func determineLevel(score : Int) : Types.UserLevel {
    if (score < Constants.NOVICE_THRESHOLD) {
      return #novice;
    } else if (score < Constants.JUNIOR_THRESHOLD) {
      return #junior;
    } else if (score < Constants.SENIOR1_THRESHOLD) {
      return #senior1;
    } else if (score < Constants.SENIOR2_THRESHOLD) {
      return #senior2;
    } else {
      return #senior3;
    };
  };

  system func preupgrade() {
    rsByUserIdStable := Iter.toArray(rsByUserId.entries());
  };

  system func postupgrade() {
    Debug.print("POSTUPGRADE FOR RS CANISTER");
    ignore Timer.setTimer(
      #seconds(0),
      func() : async () {
        Debug.print("SUBSCRIBING RS CANISTER on ADMINS");
        await authGuard.subscribe("admins");
      }
    );

    admins := authGuard.setUpDefaultAdmins(
      admins,
      deployer,
      Principal.fromActor(this)
    );
    rsByUserId := HashMap.fromIter<Principal, Int>(rsByUserIdStable.vals(), rsByUserIdStable.size(), Principal.equal, Principal.hash);
  };

  system func inspect({
    arg : Blob;
    caller : Principal;
    msg : Types.RSCanisterMessageInspection;
  }) : Bool {
    switch (msg) {
      case (#setRS _) { authGuard.isAdmin(caller) };
      case (#updateRS _) { authGuard.isModclubWallet(caller) };
      case (#updateRSBulk _) { authGuard.isModclubWallet(caller) };
      case (#handleSubscription _) { authGuard.isModclubAuth(caller) };
      case _ { not Principal.isAnonymous(caller) };
    };
  };

};
