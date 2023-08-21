const fs = require("fs");
const path = require("path");

const DEV_ENV = process.env.DEV_ENV;

console.log(`Current DEV_ENV=${DEV_ENV}`);
if (!DEV_ENV) {
  throw new Error("please set DEV_ENV. ( qa | dev | production )");
}

let postfix;
if (DEV_ENV === "production" || DEV_ENV === "prod") {
  postfix = "";
} else if (DEV_ENV === "dev") {
  postfix = "_dev";
} else if (DEV_ENV === "qa") {
  postfix = "_qa";
} else {
  throw new Error("Unknown DEV_ENV value.");
}

const content = `// This file is auto generated from scripts/build/gen_declarations_by_env.cjs
// Current DEV_ENV=${DEV_ENV}

import * as modclub_types from "../../declarations/modclub${postfix}/modclub${postfix}.did";
import * as rs_types from "../../declarations/rs${postfix}/rs${postfix}.did";
import * as vesting_types from "../../declarations/vesting${postfix}/vesting${postfix}.did";
import * as wallet_types from "../../declarations/wallet${postfix}/wallet${postfix}.did";

export { modclub_types, rs_types, vesting_types, wallet_types };
`;

// Write to the desired file
const dest = path.join(
  __dirname,
  "../../src/modclub_assets/src/declarations_by_env.ts"
);
fs.writeFileSync(dest, content);

console.log(`${dest} has been generated. `);
