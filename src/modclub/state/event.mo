module Event {
  
    public type CreateProfile = {
      userName : Text;
    };

    public type ContentSubmitted = {
      id: Types.ContentId;
      contentType: Types.ContentType;
      source: Types.UserId;
    };

    public type ReviewContent = {
      source : Types.UserId;
      target : Types.ContentId;
      approves : Bool; // false for an "unlike" event
      rulesBroken : ?[Types.RuleId];
    };

    /// An abuse flag event occurs when a reporting user
    /// sets or clears the abuse toggle in their UI for a video or user.
    public type AbuseFlag = {
      reporter : Types.UserId;
      target : {
        #content : Types.ContentId;
        #user : Types.UserId;
      };
      flag : Bool;
    };

    public type EventKind = {
      #createProfile : CreateProfile;
      #contentSubmitted : ContentSubmitted;
      #reviewContent : ReviewContent;
      #abuseFlag : AbuseFlag;
    };

    public type Event = {
      id : Nat; // unique ID, to avoid using time as one (not always unique)
      time : Int; // using mo:base/Time and Time.now() : Int
      kind : EventKind;
    };

    public func equal(x:Event, y:Event) : async Bool { x == y };
    public type Log = SeqObj.Seq<Event>;
  };

}