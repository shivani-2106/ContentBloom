"""
ContentBloom AI — FastAPI backend entry point.

Responsibilities:
- Create the FastAPI application instance.
- Configure CORS so the Vite dev server (localhost:5173) can call /api/*.
- Register all API routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import generate

app = FastAPI(
    title="ContentBloom AI",
    description="AI-powered social media content generation API",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# CORS — allow the React dev server to reach the API during development.
# Tighten these origins before deploying to production.
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite default
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(generate.router, prefix="/api")


@app.get("/health")
def health_check():
    """Simple liveness probe."""
    return {"status": "ok", "service": "ContentBloom AI"}
