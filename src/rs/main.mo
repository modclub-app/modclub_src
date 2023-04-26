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
import Types "./types";
import AuthManager "../modclub/service/auth/auth";
import Utils "../common/utils";
import CommonTypes "../common/types"

shared ({ caller = deployer }) actor class RSManager(env : CommonTypes.ENV) = this {

  stable var rsByUserIdStable : [(Principal, Float)] = [];
  var rsByUserId = HashMap.HashMap<Principal, Float>(1, Principal.equal, Principal.hash);
  stable var admins : List.List<Principal> = List.nil<Principal>();
  var MODCLUB_WALLET_PRINCIPAL : ?Principal = null;

  switch (env) {
    case (#local(value)) {
      MODCLUB_WALLET_PRINCIPAL := ?value.modclub_canister_id;
    };
    case (#prod) {
      MODCLUB_WALLET_PRINCIPAL := ?Principal.fromText("la3yy-gaaaa-aaaah-qaiuq-cai");
    };
    case (#dev) {
      MODCLUB_WALLET_PRINCIPAL := ?Principal.fromText("olc6u-lqaaa-aaaah-qcooq-cai");
    };
    case (#qa) {
      MODCLUB_WALLET_PRINCIPAL := ?Principal.fromText("f2xjy-4aaaa-aaaah-qc3eq-cai");
    };
  };

  public query ({ caller }) func topUsers(start : Nat, end : Nat) : async [Types.UserAndRS] {
    let allUsers : [(Principal, Float)] = Iter.toArray(rsByUserId.entries());
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
    let rs = Option.get(rsByUserId.get(caller), 0.0);
    {
      score = rs;
      level = determineLevel(rs);
    };
  };

  public query ({ caller }) func queryRSAndLevelByPrincipal(user : Principal) : async Types.RSAndLevel {
    let rs = Option.get(rsByUserId.get(user), 0.0);
    {
      score = rs;
      level = determineLevel(rs);
    };
  };

  public shared ({ caller }) func updateRSBulk(userVotes : [Types.UserAndVote]) : async [Types.UserAndRS] {
    if (not Principal.equal(Utils.unwrap(MODCLUB_WALLET_PRINCIPAL), caller)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    let buff = Buffer.Buffer<Types.UserAndRS>(userVotes.size());
    for (userVote in userVotes.vals()) {
      buff.add(await _updateRS(userVote.userId, userVote.votedCorrect));
    };
    buff.toArray();
  };

  public shared ({ caller }) func updateRS(userId : Principal, votedCorrect : Bool) : async Types.UserAndRS {
    if (not Principal.equal(Utils.unwrap(MODCLUB_WALLET_PRINCIPAL), caller)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    return await _updateRS(userId, votedCorrect);
  };

  public shared ({ caller }) func setRS(userId : Principal, rs : Float) : async () {
    if (not AuthManager.isAdmin(caller, admins)) {
      throw Error.reject(AuthManager.Unauthorized);
    };
    rsByUserId.put(userId, rs);
  };

  private func _updateRS(userId : Principal, votedCorrect : Bool): async Types.UserAndRS {
    var point : Float = 0.1;
    if (not votedCorrect) {
      point := point * -1;
    };
    let currentRS : Float = Option.get(rsByUserId.get(userId), 0.0);

    if (not ((currentRS == 0 and point < 0) or (currentRS == 100 and point > 0))) {
      rsByUserId.put(userId, currentRS + point);
    };
    return {
      userId = userId;
      score = currentRS;
    };
  };
  private func sortTopUser(user1 : (Principal, Float), user2 : (Principal, Float)) : Order.Order {
    Float.compare(user2.1, user1.1);
  };

  private func determineLevel(score : Float) : Types.UserLevel {
    if (score < 20) {
      return #novice;
    } else if (score < 50) {
      return #junior;
    } else if (score < 70) {
      return #senior1;
    } else if (score < 90) {
      return #senior2;
    } else {
      return #senior3;
    };
  };

  system func preupgrade() {
    rsByUserIdStable := Iter.toArray(rsByUserId.entries());
  };

  system func postupgrade() {
    admins := AuthManager.setUpDefaultAdmins(
      admins,
      deployer,
      Principal.fromActor(this)
    );
    rsByUserId := HashMap.fromIter<Principal, Float>(rsByUserIdStable.vals(), rsByUserIdStable.size(), Principal.equal, Principal.hash);
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
    adminListResponse : Result.Result<List.List<Principal>, Text>
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
