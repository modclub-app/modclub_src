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
  ) : async Types.HttpResponse {
    // Validate API key in header matches the configured API key
    let apiKeyHeader : Text = Option.get(
      getHeaderValue("x-api-key", request.headers),
      ""
    );
    if (apiKeyHeader == "" or apiKeyHeader != apiKey) {
      // Log the error
      logger.logError("hanglePohRegister: Invalid API key");
      return createHttpResponse(401, "Unauthorized");
    };

    let bodyJsonMap = extractObjectProperties(Option.get(Text.decodeUtf8(request.body), "{}"));
    let status = await extractText(bodyJsonMap, "status");
    let principalIdText = await extractText(bodyJsonMap, "principalId");
    let message = await extractText(bodyJsonMap, "message");
    let similarity = await extractText(bodyJsonMap, "similarity");
    let matchedPrincipalId = await extractText(bodyJsonMap, "matchedPrincipalId");
    // Log everything so we have details for debugging
    logger.logMessage("Received request from poh with status: " # status # " principalId: " # principalIdText # " message: " # message # " similarity: " # similarity # " matchedPrincipalId: " # matchedPrincipalId);

    let principalId = Principal.fromText(principalIdText);
    let finalStatus = if (status == "SUCCESS") {
      #pending // Set to pending so that it goes to manual review
    } else {
      #rejected;
    };

    let _ = pohEngine.changeChallengeTaskStatus(
      Poh.CHALLENGE_UNIQUE_POH_ID,
      principalId,
      finalStatus
    );

    // TODO: Should we issue callback to providers here

    return createHttpResponse(200, "OK");
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

  public func parseUrlAndGetPath(url : Text) : Text {
    // Split the URL by slash
    let parts = Text.split(url, #char '/');

    // Convert the iterator to an array for easier manipulation
    let partsArray = Iter.toArray<Text>(parts);

    // Check if the array has at least 4 elements (protocol, empty, domain, path)
    if (Array.size(partsArray) < 4) {
      return ""; // No path found
    };

    // size of parts array
    let size : Nat = Array.size(partsArray) - 3;

    // Reconstruct the path from the fourth element onwards
    let pathParts = Array.subArray(partsArray, 3, size);
    let fullPath = Text.join("/", pathParts.vals());

    // Split the path at the query string
    let pathWithoutQuery = Text.split(fullPath, #char '?');

    // Return only the path part, excluding the query string
    return Iter.toArray<Text>(pathWithoutQuery)[0];
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
      // If no value exists or found string or json in place of number
      // 400 error
      case (_) {
        throw Error.reject("Expected text for property " # propertyName);
      };
    };
  };

  func key(t : Principal) : Trie.Key<Principal> {
    { key = t; hash = Principal.hash(t) };
  };
};
