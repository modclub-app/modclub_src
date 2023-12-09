"use strict";
const fs = require("fs");
let dfx = require("./input/dfx.json");
let ids = require("./input/canister_ids.json");

var args = process.argv.slice(2);

var buckets = "";

args[0].split(",").forEach((item, i) => {
  if (item != "") {
    buckets += ` ${args[1]}_bucket_${i}`;
    dfx["canisters"][`${args[1]}_bucket_${i}`] = {
      main: "../../src/modclub/service/storage/buckets.mo",
      type: "motoko",
    };
    dfx["networks"] = {
      local: {
        bind: "127.0.0.1:8080",
        type: "ephemeral",
      },
    };
    if (args[1] == "l") {
      ids[`${args[1]}_bucket_${i}`] = {
        local: item,
      };
    } else {
      ids[`${args[1]}_bucket_${i}`] = {
        ic: item,
      };
    }
  }
});

let serialized_dfx = JSON.stringify(dfx, null, 2);
fs.writeFileSync("dfx.json", serialized_dfx);

let serialized_ids = JSON.stringify(ids, null, 2);
if (args[1] == "l") {
  fs.writeFileSync(".dfx/local/canister_ids.json", serialized_ids);
} else {
  fs.writeFileSync("canister_ids.json", serialized_ids);
}
// DO NOT MODIFY THIS!!! AND DO NOT PUT ANY OTHER CONSOLE.LOG() !!!
console.log(buckets);
