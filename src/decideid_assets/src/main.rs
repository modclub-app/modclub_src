use candid::{candid_method, CandidType, Deserialize};
use canister_sig_util::signature_map::{SignatureMap, LABEL_SIG};
use ic_cdk::api::{caller, set_certified_data, time};
use ic_cdk_macros::{init, query, update};
use ic_certification::{fork_hash, labeled_hash, pruned};
use include_dir::{include_dir, Dir};
use serde_bytes::ByteBuf;

use std::cell::RefCell;

use asset_util::{collect_assets, CertifiedAssets};
use ic_cdk::api;

thread_local! {
    static SIGNATURES : RefCell<SignatureMap> = RefCell::new(SignatureMap::default());

    // Assets for the management app
    static ASSETS: RefCell<CertifiedAssets> = RefCell::new(CertifiedAssets::default());
}


#[cfg(target_arch = "wasm32")]
use ic_cdk::println;

#[init]
#[candid_method(init)]
fn init() {
    init_assets();
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
pub fn http_request(req: HttpRequest) -> HttpResponse {
    let parts: Vec<&str> = req.url.split('?').collect();
    let path = parts[0];
    let sigs_root_hash =
        SIGNATURES.with_borrow(|sigs| pruned(labeled_hash(LABEL_SIG, &sigs.root_hash())));
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
    vec![
        ("Access-Control-Allow-Origin".to_string(), "*".to_string()),
        ("access-control-expose-headers".to_string(), "*".to_string()),
        ("access-control-allow-headers".to_string(), "*".to_string()),
        ("x-ic-canister-id".to_string(), format!("{}", canister_id).to_string())
    ]
}

fn main() {}


// Order dependent: do not move above any function annotated with #[candid_method]!
candid::export_service!();

// Assets
static ASSET_DIR: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/../../dist/decideid_assets");
pub fn init_assets() {
    println!("[DEBUG]::[&ASSET_DIR]::{:?}", &ASSET_DIR);
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

    // the string we are replacing here is inserted by vite during the front-end build
    html.replace(
            r#"<script type="module" crossorigin src="/index.js"></script>"#,
            &format!(r#"<script data-canister-id="{canister_id}" type="module" crossorigin src="/index.js"></script>"#).to_string()
        )
}

#[cfg(test)]
mod test {
    use crate::__export_service;
    use candid_parser::utils::{service_equal, CandidSource};
    use std::path::Path;

    /// Checks candid interface type equality by making sure that the service in the did file is
    /// equal to the generated interface.
    #[test]
    fn check_candid_interface_compatibility() {
        let canister_interface = __export_service();
        service_equal(
            CandidSource::Text(&canister_interface),
            CandidSource::File(Path::new("vc_demo_issuer.did")),
        )
        .unwrap_or_else(|e| {
            panic!(
                "the canister code interface is not equal to the did file: {:?}",
                e
            )
        });
    }
}
