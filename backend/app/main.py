from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import analysis

app = FastAPI(
    title="Indorama Best-fit Analysis API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)

app.include_router(analysis.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
