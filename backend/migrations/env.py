from logging.config import fileConfig

from alembic import context

# reuse the app's engine so migrations hit the same DATABASE_URL
# (including the postgres:// -> postgresql:// fix in database.py)
from database import engine, DATABASE_URL
from models import Base

config = context.config

# skip alembic's logging setup when migrations run inside the app on startup,
# otherwise it would reconfigure (and silence) uvicorn's loggers
if config.config_file_name is not None and not config.attributes.get("skip_logging_config"):
    fileConfig(config.config_file_name)

# autogenerate compares the database against these models
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    # `alembic upgrade head --sql` - print the SQL instead of running it
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
