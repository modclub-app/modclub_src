use crate::consent_message::{get_vc_consent_message, SupportedLanguage};
use candid::{candid_method, CandidType, Deserialize, Principal};
use canister_sig_util::signature_map::{SignatureMap, LABEL_SIG};
use canister_sig_util::{extract_raw_root_pk_from_der, CanisterSigPublicKey, IC_ROOT_PK_DER};
use ic_cdk::api::{caller, set_certified_data, time};
use ic_cdk_macros::{init, query, update};
use ic_certification::{fork_hash, labeled_hash, pruned, Hash};
use ic_stable_structures::storable::Bound;
use ic_stable_structures::{DefaultMemoryImpl, RestrictedMemory, StableCell, Storable};
use identity_core::common::{Timestamp, Url};
use identity_core::convert::FromJson;
use identity_credential::credential::{Credential, CredentialBuilder, Subject};
use include_dir::{include_dir, Dir};
use serde_bytes::ByteBuf;
use serde_json::json;
use sha2::{Digest, Sha256};
use std::borrow::Cow;
use std::cell::RefCell;
use std::collections::HashSet;
use std::collections::HashMap;
use vc_util::issuer_api::{
    ArgumentValue, CredentialSpec, DerivationOriginData, DerivationOriginError,
    DerivationOriginRequest, GetCredentialRequest, Icrc21ConsentInfo, Icrc21Error,
    Icrc21ErrorInfo, Icrc21VcConsentMessageRequest, IssueCredentialError, IssuedCredentialData,
    PrepareCredentialRequest, PreparedCredentialData, SignedIdAlias,
};
use vc_util::{
    did_for_principal, get_verified_id_alias_from_jws, vc_jwt_to_jws, vc_signing_input,
    vc_signing_input_hash, AliasTuple,
};
use asset_util::{collect_assets, CertifiedAssets};

use SupportedCredentialType::{ProofOfHumanity};

use ic_cdk::api;
use ic_cdk_macros::{post_upgrade, pre_upgrade};

mod consent_message;

/// We use restricted memory in order to ensure the separation between non-managed config memory (first page)
/// and the managed memory for potential other data of the canister.
type Memory = RestrictedMemory<DefaultMemoryImpl>;
type ConfigCell = StableCell<IssuerConfig, Memory>;
type PohVCCell = StableCell<PohVerifiedCredentials, Memory>;

const MINUTE_NS: u64 = 60 * 1_000_000_000;
const PROD_II_CANISTER_ID: &str = "rdmx6-jaaaa-aaaaa-aaadq-cai";
const LOCAL_II_CANISTER_ID: &str = "aax3a-h4aaa-aaaaa-qaahq-cai";
// The expiration of issued verifiable credentials.
const VC_EXPIRATION_PERIOD_NS: u64 = 15 * MINUTE_NS;

#[derive(Debug)]
pub enum SupportedCredentialType {
    ProofOfHumanity(String),
}

thread_local! {
    /// Static configuration of the canister set by init() or post_upgrade().
    static CONFIG: RefCell<ConfigCell> = RefCell::new(ConfigCell::init(config_memory(), IssuerConfig::default()).expect("failed to initialize stable cell"));
    static POH_VC_STABLE: RefCell<PohVCCell> = RefCell::new(PohVCCell::init(config_memory(), PohVerifiedCredentials::default()).expect("failed to initialize stable cell for PohVerifiedCredentials"));
    static SIGNATURES : RefCell<SignatureMap> = RefCell::new(SignatureMap::default());
    static POH_VERIFIED : RefCell<HashSet<Principal>> = RefCell::new(HashSet::new());
    static POH_CANDIDATES : RefCell<HashMap<Principal, Principal>> = RefCell::new(HashMap::new());
    static ASSETS: RefCell<CertifiedAssets> = RefCell::new(CertifiedAssets::default());
    static MODCLUB_CANISTER_IDS: RefCell<HashSet<String>> = RefCell::new(HashSet::new());
}

