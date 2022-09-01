import Error "mo:base/Error";
import Buffer "mo:base/Buffer";
import Array "mo:base/Array";
import Order "mo:base/Order";

import GlobalState "../../statev1";
import Types "../../types";
import Helpers "../../helpers";

module AirDropModule {

  public func airdropRegister(userId : Principal, state : GlobalState.State) : async Types.AirdropUser {
    switch (state.airdropUsers.get(userId)) {
      case (?result) {
        throw Error.reject("User already registered for airdrop");
      };
      case (null) {
        let user : Types.AirdropUser = {
          id = userId;
          createdAt = Helpers.timeNow();
        };
        state.airdropUsers.put(userId, user);
        return user;
      };
    };
  };

  public func isAirdropRegistered(userId : Principal, state : GlobalState.State) : async Types.AirdropUser {
    switch (state.airdropUsers.get(userId)) {
      case (?result) {
        return result;
      };
      case (null) {
        throw Error.reject("User not registered");
      };
    };
  };

  public func getAirdropUsers(state : GlobalState.State) : [Types.AirdropUser] {
    let buf = Buffer.Buffer<Types.AirdropUser>(0);
    for ((id, u) in state.airdropUsers.entries()) { buf.add(u) };
    return Array.sort(buf.toArray(), compareUsers);
  };

  public func addToAirdropWhitelist(
    pids : [Principal],
    state : GlobalState.State,
  ) : () {
    for (pid in pids.vals()) {
      state.airdropWhitelist.put(pid, pid);
    };
  };

  public func getAirdropWhitelist(state : GlobalState.State) : [Principal] {
    let buf = Buffer.Buffer<Principal>(0);
    for ((id, u) in state.airdropWhitelist.entries()) { buf.add(u) };
    return buf.toArray();
  };

  private func compareUsers(a : Types.AirdropUser, b : Types.AirdropUser) : Order.Order {
    if (a.createdAt > b.createdAt) {
      #greater;
    } else if (a.createdAt < b.createdAt) {
      #less;
    } else {
      #equal;
    };
  };
};
