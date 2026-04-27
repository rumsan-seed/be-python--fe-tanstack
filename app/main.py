from contextlib import asynccontextmanager
from pathlib import Path

import uvicorn
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse

from app.auth import verify_api_key
from app.config import settings
from app.database import create_db_and_tables
from app.routers import notes

_frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_db_and_tables()
    yield
    # Shutdown


app = FastAPI(
    title="App Seed",
    description="FastAPI + TanStack Router seed project",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

http_deps = [Depends(verify_api_key)]
app.include_router(notes.router, prefix="/api/v1", dependencies=http_deps)


@app.get("/api/v1/health", dependencies=http_deps)
def health():
    return {"status": "ok"}


@app.get("/api/v1/auth/check", dependencies=http_deps)
def auth_check():
    """Returns OK if auth is valid. Used by frontend to verify API key."""
    return {"status": "ok", "auth_required": bool(settings.api_key)}


@app.get("/api/v1/auth/required", dependencies=[])
def auth_required():
    """Public endpoint: tells frontend if auth is required (no key check)."""
    return {"required": bool(settings.api_key)}


@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # Try exact file match
    file = _frontend_dist / full_path
    if file.is_file():
        return FileResponse(file)
    # Try directory index
    index = file / "index.html"
    if index.is_file():
        return HTMLResponse(index.read_text())
    # SPA fallback
    root_index = _frontend_dist / "index.html"
    if root_index.is_file():
        return HTMLResponse(root_index.read_text())
    return HTMLResponse(
        "<p>Frontend not built. Run: <code>uv run prod</code></p>", status_code=503
    )


def start():
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
    )


def start_prod():
    import subprocess
    import sys

    frontend_dir = Path(__file__).parent.parent / "frontend"
    if frontend_dir.exists():
        print("Installing frontend dependencies...")
        install_result = subprocess.run(
            ["pnpm", "install", "--frozen-lockfile"],
            cwd=str(frontend_dir),
        )
        if install_result.returncode != 0:
            print("Frontend dependency installation failed.")
            sys.exit(1)

        print("Building frontend...")
        result = subprocess.run(["pnpm", "build"], cwd=str(frontend_dir))
        if result.returncode != 0:
            print("Frontend build failed.")
            sys.exit(1)
        print("Frontend built.")

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=False,
    )


if __name__ == "__main__":
    start()
