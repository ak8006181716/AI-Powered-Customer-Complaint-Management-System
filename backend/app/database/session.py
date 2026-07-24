import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.config import settings
from app.database.base import Base

logger = logging.getLogger("pharma_app.database")

# Silence noisy SQLAlchemy query logging
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

# Primary Engine Setup
try:
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        future=True,
    )
except Exception as e:
    logger.warning(f"Could not initialize primary DB URL ({settings.DATABASE_URL}). Falling back to SQLite: {e}")
    engine = create_async_engine(
        settings.SQLITE_FALLBACK_URL,
        echo=False,
        future=True,
    )

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def init_db():
    """Create all database tables on application startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for obtaining async SQLAlchemy session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
