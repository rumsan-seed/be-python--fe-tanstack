from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_dir: Path = Path.home() / ".app-seed"
    host: str = "0.0.0.0"
    port: int = 8000
    api_key: str = ""  # Optional: if set, requires X-API-Key header or ?key= param

    model_config = SettingsConfigDict(
        env_prefix="APP_",
        env_file=".env",
        env_file_encoding="utf-8",
    )

    @property
    def database_url(self) -> str:
        return f"sqlite:///{self.database_dir / 'app.db'}"


settings = Settings()
