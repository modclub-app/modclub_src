import * as vetkd from "ic-vetkd-utils";
import { Principal } from "@dfinity/principal";
import { Actor } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

export async function get_aes_256_gcm_key(
  context,
  actor,
  derivationPrincipalId
) {
  if (!derivationPrincipalId) {
    throw new Error("No derivationPrincipal provided for get_aes_256_gcm_key");
  }
  let derivPrincipal = Principal.from(derivationPrincipalId);
  const seed = window.crypto.getRandomValues(new Uint8Array(32));
  const tsk = new vetkd.TransportSecretKey(seed);

  const ek_bytes_hex = await actor.encryptedSymmetricKeyForCaller(
    context,
    tsk.public_key(),
    [derivPrincipal]
  );

  const pk_bytes_hex = await actor.symmetricKeyVerificationKey(context, [
    derivPrincipal,
  ]);

  return tsk.decrypt_and_hash(
    hex_decode(ek_bytes_hex),
    hex_decode(pk_bytes_hex),
    derivPrincipal.toUint8Array(),
    32,
    new TextEncoder().encode("aes-256-gcm")
  );
}

export async function aes_gcm_encrypt(raw_data_blob, rawKey) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bits; unique per message
  const aes_key = await window.crypto.subtle.importKey(
    "raw",
    rawKey,
    "AES-GCM",
    false,
    ["encrypt"]
  );
  const abData = await raw_data_blob.arrayBuffer();

  const ciphertext_buffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    aes_key,
    abData
  );
  const ciphertext = new Uint8Array(ciphertext_buffer);
  var iv_and_cipher = new Uint8Array(iv.length + ciphertext.length);
  iv_and_cipher.set(iv, 0);
  iv_and_cipher.set(ciphertext, iv.length);

  return new Blob([iv_and_cipher]);
}

export async function aes_gcm_decrypt(
  iv_and_cipher_blob,
  rawKey,
  type = "plain/text"
) {
  const iv_and_cipher = new Uint8Array(await iv_and_cipher_blob.arrayBuffer());
  const iv = iv_and_cipher.subarray(0, 12); // 96-bits; unique per message
  const ciphertext = iv_and_cipher.subarray(12);
  const aes_key = await window.crypto.subtle.importKey(
    "raw",
    rawKey,
    "AES-GCM",
    false,
    ["decrypt"]
  );

  try {
    let decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      aes_key,
      ciphertext
    );
    return new Blob([decrypted], { type });
  } catch (e) {
    console.error("ERROR_ON_DECRYPTION::", e.message);
    console.error("ERROR_RAW::", e);
  }
}

const hex_decode = (hexString) =>
  Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
const hex_encode = (bytes) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
