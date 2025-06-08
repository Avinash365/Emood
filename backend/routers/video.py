from fastapi import APIRouter, File, UploadFile
from utils.video_utils import extract_face_features
from models.loader import video_model, emotions
import numpy as np
import os
import uuid

router = APIRouter(prefix="/predict")

@router.post("/video")
async def predict_video(file: UploadFile = File(...)):
    # Handle extension
    suffix = os.path.splitext(file.filename)[1] or ".mp4"

    # Save to temp dir
    temp_dir = "temp_videos"
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, f"{uuid.uuid4()}{suffix}")

    # Save video content
    content = await file.read()
    with open(temp_path, "wb") as f:
        f.write(content)

    print(f"Temp video file saved at: {temp_path}")

    try:
        features = extract_face_features(temp_path)
        if features is None:
            return {"emotion": "No frames found in video", "emotion_probabilities": None}

        # Run prediction
        prediction = video_model.predict(features)
        prediction = prediction.mean(axis=0)  # average if multiple frames
        probs = prediction / np.sum(prediction)  # normalize if not softmaxed
        predicted_class = int(np.argmax(probs))
        predicted_emotion = emotions[predicted_class]

        # Format probabilities
        emotion_probabilities = {
            emotions[i]: float(f"{prob:.4f}")
            for i, prob in enumerate(probs)
        }

        return {
            "emotion": predicted_emotion,
            "emotion_probabilities": emotion_probabilities
        }

    except Exception as e:
        return {
            "emotion": "Error",
            "emotion_probabilities": None,
            "video_emotion_error": str(e)
        }

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
