import { issueJwt } from "./api";

export async function getJwt() {
  let jwt = window.localStorage.getItem("jwt");
  if (!jwt) {
    jwt = await refreshJwt();
  }
  console.log("Fetched JWT:", jwt);
  return jwt;
}

export async function fetchWithJwt(url: string) {
  const jwt = await getJwt();
  const options = {
    method: "GET",
  };
  return fetch(url + `&token=${jwt}`, options);
}

export async function refreshJwt(): Promise<string> {
  const jwt = await issueJwt();
  window.localStorage.setItem("jwt", jwt);
  return jwt;
}
