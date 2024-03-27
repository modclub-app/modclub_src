import { modclub_types } from "./types";

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
  url: string
): Promise<string> {
  const res = await fetchWithJwt(modclub, url);
  const imageBlob = await res.blob();
  return URL.createObjectURL(imageBlob);
}

export async function fetchDataBlob(
  modclub: modclub_types.ModClub,
  url: string
): Promise<Blob> {
  const res = await fetchWithJwt(modclub, url);
  const dataBlob = await res.blob();

  return dataBlob;
}
