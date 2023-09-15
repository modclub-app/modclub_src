const fs = require("fs");
const path = require("path");

let DEV_ENV = process.env.DEV_ENV;

if (!DEV_ENV) {
  DEV_ENV = "qa";
  console.warn("DEV_ENV is not set. Default the value to 'qa' ");
}

console.log(`Current DEV_ENV=${DEV_ENV}`);
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

const content = `// This file is auto generated from scripts/build/gen_files_by_env.cjs
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

// === generate actors_by_env.ts
const actors_by_env_content = `// This file is auto generated from scripts/build/gen_files_by_env.cjs
// Current DEV_ENV=${DEV_ENV}

import * as modclub from "../../declarations/modclub${postfix}";
import * as rs from "../../declarations/rs${postfix}";
import * as vesting from "../../declarations/vesting${postfix}";
import * as wallet from "../../declarations/wallet${postfix}";

export { modclub, rs, vesting, wallet };
`;

// Write to the desired file
const actors_by_env_dest = path.join(
  __dirname,
  "../../src/modclub_assets/src/actors_by_env.ts"
);
fs.writeFileSync(actors_by_env_dest, actors_by_env_content);
console.log(`${actors_by_env_dest} has been generated. `);
