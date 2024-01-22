use ic_cdk::*;
use candid::*;
use ic_crypto_internal_bls12_381_type::{G2Affine, Scalar};
use ic_crypto_internal_bls12_381_vetkd::{
    DerivationPath, DerivedPublicKey, EncryptedKey, EncryptedKeyShare, TransportPublicKey,
    TransportPublicKeyDeserializationError,
};
use rand::SeedableRng;
use rand_chacha::ChaCha20Rng;
use std::cell::RefCell;
use types::{
    VetKDCurve, VetKDEncryptedKeyReply, VetKDEncryptedKeyRequest, VetKDKeyId, VetKDPublicKeyReply,
    VetKDPublicKeyRequest,
};

mod types;

const ENCRYPTED_KEY_CYCLE_COSTS: u64 = 0;

thread_local! {
    static _MASTER_SK_HEX: RefCell<Option<String>> = RefCell::new(None);
    static RNG: RefCell<Option<ChaCha20Rng>> = RefCell::new(None);
    static _RNG_SEED_RAW_BYTES: RefCell<Option<[u8; 32]>> = RefCell::new(None);
    static _MASTER_PK: RefCell<Option<G2Affine>> = RefCell::new(None);
    static _MASTER_SK: RefCell<Option<Scalar>> = RefCell::new(None);
}

// #[init]
// fn canister_init(args: Option<InitArgs>) {
//     match &args {
//         Some(args) => {
//             init_master_keys(args.master_sk_hex.clone());
//         },
//         None => {
//             ic_cdk::print("Wrong argument provided, NO master_sk_hex string found.");
//         },
//     };
// }

#[pre_upgrade]
fn pre_upgrade() {
    // ic_cdk::print("[DEBUG] Running PRE_UPGRADE hook.");
    let _ = _MASTER_SK_HEX.with(|msk_hex| match &*msk_hex.borrow() {
        Some(_mks_hex) => {
            let _ = ic_cdk::storage::stable_save((_mks_hex.clone(),)).expect("Could not save the _mks_hex for upgrade");
            // ic_cdk::print("[DEBUG] HEX saved to StableMemory.");
        },
        _ => ic_cdk::print("[DEBUG][ERROR] NO HEX FOUND to save to StableMemory."),
    });
}

#[post_upgrade]
fn post_upgrade() {
    ic_cdk::print("[DEBUG] Running POST_UPGRADE hook.");

    match ic_cdk::storage::stable_restore::<(String,)>() {
        Ok((hex,)) => {
            // ic_cdk::print(format!("[DEBUG] HEX({}) restored from the StableMemory.", hex));
            _MASTER_SK_HEX.with(|msk_hex| {
                msk_hex.borrow_mut().get_or_insert(hex.clone());
                init_master_keys(hex.clone());
                // ic_cdk::print("[DEBUG] HEX resaved to the THREAD_LOCAL.");
            });
        },
        _ => ic_cdk::print("[ERROR] Could not restore the state after upgrade"),
    };
}

fn get_m_sk_hex(mk_hash : String) -> String {
    let msk_hex_init = _MASTER_SK_HEX.with(|msk_hex| match &*msk_hex.borrow() {
        Some(_msk_hex) => true,
        None => false,
    });
    if !msk_hex_init {
        _MASTER_SK_HEX.with(|msk_hex| {
            msk_hex.borrow_mut().get_or_insert(mk_hash.clone());
        });
    };

    _MASTER_SK_HEX.with(|msk_hex| match &*msk_hex.borrow() {
        Some(_hex) => _hex.clone(),
        None => trap("[ERROR] No value for MASTER_SK_HEX found."),
    })
}

#[update]
async fn vetkd_public_key(request: VetKDPublicKeyRequest) -> VetKDPublicKeyReply {
    ensure_bls12_381_test_key_1(request.key_id);
    ensure_derivation_path_is_valid(&request.derivation_path);

    let _mpk = _MASTER_PK.with(|m_pk| match &*m_pk.borrow() {
        Some(_m_pk) => _m_pk.clone(),
        None => ic_cdk::trap("MASTER_PK is not initialized."),
    });

    let derivation_path = {
        let canister_id = request.canister_id.unwrap_or_else(ic_cdk::caller);
        DerivationPath::new(canister_id.as_slice(), &request.derivation_path)
    };
    let derived_public_key = DerivedPublicKey::compute_derived_key(&_mpk, &derivation_path);
    VetKDPublicKeyReply {
        public_key: derived_public_key.serialize().to_vec(),
    }
}

#[update]
async fn pub_init_master_keys(mk_h: String) -> () {
    init_master_keys(mk_h.clone());
}

