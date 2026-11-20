import io
from datetime import timedelta

from minio import Minio
from minio.error import S3Error

from .config import settings


class Storage:
    def __init__(self) -> None:
        self.client = Minio(
            settings.minio_endpoint,
            access_key=settings.minio_access_key,
            secret_key=settings.minio_secret_key,
            secure=settings.minio_use_ssl,
        )
        self.bucket = settings.minio_bucket_name

    def ensure_bucket(self) -> None:
        try:
            if not self.client.bucket_exists(self.bucket):
                self.client.make_bucket(self.bucket)
        except S3Error as exc:
            raise RuntimeError(
                f"Failed to ensure bucket '{self.bucket}': {exc}"
            ) from exc

    def upload(
        self, image_bytes: bytes, object_key: str, content_type: str = "image/jpeg"
    ) -> str:
        self.client.put_object(
            self.bucket,
            object_key,
            data=io.BytesIO(image_bytes),
            length=len(image_bytes),
            content_type=content_type,
        )
        return object_key

    def get_internal_url(self, object_key: str) -> str:
        return self.client.presigned_get_object(
            self.bucket,
            object_key,
            expires=timedelta(hours=1),
        )

    def delete(self, object_key: str) -> None:
        self.client.remove_object(self.bucket, object_key)


storage = Storage()
