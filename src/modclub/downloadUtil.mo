import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Int "mo:base/Int";
import Option "mo:base/Option";
import PohTypes "./service/poh/types";
import Principal "mo:base/Principal";
import Text "mo:base/Text";


module {

  public func joinArrOpt(array: ?[Text]) : Text {
    switch(array) {
        case(null)();
        case(?arr) {
            return joinArr(arr);
        };
    };
    return "";
  };

  public func joinArr(arr: [Text]) : Text {
    return Text.join(",", arr.vals());
  };

  public func toString_ViolatedRules(violatedRules: [PohTypes.ViolatedRules]) : [Text] {
    let buff = Buffer.Buffer<Text>(violatedRules.size());
    for(vRule in violatedRules.vals()) {
        buff.add(vRule.ruleId # ";" # vRule.ruleDesc)
    };
    return buff.toArray();
  };

  public func toString_PohChallengeRequiredField(challengeRequiredField: [PohTypes.PohChallengeRequiredField]) : [Text] {
    let buff = Buffer.Buffer<Text>(challengeRequiredField.size());

    for(rField in challengeRequiredField.vals()) {
      buff.add(switch(rField) {
        case(#textBlob)  "textBlob";
        case(#imageBlob) "imageBlob";
        case(#videoBlob) "videoBlob";
        case(#profileFieldBlobs) "profileFieldBlobs";
      });
    };
    return buff.toArray();
  };

  public func toString_PohChallengeType(challengeRequiredField: [PohTypes.PohChallengeType]) : [Text] {
    let buff = Buffer.Buffer<Text>(challengeRequiredField.size());

    for(rField in challengeRequiredField.vals()) {
      buff.add(switch(rField) {
        case(#ssn)  "ssn";
        case(#dl) "dl";
        case(#selfPic) "selfPic";
        case(#selfVideo) "selfVideo";
        case(#fullName) "fullName";
        case(#userName) "userName";
        case(#email) "email";
      });
    };
    return buff.toArray();
  };

  public func toString_PohChallengesAttemptV1(attempts: [PohTypes.PohChallengesAttemptV1]) : [Text] {
    let buff = Buffer.Buffer<Text>(attempts.size());

    for(attempt in attempts.vals()) {
      buff.add(Option.get(attempt.attemptId, "") # ";" # attempt.challengeId # ";" # attempt.challengeName # ";" # attempt.challengeDescription # ";" # joinArr(toString_PohChallengeType([attempt.challengeType])) 
      # ";" # Principal.toText(attempt.userId) # ";" #  Option.get(attempt.attemptId, "") # ";" #  Int.toText(attempt.createdAt) # ";" #  Int.toText(attempt.submittedAt) # ";" #  Int.toText(attempt.updatedAt) # ";"
      #  Int.toText(attempt.completedOn) # ";" #  Principal.toText(Option.get(attempt.dataCanisterId, Principal.fromText("aaaaa-aa"))) # ";" #  joinArrOpt(attempt.wordList) );
    };
    return buff.toArray();
  };
    
}