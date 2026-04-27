import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv

# load variables form backend/.env into os.environ
load_dotenv()

# read the DB URL from env
DATABASE_URL = os.getenv("DATABASE_URL")

# the engine is the actual PostgreSQL connection
# pool_pre_ping=True means that SQLAlchemy checkls if a connection is still alive before using it - preventing errors after the DB goes idle
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# calling SessionLocal would create a new session
# autocommut=False means changes aren't saved until you explicilty call commit()
# autoflush=False means SQLAlchemy won't automatically sync pending changes
# bind=engine connects sessions to our DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# this is the parent class for all our ORM models
class Base(DeclarativeBase):
	pass


# this is adependency - FastAPI will call this fn for every request that needs db access
# it creates a session yields it to the route handler and then also closes it when the request is done
# the try/finally gurantess the session closes even if an error occurs
def get_db():
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()


