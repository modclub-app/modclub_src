import Array "mo:base/Array";
import Base32 "mo:encoding/Base32";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Canistergeek "./canistergeek/canistergeek";
import Char "mo:base/Char";
import GlobalState "../modclub/statev2";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Int64 "mo:base/Int64";
import Iter "mo:base/Iter";
import LFSR "mo:rand/LFSR";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Nat8 "mo:base/Nat8";
import Nat16 "mo:base/Nat16";
import Float "mo:base/Float";
import Prim "mo:prim";
import Principal "mo:base/Principal";
import SHA256 "mo:crypto/SHA/SHA256";
import Source "mo:uuid/async/SourceV4";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Error "mo:base/Error";
import Types "../modclub/types";
import UUID "mo:uuid/UUID";
import Constants "constants";
import Bool "mo:base/Bool";
import Option "mo:base/Option";
import RSTypes "../rs/types";
import RSConstants "../rs/constants";
import CommonTypes "./types";

module Helpers {

  let NANOS_PER_MILLI = 1000000;
  private let symbols = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F'
  ];
  private let base : Nat8 = 0x10;

  public func timeNow() : Types.Timestamp {
    Time.now() / NANOS_PER_MILLI;
    // Convert to milliseconds
  };

  public func generateUUID() : async Text {
    let g = Source.Source();
    let uuid = await g.new();
    return UUID.toText(await g.new());
  };

  public func generateHash(content : Text) : Text {
    return encode(SHA256.sum(Blob.toArray(Text.encodeUtf8(content))));
  };

  // Generates a semi unique ID
  public func generateId(
    caller : Principal,
    category : Text,
    state : GlobalState.State
  ) : Text {
    var count : Nat = 0;
    switch (state.GLOBAL_ID_MAP.get(category)) {
      case (?result) {
        count := result;
      };
      case (_)();
    };
    count := count + 1;
    state.GLOBAL_ID_MAP.put(category, count);
    return Principal.toText(caller) # "-" # category # "-" # (Nat.toText(count));
  };

  public func getContentReservationId(userId : Principal, packageId : Text) : Text {
    return "content-reservation-" # Principal.toText(userId) # packageId;
  };

  public func nonZeroNat(val : Nat) : async () {
    if (not Nat.greater(val, 0)) {
      throw Error.reject("Amount must be greater than zero");
    };
  };

  // Generates a voteparameter semi unique ID
  public func generateVoteParamId(
    category : Text,
    state : GlobalState.State
  ) : Text {
    var count : Nat = 0;
    switch (state.GLOBAL_ID_MAP.get(category)) {
      case (?result) {
        count := result;
      };
      case (_)();
    };
    count := count + 1;
    state.GLOBAL_ID_MAP.put(category, count);
    return category # "-" # (Nat.toText(count));
  };
  public func generateRandomList(
    size : Nat,
    wordList : [Text],
    randomFeed : LFSR.LFSR32
  ) : [Text] {
    if (wordList.size() <= size) {
      return wordList;
    };
    let randomWords = Buffer.Buffer<Text>(size);

    // using hashmap since hashset is not available
    let allAvailableWordIndices = HashMap.HashMap<Nat, Nat>(
      1,
      Int.equal,
      Int.hash
    );
    for (i in Iter.range(0, wordList.size() - 1)) {
      allAvailableWordIndices.put(i, 1);
      //value is useless here
    };
    // using abs to convert Int to Nat
    var seed = Int.abs(Time.now()) % 255;
    var wordListLength = wordList.size();
    // let feed = LFSR.LFSR8(?Nat8.fromNat(seed));
    while (randomWords.size() < size) {
      seed := Nat32.toNat(randomFeed.next().0) % allAvailableWordIndices.size();
      // same word index shouldn't be chosen again
      let selectedIndex = Iter.toArray(allAvailableWordIndices.keys()).get(seed);
      allAvailableWordIndices.delete(selectedIndex);
      randomWords.add(wordList.get(selectedIndex));
    };
    Buffer.toArray<Text>(randomWords);
  };

  public func getRandomFeedGenerator() : LFSR.LFSR32 {
    var seed = Int.abs(Time.now()) % 65536;
    let feed = LFSR.LFSR32(?Nat32.fromNat(seed));
  };

  public func encodeBase32(content : Text) : ?Text {
    return Text.decodeUtf8(
      Blob.fromArray(Base32.encode(Blob.toArray(Text.encodeUtf8(content))))
    );
  };
  public func encodeNat8ArraytoBase32(content : [Nat8]) : ?Text {
    return Text.decodeUtf8(Blob.fromArray(Base32.encode(content)));
  };

  public func decodeBase32(content : Text) : ?Text {
    let res = Base32.decode(Blob.toArray(Text.encodeUtf8(content)));
    switch (res) {
      case (#ok(r)) {
        return Text.decodeUtf8(Blob.fromArray(r));
      };
      case (_)();
    };
    return null;
  };

  public func textToNat(txt : Text) : Nat {
    assert (txt.size() > 0);
    let chars = txt.chars();

    var num : Nat = 0;
    for (v in chars) {
      let charToNum = Nat32.toNat(Char.toNat32(v) -48);
      assert (charToNum >= 0 and charToNum <= 9);
      num := num * 10 + charToNum;
    };

    num;
  };

  public func intToNat(value : Int) : Nat {
    Nat64.toNat(Int64.toNat64(Int64.fromInt(value)));
  };

  public func allowedCanistergeekCaller(caller : Principal) : Bool {
    let authorizedCallers : [Principal] = [
      Principal.fromText(
        "hqyof-lxrze-ezy5y-bys4t-dm4bq-7i57t-uisji-lsnmt-5jdma-4ujdb-5qe"
      ),
      Principal.fromText(
        "mni5w-twhal-we6re-mvbh2-r3e6x-2djsc-nubmb-hw2ra-avyuu-mu2gj-5qe"
      ),
      Principal.fromText(
        "ov3ez-uxdlq-nu3dd-tpoic-653wi-seo7t-uwqwz-fcoou-homaw-sku6s-nae"
      ),
      Principal.fromText(
        "vd5zo-22yle-so7c7-cnleg-vjzme-vjh2v-2sc7q-76zcs-ul27t-axccm-aqe"
      ),
      Principal.fromText(
        "rticr-ll5pl-u37cr-zipyn-tun6r-gux4r-6j2pd-yfhu3-5mpzf-xmk6c-lqe"
      ),
      Principal.fromText(
        "dowzh-nyaaa-aaaai-qnowq-cai"
      )
    ];
    var exists = Array.find<Principal>(
      authorizedCallers,
      func(val : Principal) : Bool {
        Principal.equal(val, caller);
      }
    );
    exists != null;
  };

  public func level2Text(lv : Types.Level) : Text {
    switch (lv) {
      case (#simple) {
        return "simple";
      };
      case (#normal) {
        return "normal";
      };
      case (#hard) {
        return "hard";
      };
      case (#xhard) {
        return "xhard";
      };
    };
  };

  public func getLogger(cgLogger : Canistergeek.Logger) : CommonTypes.ModclubLogger {
    return {
      logMessage = func(m : Text) { logMessage(cgLogger, m, #info) };
      logError = func(m : Text) { logMessage(cgLogger, m, #error) };
      throwError = func(m : Text) : async () {
        logMessage(cgLogger, m, #error);
        throw Error.reject(m);
      };
      logWarn = func(m : Text) { logMessage(cgLogger, m, #warn) };
      logDebug = func(m : Text) { logMessage(cgLogger, m, #debugLevel) };
    };
  };

  public func logMessage(
    canistergeekLogger : Canistergeek.Logger,
    logMessage : Text,
    logLevel : { #info; #error; #warn; #debugLevel }
  ) {
    var level = "INFO: ";
    switch (logLevel) {
      case (#info) {
        level := "INFO: ";
      };
      case (#error) {
        level := "ERROR: ";
      };
      case (#warn) {
        level := "WARN: ";
      };
      case (#debugLevel) {
        level := "DEBUG: ";
      };
    };
    canistergeekLogger.logMessage(level # logMessage);
  };

  /**
   * Encode an array of unsigned 8-bit integers in hexadecimal format.
   */
  func encode(array : [Nat8]) : Text {
    Array.foldLeft<Nat8, Text>(
      array,
      "",
      func(accum, w8) {
        accum # encodeW8(w8);
      }
    );
  };

  func encodeW8(w8 : Nat8) : Text {
    let c1 = symbols[Prim.nat8ToNat(w8 / base)];
    let c2 = symbols[Prim.nat8ToNat(w8 % base)];
    Prim.charToText(c1) # Prim.charToText(c2);
  };

  public let providerSubaccountTypes = ["RESERVE", "ACCOUNT_PAYABLE"];
  public let moderatorSubaccountTypes = ["RESERVE", "ACCOUNT_PAYABLE"];

  public func generateSubAccounts(subaccountTypes : [Text]) : async [(Text, Blob)] {
    let subAccs = Buffer.Buffer<(Text, Blob)>(1);

    for (subAccType in subaccountTypes.vals()) {
      let saUUID = await generateUUID();
      subAccs.add((subAccType, Text.encodeUtf8(Text.replace(saUUID, #char('-'), ""))));
    };

    Buffer.toArray(subAccs);
  };

  public func joinArrOpt(array : ?[Text]) : Text {
    switch (array) {
      case (null)();
      case (?arr) {
        return joinArr(arr);
      };
    };
    return "";
  };

  public func joinArr(arr : [Text]) : Text {
    return Text.join(",", arr.vals());
  };

  public func translateUpToRs(up : Nat) : (Int, RSTypes.UserLevel) {
    let topSeniorUP = Constants.TOP_SENIOR_TRANSLATE_THRESHOLD;
    let seniorUP = Constants.SENIOR_TRANSLATE_THRESHOLD;
    let juniorUP = Constants.JUNIOR_TRANSLATE_THRESHOLD;

    if (Nat.greater(up, topSeniorUP)) {
      return (75 * RSConstants.RS_FACTOR, #senior3); // #TopSenior as one of most efficient users
    } else if (Nat.greater(up, seniorUP) and Nat.less(up, topSeniorUP)) {
      return (50 * RSConstants.RS_FACTOR, #senior1); // #Senior
    } else if (Nat.greater(up, juniorUP) and Nat.less(up, seniorUP)) {
      return (20 * RSConstants.RS_FACTOR, #junior); // #Junior
    } else {
      return (10 * RSConstants.RS_FACTOR, #novice); // #Novice for all others as motivational user-friendly approach
    };
  };

  public func appendCsvRow(uid : Principal, scores : Int, up : Int, csv : Text) : Text {
    return csv # Principal.toText(uid) # ";" # Int.toText(scores) # ";" # Int.toText(up) # ";\n";
  };

  public func getAirdropAmountByUsePoints(up : Nat) : Nat {
    let level5 : Nat = 40000;
    let level4 : Nat = 20000;
    let level3 : Nat = 10000;
    let level2 : Nat = 5000;
    let level1 : Nat = 1000;

    if (Nat.greaterOrEqual(up, level5)) {
      return 50000;
    } else if (Nat.greaterOrEqual(up, level4) and Nat.less(up, level5)) {
      return 25000;
    } else if (Nat.greaterOrEqual(up, level3) and Nat.less(up, level4)) {
      return 10000;
    } else if (Nat.greaterOrEqual(up, level2) and Nat.less(up, level3)) {
      return 5000;
    } else if (Nat.greaterOrEqual(up, level1) and Nat.less(up, level2)) {
      return 1000;
    } else {
      return 0;
    };
  };

  public func upgradeContentIndex(
    indexTextRep : Text,
    contentId : Types.ContentId,
    contentIndexes : HashMap.HashMap<Text, Buffer.Buffer<Types.ContentId>>
  ) : HashMap.HashMap<Text, Buffer.Buffer<Types.ContentId>> {
    let ids = Option.get(
      contentIndexes.get(indexTextRep),
      Buffer.Buffer<Types.ContentId>(100)
    );
    if (
      Buffer.isEmpty(ids) or not Buffer.contains<Types.ContentId>(ids, contentId, Text.equal)
    ) {
      ids.add(contentId);
      contentIndexes.put(indexTextRep, ids);
    };
    contentIndexes;
  };

  public func getContentFilteringWhitelist(
    filters : { providers : ?[Principal]; categories : ?[Text] },
    contentIndexes : HashMap.HashMap<Text, Buffer.Buffer<Types.ContentId>>
  ) : Buffer.Buffer<Types.ContentId> {
    let res = Buffer.Buffer<Types.ContentId>(0);
    if (Option.isSome(filters.providers)) {
      let providersIds = Option.get(filters.providers, []);
      switch (Option.isSome(filters.categories)) {
        case (true) {
          let catsIds = Option.get(filters.categories, []);
          for (pId in providersIds.vals()) {
            for (cId in catsIds.vals()) {
              let cIds = Option.get(
                contentIndexes.get(Principal.toText(pId) # cId),
                Buffer.Buffer<Types.ContentId>(100)
              );
              res.append(cIds);
            };
          };
        };
        case (false) {
          for (pId in providersIds.vals()) {
            let cIds = Option.get(
              contentIndexes.get(Principal.toText(pId)),
              Buffer.Buffer<Types.ContentId>(100)
            );
            res.append(cIds);
          };
        };
      };
    } else if (Option.isSome(filters.categories)) {
      let catsIds = Option.get(filters.categories, []);
      for (cId in catsIds.vals()) {
        let cIds = Option.get(
          contentIndexes.get(cId),
          Buffer.Buffer<Types.ContentId>(100)
        );
        res.append(cIds);
      };
    };

    res;
  };

  public func isWhitelisted(wl : Buffer.Buffer<Types.ContentId>, cid : Types.ContentId) : Bool {
    Buffer.contains<Types.ContentId>(wl, cid, Text.equal);
  };

  public func nowSeconds() : Int {
    Time.now() / 1000000000;
  };

  public func getIfTextContent(cType : Types.ContentType, chunkedContent : ?[Blob]) : Text {
    switch (cType) {
      case (#text) {
        var textContent = "";
        for (blobChunk in Option.get<[Blob]>(chunkedContent, []).vals()) {
          textContent #= Option.get<Text>(Text.decodeUtf8(blobChunk), "");
        };
        textContent;
      };
      case (_) "";
    };
  };

  public func getIfImageContent(cType : Types.ContentType, cid : Text, chunkedContent : ?[Blob], state : GlobalState.State) : {
    data : [Nat8];
    imageType : Text;
  } {
    let empty = { data = []; imageType = "" };
    switch (cType) {
      case (#imageBlob) {
        let imageContent = Buffer.Buffer<Nat8>(1);
        for (blobChunk in Option.get<[Blob]>(chunkedContent, []).vals()) {
          imageContent.append(Buffer.fromArray(Blob.toArray(blobChunk)));
        };
        switch (state.imageContent.get(cid)) {
          case (?imgContent) {
            return {
              data = Buffer.toArray(imageContent);
              imageType = imgContent.image.imageType;
            };
          };
          case (_) empty;
        };
      };
      case (_) empty;
    };
};
