from fastapi import Depends, HTTPException, Query, Request
from fastapi.security import APIKeyHeader

from app.config import settings

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def verify_api_key(
    request: Request,
    api_key: str | None = Depends(api_key_header),
    key: str | None = Query(None),
) -> None:
    """Verify API key if APP_API_KEY is configured. No-op if not set."""
    if not settings.api_key:
        return
    provided = api_key or key
    if not provided or provided != settings.api_key:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
