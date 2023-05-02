module {
  public type ENV = {
    #local : {
      modclub_canister_id : Principal;
      rs_canister_id : Principal;
      wallet_canister_id : Principal;
    };
    #prod;
    #dev;
    #qa;
  };
};
