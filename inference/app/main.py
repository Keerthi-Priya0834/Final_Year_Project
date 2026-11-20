import io

from fastapi import FastAPI, File, UploadFile
from PIL import Image

from . import model
from .schemas import InferenceResponse

app = FastAPI(title="EyeQ Inference", version="1.0.0")


@app.post("/predict", response_model=InferenceResponse)
async def predict(file: UploadFile = File(...)) -> InferenceResponse:
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    result = await model.predict(image)
    return result


@app.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "mode": "mock",
    }
