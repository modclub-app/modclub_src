module API {
  public query ({ caller }) func http_request(request : Types.HttpRequest) : async Types.HttpResponse {
    if (request.method == "POST") {
      return {
        status_code = 200;
        headers = [];
        body = Text.encodeUtf8("Upgrading");
        streaming_strategy = null;
        upgrade = ?true;
      };
    } else {
      // Handle non-POST requests here (if needed) or return a "Not Found" or "Method Not Allowed" error
      return createHttpResponse(405, "Method Not Allowed");
    };
  };

  public shared ({ caller }) func http_request_update(request : Types.HttpRequest) : async Types.HttpResponse {
    Debug.print("HTTP Request Update called");
    let url = request.url;
    let method = request.method;
    let headers = request.headers;
    let apiKey = getApiKeyFromHeaders(headers);

    switch (apiKeyToPrincipal.get(apiKey)) {
      case (null) {
        return createHttpResponse(401, "Unauthorized - API Key not found " # apiKey);
      };
      case (_)();
    };

    for (key in operationsMap.keys()) {
      let (method, url) = key;
      Debug.print("Method: " # method # ", URL: " # url);
    };

    let parts = Text.split(request.url, #text("path="));
    let temp = Iter.toArray(parts)[1];

    switch (operationsMap.get(request.method, temp)) {
      case (null) {
        return createHttpResponse(404, "Not Found - " # request.method # " " # request.url);
      };
      case (?apiHandler) {
        return await apiHandler(request);
      };
    };
  };
};
