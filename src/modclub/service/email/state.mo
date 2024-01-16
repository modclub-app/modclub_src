import Buffer "mo:base/Buffer";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";

module State {
    public type Map<X, Y> = HashMap.HashMap<X, Y>;
    public type EmailState = {
        userQueueToReceiveAlerts : Map<Principal, Bool>;
        usersToReceiveEmailAlerts : Map<Principal, Bool>;
    };

    public type EmailStateStable = {
        userQueueToReceiveAlerts : [(Principal, Bool)];
        usersToReceiveEmailAlerts : [(Principal, Bool)];
    };

    public func emptyState(): EmailState {
        return {
            userQueueToReceiveAlerts = HashMap.HashMap<Principal, Bool>(
                1,
                Principal.equal,
                Principal.hash,
            );
            usersToReceiveEmailAlerts = HashMap.HashMap<Principal, Bool>(
                1,
                Principal.equal,
                Principal.hash,
            );
        };
    };

     public func emptyStableState(): EmailStateStable {
        return {
            userQueueToReceiveAlerts = [];
            usersToReceiveEmailAlerts = [];
        };
    };

    public func getState(stableState: EmailStateStable): EmailState {
        let state = emptyState();
        for ((pid, allowed) in stableState.userQueueToReceiveAlerts.vals()) {
            state.userQueueToReceiveAlerts.put(pid, allowed);
        };
        for ((pid, allowed) in stableState.usersToReceiveEmailAlerts.vals()) {
            state.usersToReceiveEmailAlerts.put(pid, allowed);
        };
        return state;
    };

    public func getStableState(state: EmailState): EmailStateStable {
        let stableState : EmailStateStable = {
            userQueueToReceiveAlerts = Iter.toArray(
                state.userQueueToReceiveAlerts.entries(),
            );
            usersToReceiveEmailAlerts = Iter.toArray(
                state.usersToReceiveEmailAlerts.entries(),
            );
        };
        return stableState;
    };
};