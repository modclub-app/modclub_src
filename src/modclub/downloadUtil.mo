import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Option "mo:base/Option";
import Types "./types";
import PohTypes "./service/poh/types";
import VoteTypes "./service/vote/types";
import Principal "mo:base/Principal";
import Text "mo:base/Text";

module {

  public func joinArrOpt(array : ?[Text]) : Text {
    switch (array) {
      case (null)();
      case (?arr) {
        return joinArr(arr);
      };
    };
    return "";
  };

  public func joinArr(arr : [Text]) : Text {
    return Text.join(",", arr.vals());
  };

  public func toString_ViolatedRules(violatedRules : [PohTypes.ViolatedRules]) : [
    Text
  ] {
    let buff = Buffer.Buffer<Text>(violatedRules.size());
    for (vRule in violatedRules.vals()) {
      buff.add(vRule.ruleId # ";" # vRule.ruleDesc);
    };
    return buff.toArray();
  };

  public func toString_PohChallengeRequiredField(
    challengeRequiredField : [PohTypes.PohChallengeRequiredField],
  ) : [Text] {
    let buff = Buffer.Buffer<Text>(challengeRequiredField.size());

    for (rField in challengeRequiredField.vals()) {
      buff.add(
        switch (rField) {
          case (#textBlob) "textBlob";
          case (#imageBlob) "imageBlob";
          case (#videoBlob) "videoBlob";
          case (#profileFieldBlobs) "profileFieldBlobs";
        },
      );
    };
    return buff.toArray();
  };

  public func toString_PohChallengeType(
    challengeRequiredField : [PohTypes.PohChallengeType],
  ) : [Text] {
    let buff = Buffer.Buffer<Text>(challengeRequiredField.size());

    for (rField in challengeRequiredField.vals()) {
      buff.add(
        switch (rField) {
          case (#ssn) "ssn";
          case (#dl) "dl";
          case (#selfPic) "selfPic";
          case (#selfVideo) "selfVideo";
          case (#fullName) "fullName";
          case (#userName) "userName";
          case (#email) "email";
        },
      );
    };
    return buff.toArray();
  };

  public func toString_PohChallengesAttemptV1(
    attempts : [PohTypes.PohChallengesAttemptV1],
  ) : [Text] {
    let buff = Buffer.Buffer<Text>(attempts.size());

    for (attempt in attempts.vals()) {
      buff.add(
        Option.get(attempt.attemptId, "") # ";" # attempt.challengeId # ";" # attempt.challengeName # ";" # attempt.challengeDescription # ";" # joinArr(
          toString_PohChallengeType([attempt.challengeType]),
        ) # ";" # Principal.toText(attempt.userId) # ";" # joinArr(
          toString_PohChallengeStatus([attempt.status]),
        ) # ";" # Int.toText(attempt.createdAt) # ";" # Int.toText(
          attempt.submittedAt,
        ) # ";" # Int.toText(attempt.updatedAt) # ";" # Int.toText(
          attempt.completedOn,
        ) # ";" # Principal.toText(
          Option.get(attempt.dataCanisterId, Principal.fromText("aaaaa-aa")),
        ) # ";" # joinArrOpt(attempt.wordList),
      );
    };
    return buff.toArray();
  };

  public func toString_PohVote(votes : [VoteTypes.Vote]) : [Text] {
    let buff = Buffer.Buffer<Text>(votes.size());

    for (vote in votes.vals()) {
      buff.add(
        vote.id # ";" # vote.contentId # ";" # Principal.toText(vote.userId) # ";" # joinArr(
          toString_Decision([vote.decision]),
        ) # ";" # joinArr(toString_PohRulesViolated(vote.violatedRules)) # ";" # Int.toText(
          vote.createdAt,
        ),
      );
    };
    return buff.toArray();
  };

  public func toString_Decision(decisions : [VoteTypes.Decision]) : [Text] {
    let buff = Buffer.Buffer<Text>(decisions.size());
    for (d in decisions.vals()) {
      switch (d) {
        case (#approved) {
          buff.add("approved");
        };
        case (#rejected) {
          buff.add("rejected");
        };
      };
    };
    return buff.toArray();
  };

  public func toString_PohRulesViolated(vRules : [Types.PohRulesViolated]) : [
    Text
  ] {
    let buff = Buffer.Buffer<Text>(vRules.size());
    for (vRule in vRules.vals()) {
      buff.add(vRule.challengeId # ";" # vRule.ruleId);
    };
    return buff.toArray();
  };

  public func toString_Provider(providers : [Types.Provider]) : [Text] {
    let buff = Buffer.Buffer<Text>(providers.size());
    for (p in providers.vals()) {
      buff.add(
        Principal.toText(p.id) # ";" # p.name # ";" # p.description # ";" # Int.toText(
          p.createdAt,
        ) # ";" # Int.toText(p.updatedAt) # ";" # joinArr(
          toString_ProviderSettings([p.settings]),
        ),
      );
    };
    return buff.toArray();
  };

  public func toString_ProviderSettings(
    providerSettings : [Types.ProviderSettings],
  ) : [Text] {
    let buff = Buffer.Buffer<Text>(providerSettings.size());
    for (p in providerSettings.vals()) {
      buff.add(Nat.toText(p.minVotes) # ";" # Nat.toText(p.minStaked));
    };
    return buff.toArray();
  };

  public func toString_AirdropUser(airdropUsers : [Types.AirdropUser]) : [Text] {
    let buff = Buffer.Buffer<Text>(airdropUsers.size());
    for (aUser in airdropUsers.vals()) {
      buff.add(Principal.toText(aUser.id) # ";" # Int.toText(aUser.createdAt));
    };
    return buff.toArray();
  };

  public func toString_Rule(rules : [Types.Rule]) : [Text] {
    let buff = Buffer.Buffer<Text>(rules.size());
    for (rule in rules.vals()) {
      buff.add(rule.id # ";" # rule.description);
    };
    return buff.toArray();
  };

  public func toString_Vote(votes : [Types.Vote]) : [Text] {
    let buff = Buffer.Buffer<Text>(votes.size());
    for (vote in votes.vals()) {
      buff.add(
        vote.id # ";" # vote.contentId # ";" # Principal.toText(vote.userId) # ";" # joinArr(
          toString_Decision([vote.decision]),
        ) # ";" # joinArr(Option.get(vote.violatedRules, [] : [Text])) # ";" # Int.toText(
          vote.createdAt,
        ),
      );
    };
    return buff.toArray();
  };

  public func toString_TextContent(textContents : [Types.TextContent]) : [Text] {
    let buff = Buffer.Buffer<Text>(textContents.size());
    for (textContent in textContents.vals()) {
      buff.add(textContent.id # ";" # textContent.text);
    };
    return buff.toArray();
  };

  public func toString_ImageContent(imageContents : [Types.ImageContent]) : [
    Text
  ] {
    let buff = Buffer.Buffer<Text>(imageContents.size());
    for (imageContent in imageContents.vals()) {
      buff.add(
        imageContent.id # ";" # joinArr(toString_Image([imageContent.image])),
      );
    };
    return buff.toArray();
  };

  public func toString_Content(contents : [Types.Content]) : [Text] {
    let buff = Buffer.Buffer<Text>(contents.size());
    for (content in contents.vals()) {
      buff.add(
        content.id # ";" # Principal.toText(content.providerId) # ";" # joinArr(
          toString_ContentType([content.contentType]),
        ) # ";" # content.sourceId # ";" # joinArr(
          toString_ContentStatus([content.status]),
        ) # ";" # Option.get(content.title, "") # ";" # Int.toText(
          content.createdAt,
        ) # ";" # Int.toText(content.updatedAt),
      );
    };
    return buff.toArray();
  };

  public func toString_Image(images : [Types.Image]) : [Text] {
    let buff = Buffer.Buffer<Text>(images.size());
    for (image in images.vals()) {
      buff.add(joinArr(toString_Nat8(image.data)) # ";" # image.imageType);
    };
    return buff.toArray();
  };

  public func toString_Profile(profiles : [Types.Profile]) : [Text] {
    let buff = Buffer.Buffer<Text>(profiles.size());
    for (p in profiles.vals()) {
      let i = switch (p.pic) {
        case (null) { [] : [Types.Image] };
        case (?pic) { [pic] };
      };
      buff.add(
        Principal.toText(p.id) # ";" # p.userName # ";" # p.email # ";" # joinArr(
          toString_Image(i),
        ) # ";" # joinArr(toString_Role([p.role])) # ";" # Int.toText(
          p.createdAt,
        ) # ";" # Int.toText(p.updatedAt),
      );
    };
    return buff.toArray();
  };

  public func toString_Nat8(data : [Nat8]) : [Text] {
    let buff = Buffer.Buffer<Text>(data.size());
    for (d in data.vals()) {
      buff.add(Nat8.toText(d));
    };
    return buff.toArray();
  };

  public func toString_Role(roles : [Types.Role]) : [Text] {
    let buff = Buffer.Buffer<Text>(roles.size());
    for (role in roles.vals()) {
      buff.add(
        switch (role) {
          case (#moderator) {
            "moderator";
          };
          case (#admin) {
            "admin";
          };
          case (#owner) {
            "owner";
          };
        },
      );
    };
    return buff.toArray();
  };

  public func toString_PohChallengeStatus(
    statuses : [PohTypes.PohChallengeStatus],
  ) : [Text] {
    let buff = Buffer.Buffer<Text>(statuses.size());
    for (status in statuses.vals()) {
      buff.add(
        switch (status) {
          case (#notSubmitted) {
            "notSubmitted";
          };
          case (#pending) {
            "pending";
          };
          case (#verified) {
            "verified";
          };
          case (#rejected) {
            "rejected";
          };
          case (#expired) {
            "expired";
          };
        },
      );
    };
    return buff.toArray();
  };

  public func toString_ContentStatus(statuses : [Types.ContentStatus]) : [Text] {
    let buff = Buffer.Buffer<Text>(statuses.size());
    for (status in statuses.vals()) {
      buff.add(
        switch (status) {
          case (#new) {
            "new";
          };
          case (#approved) {
            "approved";
          };
          case (#rejected) {
            "rejected";
          };
        },
      );
    };
    return buff.toArray();
  };

  public func toString_ContentType(statuses : [Types.ContentType]) : [Text] {
    let buff = Buffer.Buffer<Text>(statuses.size());
    for (status in statuses.vals()) {
      buff.add(
        switch (status) {
          case (#text) {
            "text";
          };
          case (#multiText) {
            "multiText";
          };
          case (#imageUrl) {
            "imageUrl";
          };
          case (#imageBlob) {
            "imageBlob";
          };
          case (#htmlContent) {
            "htmlContent";
          };
        },
      );
    };
    return buff.toArray();
  };

};
