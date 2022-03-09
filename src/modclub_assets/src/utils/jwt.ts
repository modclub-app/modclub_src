import { issueJwt } from "./api";

export async function getJwt() {
  let jwt = window.localStorage.getItem("jwt");
  if (!jwt) {
    jwt = await refreshJwt();
  }
  return jwt;
}

export async function fetchWithJwt(url: string) {
  let jwt = await getJwt();
  const options = {
    method: "GET",
  };
  let result = null;
  try {
    result = await fetch(url + `&token=${jwt}`, options);
  } catch (e) {
    // Try again with a new JWT
    jwt = await refreshJwt();
    result = await fetch(url + `&token=${jwt}`, options);
  }
  return result;
}

export async function refreshJwt(): Promise<string> {
  const jwt = await issueJwt();
  window.localStorage.setItem("jwt", jwt);
  return jwt;
}
