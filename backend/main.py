import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from slowapi.errors import RateLimitExceeded

from migrate import run_migrations
from routes import users, jobs, overview
from limiter import limiter, rate_limit_exceeded_handler

# the lifespan function runs on startup and shutdown
# running migrations here means the schema is always up to date before requests come in
@asynccontextmanager
async def lifespan(app: FastAPI):

    # startup - apply any database migrations that haven't run yet
    # (Alembic tracks which ones have run in the alembic_version table)
    run_migrations()
    yield

    #shutdown - nothing to clean up for now


app = FastAPI(
    title="JobTrackr API",
    description="Track job applications, referral contacts, and interview rounds",
    version="1.0.0",
    lifespan=lifespan
)

# rate limiting - the decorators on individual routes read the limiter from app.state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)


# CORS - controls which frontend origins can call this API
# comma-separated list from env so the Vercel URL can change without a code edit
# e.g. ALLOWED_ORIGINS=https://jobtrackr.vercel.app,http://localhost:5173
origins = [
    origin.strip().rstrip("/")
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,    # allows cookies and auth headers
    allow_methods=["*"],       # allow GET, POST, PATCH, DELETE, etc.
    allow_headers=["*"],       # allow Authorization header and others
)


# register routers - prefix is prepnded to all routes in that router
# tags group endpoints in the auto-generated docs at /docs
app.include_router(users.router, prefix="/auth", tags=["auth"])
app.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
app.include_router(overview.router, tags=["overview"])


# health check - Railway and other platforms ping this to verify the app is running 
@app.get("/health")
def health_check():
    return {"status": "ok"}