import Debug "mo:base/Debug";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Nat32 "mo:base/Nat32";
import Hash "mo:base/Hash";
import Blob "mo:base/Blob";
import ExtCore "../common/extNft/ext/Core";
import ExtCommon "../common/extNft/ext/Common";
import Char "mo:base/Char";
import Bool "mo:base/Bool";
import ICRCTypes "../common/ICRCTypes";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Float "mo:base/Float";
import CommonTypes "../common/types";
import ModSecurity "../common/security/guard";
import Types "types";

shared ({ caller = deployer }) actor class Airdrop(env : CommonTypes.ENV) = this {

  type AccountId = Types.AccountId; //text
  type Subaccount = Types.Subaccount;
  type Account = Types.Account;
  type TokenId = Types.TokenId;
  type Token = Types.Token;
  type Tokens = Types.Tokens;
  type MetadataLegacy = ExtCommon.Metadata;
  type TokenIndex = ExtCore.TokenIndex;
  type Time = Time.Time;
  type CommonError = ExtCore.CommonError;
  type Tier = Types.Tier;
  type ClaimStatus = Types.ClaimStatus;
  type Claim = Types.Claim;
  type NFT = Types.NFT;
  type Listing = Types.Listing;

  stable var modTokenFee : Float = 0.0001;

  //issbt-caaaa-aaaap-aayeq-cai is the funded canister
  stable var nftActorPrincipal : Text = "issbt-caaaa-aaaap-aayeq-cai";
  let NFTActor = actor (nftActorPrincipal) : actor {
    getTokens : () -> async [(ExtCore.TokenIndex, MetadataLegacy)];
    tokens_ext : (AccountId) -> async Result.Result<[(TokenIndex, ?Listing, ?Blob)], CommonError>;
  };

  //dev vxnwt-gyaaa-aaaah-qc7vq-cai
  let ModTokenActor = actor (Principal.toText(env.wallet_canister_id)) : actor {
    icrc1_transfer : ({
      from_subaccount : ?ICRCTypes.Subaccount;
      to : ICRCTypes.Account;
      amount : ICRCTypes.Tokens;
      fee : ?ICRCTypes.Tokens;
      memo : ?ICRCTypes.Memo;
      created_at_time : ?ICRCTypes.Timestamp;
    }) -> async ICRCTypes.Result<ICRCTypes.TxIndex, ICRCTypes.TransferError>;
    icrc1_balance_of : shared query Account -> async Nat;
  };

  let maxHashmapSize = 1000000;
  func isEq(x : Text, y : Text) : Bool { x == y };
  func isEqNat32(x : Nat32, y : Nat32) : Bool { x == y };
  // → Holder will be Airdropped 366,667 MOD governance tokens
  // → Holder will be Airdropped 91,667 MOD governance tokens
  // → Holder will be Airdropped 18,333 MOD governance tokens

  func getRewardAmount(tier : Tier, months : Nat) : Nat {
    let monthlyReward = switch (tier) {
      case (#bronze) {
        18333 / 12;
      };
      case (#silver) {
        91667 / 12;
      };
      case (#gold) {
        366667 / 12;
      };
      case (#none) {
        0;
      };
    };
    return monthlyReward * months;

  };

  //stable var admins : List.List<Text> = List.nil<Text>();
  stable var nftIndexEntries : [(Nat32, NFT)] = []; // (index, nft)
  var nftIndexHashMap = HashMap.fromIter<Nat32, NFT>(nftIndexEntries.vals(), maxHashmapSize, Nat32.equal, func(a : Nat32) : Nat32 { a });

  func registerNFTs(nfts : [NFT]) : () {
    for (nft in nfts.vals()) {
      nftIndexHashMap.put(nft.tokenIndex, nft);
    };
  };

  func getNFTByAccountId(accountId : AccountId) : async Result.Result<[(TokenIndex, ?Listing, ?Blob)], CommonError> {
    let nfts = await NFTActor.tokens_ext(accountId);
    switch (nfts) {
      case (#ok(nfts)) {
        #ok(nfts);
      };
      case (#err(err)) {
        #err(err);
      };

    };

  };

  let sampleData : Blob = "\00\00\00\99";
  func parseMetaData(metadata : Blob) : async Result.Result<Text, Text> {

    let metadataLegacy = Text.decodeUtf8(sampleData);

    switch (metadataLegacy) {
      case (?metadataLegacy) {
        #ok(metadataLegacy);
      };
      case (null) {
        #err("Error parsing metadata");
      };
    };
  };

  func textToNat(txt : Text) : Nat32 {
    assert (txt.size() > 0);
    let chars = txt.chars();

    var num : Nat32 = 0;
    for (v in chars) {
      let charToNum = Char.toNat32(v) -48;
      assert (charToNum >= 0 and charToNum <= 9);
      num := num * 10 + charToNum;
    };

    num;
  };

  public shared query ({ caller }) func getSubAccountZero() : async ExtCore.AccountIdentifier {
    let subAccountZeroAddress = ExtCore.User.toAID(#principal caller);
    subAccountZeroAddress;
  };

  func _getSubAccountZero(principal : Principal) : ExtCore.AccountIdentifier {
    let subAccountZeroAddress = ExtCore.User.toAID(#principal principal);
    subAccountZeroAddress;
  };

  func _getTier(tokenIndex : Nat32) : Tier {
    if (tokenIndex >= 0 and tokenIndex <= 99) {
      #bronze;
    } else if (tokenIndex >= 100 and tokenIndex <= 139) {
      #silver;
    } else if (tokenIndex >= 140 and tokenIndex <= 159) {
      #gold;
    } else {
      #none;
    };
  };

  public shared func checkUnclaimedNFTs(principal : Text) : async Result.Result<[NFT], Text> {
    let nfts = await NFTActor.tokens_ext(_getSubAccountZero(Principal.fromText(principal)));
    let unclaimedNFTs = Buffer.Buffer<NFT>(0);
    switch (nfts) {
      case (#ok(nfts)) {
        for (singleNFT in nfts.vals()) {
          let tokenIndex = singleNFT.0;
          switch (nftIndexHashMap.get(tokenIndex)) {
            case (?existingNFT) {
              if (getClaimStatusByIndex(tokenIndex) == #available) {
                unclaimedNFTs.add(existingNFT);
              };
            };
            case (null) {
              if (tokenIndex >= 0 and tokenIndex <= 159 and getClaimStatusByIndex(tokenIndex) == #notRegistered) {
                unclaimedNFTs.add({
                  tokenIndex = tokenIndex;
                  lastClaim = {
                    timeStamp = 0;
                    claimStatus = getClaimStatusByIndex(tokenIndex);
                  };
                  dissolveDelay = 0;
                  tier = _getTier(tokenIndex);
                  claimCount = 0;
                });
              };
            };
          };
        };
        return #ok(Buffer.toArray(unclaimedNFTs));
      };
      case (#err(err)) {
        return #err("Error getting unclaimed NFTs");
      };
    };
  };

  public shared ({ caller }) func getAllNFTs() : async Result.Result<[NFT], Text> {
    let nfts = await NFTActor.tokens_ext(_getSubAccountZero(caller));
    let allNFTs = Buffer.Buffer<NFT>(0);
    switch (nfts) {
      case (#ok(nfts)) {
        for (singleNFT in nfts.vals()) {
          let tokenIndex = singleNFT.0;
          switch (nftIndexHashMap.get(tokenIndex)) {
            case (?existingNFT) {
              allNFTs.add(
                {
                  tokenIndex = existingNFT.tokenIndex;
                  lastClaim = {
                    timeStamp = existingNFT.lastClaim.timeStamp;
                    claimStatus = getClaimStatusByIndex(tokenIndex);
                  };
                  dissolveDelay = getDissolveDelayByIndex(tokenIndex);
                  tier = _getTier(tokenIndex);
                  claimCount = existingNFT.claimCount;
                }
              );
            };
            case (null) {
              allNFTs.add({
                tokenIndex = tokenIndex;
                lastClaim = {
                  timeStamp = 0;
                  claimStatus = getClaimStatusByIndex(tokenIndex);
                };
                dissolveDelay = 0;
                tier = _getTier(tokenIndex);
                claimCount = 0;
              });
            };
          };
        };
        return #ok(Buffer.toArray(allNFTs));
      };
      case (#err(err)) {
        return #err("Error getting all NFTs");
      };
    };
  };

  public shared func getNFTCount(principal : Text) : async Result.Result<Nat, Text> {
    let nfts = await NFTActor.tokens_ext(_getSubAccountZero(Principal.fromText(principal)));
    switch (nfts) {
      case (#ok(nfts)) {
        #ok(nfts.size());
      };
      case (#err(err)) {
        #err("Error getting nfts");
      };
    };
  };

  func isOwner(principal : Principal, index : Nat32) : async Bool {
    var accountId = _getSubAccountZero(principal);
    var fundedNFTs = await NFTActor.tokens_ext(accountId); //Funded is the name of the service that creates the NFTs
    var isOwner = false;
    switch (fundedNFTs) {
      case (#ok(fundedNFTs)) {
        for (singleNFT in fundedNFTs.vals()) {
          Debug.print("singleNFT: " # Nat32.toText(singleNFT.0));
          if (singleNFT.0 == index) {
            isOwner := true;
          } else {
            Debug.print("not owner");
          };

        };
      };
      case (_) {
        return false;
      };
    };
    return isOwner;
  };

  let MONTH_IN_SECONDS = 2_592_000;
  private stable var START_DATE = Time.now() - (MONTH_IN_SECONDS * 1_000_000_000); // Time that the airdrop counter starts

  public shared query func getStartTimestamp() : async Nat {
    Int.abs(START_DATE) / 1_000_000_000;
  };

  func _getElapsedMonths() : Int {
    let secondsNow = Time.now() / 1_000_000_000; // convert nanoseconds to seconds
    let secondsStart = START_DATE / 1_000_000_000; // convert nanoseconds to seconds
    let elapsedSeconds = secondsNow - secondsStart;
    let months = elapsedSeconds / MONTH_IN_SECONDS;

    if (months >= 12) {
      return 12;
    } else {
      return months;
    };
  };

  public shared query func getElapsedMonths() : async Nat {
    Int.abs(_getElapsedMonths());
  };

  func getLastClaimMonth(lastClaimTimestamp : Int) : Int {
    let secondsLastClaim = lastClaimTimestamp / 1_000_000_000; // convert nanoseconds to seconds
    let secondsStart = START_DATE / 1_000_000_000; // convert nanoseconds to seconds
    let elapsedSeconds = secondsLastClaim - secondsStart;
    return elapsedSeconds / MONTH_IN_SECONDS;
  };

  func getClaimStatusByIndex(index : Nat32) : ClaimStatus {
    let nft = nftIndexHashMap.get(index);

    switch (nft) {
      case (?nft) {
        let currentMonth = _getElapsedMonths();
        let lastClaimMonth = getLastClaimMonth(nft.lastClaim.timeStamp);

        if (nft.lastClaim.timeStamp == 0 or currentMonth > lastClaimMonth) {
          #available;
        } else {
          #timeLocked;
        };
      };
      case (null) {
        #notRegistered;
      };
    };
  };

  func getDissolveDelayByIndex(index : Nat32) : Nat {
    let nft = nftIndexHashMap.get(index);
    switch (nft) {
      case (?nft) {
        let currentMonth = _getElapsedMonths();
        let lastClaimMonth = getLastClaimMonth(nft.lastClaim.timeStamp);

        if (nft.lastClaim.timeStamp == 0 or currentMonth > lastClaimMonth) {
          return 0;
        } else {
          let secondsNow = Time.now() / 1_000_000_000; // convert nanoseconds to seconds
          let secondsStartOfNextMonth = (START_DATE / 1_000_000_000) + ((currentMonth + 1) * MONTH_IN_SECONDS);
          return Int.abs(secondsStartOfNextMonth - secondsNow);
        };
      };
      case (null) {
        return MONTH_IN_SECONDS;
      };
    };
  };

  func getPaddedIndex(index : Nat32) : Subaccount {
    let indexText = Nat32.toText(index);
    let paddingSize = 32 - Text.size(indexText);
    var paddedIndex = indexText;
    for (i in Iter.range(0, paddingSize - 1)) {
      paddedIndex := Text.concat("0", paddedIndex);
    };
    Text.encodeUtf8(paddedIndex);
  };

  public shared ({ caller }) func airdrop(index : Nat32) : async Result.Result<Text, Text> {
    let accountId = _getSubAccountZero(caller);

    let modclubAirdropWalletBalance = await ModTokenActor.icrc1_balance_of({
      owner = Principal.fromActor(this);
      subaccount = ?getPaddedIndex(index);
    });

    assert (index >= 0 and index <= 159);
    assert (await isOwner(caller, index));
    assert (getClaimStatusByIndex(index) == #available or getClaimStatusByIndex(index) == #notRegistered);
    let nft = nftIndexHashMap.get(index);

    let currentMonth = _getElapsedMonths();
    var lastClaimedMonth = 0;
    var totalMonthsToClaim = 0;
    var nftValue = 0;

    switch (nft) {
      case (?nft) {
        lastClaimedMonth := Int.abs(getLastClaimMonth(nft.lastClaim.timeStamp));
        totalMonthsToClaim := Int.abs(currentMonth - lastClaimedMonth);
        nftValue := getRewardAmount(nft.tier, totalMonthsToClaim);
        assert (totalMonthsToClaim > 0);
        assert (modclubAirdropWalletBalance >= Int.abs(nftValue) + Float.toInt(modTokenFee));

        assert (nft.claimCount < 12);
        registerNFTs([{
          tokenIndex = index;
          lastClaim = {
            timeStamp = Time.now();
            claimStatus = #timeLocked;
          };
          dissolveDelay = getDissolveDelayByIndex(index);
          tier = _getTier(index);
          claimCount = Int.abs(_getElapsedMonths());
        }]);
      };
      case (null) {
        nftValue := getRewardAmount(_getTier(index), Int.abs(_getElapsedMonths()));
        assert (modclubAirdropWalletBalance >= Int.abs(nftValue) + Float.toInt(modTokenFee));

        registerNFTs([{
          tokenIndex = index;
          lastClaim = {
            timeStamp = Time.now();
            claimStatus = #timeLocked;
          };
          dissolveDelay = getDissolveDelayByIndex(index);
          tier = _getTier(index);
          claimCount = Int.abs(_getElapsedMonths());
        }]);
      };
    };

    switch (await ModTokenActor.icrc1_transfer({ from_subaccount = ?getPaddedIndex(index); to = { owner = caller; subaccount = null }; amount = nftValue; fee = null; memo = null; created_at_time = null })) {
      case (#Ok(txIndex)) {
        return #ok("We've airdropped " # Nat.toText(nftValue) # " tokens to your wallet!");
      };

      case (#Err(err)) {

        return #err("Error airdropping tokens, please contact support https://discord.gg/WAuqWrtNZW. Your nft index: " # Nat32.toText(index));
      };
    };

  };

  system func preupgrade() {
    nftIndexEntries := Iter.toArray(nftIndexHashMap.entries());
  };

  system func postupgrade() {
    nftIndexEntries := [];
  };
};
