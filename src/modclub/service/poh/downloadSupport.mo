import PohStateV2 "./statev2";
import PohTypes "./types";
import Buffer "mo:base/Buffer";
import Int "mo:base/Int";


module {
    // [Text] is one row of csv here... whole function return is a row of rows
    public func download(state: PohStateV2.PohState, varName: Text, start: Int, end: Int): [[Text]] {
        let buff = Buffer.Buffer<[Text]>(1);
        switch(varName) {
            case("pohChallenges") {

                for((challengeId, challenge) in state.pohChallenges.entries()) {

                    buff.add(
                    [challengeId, challenge.challengeId, challenge.challengeName, 
                    challenge.challengeDescription, joinArrOpt(challenge.dependentChallengeId), 
                    "requiredField",
                    // challenge.requiredField,
                    "challengeType",
                    // challenge.challengeType, 
                    joinArr(toString_ViolatedRules(challenge.allowedViolationRules)), 
                    Int.toText(challenge.createdAt), 
                    Int.toText(challenge.updatedAt)
                    ]
                    );
                };
            };
            case(_) {

            };
        };
        return buff.toArray();
    };

    func joinArrOpt(array: ?[Text]) : Text {
        var joined = "";
        switch(array) {
            case(null)();
            case(?arr) {
                for(id in arr.vals()) {
                    joined := joined # "; ";
                };
            };
        };
        return joined;
    };

    func joinArr(arr: [Text]) : Text {
        var joined = "";
        for(id in arr.vals()) {
            joined := joined # "; ";
        };
        return joined;
    };

    func toString_ViolatedRules(violatedRules: [PohTypes.ViolatedRules]) : [Text] {
        let buff = Buffer.Buffer<Text>(violatedRules.size());
        for(vRule in violatedRules.vals()) {
            buff.add(vRule.ruleId # "," # vRule.ruleDesc)
        };
        return buff.toArray();
    };
}