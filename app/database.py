from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from app.config import settings

settings.database_dir.mkdir(parents=True, exist_ok=True)
engine = create_engine(settings.database_url, echo=False)


def create_db_and_tables() -> None:
    # Import all models so SQLModel knows about them before create_all
    from app.models.note import Note  # noqa: F401

    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
