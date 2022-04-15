import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import State "./state";
import Types "./types";

module Token {
  public type Map<X, Y> = HashMap.HashMap<X, Y>;
  public type TokenWallets = Map<Principal, Int>;
  public type TokenStakes = Map<Principal, Int>;
  public type TokenRewards = Map<Principal, Int>;

  // Token Constants
  public let TOKEN_MAX_SUPPLY = 1_000_000_000_000_000_000_000_000_000 ; // 1 billion * 10^18
  public let TOKEN_NAME = "MODCLUB Token";
  public let TOKEN_SYMBOL = "MOD";
  public let TOKEN_DECIMALS = 18;
  public let TOKEN_OWNER_BALANCE = TOKEN_MAX_SUPPLY;

  public type Holdings = {
    wallet: Int;
    stake: Int;
    pendingRewards: Int;
    userPoints: Int;
  };
  
  // Todo - Make these into objects insteda of Ints, we should hold rewards pending etc
  public type TokensStable = {
    tokenWallets: [(Principal, Int)];
    tokenStakes: [(Principal, Int)];
    tokenRewards: [(Principal, Int)];
  };

  public type TokensStableV1 = {
    tokenWallets: [(Principal, Int)];
    tokenStakes: [(Principal, Int)];
    tokenRewards: [(Principal, Int)];
    userPoints: [(Principal, Int)];
  };


  public func emptyStable(tokenOwner: Principal) : TokensStable {
    let st = {
      tokenWallets = [(tokenOwner, TOKEN_OWNER_BALANCE)];
      tokenStakes = [];
      tokenRewards = [];
    };
    st;
  };

  public func emptyStableV1(tokenOwner: Principal) : TokensStableV1 {
    let st = {
      tokenWallets = [(tokenOwner, TOKEN_OWNER_BALANCE)];
      tokenStakes = [];
      tokenRewards = [];
      userPoints = [];
    };
    st;
  };

  public class Tokens(tokensStable: TokensStableV1) {

    
    let _tokenWallets: TokenWallets = HashMap.HashMap<Principal, Int>(0, Principal.equal, Principal.hash);

    let _tokenStakes: TokenStakes = HashMap.HashMap<Principal, Int>(0, Principal.equal, Principal.hash);

    let _tokenRewards: TokenRewards = HashMap.HashMap<Principal, Int>(0, Principal.equal, Principal.hash);

    let userPoints = HashMap.HashMap<Principal, Int>(0, Principal.equal, Principal.hash);


    for( (p, val) in tokensStable.tokenWallets.vals()) {
      _tokenWallets.put(p, val);
    };
    for( (p, val) in tokensStable.tokenStakes.vals()) {
      _tokenStakes.put(p, val);
    };
    for( (p, val) in tokensStable.tokenRewards.vals()) {
      _tokenRewards.put(p, val);
    };
    for( (p, val) in tokensStable.userPoints.vals()) {
      userPoints.put(p, val);
    };

    public func mintTo(p: Principal, amount: Int) {
      addToWallet(p, amount, _tokenWallets);
      // addToWallet(p, amount, userPoints); Not required to mint points, I guess
    };

    public func burnFrom(p: Principal, amount: Int) : async () {
      await subtractFromWallet(p, amount, _tokenWallets, true);
      // No point distribution/slashing here as well, I believe
    };

    public func burnStakeFrom(p: Principal, amount: Int) : async () {
      await subtractFromWallet(p, amount, _tokenStakes, false);
      await subtractFromWallet(p, amount, userPoints, false);
    };

    public func transfer(from: Principal, to: Principal, amount: Int) : async () {
      await subtractFromWallet(from, amount, _tokenWallets, true);
      addToWallet(to, amount, _tokenWallets);
    };

    public func reward(from: Principal, to: Principal, amount: Int) : async () {
      await subtractFromWallet(from, amount, _tokenWallets, true);
      addToWallet(to, amount, _tokenRewards);
      addToWallet(to, amount, userPoints);
    };

    // Transfers tokens from the users reward wallet to their main wallet. 
    // This should be called after the grace period has passed for each content they voted on successfully.
    public func distributePendingReward(user: Principal, amount: Int) : async () {
      await subtractFromWallet(user, amount, _tokenRewards, true);
      addToWallet(user, amount, _tokenWallets);
    };

    public func burnReward(user: Principal, amount: Int) : async () {
      await subtractFromWallet(user, amount, _tokenRewards, false);
      await subtractFromWallet(user, amount, userPoints, false);
    };
    

    public func stake(p: Principal, amount: Int) : async () {
      await burnFrom(p, amount);
      addToWallet(p, amount, _tokenStakes);
    };

    public func unstake(p: Principal, amount: Int) : async () {
      // Todo - Add timer to unstake so that it can be unstaked after a certain time period
      await subtractFromWallet(p, amount, _tokenStakes, true);
      mintTo(p, amount);
    };

    public func voteFinalization(
      providerId: Principal,
      decision: Types.Decision,
      voteIds: [Types.VoteId],
      rewardAmount: Nat,
      state: State.State
      ) : async () {
          for(voteId in voteIds.vals()) {
            switch(state.votes.get(voteId)) {
              case (?vote) {
                if(vote.decision == decision) {
                  Debug.print("Rewarding user");
                  await reward(providerId, vote.userId, rewardAmount);
                } else {
                  Debug.print("Slashing user");
                  await burnStakeFrom(vote.userId, rewardAmount);
                };
              };
              case (null) {
                throw Error.reject("Vote not found");
              };
          };
        };
      };

    public func getHoldings(p: Principal) : Holdings {
      {
        wallet =  Option.get(_tokenWallets.get(p), 0);
        stake = Option.get(_tokenStakes.get(p), 0);
        pendingRewards = Option.get(_tokenRewards.get(p), 0);
        userPoints = Option.get(userPoints.get(p), 0);
      };
    };

    public func getAllHoldings() : [(Principal, Holdings)] {
      let rt = Buffer.Buffer<(Principal, Holdings)>(0);
      for(p in _tokenWallets.keys()) {
        rt.add((p, getHoldings(p)));
      };
      rt.toArray();
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

     private func putZeroInMapIfAbsent(userId: Principal, rewardsMap: Map<Principal, Int>) {
      switch(rewardsMap.get(userId)) {
        case(null) {
          rewardsMap.put(userId, 0);
        };
        case(_)();
      };
    };

    private func addToWallet(userId: Principal, amount: Int, wallet: Map<Principal, Int>) {
      putZeroInMapIfAbsent(userId, wallet);
      let _ = do ?{
        let existingBalance = wallet.get(userId)!;
        wallet.put(userId, existingBalance + amount);
      };
    };

    private func subtractFromWallet(userId: Principal, amount: Int, wallet: Map<Principal, Int>, lowBalanceException: Bool) : async () {
      putZeroInMapIfAbsent(userId, wallet);
      let _ = do ?{
        let existingBalance = wallet.get(userId)!;
        if(existingBalance < amount) {
          if(lowBalanceException) {
            throw Error.reject("Insufficient Funds.");
          } else {
            wallet.put(userId, 0);
          };
        } else {
          wallet.put(userId, existingBalance - amount);
        };
      };
    };

  };
};
