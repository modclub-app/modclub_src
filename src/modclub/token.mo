import Int "mo:base/Int";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Types "./types";
import State "./state";
import Error "mo:base/Error";

module Token {
  public type Map<X, Y> = HashMap.HashMap<X, Y>;
  public type TokenWallets = Map<Principal, Int>;
  public type TokenStakes = Map<Principal, Int>;
  public type TokenRewards = Map<Principal, Int>;


  public type Holdings = {
    wallet: Int;
    stake: Int;
    pendingRewards: Int;
  };
  

  public class Tokens(id: Principal) {
    // Token Constants
    let TOKEN_MAX_SUPPLY = 1_000_000_000; // 1 billion
    let TOKEN_NAME = "MODCLUB Token";
    let TOKEN_SYMBOL = "MOD";
    let TOKEN_DECIMALS = 18;
    let TOKEN_TOTAL_SUPPLY = TOKEN_MAX_SUPPLY * 10 ** TOKEN_DECIMALS;
    let TOKEN_OWNER_BALANCE = TOKEN_TOTAL_SUPPLY;
    
    let _tokenWallets: TokenWallets = HashMap.HashMap<Principal, Int>(0, Principal.equal, Principal.hash);

    let _tokenStakes: TokenStakes = HashMap.HashMap<Principal, Int>(0, Principal.equal, Principal.hash);

    let _tokenRewards: TokenRewards = HashMap.HashMap<Principal, Int>(0, Principal.equal, Principal.hash);
    
    _tokenWallets.put(id, TOKEN_OWNER_BALANCE);

    public func mintTo(p: Principal, amount: Nat) {
      switch(_tokenWallets.get(p)) {
        case (?balance) {
          _tokenWallets.put(p, balance + amount);
        };
        case (null) {
          _tokenWallets.put(p, amount);
        };
      };
    };

    public func burnFrom(p: Principal, amount: Nat) : async () {
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

    public func burnStakeFrom(p: Principal, amount: Nat) : async () {
        switch(_tokenStakes.get(p)) {
          case (?balance) {
            if (balance >= amount) {
              _tokenStakes.put(p, balance - amount);
            } else {
              throw Error.reject("Not enough tokens");
            };
          };
          case (null) {
            throw Error.reject("Not enough tokens");
          };
      };
    };

    public func transfer(from: Principal, to: Principal, amount: Nat) : async () {
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
            throw Error.reject("Insufficient funds");
          };
        };
        case (null) {
          throw Error.reject("Insufficient funds");
        };
      };
    };

    public func reward(from: Principal, to: Principal, amount: Nat) : async () {
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
    

    public func stake(p: Principal, amount: Nat) : async () {
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

    func unstake(p: Principal, amount: Nat) : async () {

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
                  await reward(providerId, vote.userId, rewardAmount);
                } else {
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

  };
};
