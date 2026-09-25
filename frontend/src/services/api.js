const BASE_URL = "http://localhost:8000";

export class ApiError extends Error {
  constructor(message, { status, detail } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
  } catch (err) {
    throw new ApiError("Unable to reach the Emergency Coordinator. Ensure the FastAPI backend is running on localhost:8000.", { status: null, detail: err.message });
  }

  const raw = await response.text();
  let body = null;
  if (raw) { try { body = JSON.parse(raw); } catch { body = null; } }

  if (!response.ok) {
    const detail = body?.detail;
    throw new ApiError(
      detail ? (Array.isArray(detail) ? detail.map((d) => `${(d.loc || []).slice(1).join(".")}: ${d.msg}`).join("; ") : String(detail)) : `The Emergency Coordinator returned HTTP ${response.status}.`,
      { status: response.status, detail }
    );
  }
  if (body === null) throw new ApiError("The Emergency Coordinator returned an unreadable response.", { status: response.status });
  return body;
}

export function healthCheck(){return request("/health",{method:"GET"});}
export function runCoordination(incident){return request("/coordination/run",{method:"POST",body:JSON.stringify(incident)});}
export function runLiveCoordination(incident, token){return request("/coordination/run-live",{method:"POST",headers:{Authorization:`Bearer ${token}`},body:JSON.stringify(incident)});}export function runSimulation(incident,simulatedChanges){return request("/simulation/run",{method:"POST",body:JSON.stringify({incident,simulated_changes:simulatedChanges})});}
export function sendEmergencySMS(to,message){return request("/sms/send",{method:"POST",body:JSON.stringify({to,message})});}
export function getOperationalFeed(token){return request("/auth/operational-feed",{method:"GET",headers:{Authorization:`Bearer ${token}`}});}
export async function speakText(text,language="en"){
  let response;
  try{response=await fetch(`${BASE_URL}/voice/speak`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text,language})});}
  catch(err){throw new ApiError("Unable to reach the Emergency Coordinator voice service.",{status:null,detail:err.message});}
  if(!response.ok){let message="Voice generation failed.";try{const data=await response.json();message=data.detail||message;}catch{}throw new ApiError(message,{status:response.status});}
  return response.blob();
}

export function askAssistant(question, context) {
  return request("/assistant/ask", {
    method: "POST",
    body: JSON.stringify({ question, ...context }),
  });
}
