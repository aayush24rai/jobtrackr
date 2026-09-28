import logging
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import inspect

from database import engine

logger = logging.getLogger("uvicorn.error")

# the first migration - matches the tables the old create_all() used to build
BASELINE_REVISION = "3c433289afab"


def run_migrations():
    # brings the database up to date with every file in migrations/versions
    # runs on app startup (see main.py) and can also be run by hand: python migrate.py
    cfg = Config(str(Path(__file__).parent / "alembic.ini"))
    cfg.attributes["skip_logging_config"] = True

    tables = inspect(engine).get_table_names()

    # databases created before Alembic already have the baseline tables but no
    # alembic_version table - mark them as being at the baseline instead of
    # trying to create the tables a second time
    if "users" in tables and "alembic_version" not in tables:
        logger.info("Existing database without migration history - stamping baseline %s", BASELINE_REVISION)
        command.stamp(cfg, BASELINE_REVISION)

    command.upgrade(cfg, "head")
    logger.info("Database migrations up to date")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run_migrations()
