from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import engine
from models import Base
from routes import users, jobs

# the lifespan function runs on startup and shutdown
# creating tables here means they're always ready before requests come in
@asynccontextmanager
async def lifespan(app: FastAPI):

    #startup - create all tables if they don't exist yet
    # this is safe to call repeatedly as it won't overwrite existing tables
    Base.metadata.create_all(bind=engine)
    yield

    #shutdown - nothing to clean up for now


app = FastAPI(
    title="JobTrackr API",
    description="Track job applications, referral contacts, and interview rounds",
    version="1.0.0",
    lifespan=lifespan
)


# CORS - controls which frontend origins can call this API
# in production replcae localhost with vercel URL!
origins = [
    "http://loaclhost:5173",    # vite dev server
    "http://localhost:3000",    # fallback in case using a different port
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


# health check - Railway and other platforms ping this to verify the app is running 
@app.get("/heatlh")
def health_check():
    return {"status": "ok"}