from fastapi import APIRouter, File, UploadFile
from utils.video_utils import extract_face_features
from models.loader import video_model, emotions
import numpy as np
import os
import uuid

router = APIRouter(prefix="/predict")

@router.post("/video")

async def predict_video(file: UploadFile = File(...)):

    # Extract suffix safely; default to .mp4 if missing
    suffix = os.path.splitext(file.filename)[1] if file.filename else ".mp4"
    if not suffix:
        suffix = ".mp4"

    # Create temp folder inside project directory
    temp_dir = "temp_videos"
    os.makedirs(temp_dir, exist_ok=True)

    # Unique filename with suffix
    temp_path = os.path.join(temp_dir, f"{uuid.uuid4()}{suffix}")

    # Save uploaded content to file
    content = await file.read()
    with open(temp_path, "wb") as f:
        f.write(content)

    print(f"Temp video file saved at: {temp_path}")

    try:
        features = extract_face_features(temp_path)
        if features is None:
            return {"emotion": "No frames found in video"}

        prediction = video_model.predict(features)
        predicted_class = np.argmax(prediction, axis=1)[0]
        return {"emotion": emotions[predicted_class]}
    except Exception as e:
        return {"video_emotion_error": str(e)}
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
