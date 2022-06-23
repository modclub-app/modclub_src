import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Int "mo:base/Int";
import Option "mo:base/Option";
import Types "./types";
import PohTypes "./service/poh/types";
import VoteTypes "./service/vote/types";
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
      # ";" # Principal.toText(attempt.userId) # ";" #  joinArr(toString_PohChallengeStatus([attempt.status])) # ";" #  Int.toText(attempt.createdAt) # ";" #  Int.toText(attempt.submittedAt) # ";" #  Int.toText(attempt.updatedAt) # ";"
      #  Int.toText(attempt.completedOn) # ";" #  Principal.toText(Option.get(attempt.dataCanisterId, Principal.fromText("aaaaa-aa"))) # ";" #  joinArrOpt(attempt.wordList) );
    };
    return buff.toArray();
  };

  public func toString_PohVote(votes: [VoteTypes.Vote]) : [Text] {
    let buff = Buffer.Buffer<Text>(votes.size());

    for(vote in votes.vals()) {
      buff.add(vote.id # ";" # vote.contentId # ";" # Principal.toText(vote.userId) # ";" 
                #  joinArr(toString_Decision([vote.decision])) # ";"
                #  joinArr(toString_PohRulesViolated(vote.violatedRules)) # ";"
                #  Int.toText(vote.createdAt));
    };
    return buff.toArray();
  };

  public func toString_Decision(decisions: [VoteTypes.Decision]) : [Text] {
    let buff = Buffer.Buffer<Text>(decisions.size());
    for(d in decisions.vals()) {
      switch(d) {
        case(#approved) {
          buff.add("approved");
        };
        case(#rejected) {
          buff.add("rejected");
        };
      };
    };
    return buff.toArray();
  };

  public func toString_PohRulesViolated(vRules: [Types.PohRulesViolated]) : [Text] {
    let buff = Buffer.Buffer<Text>(vRules.size());
    for(vRule in vRules.vals()) {
      buff.add(vRule.challengeId # ";" # vRule.ruleId);
    };
    return buff.toArray();
  };

  public func toString_PohChallengeStatus(statuses: [PohTypes.PohChallengeStatus]) : [Text] {
    let buff = Buffer.Buffer<Text>(statuses.size());
    for(status in statuses.vals()) {
      buff.add(switch(status) {
        case(#notSubmitted) {
          "notSubmitted";
        };
        case(#pending) {
          "pending";
        };
        case(#verified) {
          "verified";
        };
        case(#rejected) {
          "rejected";
        };
        case(#expired) {
          "expired";
        };
      });
    };
    return buff.toArray();
  };

  public func toString_ContentStatus(statuses: [Types.ContentStatus]) : [Text] {
    let buff = Buffer.Buffer<Text>(statuses.size());
    for(status in statuses.vals()) {
      buff.add(switch(status) {
        case(#new) {
          "new";
        };
        case(#approved) {
          "approved";
        };
        case(#rejected) {
          "rejected";
        };
      });
    };
    return buff.toArray();
  };
    
}