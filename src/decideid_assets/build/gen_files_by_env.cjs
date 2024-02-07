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
import * as decideid_types from "../../declarations/decideid${postfix}/decideid${postfix}.did";

export { modclub_types, decideid_types };
`;

// Write to the desired file
const dest = path.join(__dirname, "../src/canister_types.ts");
fs.writeFileSync(dest, content);
console.log(`${dest} has been generated. `);

// === generate actors_by_env.ts
const actors_by_env_content = `// This file is auto generated from scripts/build/gen_files_by_env.cjs
// Current DEV_ENV=${DEV_ENV}

import * as modclub_actor from "../../declarations/modclub${postfix}";
import * as decidedid_actor from "../../declarations/decideid${postfix}";

export { modclub_actor, decidedid_actor };
`;

// Write to the desired file
const actors_by_env_dest = path.join(__dirname, "../src/actors_by_env.ts");
fs.writeFileSync(actors_by_env_dest, actors_by_env_content);
console.log(`${actors_by_env_dest} has been generated. `);
