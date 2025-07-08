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

    # Save uploaded file to a temp location
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_video_file:
        content = await file.read()
        temp_video_file.write(content)
        temp_video_file.flush()
        temp_video_path = temp_video_file.name

    audio_probs = None
    video_probs = None

    try:
        # --- Video ---
        features = extract_face_features(temp_video_path)
        if features is not None:
            prediction = video_model.predict(features)
            prediction = tf.nn.softmax(prediction).numpy()[0]

            # Handle missing "calm" class
            padded_prediction = []
            model_index = 0
            for i in range(len(emotions)):
                if emotions[i] == 'calm':
                    padded_prediction.append(0.0)
                else:
                    padded_prediction.append(float(prediction[model_index]))
                    model_index += 1

            video_probs = np.array(padded_prediction)
            print("✅ Video probabilities:", video_probs)
        else:
            print("⚠️ No frames found in video.")
    except Exception as e:
        print("❌ Video emotion error:", str(e))

    try:
        # --- Audio ---
        audio_bytes = extract_audio_bytes_from_video(temp_video_path)
        if audio_bytes is not None:
            features = extract_audio_features(audio_bytes)
            if features is not None and not np.isnan(features).any():
                features = np.array(features).reshape(1, 40, 1).astype(np.float32)
                prediction = audio_model(features)
                prediction = tf.nn.softmax(prediction).numpy()[0]
                audio_probs = np.array(prediction)
                print("✅ Audio probabilities:", audio_probs)
            else:
                print("⚠️ Audio features invalid or contain NaN.")
        else:
            print("⚠️ No audio extracted from video.")
    except Exception as e:
        print("❌ Audio emotion error:", str(e))

    # Cleanup
    if os.path.exists(temp_video_path):
        os.remove(temp_video_path)

    # Fusion or fallback
    alpha = 0.3  # weight for audio
    if audio_probs is not None and video_probs is not None:
        combined_probs = alpha * audio_probs + (1 - alpha) * video_probs
        print("📊 Combined (fused) probabilities:", combined_probs)
    elif audio_probs is not None:
        combined_probs = audio_probs
        print("🗣️ Using audio only")
    elif video_probs is not None:
        combined_probs = video_probs
        print("📹 Using video only")
    else:
        raise HTTPException(status_code=500, detail="Both audio and video processing failed")

    # Prepare response
    emotion_probabilities = {
        emotions[i]: float(combined_probs[i]) for i in range(len(emotions))
    }
    predicted_emotion = emotions[np.argmax(combined_probs)]

    print("🎯 Final predicted emotion:", predicted_emotion)

    return {
        "emotion": predicted_emotion,
        "emotion_probabilities": emotion_probabilities
    }
