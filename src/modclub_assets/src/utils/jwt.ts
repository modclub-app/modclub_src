import { modclub_types } from "./types";
import { get_aes_256_gcm_key, aes_gcm_decrypt } from "./crypto_api";

async function getJwt(modclub: modclub_types.ModClub) {
  let jwt = window.localStorage.getItem("jwt");
  if (!jwt) {
    jwt = await refreshJwt(modclub);
  }
  return jwt;
}

async function fetchWithJwt(modclub: modclub_types.ModClub, url: string) {
  let jwt = await getJwt(modclub);
  const options = {
    method: "GET",
  };
  let result = null;
  try {
    result = await fetch(url + `&token=${jwt}`, options);
  } catch (e) {
    // Try again with a new JWT
    jwt = await refreshJwt(modclub);
    result = await fetch(url + `&token=${jwt}`, options);
  }
  return result;
}

export async function refreshJwt(
  modclub: modclub_types.ModClub
): Promise<string> {
  const jwt = await modclub.issueJwt();
  window.localStorage.setItem("jwt", jwt);
  return jwt;
}

export async function fetchObjectUrl(
  modclub: modclub_types.ModClub,
  url: string,
  data: any = {},
  context: string = ""
): Promise<string> {
  const res = await fetchWithJwt(modclub, url);
  const contentBlob = await res.blob();

  if (contentBlob.type.includes("encrypted/vetkd")) {
    const key = await get_aes_256_gcm_key(context, modclub, data.userId);
    console.log("Starting decryption...");

    const originalTypeEntry = contentBlob.type
      .split(";")
      .find((entry) => entry.includes("original="));
    const originalType =
      originalTypeEntry && originalTypeEntry.replace("original=", "");
    const decryptedBlob = await aes_gcm_decrypt(contentBlob, key, originalType);
    console.log("DECRYPTED_BLOB::", decryptedBlob);

    return URL.createObjectURL(decryptedBlob);
  }
  return URL.createObjectURL(contentBlob);
}

export async function fetchDataBlob(
  modclub: modclub_types.ModClub,
  url: string
): Promise<Blob> {
  const res = await fetchWithJwt(modclub, url);
  const dataBlob = await res.blob();

  return dataBlob;
}
