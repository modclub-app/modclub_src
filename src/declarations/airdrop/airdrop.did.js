export const idlFactory = ({ IDL }) => {
  const ENV = IDL.Record({
    'wallet_canister_id' : IDL.Principal,
    'vesting_canister_id' : IDL.Principal,
    'old_modclub_canister_id' : IDL.Principal,
    'modclub_canister_id' : IDL.Principal,
    'rs_canister_id' : IDL.Principal,
    'auth_canister_id' : IDL.Principal,
  });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const TokenIndex = IDL.Nat32;
  const Tier = IDL.Variant({
    'bronze' : IDL.Null,
    'gold' : IDL.Null,
    'none' : IDL.Null,
    'silver' : IDL.Null,
  });
  const Time = IDL.Int;
  const ClaimStatus = IDL.Variant({
    'available' : IDL.Null,
    'notRegistered' : IDL.Null,
    'timeLocked' : IDL.Null,
  });
  const Claim = IDL.Record({ 'timeStamp' : Time, 'claimStatus' : ClaimStatus });
  const NFT = IDL.Record({
    'dissolveDelay' : IDL.Nat,
    'tokenIndex' : TokenIndex,
    'tier' : Tier,
    'claimCount' : IDL.Nat,
    'lastClaim' : Claim,
  });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Vec(NFT), 'err' : IDL.Text });
  const Result = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const AccountIdentifier = IDL.Text;
  const Airdrop = IDL.Service({
    '_getElapsedMonths' : IDL.Func([], [IDL.Nat], ['query']),
    'airdrop' : IDL.Func([IDL.Nat32], [Result_2], []),
    'checkUnclaimedNFTs' : IDL.Func([IDL.Text], [Result_1], []),
    'getAllNFTs' : IDL.Func([], [Result_1], []),
    'getNFTCount' : IDL.Func([IDL.Text], [Result], []),
    'getStartTimestamp' : IDL.Func([], [IDL.Nat], ['query']),
    'getSubAccountZero' : IDL.Func([], [AccountIdentifier], ['query']),
  });
  return Airdrop;
};
export const init = ({ IDL }) => {
  const ENV = IDL.Record({
    'wallet_canister_id' : IDL.Principal,
    'vesting_canister_id' : IDL.Principal,
    'old_modclub_canister_id' : IDL.Principal,
    'modclub_canister_id' : IDL.Principal,
    'rs_canister_id' : IDL.Principal,
    'auth_canister_id' : IDL.Principal,
  });
  return [ENV];
};
