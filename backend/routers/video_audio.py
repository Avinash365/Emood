from fastapi import APIRouter, File, UploadFile, HTTPException
from utils.audio_utils import extract_audio_bytes_from_video, extract_audio_features
from utils.video_utils import extract_face_features
from models.loader import audio_model, video_model, emotions
import numpy as np
import os
import tempfile
import tensorflow as tf

router = APIRouter(prefix="/predict")

@router.post("/video_and_audio")
async def predict_video_and_audio(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename)[1]

    # Save upload to temp file (delete=False for compatibility)
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_video_file:
        content = await file.read()
        temp_video_file.write(content)
        temp_video_file.flush()
        temp_video_path = temp_video_file.name

    response = {}

    try:
        # --- Video ---
        features = extract_face_features(temp_video_path)
        if features is None:
            response["video_emotion"] = "No frames found in video"
            response["video_probabilities"] = None
        else:
            prediction = video_model.predict(features)
            # softmax if needed (depends on model output)
            prediction = tf.nn.softmax(prediction).numpy()
            predicted_class = np.argmax(prediction, axis=1)[0]
            response["video_emotion"] = emotions[predicted_class]
            # Map probabilities to emotions
            response["video_probabilities"] = {emotions[i]: float(prediction[0][i]) for i in range(len(emotions))}
    except Exception as e:
        response["video_emotion_error"] = str(e)
        response["video_probabilities"] = None

    try:
        # --- Audio ---
        audio_bytes = extract_audio_bytes_from_video(temp_video_path)
        if audio_bytes is None:
            response["audio_emotion"] = "No audio found in video file"
            response["audio_probabilities"] = None
        else:
            features = extract_audio_features(audio_bytes)
            features = np.expand_dims(features, axis=0)
            features = tf.convert_to_tensor(features, dtype=tf.float32)
            prediction = audio_model(features)
            prediction = tf.nn.softmax(prediction).numpy()
            predicted_class = np.argmax(prediction, axis=1)[0]
            response["audio_emotion"] = emotions[predicted_class]
            response["audio_probabilities"] = {emotions[i]: float(prediction[0][i]) for i in range(len(emotions))}
    except Exception as e:
        response["audio_emotion_error"] = str(e)
        response["audio_probabilities"] = None

    finally:
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)

    return response