/// Reserve the first stable memory page for the configuration stable cell.
fn config_memory() -> Memory {
    RestrictedMemory::new(DefaultMemoryImpl::default(), 0..1)
}

#[cfg(target_arch = "wasm32")]
use ic_cdk::println;

#[derive(CandidType, Deserialize)]
struct IssuerConfig {
    /// Root of trust for checking canister signatures.
    ic_root_key_raw: Vec<u8>,
    /// List of canister ids that are allowed to provide id alias credentials.
    idp_canister_ids: Vec<Principal>,
    /// The derivation origin to be used by the issuer.
    derivation_origin: String,
    /// Frontend hostname to be used by the issuer.
    frontend_hostname: String,
}

impl Storable for IssuerConfig {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).expect("failed to encode IssuerConfig"))
    }
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).expect("failed to decode IssuerConfig")
    }
    const BOUND: Bound = Bound::Unbounded;
}

impl Default for IssuerConfig {
    fn default() -> Self {
        let derivation_origin = format!("https://{}.ic0.app", ic_cdk::id().to_text());
        Self {
            ic_root_key_raw: extract_raw_root_pk_from_der(IC_ROOT_PK_DER)
                .expect("failed to extract raw root pk from der"),
            idp_canister_ids: vec![
                Principal::from_text(PROD_II_CANISTER_ID).unwrap(),
                Principal::from_text(LOCAL_II_CANISTER_ID).unwrap(),
            ],
            derivation_origin: derivation_origin.clone(),
            frontend_hostname: derivation_origin, // by default, use DERIVATION_ORIGIN as frontend-hostname
        }
    }
}

impl From<IssuerInit> for IssuerConfig {
    fn from(init: IssuerInit) -> Self {
        Self {
            ic_root_key_raw: extract_raw_root_pk_from_der(&init.ic_root_key_der)
                .expect("failed to extract raw root pk from der"),
            idp_canister_ids: init.idp_canister_ids,
            derivation_origin: init.derivation_origin,
            frontend_hostname: init.frontend_hostname,
        }
    }
}

#[derive(CandidType, Deserialize)]
struct IssuerInit {
    /// Root of trust for checking canister signatures.
    ic_root_key_der: Vec<u8>,
    /// List of canister ids that are allowed to provide id alias credentials.
    idp_canister_ids: Vec<Principal>,
    /// The derivation origin to be used by the issuer.
    derivation_origin: String,
    /// Frontend hostname be used by the issuer.
    frontend_hostname: String,
}


#[derive(CandidType, Deserialize)]
struct PohVerifiedCredentials {
    verified: Vec<Principal>,
    poh_candidates: Vec<(Principal, Principal)>,
}

impl Storable for PohVerifiedCredentials {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).expect("failed to encode PohVerifiedCredentials"))
    }
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).expect("failed to decode PohVerifiedCredentials")
    }
    const BOUND: Bound = Bound::Unbounded;
}

impl Default for PohVerifiedCredentials {
    fn default() -> Self {
        Self {
            verified: vec![],
            poh_candidates: vec![],
        }
    }
}

impl PohVerifiedCredentials {
    fn from_state(verified : HashSet<Principal>, candidates : HashMap<Principal, Principal>) -> Self {
        let candidates_vec : Vec<(Principal, Principal)> = candidates.iter().map(|(k, v)| { (k.clone(), v.clone()) }).collect();

        Self {
            verified: Vec::from_iter(verified.clone()),
            poh_candidates: candidates_vec,
        }
    }
}

#[init]
#[candid_method(init)]
fn init(init_arg: Option<IssuerInit>) {
    if let Some(init) = init_arg {
        apply_config(init);
    };
    init_assets();
    init_mc_ids();
}

