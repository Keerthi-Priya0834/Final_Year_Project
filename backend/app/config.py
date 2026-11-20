from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    database_url: str = "sqlite+aiosqlite:///./data/eyeq.db"
    minio_endpoint: str = "minio:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_bucket_name: str = "eyeq-scans"
    minio_use_ssl: bool = False
    inference_url: str = "http://inference:8001"
    GROQ_API_KEY: SecretStr | None = None

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
