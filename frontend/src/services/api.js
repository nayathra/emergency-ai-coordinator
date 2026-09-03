// Centralized communication with the Emergency AI Coordinator backend.
// No component should call fetch() directly -- everything routes through here.

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
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (err) {
    throw new ApiError(
      "Unable to reach the Emergency Coordinator. Ensure the FastAPI backend is running on localhost:8000.",
      { status: null, detail: err.message }
    );
  }

  let body = null;
  const raw = await response.text();

  if (raw) {
    try {
      body = JSON.parse(raw);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    if (response.status === 422 && body?.detail) {
      const detail = Array.isArray(body.detail)
        ? body.detail
            .map((d) => `${(d.loc || []).slice(1).join(".")}: ${d.msg}`)
            .join("; ")
        : String(body.detail);

      throw new ApiError(`The request was rejected: ${detail}`, {
        status: 422,
        detail: body.detail,
      });
    }

    throw new ApiError(
      `The Emergency Coordinator returned an unexpected response (HTTP ${response.status}).`,
      { status: response.status, detail: body }
    );
  }

  if (body === null) {
    throw new ApiError(
      "The Emergency Coordinator returned an unreadable response.",
      { status: response.status }
    );
  }

  return body;
}

export function healthCheck() {
  return request("/health", {
    method: "GET",
  });
}

export function runCoordination(incident) {
  return request("/coordination/run", {
    method: "POST",
    body: JSON.stringify(incident),
  });
}

export function runSimulation(incident, simulatedChanges) {
  return request("/simulation/run", {
    method: "POST",
    body: JSON.stringify({
      incident,
      simulated_changes: simulatedChanges,
    }),
  });
}

// 🚨 Send emergency SMS through Twilio
export function sendEmergencySMS(to, message) {
  return request("/sms/send", {
    method: "POST",
    body: JSON.stringify({
      to,
      message,
    }),
  });
}
// 🔊 Generate emergency voice in the selected language
export async function speakText(text, language = "en") {
  let response;

  try {
    response = await fetch(`${BASE_URL}/voice/speak`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        language,
      }),
    });
  } catch (err) {
    throw new ApiError(
      "Unable to reach the Emergency Coordinator voice service.",
      {
        status: null,
        detail: err.message,
      }
    );
  }

  if (!response.ok) {
    let message = "Voice generation failed.";
    let detail = null;

    try {
      const errorData = await response.json();
      detail = errorData.detail;
      message = detail || message;
    } catch {
      // Ignore JSON parsing failure
    }

    throw new ApiError(message, {
      status: response.status,
      detail,
    });
  }

  return await response.blob();
}