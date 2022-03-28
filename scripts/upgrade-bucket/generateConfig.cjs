'use strict';
const fs = require('fs');
let dfx = require('./input/dfx.json');
let ids = require('./input/canister_ids.json');

var args = process.argv.slice(2);

args[0].split(",")
  .forEach((item, i) => {
      if(item != "") {
        console.log(i, item);
        dfx['canisters'][`${args[1]}_bucket_${i}`] = {
            main: "../../src/modclub/service/storage/buckets.mo",
            type: "motoko"
        };
        if(args[1] == 'l') {
            ids[`${args[1]}_bucket_${i}`] = {
                local: item
            };
        } else {
            ids[`${args[1]}_bucket_${i}`] = {
                ic: item
            };
        }
    }
});

let data = JSON.stringify(dfx, null, 2);
fs.writeFileSync('dfx.json', data);

data = JSON.stringify(ids, null, 2);
if(args[1] == 'l') {
    fs.writeFileSync('.dfx/local/canister_ids.json', data);
} else {
    fs.writeFileSync('canister_ids.json', data);
}