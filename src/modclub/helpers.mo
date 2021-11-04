module Helpers {
   public func addToWaitList(email : Text) : async Text {
      if(waitList.size() > maxWaitListSize) {
        return "Sorry, the waitlist is full";
      };
      switch (waitList.get(email)) {        
        case (?result) return "The email address " # email # " has already joined the waitlist";
        case (_) waitList.put(email, email);
      };
      return "Thank you for joining the waitlist";
    };
    
}