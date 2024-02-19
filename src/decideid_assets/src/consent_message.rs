//! This module contains the various consent messages that is displayed to the user when they are asked to consent to the issuance of a credential.

use crate::SupportedCredentialType;
use lazy_static::lazy_static;
use std::collections::HashMap;
use std::fmt::{Display, Formatter};
use strfmt::strfmt;
use vc_util::issuer_api::{
    Icrc21ConsentInfo, Icrc21ConsentPreferences, Icrc21Error, Icrc21ErrorInfo,
};
use SupportedLanguage::{English};

const POH_VC_DESCRIPTION_EN: &str = r###"# {employer} Proof Of Humanity

Credential that prooves unique humanity."###;

lazy_static! {
    static ref CONSENT_MESSAGE_TEMPLATES: HashMap<(CredentialTemplateType, SupportedLanguage), &'static str> =
        HashMap::from([
            (
                (CredentialTemplateType::ProofOfHumanity, English),
                POH_VC_DESCRIPTION_EN
            )
        ]);
}

#[derive(Clone, Eq, PartialEq, Hash)]
pub enum CredentialTemplateType {
    ProofOfHumanity,
}

#[derive(Clone, Eq, PartialEq, Hash)]
pub enum SupportedLanguage {
    English,
}

impl From<&SupportedCredentialType> for CredentialTemplateType {
    fn from(value: &SupportedCredentialType) -> Self {
        match value {
            SupportedCredentialType::ProofOfHumanity(_) => {
                CredentialTemplateType::ProofOfHumanity
            }
        }
    }
}

impl SupportedCredentialType {
    /// Re-expands a known credential type back into its parameters, which can be used for consent message templating.
    fn to_param_tuple(&self) -> (String, String) {
        match self {
            SupportedCredentialType::ProofOfHumanity(_) => {
                ("ProofOfHumanity".to_string(), "_".to_string())
            }
        }
    }
}

impl From<Icrc21ConsentPreferences> for SupportedLanguage {
    fn from(value: Icrc21ConsentPreferences) -> Self {
        match &value.language.to_lowercase()[..2] {
            _ => English, // english is also the fallback
        }
    }
}

impl Display for SupportedLanguage {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            English => write!(f, "en"),
        }
    }
}

pub fn get_vc_consent_message(
    credential_type: &SupportedCredentialType,
    language: &SupportedLanguage,
) -> Result<Icrc21ConsentInfo, Icrc21Error> {
    render_consent_message(credential_type, language).map(|message| Icrc21ConsentInfo {
        consent_message: message,
        language: format!("{}", language),
    })
}

fn render_consent_message(
    credential: &SupportedCredentialType,
    language: &SupportedLanguage,
) -> Result<String, Icrc21Error> {
    let template = CONSENT_MESSAGE_TEMPLATES
        .get(&(CredentialTemplateType::from(credential), language.clone()))
        .ok_or(Icrc21Error::ConsentMessageUnavailable(Icrc21ErrorInfo {
            description: "Consent message template not found".to_string(),
        }))?;

    strfmt(template, &HashMap::from([credential.to_param_tuple()])).map_err(|e| {
        Icrc21Error::ConsentMessageUnavailable(Icrc21ErrorInfo {
            description: e.to_string(),
        })
    })
}
