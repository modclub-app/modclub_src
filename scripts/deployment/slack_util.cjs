const https = require("https");

function notify_slack(template, path, error_callback) {
  const data = Buffer.from(JSON.stringify(template), "utf-8");

  const options = {
    hostname: "hooks.slack.com",
    path: path,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);

    if (res.statusCode < 200 || res.statusCode >= 300) {
      console.error("Request failed with status:", res.statusCode);
      if (error_callback) {
        error_callback(`Request failed with status: ${res.statusCode}`);
      }
    }

    res.on("data", (d) => {
      process.stdout.write(d);
    });
  });

  req.on("error", (error) => {
    console.error("Error with request:", error);
    if (error_callback) {
      error_callback(`Error with request: ${error.message}`);
    }
  });

  req.write(data);
  req.end();
}

module.exports = {
  notify_slack,
};
