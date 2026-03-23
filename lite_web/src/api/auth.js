function getServerUrl() {
  return process.env.REACT_APP_CASDOOR_SERVER_URL || "";
}

function getRefinedValue(value) {
  return value ?? "";
}

function getRawGetParameter(key) {
  const fullUrl = window.location.href;
  const token = fullUrl.split(`${key}=`)[1];
  if (!token) {
    return "";
  }
  const value = token.split("&")[0];
  return value ? decodeURIComponent(value) : "";
}

export function getOAuthGetParameters(search = window.location.search) {
  const queries = new URLSearchParams(search);
  const clientId = getRefinedValue(queries.get("client_id"));
  const responseType = getRefinedValue(queries.get("response_type"));

  let redirectUri = getRawGetParameter("redirect_uri");
  if (!redirectUri) {
    redirectUri = getRefinedValue(queries.get("redirect_uri"));
  }

  const scope = getRefinedValue(queries.get("scope"));
  const state = getRefinedValue(queries.get("state"));
  const nonce = getRefinedValue(queries.get("nonce"));
  const challengeMethod = getRefinedValue(queries.get("code_challenge_method"));
  const codeChallenge = getRefinedValue(queries.get("code_challenge"));

  if (!clientId) {
    return null;
  }

  return {
    clientId,
    responseType,
    redirectUri,
    scope,
    state,
    nonce,
    challengeMethod,
    codeChallenge,
    type: "code",
  };
}

function oAuthParamsToQuery(oAuthParams) {
  if (!oAuthParams) {
    return "";
  }
  return `?clientId=${oAuthParams.clientId}&responseType=${oAuthParams.responseType}&redirectUri=${encodeURIComponent(oAuthParams.redirectUri)}&type=${oAuthParams.type}&scope=${oAuthParams.scope}&state=${oAuthParams.state}&nonce=${oAuthParams.nonce}&code_challenge_method=${oAuthParams.challengeMethod}&code_challenge=${oAuthParams.codeChallenge}`;
}

async function request(path, method = "GET", body) {
  const response = await fetch(`${getServerUrl()}${path}`, {
    method,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.json();
}

export function getApplicationLogin(oAuthParams) {
  return request(`/api/get-app-login${oAuthParamsToQuery(oAuthParams)}`);
}

export function getApplicationByName(applicationName) {
  return request(`/api/get-application?id=admin/${encodeURIComponent(applicationName)}`);
}

export function login(values, oAuthParams) {
  return request(`/api/login${oAuthParamsToQuery(oAuthParams)}`, "POST", values);
}

export function signup(values, oAuthParams) {
  return request(`/api/signup${oAuthParamsToQuery(oAuthParams)}`, "POST", values);
}
