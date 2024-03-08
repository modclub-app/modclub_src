import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Trie "mo:base/Trie";
import Bool "mo:base/Bool";

import JSON "mo:json/JSON";

import Poh "../poh/poh";
import Types "../../types";
import CommonTypes "../../../common/types";

module RequestHandler {

  public func handlePohRegister(
    request : Types.HttpRequest,
    pohEngine : Poh.PohEngine,
    apiKey : Text,
    logger : CommonTypes.ModclubLogger
  ) : async ?Principal {
    logger.logMessage("POH Register request received");
    // Validate API key in header matches the configured API key
    let apiKeyHeader : Text = Option.get(
      getHeaderValue("x-api-key", request.headers),
      ""
    );
    if (apiKeyHeader == "" or apiKeyHeader != apiKey) {
      // Log the error
      logger.logError("handlePohRegister: Invalid API key");
      throw Error.reject("Invalid API key");
    };
    let decodedBody = Option.get(Text.decodeUtf8(request.body), "{}");
    logger.logMessage("POH Register request decoded body: " # decodedBody);

    let bodyJsonMap = extractObjectProperties(decodedBody);
    let status = await extractText(bodyJsonMap, "status");
    let principalIdText = await extractText(bodyJsonMap, "user_id");
    let message = await extractText(bodyJsonMap, "message");
    let similarity = await extractText(bodyJsonMap, "similarity");
    let matchedPrincipalId = await extractText(bodyJsonMap, "matched_user_id");
    // Log everything so we have details for debugging
    logger.logMessage("Received request from poh with status: " # status # " principalId: " # principalIdText # " message: " # message # " similarity: " # similarity # " matchedPrincipalId: " # matchedPrincipalId);

    let principalId = Principal.fromText(principalIdText);

    // If the POH request was successful, return the principalId for further processing
    let finalStatus = if (status == "SUCCESS") {
      return ?principalId;
    } else {
      // Set the status to rejected since the user is probably registered already
      let _ = pohEngine.changeChallengeTaskStatus(
        Poh.CHALLENGE_UNIQUE_POH_ID,
        principalId,
        #rejected
      );
      return null;
    };
  };

  public func handleIpRegister(
    request : Types.HttpRequest,
    principal : Principal,
    pohEngine : Poh.PohEngine,
    provider2IpRestriction : Trie.Trie<Principal, Bool>
  ) : async Types.HttpResponse {
    // Extract IP from headers
    let ip : Text = Option.get(getHeaderValue("x-real-ip", request.headers), "");

    // Extract token from query parameters
    let queryParams = parseQueryParams(request.url);
    let token : Text = Option.get(queryParams.get("token"), "");

    // Validate IP and token
    if (ip == "" or token == "") {
      return createHttpResponse(400, "IP or token couldn't be found");
    };

    var ipRestrictionConfigured = false;
    // Decode token and get providerId and providerUserId
    switch (pohEngine.decodeToken(token)) {
      case (#err(err)) {
        return createHttpResponse(400, "Invalid token.");
      };
      case (#ok(providerAndUserData)) {
        let providerId = providerAndUserData.providerId;
        let providerUserId = providerAndUserData.providerUserId;
        ipRestrictionConfigured := Option.get(
          Trie.get(
            provider2IpRestriction,
            key(providerId),
            Principal.equal
          ),
          false
        );

        // Check for IP restriction configuration
        if (ipRestrictionConfigured) {
          // Register IP with Provider User
          let registered = pohEngine.registerIPWithProviderUser(providerUserId, ip, providerId);
          if (not registered) {
            return createHttpResponse(500, "Token is already associated.");
          };
        };

        // Success response
        return createHttpResponse(200, "Token Associated with IP.");
      };
    };
  };

  public func createHttpResponse(status_code : Nat16, body : Text) : Types.HttpResponse {
    {
      status_code = status_code;
      headers = [];
      body = Text.encodeUtf8(body);
      streaming_strategy = null;
      upgrade = null;
    };
  };

  // Helper function to parse query parameters
  private func parseQueryParams(url : Text) : HashMap.HashMap<Text, Text> {
    // Extract query string from URL
    let queryString = Iter.toArray<Text>(Text.split(url, #char '?'))[1];
    // Split the query string into key-value pairs
    let pairs = Text.split(queryString, #text("&"));
    // Convert pairs to a HashMap
    let queryParams = HashMap.HashMap<Text, Text>(0, Text.equal, Text.hash);
    for (pair in pairs) {
      let kv : [Text] = Iter.toArray<Text>(Text.split(pair, #text("=")));
      if (kv.size() == 2) {
        queryParams.put(kv[0], kv[1]);
      };
    };
    return queryParams;
  };

  private func getHeaderValue(name : Text, headers : [(Text, Text)]) : ?Text {
    var result : ?Text = null;
    label l for ((headerName, value) : (Text, Text) in headers.vals()) {
      if (headerName == name) {
        result := ?value;
        break l;
      };
    };
    return result;
  };

  public func parseUrlAndGetPath(request : Types.HttpRequest) : Text {
    // Split the URL at 'path='
    let parts = Iter.toArray(Text.split(request.url, #text("path=")));

    // Check if 'path=' is found and there is a part following it
    if (Array.size(parts) > 1) {
      let pathWithPossibleExtraParams = parts[1];

      // Further split to isolate the path value if there are additional query parameters
      let pathParts = Iter.toArray(Text.split(pathWithPossibleExtraParams, #char '&'));

      // The actual path value will be the first element of pathParts
      let path = pathParts[0];
      path;
    } else {
      request.url;
    };
  };

  private func extractJson(data : Text) : JSON.JSON {
    let bodyJson : JSON.JSON = Option.get(JSON.parse(data), #Object([]));
    return bodyJson;
  };

  private func extractObjectProperties(body : Text) : HashMap.HashMap<Text, JSON.JSON> {
    let bodyJson : JSON.JSON = extractJson(body);
    switch (bodyJson) {
      case (#Object(json)) {
        return HashMap.fromIter(json.vals(), json.size(), Text.equal, Text.hash);
      };
      case (_) {
        return HashMap.HashMap<Text, JSON.JSON>(1, Text.equal, Text.hash);
      };
    };
  };

  private func extractNumber(attrMap : HashMap.HashMap<Text, JSON.JSON>, propertyName : Text) : async Int {
    switch (attrMap.get(propertyName)) {
      case (?#Number(num)) {
        return num;
      };
      // If no value exists or found string or json in place of number
      // 400 error
      case (_) {
        throw Error.reject("Expected number for property " # propertyName);
      };
    };
  };

  private func extractText(attrMap : HashMap.HashMap<Text, JSON.JSON>, propertyName : Text) : async Text {
    switch (attrMap.get(propertyName)) {
      case (?#String(str)) {
        return str;
      };
      case (_) {
        return "";
      };
    };
  };

  func key(t : Principal) : Trie.Key<Principal> {
    { key = t; hash = Principal.hash(t) };
  };
};
