from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.agents import router as agents_router
from app.routes.coordination import router as coordination_router
from app.routes.simulation import router as simulation_router


app = FastAPI(
    title="Emergency AI Coordinator",
    description="Multi-Agent AI for Emergency Response Coordination",
    version="1.0.0",
)

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(agents_router)
app.include_router(coordination_router)
app.include_router(simulation_router)

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