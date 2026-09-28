from fastapi import Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

# rate limiter keyed by client IP
# behind Railway's proxy this relies on uvicorn --proxy-headers (see Procfile),
# otherwise every request would look like it came from the proxy's IP
# counts live in memory, which is fine for a single instance
limiter = Limiter(key_func=get_remote_address)


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    # return {"detail": ...} like every other error so the frontend can show it
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many attempts. Please wait a bit and try again."},
    )
