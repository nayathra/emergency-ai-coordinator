const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function authRequest(path, payload, token) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || "Authentication request failed.");
  return body;
}
export function login(credentials){return authRequest("/auth/login",credentials);}
export function signup(profile){return authRequest("/auth/signup",profile);}
export function updateResource(token,payload){return authRequest("/auth/resource-update",payload,token);}
export function saveSession(session){localStorage.setItem("emergency_ai_session",JSON.stringify(session));}
export function loadSession(){try{const raw=localStorage.getItem("emergency_ai_session");return raw?JSON.parse(raw):null;}catch{return null;}}
export function clearSession(){localStorage.removeItem("emergency_ai_session");}