#[post_upgrade]
fn post_upgrade(init_arg: Option<IssuerInit>) {
    init_assets();
    init_mc_ids();
    POH_VC_STABLE.with_borrow(|poh_vc_stable_cell| {
        let poh_vc_stable = poh_vc_stable_cell.get();
        POH_VERIFIED.with_borrow_mut(|poh_verified_users| {
            for v_pid in poh_vc_stable.verified.iter() {
                poh_verified_users.insert(v_pid.clone());
            }
        });
        POH_CANDIDATES.with_borrow_mut(|poh_candidate_users| {
            for (k, v) in poh_vc_stable.poh_candidates.iter() {
                poh_candidate_users.insert(k.clone(), v.clone());
            }
        });
    });
}

#[pre_upgrade]
fn pre_upgrade() {
    let _verified = POH_VERIFIED.with_borrow(|poh_verified| {
        poh_verified.clone()
    });
    let _candidates = POH_CANDIDATES.with_borrow(|poh_candidate_users| {
        poh_candidate_users.clone()
    });
    POH_VC_STABLE
    .with_borrow_mut(|poh_vc_cell| poh_vc_cell.set(PohVerifiedCredentials::from_state(_verified, _candidates)))
    .expect("failed to apply POH_VC_STABLE from state");
}

#[update]
#[candid_method]
fn configure(config: IssuerInit) {
    apply_config(config);
}

fn apply_config(init: IssuerInit) {
    CONFIG
        .with_borrow_mut(|config_cell| config_cell.set(IssuerConfig::from(init)))
        .expect("failed to apply issuer config");
}

fn init_mc_ids() {
    MODCLUB_CANISTER_IDS.with_borrow_mut(|mc_ids| {
        let ids = vec!["hvyqe-cyaaa-aaaah-qdbiq-cai", "d7isk-4aaaa-aaaah-qdbsa-cai", "gwuzc-waaaa-aaaah-qdboa-cai", "cbopz-duaaa-aaaaa-qaaka-cai"];
        for cid in ids.iter() {
            mc_ids.insert(String::from(cid.clone()));
        };
    });
}
// ----------- ASSETS


#[query]
#[candid_method(query)]
pub fn http_request(req: HttpRequest) -> HttpResponse {
    let parts: Vec<&str> = req.url.split('?').collect();
    println!("[DEBUG]::[HTTP_REQUEST]::{:?}", &parts);
    let path = parts[0];
    let sigs_root_hash =
        SIGNATURES.with_borrow(|sigs| pruned(labeled_hash(LABEL_SIG, &sigs.root_hash())));
    let assets_keys: Vec<String> = ASSETS.with_borrow(|assets| {
        assets.get_certified_assets()
    });

    let maybe_asset = ASSETS.with_borrow(|assets| {
        assets.get_certified_asset(path, req.certificate_version, Some(sigs_root_hash))
    });

    let mut headers = static_headers();
    match maybe_asset {
        Some(asset) => {
            headers.extend(asset.headers);
            HttpResponse {
                status_code: 200,
                body: ByteBuf::from(asset.content),
                headers,
            }
        }
        None => HttpResponse {
            status_code: 404,
            headers,
            body: ByteBuf::from(format!("Asset {} not found.", path)),
        },
    }
}

fn static_headers() -> Vec<(String, String)> {
    let canister_id = api::id();
    // TODO: Put real II origin here instead of "*"
    vec![
        ("Access-Control-Allow-Origin".to_string(), "*".to_string()),
        ("access-control-expose-headers".to_string(), "*".to_string()),
        ("access-control-allow-headers".to_string(), "*".to_string()),
        ("x-ic-canister-id".to_string(), format!("{}", canister_id).to_string())
    ]
}



