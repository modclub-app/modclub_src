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
import Utils "../common/utils";
import CommonTypes "../common/types";
import ModSecurity "../common/security/guard";
import Int "mo:base/Int";
import Constants "constants";

shared ({ caller = deployer }) actor class RSManager(env : CommonTypes.ENV) = this {

  stable var rsByUserIdStable : [(Principal, Int)] = [];
  var rsByUserId = HashMap.HashMap<Principal, Int>(1, Principal.equal, Principal.hash);
  var MODCLUB_WALLET_PRINCIPAL : ?Principal = null;

  stable var admins : List.List<Principal> = List.nil<Principal>();
  let authGuard = ModSecurity.Guard(env, "RS_CANISTER");

  authGuard.subscribe("admins");

  stable var subscriptions = List.nil<Types.Subscriber>();

  private func publish(topic : Text, payload : Principal) : async () {
    try {
      for (subscriber in List.toArray(subscriptions).vals()) {
        if (subscriber.topic == topic) {
          await subscriber._actor.handleSubscription(#events([{ topic; payload }]));
        };
      };
    } catch (e) {
      throw Error.reject("Error while publishing: " # Error.message(e));
    };
  };

  public shared ({ caller }) func subscribe(_topic : Text) : async () {
    Utils.mod_assert(authGuard.isModclubCanister(caller), ModSecurity.AccessMode.NotPermitted);

    let exists = List.some<Types.Subscriber>(
      subscriptions,
      func(sub : Types.Subscriber) {
        Principal.equal(sub.consumer, caller) and sub.topic == _topic
      }
    );
    if (not exists) {
      try {
        subscriptions := List.push<Types.Subscriber>(
          {
            topic = _topic;
            consumer = caller;
            _actor = actor (Principal.toText(caller));
          },
          subscriptions
        );
      } catch (e) {
        throw Error.reject("Error while subscribing: " # Error.message(e));
      };
    };
  };

  public shared ({ caller }) func handleSubscription(payload : CommonTypes.ConsumerPayload) : async () {
    authGuard.handleSubscription(payload);
  };

  public query ({ caller }) func showAdmins() : async [Principal] {
    Utils.mod_assert(authGuard.isAdmin(caller), ModSecurity.AccessMode.NotPermitted);
    authGuard.getAdmins();
  };

  public query ({ caller }) func topUsers(start : Nat, end : Nat) : async [Types.UserAndRS] {
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
    Buffer.toArray<Types.UserAndRS>(topK);
  };

  public query ({ caller }) func queryRSAndLevel() : async Types.RSAndLevel {
    let rs = Option.get(rsByUserId.get(caller), 0);
    {
      score = rs;
      level = determineLevel(rs);
    };
  };

  public query ({ caller }) func queryRSAndLevelByPrincipal(user : Principal) : async Types.RSAndLevel {
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
    Buffer.toArray<Types.UserAndRS>(buff);
  };

  public shared ({ caller }) func updateRS(userId : Principal, votedCorrect : Bool, decision : Types.Decision) : async Types.UserAndRS {
    await _updateRS(userId, votedCorrect, decision);
  };

  public shared ({ caller }) func setRS(userId : Principal, rs : Int) : async Result.Result<Bool, Text> {
    rsByUserId.put(userId, rs);
    #ok(true);
  };

  private func _updateRS(userId : Principal, votedCorrect : Bool, decision : Types.Decision) : async Types.UserAndRS {
    var point : Int = Constants.DEFAULT_RS;
    var pointMultiplier : Int = 1;
    let statBefore = (await queryRSAndLevelByPrincipal(userId));
    let isNovice = statBefore.level == #novice;
    let isSeniorBefore = statBefore.score > Constants.SENIOR1_THRESHOLD;

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
    if ((not isSeniorBefore) and clampedRS > Constants.SENIOR1_THRESHOLD) {
      await publish("moderator_became_senior", userId);
    };

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
    authGuard.subscribe("admins");
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
