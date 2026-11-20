from pathlib import Path
from typing import cast

import timm
import torch
import torch.nn as nn
from fastapi.concurrency import run_in_threadpool
from PIL import Image
from torchvision import transforms

from .schemas import (
    AMDProbabilities,
    InferenceResponse,
    StageProbabilities,
    VisibilityProbabilities,
)

AMD_CLASSES = ["NORMAL", "DRUSEN", "DME", "CNV"]
STAGE_CLASSES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"]

BASE_DIR = Path(__file__).resolve().parent
WEIGHTS_PATH = BASE_DIR.parent / "weights" / "best_amd_vit(1).pth"


class AMDViT(nn.Module):
    def __init__(self):
        super().__init__()
        self.vit = timm.create_model(
            "vit_base_patch16_224", pretrained=False, num_classes=0
        )

        d = cast(int, self.vit.num_features)
        self.type_head = nn.Linear(d, 4)
        self.stage_head = nn.Linear(d, 3)
        self.visibility_head = nn.Linear(d, 1)

    def forward(self, x):
        f = self.vit(x)
        return self.type_head(f), self.stage_head(f), self.visibility_head(f)


device = torch.device("cpu")
model = AMDViT().to(device)

state_dict = torch.load(WEIGHTS_PATH, map_location="cpu")
model.load_state_dict(state_dict)

model.eval()


transform = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.5] * 3, [0.5] * 3),
    ]
)


async def predict(image: Image.Image) -> InferenceResponse:
    def inference():
        img = transform(image).unsqueeze(0).to(device)  # type: ignore
        with torch.no_grad():
            type_pred, stage_pred, visibility_pred = model(img)

            amd_probs = torch.softmax(type_pred, dim=1).cpu().numpy()[0]
            stage_probs = torch.softmax(stage_pred, dim=1).cpu().numpy()[0]
            visibility = visibility_pred.item()

        amd_result = {
            AMD_CLASSES[i]: float(amd_probs[i]) for i in range(len(AMD_CLASSES))
        }
        stage_result = {
            STAGE_CLASSES[i]: float(stage_probs[i]) for i in range(len(STAGE_CLASSES))
        }
        visibility_result = round(visibility, 2)

        return amd_result, stage_result, visibility_result

    amd_result, stage_result, visibility_result = await run_in_threadpool(inference)

    response = InferenceResponse(
        amd_result=AMDProbabilities(**amd_result),
        stage_result=StageProbabilities(**stage_result),
        visibility_result=VisibilityProbabilities(VISIBILITY=visibility_result),
    )
    return response
