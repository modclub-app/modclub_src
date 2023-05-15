module {
  public type ENV = {
    #local : {
      modclub_canister_id : Principal;
      rs_canister_id : Principal;
      wallet_canister_id : Principal;
      auth_canister_id : Principal;
    };
    #prod;
    #dev;
    #qa;
  };
  public type ConsumerPayload = {
    #admins : [Principal];
  };
  public type SubscriberCallback = shared ConsumerPayload -> async ();

  public type ModclubCanister = {
    #modclub;
    #rs;
    #wallet;
    #auth;
  };
};