fn init_master_keys(mk_hash: String) -> bool {
    // ic_cdk::print(format!("[DEBUG] init_master_keys() RUN."));
    let hash = get_m_sk_hex(mk_hash);
    let msk_init = _MASTER_SK.with(|opt_sk| match &*opt_sk.borrow() {
        Some(_sk) => true,
        None => false,
    });
    let mpk_init = _MASTER_SK.with(|opt_pk| match &*opt_pk.borrow() {
        Some(_pk) => true,
        None => false,
    });
    if !msk_init {
        // ic_cdk::print(format!("[DEBUG] No _MASTER_SK initialized, trying to init."));
        _MASTER_SK.with(|opt_sk| {
            let msk_scalar = Scalar::deserialize(
                &hex::decode(hash).expect("failed to hex-decode")
            ).expect("failed to deserialize Scalar");
            opt_sk.borrow_mut().get_or_insert(msk_scalar);
            // ic_cdk::print(format!("[DEBUG] _MASTER_SK initialized."));
        });

        if !mpk_init {
            // ic_cdk::print(format!("[DEBUG] No _MASTER_PK initialized, trying to init."));
            _MASTER_PK.with(|opt_pk| {
                let msk = _MASTER_SK.with(|opt_sk| match &*opt_sk.borrow() {
                    Some(_sk) => _sk.clone(),
                    None => ic_cdk::trap("No MASTER_SK found."),
                });
                let _ = &*opt_pk.borrow_mut().get_or_insert(
                    G2Affine::from(G2Affine::generator() * msk.clone())
                );
                // ic_cdk::print(format!("[DEBUG] _MASTER_PK initialized."));
            });
        };
    };
    
    true
}

#[update]
async fn vetkd_encrypted_key(request: VetKDEncryptedKeyRequest) -> VetKDEncryptedKeyReply {
    ensure_call_is_paid(ENCRYPTED_KEY_CYCLE_COSTS);
    ensure_bls12_381_test_key_1(request.key_id);
    ensure_derivation_path_is_valid(&request.public_key_derivation_path);
    let derivation_path = DerivationPath::new(
        ic_cdk::caller().as_slice(),
        &request.public_key_derivation_path,
    );
    let tpk =
        TransportPublicKey::deserialize(&request.encryption_public_key).unwrap_or_else(
            |e| match e {
                TransportPublicKeyDeserializationError::InvalidPublicKey => {
                    ic_cdk::trap("invalid encryption public key")
                }
            },
        );
    let _mpk = _MASTER_PK.with(|m_pk| match &*m_pk.borrow() {
        Some(_m_pk) => _m_pk.clone(),
        None => ic_cdk::trap("MASTER_PK is not initialized."),
    });
    let _msk = _MASTER_SK.with(|m_sk| match &*m_sk.borrow() {
        Some(_m_sk) => _m_sk.clone(),
        None => ic_cdk::trap("MASTER_SK is not initialized."),
    });

    ic_cdk::println!("[DEBUG] [with_rng] SINGLE_CALL");
    let eks = with_rng(|rng| {
        EncryptedKeyShare::create(
            rng,
            &_mpk,
            &_msk,
            &tpk,
            &derivation_path,
            &request.derivation_id,
        )
    })
    .await;
    let ek = EncryptedKey::combine(
        &vec![(0, _mpk.clone(), eks)],
        1,
        &_mpk,
        &tpk,
        &derivation_path,
        &request.derivation_id,
    )
    .unwrap_or_else(|_e| ic_cdk::trap("bad key share"));

    VetKDEncryptedKeyReply {
        encrypted_key: ek.serialize().to_vec(),
    }
}

fn ensure_bls12_381_test_key_1(key_id: VetKDKeyId) {
    if key_id.curve != VetKDCurve::Bls12_381 {
        ic_cdk::trap("unsupported key ID curve");
    }
    if key_id.name.as_str() != "test_key_1" {
        ic_cdk::trap("unsupported key ID name");
    }
}

fn ensure_derivation_path_is_valid(derivation_path: &Vec<Vec<u8>>) {
    if derivation_path.len() > 255 {
        ic_cdk::trap("derivation path too long")
    }
}

fn ensure_call_is_paid(cycles: u64) {
    if ic_cdk::api::call::msg_cycles_accept(cycles) < cycles {
        ic_cdk::trap("insufficient cycles");
    }
}

async fn with_rng<T>(fn_with_rng: impl FnOnce(&mut ChaCha20Rng) -> T) -> T {
    let rng_initialized = RNG.with(|option_rng| match &*option_rng.borrow() {
        Some(_rng) => true,
        None => false,
    });
    if !rng_initialized {
        let (raw_rand,): (Vec<u8>,) = ic_cdk::api::management_canister::main::raw_rand()
            .await
            .unwrap_or_else(|_e| ic_cdk::trap("call to raw_rand failed"));
        let raw_rand_32_bytes: [u8; 32] = raw_rand
            .try_into()
            .unwrap_or_else(|_e| panic!("raw_rand not 32 bytes"));
        // ic_cdk::println!("[DEBUG] [raw_rand_32_bytes] initialized: {}", format!("{:?}", raw_rand_32_bytes));
        _RNG_SEED_RAW_BYTES.with(|opt_seed| {
            opt_seed.borrow_mut().get_or_insert(raw_rand_32_bytes);
            ic_cdk::print(format!("[DEBUG] _RNG_SEED_RAW_BYTES initialized."));
        });
        let rng = ChaCha20Rng::from_seed(raw_rand_32_bytes);
        RNG.with(|option_rng| {
            option_rng.borrow_mut().get_or_insert(rng);
        });
        ic_cdk::println!("RNG initialized");
    }
    RNG.with(|option_rng| fn_with_rng(option_rng.borrow_mut().as_mut().expect("missing RNG")))
}
