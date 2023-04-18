import P "mo:base/Prelude";

module {
  public func unwrap<T>(x : ?T) : T = switch x {
    case null { P.unreachable() };
    case (?x_) { x_ };
  };
};
