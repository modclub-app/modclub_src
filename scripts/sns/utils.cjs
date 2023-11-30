const https = require("https");
const readline = require("readline");
const { spawn } = require("child_process");

const webhookUrl = new URL(
  process.env.PROPOSAL_NOTIFICATION_SLACK_HOOK || "http://slack.app"
);

exports.notifyToSlack = (message) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ text: message });
    const options = {
      hostname: webhookUrl.hostname,
      path: webhookUrl.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.from(payload).length,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          console.error("Slack response:", data);
          reject(
            new Error(
              `Failed to send message to Slack. Status Code: ${res.statusCode}`
            )
          );
        }
      });
    });

    req.on("error", (error) => reject(error));
    req.write(payload);
    req.end();
  });
};

exports.shellExec = (cmd) => {
  return new Promise((resolve, reject) => {
    let output = "";
    const toOutput = (data) => (output += data.toString());
    const command = spawn(cmd, {
      shell: true,
      stdio: ["inherit", "pipe", "pipe"],
    });

    command.stdout.on("data", toOutput);
    command.stderr.on("data", toOutput);

    command.on("error", (error) => reject(error));
    command.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Command exited with code ${code}: ${output}`));
      } else {
        resolve(output);
      }
    });
  });
};

exports.getPrompt = (procs) => (question) => {
  const rl = readline.createInterface({
    input: procs.stdin,
    output: procs.stdout,
  });

  rl.on("SIGINT", () => {
    rl.close();
    procs.exit(0);
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
      rl.close();
    });
  });
};
