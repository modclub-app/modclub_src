const fs = require("fs");

const filePath = process.argv[2];
const content = fs.readFileSync(filePath, "utf8");
const jsonData = JSON.parse(content);

// Output in a format that's easy for the shell script to read and print
jsonData.forEach((item) => {
  if (item.htmlContent) {
    console.log(
      `${item.sourceId}|${item.title}|${item.htmlContent}|${item.complexity}`
    );
  } else {
    console.log(`${item.sourceId}|${item.title}|${item.text}`);
  }
});
