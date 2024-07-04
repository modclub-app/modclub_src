import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import CommonTypes "./types";

module {
  public class Messages() {
    private var entries : [(Text, Text)] = [
      ("ProviderNotInAllowList", "registerProvider - Provider not in allow list with provider ID: "),
      ("SubmitHtmlContent", "submitHtmlContent sourceId: "),
      ("GetTasks", "getTasks - provider called with provider ID: "),
      ("GetTasksFinished", "getTasks - FINISHED - provider called with provider ID: "),
      ("Vote", "vote - User ID: "),
      ("PohCallbackForModclub", "pohCallbackForModclub - status: "),
      ("GetCanisterLog", "getCanisterLog - request from caller: "),
      ("VotingCompleted", "Voting completed for packageId: "),
      ("VotingCompletedApproved", "Voting completed. Final decision: approved for packageId: "),
      ("VotingCompletedRejected", "Voting completed. Final decision: rejected for packageId: "),
      ("UserVoting", "User Voting "),
      ("UserIDVoting", "UserID: RS Before Vote POH: Full rewards"),
      ("PreUpgrade", "MODCLUB PREUPGRADE at time: "),
      ("PostUpgrade", "MODCLUB POSTUPGRADE at time: "),
      ("HttpRequest", "http_request - called for url "),
      ("HttpRequestUpdate", "http_request_update - called for url "),
      ("ImportAirdropMetadataCall", "MODCLUB Instance has importAirdropMetadata call: "),
      ("ImportAirdropMetadataProfiles", "MODCLUB Instance has importAirdropMetadata call: ")
    ];

    private var messages = HashMap.fromIter<Text, Text>(entries.vals(), 16, Text.equal, Text.hash);

    public func logMessage(logger: CommonTypes.ModclubLogger, key : Text, additionalInfo : Text) {
      switch (messages.get(key)) {
        case (?msg) {
          logger.logMessage(msg # additionalInfo);
        };
        case null {
          logger.logMessage("Message not found for key: " # key # " with info: " # additionalInfo);
        };
      };
    };
  };
};
