import Int "mo:base/Int";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Types "./types";
import State "./state";
import Error "mo:base/Error";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug"; 

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
  };
  
  // Todo - Make these into objects insteda of Ints, we should hold rewards pending etc
  public type TokensStable = {
    tokenWallets: [(Principal, Int)];
    tokenStakes: [(Principal, Int)];
    tokenRewards: [(Principal, Int)];
  };

  public func emptyStable(initializer: Principal) : TokensStable {
      let st = {
        tokenWallets = [(initializer, TOKEN_OWNER_BALANCE)];
        tokenStakes = [];
        tokenRewards = [];
      };
      st;
    };

  public class Tokens(tokensStable: TokensStable) {

    
    let _tokenWallets: TokenWallets = HashMap.HashMap<Principal, Int>(0, Principal.equal, Principal.hash);

    let _tokenStakes: TokenStakes = HashMap.HashMap<Principal, Int>(0, Principal.equal, Principal.hash);

    let _tokenRewards: TokenRewards = HashMap.HashMap<Principal, Int>(0, Principal.equal, Principal.hash);

    for( (p, val) in tokensStable.tokenWallets.vals()) {
      _tokenWallets.put(p, val);
    };
    for( (p, val) in tokensStable.tokenStakes.vals()) {
      _tokenStakes.put(p, val);
    };
    for( (p, val) in tokensStable.tokenRewards.vals()) {
      _tokenRewards.put(p, val);
    };

    public func mintTo(p: Principal, amount: Int) {
      switch(_tokenWallets.get(p)) {
        case (?balance) {
          _tokenWallets.put(p, balance + amount);
        };
        case (null) {
          _tokenWallets.put(p, amount);
        };
      };
    };

    public func burnFrom(p: Principal, amount: Int) : async () {
      switch(_tokenWallets.get(p)) {
        case (?balance) {
          if (balance >= amount) {
            _tokenWallets.put(p, balance - amount);
          } else {
            throw Error.reject("Not enough tokens");
          };
        };
        case (null) {
          throw Error.reject("Not enough tokens");
        };
      };
    };

    public func burnStakeFrom(p: Principal, amount: Int) : async () {
        switch(_tokenStakes.get(p)) {
          case (?balance) {
            if (balance >= amount) {
              _tokenStakes.put(p, balance - amount);
            } else {
              _tokenStakes.put(p, 0); // Reset the user to 0
            };
          };
          case (null) {
            throw Error.reject("Not enough tokens");
          };
      };
    };

    public func transfer(from: Principal, to: Principal, amount: Int) : async () {
      switch(_tokenWallets.get(from)) {
        case (?balance) {
          if (balance >= amount) {
            _tokenWallets.put(from, balance - amount);
            switch(_tokenWallets.get(to)) {
              case (?balance) {
                _tokenWallets.put(to, balance + amount);
              };
              case (null) {
                _tokenWallets.put(to, amount);
              };
            };
          } else {
            Debug.print("Insufficient funds: fromBal : "# Int.toText(balance) # " withdraw amount " # Int.toText(amount));
            throw Error.reject("Insufficient funds");
          };
        };
        case (null) {
          throw Error.reject("Insufficient funds");
        };
      };
    };

    public func reward(from: Principal, to: Principal, amount: Int) : async () {
      switch(_tokenWallets.get(from)) {
        case (?balance) {
          if (balance >= amount) {
            _tokenWallets.put(from, balance - amount);
            switch(_tokenRewards.get(to)) {
              case (?balance) {
                _tokenRewards.put(to, balance + amount);
              };
              case (null) {
                _tokenRewards.put(to, amount);
              };
            };
          } else {
            throw Error.reject("Insufficient funds");
          };
        };
        case (null) {
          throw Error.reject("Insufficient funds");
        };
      };
    };
    

    public func stake(p: Principal, amount: Int) : async () {
      await burnFrom(p, amount);
      switch(_tokenStakes.get(p)) {
        case (?balance) {
          _tokenStakes.put(p, balance + amount);
        };
        case (null) {
          _tokenStakes.put(p, amount);
        };
      };
    };

    public func unstake(p: Principal, amount: Int) : async () {

      // Todo - Add timer to unstake so that it can be unstaked after a certain time period
      switch(_tokenStakes.get(p)) {
        case (?balance) {
          // Check that there are enough tokens to unstake
          if (balance >= amount) {
            _tokenStakes.put(p, balance - amount);
            mintTo(p, amount);
          } else {
            throw Error.reject("Insufficient funds");
          };
        };
        case (null) {
         throw Error.reject("Insufficient funds");
        };
      };
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
      switch(_tokenWallets.get(p)) {
        case (?wbalance) {
          switch(_tokenStakes.get(p)) {
            case (?sbalance) {
              switch(_tokenRewards.get(p)) {
                case (?rbalance) {
                  let rt = {
                    wallet =  wbalance;
                    stake = sbalance;
                    pendingRewards = rbalance;
                  };
                  rt;
                };
                case (null) {
                  let rt = {
                    wallet =  wbalance;
                    stake = sbalance;
                    pendingRewards = 0;
                  };
                  rt;
                };
              };
            };
            case (null) {
              let rt = {
                wallet =  wbalance;
                stake = 0;
                pendingRewards = 0;
              };
              rt;
            };
          };
        };
        case (null) {
          let rt = {
            wallet =  0;
            stake = 0;
            pendingRewards = 0;
          };
          rt;
        };
      };
    };  

    public func getAllHoldings() : [Holdings] {
      let rt = [];
      for(p in _tokenWallets.keys().vals()) {
        rt.push(getHoldings(p));
      };
      rt;
    };

    public func getStable() : TokensStable {
      let st = {
        tokenWallets = Iter.toArray(_tokenWallets.entries());
        tokenStakes = Iter.toArray(_tokenStakes.entries());
        tokenRewards = Iter.toArray(_tokenRewards.entries());
      };
      st;
    };

  };
};
