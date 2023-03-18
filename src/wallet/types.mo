import Principal "mo:base/Principal";
module {

public type UserAndAmount = {
    fromSA: ?Text;
    toOwner: Principal;
    toSA: ?Text;
    amount: Float;
  };
  
};