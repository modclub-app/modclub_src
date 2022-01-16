import Types "./types";
import Time "mo:base/Time";

module Helpers {
    let NANOS_PER_MILLI = 1000000;
    public func timeNow() : Types.Timestamp {
      Time.now()  / NANOS_PER_MILLI; // Convert to milliseconds
    };
    
}