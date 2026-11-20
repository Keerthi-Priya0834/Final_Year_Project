import io

import httpx
from PIL import Image

from ..config import settings
from ..schemas import InferenceResponse


async def run_inference(image_bytes: bytes) -> InferenceResponse:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((224, 224), Image.Resampling.LANCZOS)

    buffer = io.BytesIO()
    image.save(buffer, format="JPEG")
    resized_bytes = buffer.getvalue()

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{settings.inference_url}/predict",
            files={"file": ("scan.jpg", resized_bytes, "image/jpeg")},
        )
        response.raise_for_status()
        return InferenceResponse(**response.json())
