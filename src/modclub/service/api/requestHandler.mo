import Debug "mo:base/Debug";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import HashMap "mo:base/Array";
import Error "mo:base/Error";
import JSON "mo:json/JSON";
import Trie "mo:base/Trie";
import Principal "mo:base/Principal";
import Types "../../types";
import Option "mo:base/Option";
import Poh "../poh/poh";

module RequestHandler {

  public func handlePohRegister(request : Types.HttpRequest, principal : Principal) : async Types.HttpResponse {
    // Add code here to handle new endpoint - pohRegister
    return createHttpResponse(404, "Not implemented");
  };

  public func handleIpRegister(
    request : Types.HttpRequest,
    principal : Principal,
    pohEngine : Poh.PohEngine,
    provider2IpRestriction : Trie.Trie<Principal, Bool>
  ) : async Types.HttpResponse {
    // Extract IP from headers
    let ip = Option.unwrap(getHeaderValue("x-real-ip", request.headers), "");

    // Extract token from query parameters
    let queryParams = parseQueryParams(request.url);
    let token = Option.unwrap(HashMap.get(queryParams, "token"), "");

    // Validate IP and token
    if (ip == "" or token == "") {
      return createHttpResponse(400, "IP or token couldn't be found");
    };

    // Decode token and get providerId and providerUserId
    switch (pohEngine.decodeToken(token)) {
      case (#err(err)) {
        return createHttpResponse(400, "Invalid token.");
      };
      case (#ok(providerAndUserData)) {
        let providerId = providerAndUserData.providerId;
        let providerUserId = providerAndUserData.providerUserId;
        let ipRestrictionConfigured = Option.get(
          Trie.get(
            provider2IpRestriction,
            providerId,
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

  // Helper function to parse query parameters
  private func parseQueryParams(url : Text) : HashMap.HashMap<Text, Text> {
    // Extract query string from URL
    let queryString = Text.split(url, #char '?')[1];
    // Split the query string into key-value pairs
    let pairs = Text.split(queryString, #text("&"));
    // Convert pairs to a HashMap
    let queryParams = HashMap.HashMap<Text, Text>(pairs.size(), Text.equal, Text.hash);
    for (pair in pairs.vals()) {
      let kv = Text.split(pair, #text("="));
      if (Array.size(kv) == 2) {
        HashMap.put(queryParams, kv[0], kv[1]);
      };
    };
    return queryParams;
  };

  private func getHeaderValue(name : Text, headers : [(Text, Text)]) : ?Text {
    var result : ?Text = null;
    for ((headerName, value) : (Text, Text) in headers.vals()) {
      if (headerName == name) {
        result := ?value;
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

    // Reconstruct the path from the fourth element onwards
    let pathParts = Array.subArray(partsArray, 3, Array.size(partsArray) - 3);
    let fullPath = Text.join("/", pathParts.vals());

    // Split the path at the query string
    let pathWithoutQuery = Text.split(fullPath, #char '?');

    // Return only the path part, excluding the query string
    return Iter.toArray<Text>(pathWithoutQuery)[0];
  };

  private func extractObjectProperties(bodyJson : JSON.JSON) : HashMap.HashMap<Text, JSON.JSON> {
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
        throw Error.reject("Bad Request");
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
        throw Error.reject("Bad Request");
      };
    };
  };

  func createHttpResponse(status_code : Nat16, body : Text) : Types.HttpResponse {
    {
      status_code = status_code;
      headers = [];
      body = Text.encodeUtf8(body);
      streaming_strategy = null;
      upgrade = null;
    };
  };
};
