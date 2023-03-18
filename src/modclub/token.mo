import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import State "./statev1";
import Types "./types";

module Token {
  public type Map<X, Y> = HashMap.HashMap<X, Y>;
  public type TokenWallets = Map<Principal, Int>;
  public type TokenStakes = Map<Principal, Int>;
  public type TokenRewards = Map<Principal, Int>;

  // Token Constants
  public let TOKEN_MAX_SUPPLY = 1_000_000_000_000_000_000_000_000_000;
  // 1 billion * 10^18
  public let TOKEN_NAME = "MODCLUB Token";
  public let TOKEN_SYMBOL = "MOD";
  public let TOKEN_DECIMALS = 18;
  public let TOKEN_OWNER_BALANCE = TOKEN_MAX_SUPPLY;

  public type Holdings = {
    wallet : Int;
    stake : Int;
    pendingRewards : Int;
    userPoints : Int;
  };

  // Todo - Make these into objects insteda of Ints, we should hold rewards pending etc
  public type TokensStable = {
    tokenWallets : [(Principal, Int)];
    tokenStakes : [(Principal, Int)];
    tokenRewards : [(Principal, Int)];
  };

  public type TokensStableV1 = {
    tokenWallets : [(Principal, Int)];
    tokenStakes : [(Principal, Int)];
    tokenRewards : [(Principal, Int)];
    userPoints : [(Principal, Int)];
  };

  public func emptyStable(tokenOwner : Principal) : TokensStable {
    let st = {
      tokenWallets = [(tokenOwner, TOKEN_OWNER_BALANCE)];
      tokenStakes = [];
      tokenRewards = [];
    };
    st;
  };

  public func emptyStableV1(tokenOwner : Principal) : TokensStableV1 {
    let st = {
      tokenWallets = [(tokenOwner, TOKEN_OWNER_BALANCE)];
      tokenStakes = [];
      tokenRewards = [];
      userPoints = [];
    };
    st;
  };

  public class Tokens(tokensStable : TokensStableV1) {

    let _tokenWallets : TokenWallets = HashMap.HashMap<Principal, Int>(
      0,
      Principal.equal,
      Principal.hash,
    );

    let _tokenStakes : TokenStakes = HashMap.HashMap<Principal, Int>(
      0,
      Principal.equal,
      Principal.hash,
    );

    let _tokenRewards : TokenRewards = HashMap.HashMap<Principal, Int>(
      0,
      Principal.equal,
      Principal.hash,
    );

    let userPoints = HashMap.HashMap<Principal, Int>(
      0,
      Principal.equal,
      Principal.hash,
    );

    for ((p, val) in tokensStable.tokenWallets.vals()) {
      _tokenWallets.put(p, val);
    };
    for ((p, val) in tokensStable.tokenStakes.vals()) {
      _tokenStakes.put(p, val);
    };
    for ((p, val) in tokensStable.tokenRewards.vals()) {
      _tokenRewards.put(p, val);
    };
    for ((p, val) in tokensStable.userPoints.vals()) {
      userPoints.put(p, val);
    };

    public func getStable() : TokensStable {
      let st = {
        tokenWallets = Iter.toArray(_tokenWallets.entries());
        tokenStakes = Iter.toArray(_tokenStakes.entries());
        tokenRewards = Iter.toArray(_tokenRewards.entries());
      };
      st;
    };

    public func getStableV1() : TokensStableV1 {
      let st = {
        tokenWallets = Iter.toArray(_tokenWallets.entries());
        tokenStakes = Iter.toArray(_tokenStakes.entries());
        tokenRewards = Iter.toArray(_tokenRewards.entries());
        userPoints = Iter.toArray(userPoints.entries());
      };
      st;
    };
  };
};
