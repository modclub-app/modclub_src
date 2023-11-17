const fs = require("fs");
const assert = require("assert");

function assert_content(data) {
  assert.strictEqual(data.length, 10);
  let content = data.find((o) => o.sourceId === "Emily Thompson");
  assert.strictEqual(content.sourceId, "Emily Thompson");
  assert.strictEqual(content.title, "Diverse Marine Life in Our Oceans");
  assert.strictEqual(content.contentStatus, "new");
  assert.strictEqual(content.contentType, "text");
}

function assert_profiles(data) {
  assert.strictEqual(data.length, 4);
  assert.strictEqual(data[0].email, "");
  assert.strictEqual(data[0].role, "Moderator");
}

// Function to read and parse the data
function readAndParseData(filePath, test_name) {
  // Read the file
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      process.exit(1);
    }

    try {
      const trimmedData = data.trim();
      const cleanedData = trimmedData.substring(1, trimmedData.length - 1);

      let unescapedDataString = cleanedData.replace(/\\\"/g, '"');
      unescapedDataString = unescapedDataString.substring(
        2,
        unescapedDataString.length - 3
      );

      const jsonData = JSON.parse(unescapedDataString);
      console.log("Parsed Data:", jsonData);

      if (test_name == "content") {
        assert_content(jsonData);
      } else if (test_name == "profiles") {
        assert_profiles(jsonData);
      }
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
}

readAndParseData("test_output.txt", process.argv[2]);
