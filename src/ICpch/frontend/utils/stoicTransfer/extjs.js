/* global BigInt */
import { Actor, HttpAgent } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import {
  LEDGER_CANISTER_ID,
  GOVERNANCE_CANISTER_ID,
  NNS_CANISTER_ID,
  CYCLES_MINTING_CANISTER_ID,
  getCyclesTopupSubAccount,
  rosettaApi,
  principalToAccountIdentifier,
  toHexString,
  from32bits,
  to32bits,
  isHex,
  getSubAccountArray,
  fromHexString,
  validatePrincipal,
} from "./utils.js"

import ledgerIDL from "../candid/ledger.did.js"
import governanceIDL from "../candid/governance.did.js"
import nnsIDL from "../candid/nns.did.js"
import cyclesIDL from "../candid/cycles.did.js"
import hzldIDL from "../candid/hzld.did.js" //hardcode to hzld...
import icpunksIDL from "../candid/icpunks.did.js" //hardcode to icpunks...
import extIDL from "../candid/ext.did.js"
import advancedIDL from "../candid/advanced.did.js"
import wrapperIDL from "../candid/wrapper.did.js"
import logIDL from "../candid/log.did.js"
import icdripIDL from "../candid/icdrip.did.js"
//import cronicsIDL from '../candid/cronics.did.js';

const constructUser = (u) => {
  if (isHex(u) && u.length === 64) {
    return {
      address: u,
    }
  } else {
    return {
      principal: Principal.fromText(u),
    }
  }
}
const tokenIdentifier = (principal, index) => {
  const padding = Buffer("\x0Atid")
  const array = new Uint8Array([
    ...padding,
    ...Principal.fromText(principal).toBlob(),
    ...to32bits(index),
  ])
  return Principal.fromBlob(array).toText()
}
const decodeTokenId = (tid) => {
  var p = [...Principal.fromText(tid).toBlob()]
  var padding = p.splice(0, 4)
  if (toHexString(padding) !== toHexString(Buffer("\x0Atid"))) {
    return {
      index: 0,
      canister: tid,
      token: tokenIdentifier(tid, 0),
    }
  } else {
    return {
      index: from32bits(p.splice(-4)),
      canister: Principal.fromBlob(p).toText(),
      token: tid,
    }
  }
}

//Preload IDLS against a common name
const _preloadedIdls = {
  governance: governanceIDL,
  ledger: ledgerIDL,
  hzld: hzldIDL,
  icpunks: icpunksIDL,
  nns: nnsIDL,
  ext: extIDL,
  default: extIDL,
  wrapper: wrapperIDL,
}

class ExtConnection {
  //map known canisters to preloaded IDLs
  _mapIdls = {
    [LEDGER_CANISTER_ID]: _preloadedIdls["ledger"],
    [GOVERNANCE_CANISTER_ID]: _preloadedIdls["governance"],
    [NNS_CANISTER_ID]: _preloadedIdls["nns"],
    "rkp4c-7iaaa-aaaaa-aaaca-cai": cyclesIDL,
    "qz7gu-giaaa-aaaaf-qaaka-cai": _preloadedIdls["hzld"],
    "qcg3w-tyaaa-aaaah-qakea-cai": _preloadedIdls["icpunks"],
    "jzg5e-giaaa-aaaah-qaqda-cai": _preloadedIdls["icpunks"],
    "xkbqi-2qaaa-aaaah-qbpqq-cai": _preloadedIdls["icpunks"],
    "q6hjz-kyaaa-aaaah-qcama-cai": _preloadedIdls["wrapper"],
    "bxdf4-baaaa-aaaah-qaruq-cai": _preloadedIdls["wrapper"],
    "3db6u-aiaaa-aaaah-qbjbq-cai": _preloadedIdls["wrapper"],
    "kxh4l-cyaaa-aaaah-qadaq-cai": advancedIDL,
    "qgsqp-byaaa-aaaah-qbi4q-cai": logIDL,
    "d3ttm-qaaaa-aaaai-qam4a-cai": icdripIDL,
  }
  _metadata = {
    [LEDGER_CANISTER_ID]: {
      name: "ICP",
      symbol: "ICP",
      decimals: 8,
      type: "fungible",
    },
    "qz7gu-giaaa-aaaaf-qaaka-cai": {
      name: "HZLD",
      symbol: "HZLD",
      decimals: 0,
      type: "fungible",
    },
  }
  _identity = false //new AnonymousIdentity();
  _host = false
  _agent = false
  _canisters = {}

