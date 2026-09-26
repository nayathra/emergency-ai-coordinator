from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.agents import router as agents_router
from app.routes.auth import router as auth_router
from app.routes.coordination import router as coordination_router
from app.routes.simulation import router as simulation_router
from app.routes.sms import router as sms_router
from app.routes.incident import router as incident_router
from app.routes.voice import router as voice_router
from app.routes.call import router as call_router
from app.routes.assistant import router as assistant_router


app = FastAPI(
    title="Emergency AI Coordinator",
    description="Multi-Agent AI for Emergency Response Coordination",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(agents_router)
app.include_router(coordination_router)
app.include_router(simulation_router)
app.include_router(sms_router)
app.include_router(incident_router)
app.include_router(voice_router)
app.include_router(call_router)
app.include_router(assistant_router)


@app.get("/")
def root():
    return {
        "status": "online",
        "message": "Emergency AI Coordinator API is running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "emergency-ai-coordinator",
    }
