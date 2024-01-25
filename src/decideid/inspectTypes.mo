import LoggerTypesModule "../common/canistergeek/logger/typesModule";
import Canistergeek "../common/canistergeek/canistergeek";
import CommonTypes "../common/types";

module {
  public type DecideIdCanisterMethods = {
    #collectCanisterMetrics : () -> ();
    #handleSubscription : () -> CommonTypes.ConsumerPayload;
    #getCanisterLog : () -> ?LoggerTypesModule.CanisterLogRequest;
    #getCanisterMetrics : () -> Canistergeek.GetMetricsParameters;
    #hello : () -> ()

  }
}