  constructor(host, identity) {
    if (identity) this._identity = identity
    if (host) this._host = host
    this._makeAgent()
  }
  idl(canister, idl) {
    //Map a canister to a preloaded idl
    this._mapIdls[canister] = idl
  }
  setIdentity(identity) {
    if (identity) this._identity = identity
    else this._identity = false
    this._makeAgent()
    return this
  }
  setHost(host) {
    if (host) this._host = host
    else this._host = false
    this._makeAgent()
    return this
  }
  canister(cid, idl) {
    if (!idl) {
      if (this._mapIdls.hasOwnProperty(cid)) {
        idl = this._mapIdls[cid]
      } else {
        idl = _preloadedIdls["default"]
      }
    } else if (typeof idl == "string") {
      if (_preloadedIdls.hasOwnProperty(idl)) {
        idl = _preloadedIdls[idl]
      } else {
        throw new Error(idl + " is not a preloaded IDL")
      }
    }
    if (!this._canisters.hasOwnProperty(cid)) {
      this._canisters[cid] = Actor.createActor(idl, {
        agent: this._agent,
        canisterId: cid,
      })
    }
    return this._canisters[cid]
  }
  token(tid, idl) {
    tid = LEDGER_CANISTER_ID
    var tokenObj = { canister: tid }
    // if (!tid) tid = LEDGER_CANISTER_ID;//defaults to ledger
    // var tokenObj = decodeTokenId(tid);
    // if (!idl) {
    //   if (this._mapIdls.hasOwnProperty(tokenObj.canister)) idl = this._mapIdls[tokenObj.canister];
    //   else idl = _preloadedIdls['ext']; //ext is our token default...
    // }
    var api = this.canister(tid, idl)
    return {
      call: api,
      fee: () => {
        return new Promise((resolve, reject) => {
          switch (tokenObj.canister) {
            case LEDGER_CANISTER_ID:
              resolve(10000)
              break
            case "qz7gu-giaaa-aaaaf-qaaka-cai":
              resolve(1)
              break
            default:
              //TODO compute fees
              resolve(0)
              break
          }
        })
      },
      getTokens: (aid, principal) => {
        return new Promise((resolve, reject) => {
          switch (tokenObj.canister) {
            case "qcg3w-tyaaa-aaaah-qakea-cai":
            case "jzg5e-giaaa-aaaah-qaqda-cai":
            case "d3ttm-qaaaa-aaaai-qam4a-cai":
            case "xkbqi-2qaaa-aaaah-qbpqq-cai":
              if (aid !== principalToAccountIdentifier(principal, 0)) {
                resolve([])
              } else {
                api.user_tokens(Principal.fromText(principal)).then((r) => {
                  resolve(
                    r.map((x) => {
                      return {
                        id: tokenIdentifier(tokenObj.canister, Number(x)),
                        canister: tokenObj.canister,
                        index: Number(x),
                        listing: false,
                        metadata: false,
                        wrapped: false,
                      }
                    }),
                  )
                })
              }
              break
            default:
              if (typeof api.tokens_ext == "undefined") reject("Not supported")
              else {
                try {
                  api
                    .tokens_ext(aid)
                    .then((r) => {
                      if (typeof r.ok != "undefined") {
                        resolve(
                          r.ok.map((d) => {
                            return {
                              index: d[0],
                              id: tokenIdentifier(tokenObj.canister, d[0]),
                              canister: tokenObj.canister,
                              listing: d[1].length ? d[1][0] : false,
                              metadata: d[2].length ? d[2][0] : false,
                            }
                          }),
                        )
                      } else if (typeof r.err != "undefined") {
                        if (
                          r.err.hasOwnProperty("Other") &&
                          r.err.Other === "No tokens"
                        ) {
                          resolve([])
                        } else reject(r.err)
                      } else reject(r)
                    })
                    .catch(reject)
                } catch (e) {
                  reject(e)
                }
              }
              break
          }
        })
      },
      getTokensLegacy: (aid, principal) => {
        return new Promise((resolve, reject) => {
          switch (tokenObj.canister) {
            case "qcg3w-tyaaa-aaaah-qakea-cai":
            case "jzg5e-giaaa-aaaah-qaqda-cai":
            case "d3ttm-qaaaa-aaaai-qam4a-cai":
            case "xkbqi-2qaaa-aaaah-qbpqq-cai":
              if (aid !== principalToAccountIdentifier(principal, 0)) {
                resolve([])
              } else {
                api.user_tokens(Principal.fromText(principal)).then((r) => {
                  resolve(
                    r.map((x) => {
                      return {
                        id: tokenIdentifier(tokenObj.canister, Number(x)),
                        canister: tokenObj.canister,
                        index: Number(x),
                        listing: false,
                        metadata: false,
                        wrapped: false,
                      }
                    }),
                  )
                })
              }
              break
            default:
              if (typeof api.tokens == "undefined") reject("Not supported")
              else {
                try {
                  api
                    .tokens(aid)
                    .then((r) => {
                      if (typeof r.ok != "undefined") {
                        resolve(
                          r.ok.map((d) => {
                            return {
                              index: d[0],
                              id: tokenIdentifier(tokenObj.canister, d[0]),
                              canister: tokenObj.canister,
                              listing: d[1].length ? d[1][0] : false,
                              metadata: d[2].length ? d[2][0] : false,
                            }
                          }),
                        )
                      } else if (typeof r.err != "undefined") {
                        if (
                          r.err.hasOwnProperty("Other") &&
                          r.err.Other === "No tokens"
                        ) {
                          resolve([])
                        } else reject(r.err)
                      } else reject(r)
                    })
                    .catch(reject)
                } catch (e) {
                  reject(e)
                }
              }
              break
          }
        })
      },
      getMetadata: () => {
        switch (tokenObj.canister) {
          case "qcg3w-tyaaa-aaaah-qakea-cai":
          case "jzg5e-giaaa-aaaah-qaqda-cai":
          case "xkbqi-2qaaa-aaaah-qbpqq-cai":
            return new Promise((resolve, reject) => {
              api.data_of(tokenObj.index).then((r) => {
                resolve({
                  metadata: [
                    [],
                    {
                      name: r.name,
                      desc: r.desc,
                      properties: r.properties,
                      url: r.url,
                    },
                  ],
                  type: "nonfungible",
                })
              })
            })
            break
          case "d3ttm-qaaaa-aaaai-qam4a-cai":
            return new Promise((resolve, reject) => {
              api.get_token_properties(tokenObj.index).then((r) => {
                resolve({
                  metadata: [[], r],
                  type: "nonfungible",
                })
              })
            })
            break
          default:
            return new Promise((resolve, reject) => {
              if (this._metadata.hasOwnProperty(tokenObj.canister)) {
                resolve(this._metadata[tokenObj.canister])
              } else {
                switch (tokenObj.canister) {
                  default:
                    api
                      .metadata(tokenObj.token)
                      .then((r) => {
                        if (typeof r.ok != "undefined") {
                          if (typeof r.ok.fungible != "undefined") {
                            resolve({
                              name: r.ok.fungible.name,
                              symbol: r.ok.fungible.symbol,
                              decimals: r.ok.fungible.decimals,
                              metadata: r.ok.fungible.metadata,
                              type: "fungible",
                            })
                          } else {
                            var md = r.ok.nonfungible.metadata[0] ?? []
                            if (md.length > 256) md = md.slice(0, 256)
                            resolve({
                              metadata: [md],
                              type: "nonfungible",
                            })
                          }
                        } else if (typeof r.err != "undefined") reject(r.err)
                        else reject(r)
                      })
                      .catch(reject)
                    break
                }
              }
            })
            break
        }
      },
      getBearer: () => {
        switch (tokenObj.canister) {
          case "qcg3w-tyaaa-aaaah-qakea-cai":
          case "jzg5e-giaaa-aaaah-qaqda-cai":
          case "xkbqi-2qaaa-aaaah-qbpqq-cai":
            return new Promise((resolve, reject) => {
              api.owner_of(tokenObj.index).then((r) => {
                resolve(principalToAccountIdentifier(r.toText(), 0))
              })
            })
            break
          case "d3ttm-qaaaa-aaaai-qam4a-cai":
            return new Promise((resolve, reject) => {
              api.owner_of(tokenObj.index).then((r) => {
                if (r.length > 0)
                  resolve(principalToAccountIdentifier(r[0].toText(), 0))
                else reject("No such token exists")
              })
            })
            break
          default:
            return new Promise((resolve, reject) => {
              api
                .bearer(tokenObj.token)
                .then((r) => {
                  if (typeof r.ok != "undefined") resolve(r.ok)
                  else if (typeof r.err != "undefined") reject(r.err)
                  else reject(r)
                })
                .catch(reject)
            })
            break
        }
      },
      getDetails: () => {
        switch (tokenObj.canister) {
          case "qcg3w-tyaaa-aaaah-qakea-cai":
          case "jzg5e-giaaa-aaaah-qaqda-cai":
          case "xkbqi-2qaaa-aaaah-qbpqq-cai":
            return new Promise((resolve, reject) => {
              api.owner_of(tokenObj.index).then((r) => {
                resolve([principalToAccountIdentifier(r.toText(), 0), []])
              })
            })
            break
          case "d3ttm-qaaaa-aaaai-qam4a-cai":
            return new Promise((resolve, reject) => {
              api.owner_of(tokenObj.index).then((r) => {
                if (r.length > 0)
                  resolve([principalToAccountIdentifier(r[0].toText(), 0), []])
                else reject("No such token exists")
              })
            })
            break
          default:
            return new Promise((resolve, reject) => {
              api
                .details(tokenObj.token)
                .then((r) => {
                  if (typeof r.ok != "undefined") resolve(r.ok)
                  else if (typeof r.err != "undefined") reject(r.err)
                  else reject(r)
                })
                .catch(reject)
            })
            break
        }
      },
      getBalance: (address, princpal) => {
        return new Promise((resolve, reject) => {
          var args
          switch (tokenObj.canister) {
            case LEDGER_CANISTER_ID:
              rosettaApi.getAccountBalance(address).then((b) => {
                resolve(b)
              })
              break
            case "qz7gu-giaaa-aaaaf-qaaka-cai":
              args = {
                user: Principal.fromText(princpal),
              }
              api
                .getBalanceInsecure(args)
                .then((b) => {
                  var bal = b.length === 0 ? 0 : b[0]
                  resolve(bal)
                })
                .catch(reject)
              break
            default:
              args = {
                user: constructUser(address),
                token: tokenObj.token,
              }
              api
                .balance(args)
                .then((r) => {
                  if (typeof r.ok != "undefined") resolve(r.ok)
                  else if (typeof r.err != "undefined") reject(r.err)
                  else reject(r)
                })
                .catch(reject)
              break
          }
        })
      },
      getTransactions: (address, princpal) => {
        return new Promise((resolve, reject) => {
          switch (tokenObj.canister) {
            case LEDGER_CANISTER_ID:
              rosettaApi
                .getTransactionsByAccount(address)
                .then((ts) => {
                  if (!Array.isArray(ts)) resolve([])
                  var _ts = []
                  ts.map((_t) => {
                    if (_t.type !== "TRANSACTION") return false
                    if (_t.status !== "COMPLETED") return false
                    _ts.push({
                      from: _t.account1Address,
                      to: _t.account2Address,
                      amount: Number(_t.amount / 100000000),
                      fee: Number(_t.fee / 100000000),
                      hash: _t.hash,
                      timestamp: _t.timestamp,
                      memo: Number(_t.memo),
                    })
                    return true
                  })
                  _ts.reverse()
                  resolve(_ts)
                })
                .catch(reject)
              break
            case "qz7gu-giaaa-aaaaf-qaaka-cai":
            default:
              resolve([])
              break
          }
        })
      },
      /*
        from_principal = principal of account as text
        from_sa = subaccount (to produce hex address). null/0 default as number
        to_user = valid User (address or principal) as text
        amount = valid amount as BigInt
        fee = valid fee as BigInt
        memo = data to be sent as text/hex/number
        notify = if we need to notify TODO
      */
      list: (from_sa, price) => {
        return new Promise((resolve, reject) => {
          var args
          switch (tokenObj.canister) {
            case LEDGER_CANISTER_ID:
            case "qz7gu-giaaa-aaaaf-qaaka-cai":
            case "d3ttm-qaaaa-aaaai-qam4a-cai":
            case "qcg3w-tyaaa-aaaah-qakea-cai":
            case "jzg5e-giaaa-aaaah-qaqda-cai":
            case "xkbqi-2qaaa-aaaah-qbpqq-cai":
              reject("Not supported")
              break
            default:
              args = {
                token: tid,
                from_subaccount: [getSubAccountArray(from_sa ?? 0)],
                price: price === 0 ? [] : [price],
              }
              api
                .list(args)
                .then((b) => {
                  if (typeof b.ok != "undefined") {
                    resolve(true)
                  } else {
                    reject(JSON.stringify(b.err))
                  }
                })
                .catch(reject)
              break
          }
        })
      },
      transfer: (
        from_principal,
        from_sa,
        to_user,
        amount,
        fee,
        memo,
        notify,
      ) => {
        return new Promise((resolve, reject) => {
          var args
          switch (tokenObj.canister) {
            case LEDGER_CANISTER_ID:
              args = {
                from_subaccount: [getSubAccountArray(from_sa ?? 0)],
                to: to_user, //Should be an address
                amount: { e8s: amount },
                fee: { e8s: fee },
                memo: memo ? Number(BigInt(memo)) : 0,
                created_at_time: [],
              }
              api
                .send_dfx(args)
                .then((bh) => {
                  resolve(bh)
                })
                .catch(reject)
              //Notify here
              break
            case "qcg3w-tyaaa-aaaah-qakea-cai":
            case "jzg5e-giaaa-aaaah-qaqda-cai":
            case "xkbqi-2qaaa-aaaah-qbpqq-cai":
              if (!validatePrincipal(to_user))
                reject(
                  "ICPunks does not support traditional addresses, you must use a Principal",
                )
              api
                .transfer_to(Principal.fromText(to_user), tokenObj.index)
                .then((b) => {
                  if (b) {
                    resolve(true)
                  } else {
                    reject("Something went wrong")
                  }
                })
                .catch(reject)
              break
            case "d3ttm-qaaaa-aaaai-qam4a-cai":
              if (!validatePrincipal(to_user))
                reject(
                  "IC Drip does not support traditional addresses, you must use a Principal",
                )
              api
                .transfer_to(Principal.fromText(to_user), tokenObj.index)
                .then((b) => {
                  if (b) {
                    resolve(true)
                  } else {
                    reject("Something went wrong")
                  }
                })
                .catch(reject)
              break
              break
            case "qz7gu-giaaa-aaaaf-qaaka-cai":
              args = {
                to: Principal.fromText(to_user),
                metadata: [],
                from: Principal.fromText(from_principal),
                amount: amount,
              }
              api
                .transfer(args)
                .then((b) => {
                  if (typeof b.ok != "undefined") {
                    resolve(true)
                  } else {
                    reject(JSON.stringify(b.err))
                  }
                })
                .catch(reject)
              break
            default:
              args = {
                token: tid,
                from: {
                  address: principalToAccountIdentifier(
                    from_principal,
                    from_sa ?? 0,
                  ),
                },
                subaccount: [getSubAccountArray(from_sa ?? 0)],
                to: constructUser(to_user),
                amount: amount,
                fee: fee,
                memo: fromHexString(memo),
                notify: notify,
              }
              api
                .transfer(args)
                .then((b) => {
                  if (typeof b.ok != "undefined") {
                    resolve(b.ok)
                  } else {
                    reject(JSON.stringify(b.err))
                  }
                })
                .catch(reject)
              break
          }
        })
      },
      mintCycles: (from_principal, from_sa, canister, amount, fee) => {
        return new Promise((resolve, reject) => {
          switch (tokenObj.canister) {
            case LEDGER_CANISTER_ID:
              var _to_sub = getCyclesTopupSubAccount(canister)
              var _to = principalToAccountIdentifier(
                CYCLES_MINTING_CANISTER_ID,
                _to_sub,
              )
              var args = {
                from_subaccount: [getSubAccountArray(from_sa ?? 0)],
                to: _to,
                fee: { e8s: fee },
                memo: Number(BigInt("0x50555054")),
                created_at_time: [],
                amount: { e8s: amount },
              }
              api
                .send_dfx(args)
                .then((block) => {
                  var args = {
                    block_height: block,
                    max_fee: { e8s: fee },
                    from_subaccount: [getSubAccountArray(from_sa ?? 0)],
                    to_subaccount: [getSubAccountArray(_to_sub)],
                    to_canister: Principal.fromText(CYCLES_MINTING_CANISTER_ID),
                  }
                  api.notify_dfx(args).then(resolve).catch(reject)
                })
                .catch(reject)
              break
            case "5ymop-yyaaa-aaaah-qaa4q-cai":
              reject("WIP")
              break
            default:
              reject("Cycle topup is not supported by this token")
              break
          }
        })
      },
    }
  }

  _makeAgent() {
    var args = {}
    if (this._identity) args["identity"] = this._identity
    if (this._host) args["host"] = this._host
    this._agent = new HttpAgent(args)
  }
}

const extjs = {
  connect: (host, identity) =>
    new ExtConnection(host ?? "https://ic0.app/", identity),
  decodeTokenId: decodeTokenId,
  encodeTokenId: tokenIdentifier,
  toSubaccount: getSubAccountArray,
  toAddress: principalToAccountIdentifier,
  fromHexString: fromHexString,
}
export default extjs
window.extjs = extjs