// Assets
static ASSET_DIR: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/../../dist/modclub_assets");
pub fn init_assets() {
    ASSETS.with_borrow_mut(|assets| {
        *assets = CertifiedAssets::certify_assets(
            collect_assets(&ASSET_DIR, Some(fixup_html)),
            &static_headers(),
        );
    });

    update_root_hash()
}
pub type HeaderField = (String, String);

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct HttpRequest {
    pub method: String,
    pub url: String,
    pub headers: Vec<HeaderField>,
    pub body: ByteBuf,
    pub certificate_version: Option<u16>,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct HttpResponse {
    pub status_code: u16,
    pub headers: Vec<HeaderField>,
    pub body: ByteBuf,
}

fn fixup_html(html: &str) -> String {
    let canister_id = api::id();
    // the string we are replacing here is inserted by BUNDLER during the front-end build
    html.replace(
            r#"<script defer src="index.js"></script>"#,
            &format!(r#"<script data-canister-id="{canister_id}" defer crossorigin src="index.js"></script>"#).to_string()
        )
}


// ------------


fn authorize_vc_request(
    alias: &SignedIdAlias,
    expected_vc_subject: &Principal,
    current_time_ns: u128,
) -> Result<AliasTuple, IssueCredentialError> {
    CONFIG.with_borrow(|config| {
        let config = config.get();

        // for idp_canister_id in &config.idp_canister_ids {

        //     if let Ok(alias_tuple) = get_verified_id_alias_from_jws(
        //         &alias.credential_jws,
        //         expected_vc_subject,
        //         idp_canister_id,
        //         &config.ic_root_key_raw,
        //         current_time_ns,
        //     ) {
        //         return Ok(alias_tuple);
        //     }
        // }
        let verification = get_verified_id_alias_from_jws(
            &alias.credential_jws,
            expected_vc_subject,
            &Principal::from_text(LOCAL_II_CANISTER_ID).unwrap(),
            &config.ic_root_key_raw,
            current_time_ns,
        );
        match verification {
            Ok(alias_tuple) => { return Ok(alias_tuple); },
            Err(err) => {
                println!(
                    "\n*** [DEBUG] [_ERROR_] get_verified_id_alias_from_jws :: {:?}\n",
                    &err
                );
                return Err(IssueCredentialError::InvalidIdAlias(
                    "id alias could not be verified".to_string(),
                ))
            }
        };

    })
}

#[update]
#[candid_method]
async fn derivation_origin(
    req: DerivationOriginRequest,
) -> Result<DerivationOriginData, DerivationOriginError> {
    get_derivation_origin(&req.frontend_hostname)
}

fn get_derivation_origin(hostname: &str) -> Result<DerivationOriginData, DerivationOriginError> {
    CONFIG.with_borrow(|config| {
        let config = config.get();
        if hostname == config.frontend_hostname {
            Ok(DerivationOriginData {
                origin: config.derivation_origin.clone(),
            })
        } else {
            Err(DerivationOriginError::UnsupportedOrigin(
                hostname.to_string(),
            ))
        }
    })
}

#[update]
#[candid_method]
async fn prepare_credential(
    req: PrepareCredentialRequest,
) -> Result<PreparedCredentialData, IssueCredentialError> {
    let alias_tuple = match authorize_vc_request(&req.signed_id_alias, &caller(), time().into()) {
        Ok(alias_tuple) => alias_tuple,
        Err(err) => return Err(err),
    };
    let credential_type = match verify_credential_spec(&req.credential_spec) {
        Ok(credential_type) => credential_type,
        Err(err) => {
            return Err(IssueCredentialError::UnsupportedCredentialSpec(err));
        }
    };

    let credential = match prepare_credential_payload(&credential_type, &alias_tuple) {
        Ok(credential) => credential,
        Err(err) => return Result::<PreparedCredentialData, IssueCredentialError>::Err(err),
    };
    let seed = calculate_seed(&alias_tuple.id_alias);
    let canister_id = ic_cdk::id();
    let canister_sig_pk = CanisterSigPublicKey::new(canister_id, seed.to_vec());
    let credential_jwt = credential
        .serialize_jwt()
        .expect("internal: JWT serialization failure");
    let signing_input =
        vc_signing_input(&credential_jwt, &canister_sig_pk).expect("failed getting signing_input");
    let msg_hash = vc_signing_input_hash(&signing_input);

    SIGNATURES.with(|sigs| {
        let mut sigs = sigs.borrow_mut();
        sigs.add_signature(seed.as_ref(), msg_hash);
    });
    // update_root_hash();
    Ok(PreparedCredentialData {
        prepared_context: Some(ByteBuf::from(credential_jwt.as_bytes())),
    })
}

fn update_root_hash() {
    SIGNATURES.with_borrow(|sigs| {
        ASSETS.with_borrow(|assets| {
            let prefixed_root_hash = fork_hash(
                // NB: Labels added in lexicographic order.
                &assets.root_hash(),
                &labeled_hash(LABEL_SIG, &sigs.root_hash()),
            );

            set_certified_data(&prefixed_root_hash[..]);
        })
    })
}

#[query]
#[candid_method(query)]
fn get_credential(req: GetCredentialRequest) -> Result<IssuedCredentialData, IssueCredentialError> {
    let alias_tuple = match authorize_vc_request(&req.signed_id_alias, &caller(), time().into()) {
        Ok(alias_tuple) => alias_tuple,
        Err(err) => return Result::<IssuedCredentialData, IssueCredentialError>::Err(err),
    };
    if let Err(err) = verify_credential_spec(&req.credential_spec) {
        return Result::<IssuedCredentialData, IssueCredentialError>::Err(
            IssueCredentialError::UnsupportedCredentialSpec(err),
        );
    }
    let subject_principal = alias_tuple.id_alias;
    let seed = calculate_seed(&subject_principal);
    let canister_id = ic_cdk::id();
    let canister_sig_pk = CanisterSigPublicKey::new(canister_id, seed.to_vec());
    let prepared_context = match req.prepared_context {
        Some(context) => context,
        None => {
            return Result::<IssuedCredentialData, IssueCredentialError>::Err(internal_error(
                "missing prepared_context",
            ))
        }
    };
    let credential_jwt = match String::from_utf8(prepared_context.into_vec()) {
        Ok(s) => s,
        Err(_) => {
            return Result::<IssuedCredentialData, IssueCredentialError>::Err(internal_error(
                "invalid prepared_context",
            ))
        }
    };
    let signing_input =
        vc_signing_input(&credential_jwt, &canister_sig_pk).expect("failed getting signing_input");
    let message_hash = vc_signing_input_hash(&signing_input);
    let sig_result = SIGNATURES.with(|sigs| {
        let sig_map = sigs.borrow();
        let certified_assets_root_hash = ASSETS.with_borrow(|assets| assets.root_hash());
        sig_map.get_signature_as_cbor(&seed, message_hash, Some(certified_assets_root_hash))
    });
    let sig = match sig_result {
        Ok(sig) => sig,
        Err(e) => {
            return Result::<IssuedCredentialData, IssueCredentialError>::Err(
                IssueCredentialError::SignatureNotFound(format!(
                    "signature not prepared or expired: {}",
                    e
                )),
            );
        }
    };
    let vc_jws =
        vc_jwt_to_jws(&credential_jwt, &canister_sig_pk, &sig).expect("failed constructing JWS");
    Result::<IssuedCredentialData, IssueCredentialError>::Ok(IssuedCredentialData { vc_jws })
}

#[update]
#[candid_method]
async fn vc_consent_message(
    req: Icrc21VcConsentMessageRequest,
) -> Result<Icrc21ConsentInfo, Icrc21Error> {
    // let credential_type = match verify_credential_spec(&req.credential_spec) {
    //     Ok(credential_type) => credential_type,
    //     Err(err) => {
    //         return Err(Icrc21Error::UnsupportedCanisterCall(Icrc21ErrorInfo {
    //             description: err,
    //         }));
    //     }
    // };
    // get_vc_consent_message(&credential_type, &SupportedLanguage::from(req.preferences))
    return Ok(Icrc21ConsentInfo {
        consent_message : "Modclub Proof of Unique Humanity".to_string(),
        language : "en-US".to_string(),
    });
}

fn verify_credential_spec(spec: &CredentialSpec) -> Result<SupportedCredentialType, String> {
    match spec.credential_type.as_str() {
        "ProofOfHumanity" => {
            verify_single_argument(
                spec,
                "verificationType",
                ArgumentValue::String("human-moderation".to_string()),
            )?;
            Ok(ProofOfHumanity("ProofOfHumanity".to_string()))
        }
        other => Err(format!("Credential {} is not supported", other)),
    }
}

// Verifies that the credential spec `spec` contains an argument `expected_argument`
// with the value `expected_value`.
fn verify_single_argument(
    spec: &CredentialSpec,
    expected_argument: &str,
    expected_value: ArgumentValue,
) -> Result<(), String> {
    fn missing_argument_error(
        spec: &CredentialSpec,
        expected_argument: &str,
    ) -> Result<(), String> {
        Err(format!(
            "Missing argument '{}' for credential {}",
            expected_argument, spec.credential_type
        ))
    }

    let Some(arguments) = &spec.arguments else {
        return missing_argument_error(spec, expected_argument);
    };
    let Some(value) = arguments.get(expected_argument) else {
        return missing_argument_error(spec, expected_argument);
    };

    if value != &expected_value {
        return Err(format!(
            "Unsupported value for argument '{}': expected '{}', got '{}'",
            expected_argument, expected_value, value
        ));
    }

    let unexpected_arguments: Vec<&String> = arguments
        .keys()
        .filter(|k| k.as_str() != expected_argument)
        .collect();
    if !unexpected_arguments.is_empty() {
        return Err(format!(
            "Unexpected arguments for credential {}: {:?}",
            spec.credential_type, unexpected_arguments
        ));
    }
    Ok(())
}

#[update]
#[candid_method]
fn add_poh_verified(uid: Principal) -> Result<u32, String> {
    MODCLUB_CANISTER_IDS.with_borrow(|mc_ids| {
        assert!(mc_ids.contains(&(caller().to_text())));
    });
    POH_CANDIDATES.with_borrow(|poh_candidate_users| {
        match poh_candidate_users.get(&uid) {
            Some(&d_pid) => {
                POH_VERIFIED.with_borrow_mut(|poh_verified_users| {
                    println!(
                        "*** [DEBUG] [add_poh_verified] [User_ID] {:?}\n",
                        uid
                    );
                    poh_verified_users.insert(d_pid.clone());
                });

                let new_len : u32 = POH_VERIFIED.with_borrow(|pvu| {
                    pvu.len()
                }).try_into().unwrap();

                println!("Add poh_verified_user STATUS {}, New Lenght {}", uid, new_len);
                return Ok(new_len);
            }
            None => { return Err(format!("No POH candidate found.")); }
        };
    })
}

#[update]
#[candid_method]
fn remove_poh_verified(uid: Principal) -> Result<u32, String> {
    MODCLUB_CANISTER_IDS.with_borrow(|mc_ids| {
        assert!(mc_ids.contains(&(caller().to_text())));
    });
    POH_CANDIDATES.with_borrow(|poh_candidate_users| {
        match poh_candidate_users.get(&uid) {
            Some(&d_pid) => {
                POH_VERIFIED.with_borrow_mut(|poh_verified_users| {
                    let rem_res = poh_verified_users.remove(&d_pid.clone());
                    println!(
                        "*** [DEBUG] [remove_poh_verified] [User_ID] {:?} [STATUS] {:?} \n",
                        &d_pid.clone().to_text(), rem_res
                    );
                });
            
                let new_len : u32 = POH_VERIFIED.with_borrow(|pvu| {
                    pvu.len()
                }).try_into().unwrap();

                return Ok(new_len);
            }
            None => { return Err(format!("No POH candidate found to remove_poh_verified.")); }
        };
    })
}

#[update]
#[candid_method]
fn add_poh_candidate(uid: Principal) -> Result<u32, String> {
    let inserted_pid = POH_CANDIDATES.with_borrow_mut(|poh_candidate_users| {
        println!(
            "*** [DEBUG] [add_poh_candidate] [User_ID] {:?} \n",
            uid.to_text()
        );
        poh_candidate_users.insert(uid.clone(), caller());
        match poh_candidate_users.get(&uid) {
            Some(&c_pid) => { c_pid.clone() },
            None => { panic!("Error occurs for [add_poh_candidate]. UID {}", uid.to_text()) },
        }
    });
    let new_len : u32 = POH_CANDIDATES.with_borrow(|pсu| {
        pсu.len()
    }).try_into().unwrap();

    println!("Add add_poh_candidate INSERTED_PAIR:: <{}, {}>, \n New Lenght {}", inserted_pid.to_text(), uid, new_len);
    Ok(new_len)
}

fn main() {}

fn calculate_seed(principal: &Principal) -> Hash {
    // IMPORTANT: In a real dapp the salt should be set to a random value.
    let dummy_salt = [5u8; 32];

    let mut bytes: Vec<u8> = vec![];
    bytes.push(dummy_salt.len() as u8);
    bytes.extend_from_slice(&dummy_salt);

    let principal_bytes = principal.as_slice();
    bytes.push(principal_bytes.len() as u8);
    bytes.extend(principal_bytes);
    hash_bytes(bytes)
}

fn poh_credential(subject_principal: Principal, employer_name: &str) -> Credential {
    let subject: Subject = Subject::from_json_value(json!({
      "id": did_for_principal(subject_principal),
      "humanity_verified": {
            "verifierName": "Modclub Foundation",
            "verificationType": "human-moderation",
      },
    }))
    .unwrap();

    // Build credential using subject above and issuer.
    CredentialBuilder::default()
        .id(Url::parse("https://modclub.app/#app").unwrap())
        .issuer(Url::parse("https://modclub.app").unwrap())
        .type_("ProofOfHumanity")
        .subject(subject)
        .expiration_date(exp_timestamp())
        .build()
        .unwrap()
}

fn exp_timestamp() -> Timestamp {
    Timestamp::from_unix(((time() + VC_EXPIRATION_PERIOD_NS) / 1_000_000_000) as i64)
        .expect("internal: failed computing expiration timestamp")
}

fn prepare_credential_payload(
    credential_type: &SupportedCredentialType,
    alias_tuple: &AliasTuple,
) -> Result<Credential, IssueCredentialError> {
    match credential_type {
        ProofOfHumanity(poph_vc) => {
            let verification = POH_VERIFIED.with_borrow(|poph_verified| {
                verify_authorized_principal(credential_type, alias_tuple, poph_verified)
            });
            match verification {
                Ok(_) => {
                    return Ok(poh_credential(
                        alias_tuple.id_alias,
                        poph_vc,
                    ));
                }
                Err(e) => {
                    return Err(e);
                }
            }
        }
    }
}

fn verify_authorized_principal(
    credential_type: &SupportedCredentialType,
    alias_tuple: &AliasTuple,
    authorized_principals: &HashSet<Principal>,
) -> Result<(), IssueCredentialError> {
    for ap in authorized_principals.iter() {
        println!(
            "*** [DEBUG] principal {} in authorized principals",
            ap.to_text()
        );
    }
    if authorized_principals.contains(&alias_tuple.id_dapp) {
        Ok(())
    } else {
        println!(
            "*** principal {} it is not authorized for credential type {:?}",
            alias_tuple.id_dapp.to_text(),
            credential_type
        );
        println!(
            "*** [DEBUG] :: [alias_tuple] {:?}",
            alias_tuple,
        );
        Err(IssueCredentialError::UnauthorizedSubject(format!(
            "unauthorized principal {}",
            alias_tuple.id_dapp.to_text()
        )))
    }
}

fn internal_error(msg: &str) -> IssueCredentialError {
    IssueCredentialError::Internal(String::from(msg))
}

fn hash_bytes(value: impl AsRef<[u8]>) -> Hash {
    let mut hasher = Sha256::new();
    hasher.update(value.as_ref());
    hasher.finalize().into()
}

// Order dependent: do not move above any function annotated with #[candid_method]!
candid::export_service!();
