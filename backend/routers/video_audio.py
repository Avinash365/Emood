from fastapi import APIRouter, File, UploadFile, HTTPException
from utils.audio_utils import extract_audio_bytes_from_video, extract_audio_features
from utils.video_utils import extract_face_features
from models.loader import audio_model, video_model, emotions, emotions_vedio
import numpy as np
import os
import tempfile
import tensorflow as tf

router = APIRouter(prefix="/predict")

def print_prediction_block(title: str, emotions_list, probabilities):
    print(f"\n🧠 {title}")
    print("-" * 42)
    for emotion, prob in zip(emotions_list, probabilities):
        print(f"{emotion.capitalize():<12} | {prob:.4f}")
    print("-" * 42)

def pad_video_probs(raw_probs: np.ndarray) -> np.ndarray:
    """Pad video model's prediction with 0.0 for missing 'calm'."""
    video_probs_dict = dict(zip(emotions_vedio, raw_probs))
    return np.array([
        0.0 if emo == "calm" else video_probs_dict.get(emo, 0.0)
        for emo in emotions
    ])

def softmax_probs(model, features):
    """Predict and apply softmax."""
    prediction = model.predict(features)
    return tf.nn.softmax(prediction).numpy()[0]

@router.post("/video_and_audio")
async def predict_video_and_audio(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_video_file:
        content = await file.read()
        temp_video_file.write(content)
        temp_video_path = temp_video_file.name

    audio_probs, video_probs = None, None

    # --- VIDEO PROCESSING ---
    try:
        video_features = extract_face_features(temp_video_path)
        if video_features is not None:
            raw_video_probs = softmax_probs(video_model, video_features)
            print_prediction_block("Video Prediction (Raw)", emotions_vedio, raw_video_probs)

            video_probs = pad_video_probs(raw_video_probs)
            print_prediction_block("Video Prediction (Aligned)", emotions, video_probs)
        else:
            print("⚠️ No frames found in video.")
    except Exception as e:
        print("❌ Video emotion error:", str(e))

    # --- AUDIO PROCESSING ---
    try:
        audio_bytes = extract_audio_bytes_from_video(temp_video_path)
        if audio_bytes:
            audio_features = extract_audio_features(audio_bytes)
            if audio_features is not None and not np.isnan(audio_features).any():
                audio_input = np.array(audio_features).reshape(1, 40, 1).astype(np.float32)
                audio_probs = softmax_probs(audio_model, audio_input)
                print_prediction_block("Audio Prediction", emotions, audio_probs)
            else:
                print("⚠️ Invalid or NaN audio features.")
        else:
            print("⚠️ No audio extracted from video.")
    except Exception as e:
        print("❌ Audio emotion error:", str(e))

    # Cleanup temp file
    if os.path.exists(temp_video_path):
        os.remove(temp_video_path)


    # --- FUSION ---
    alpha = 0.7  # weight for audio
    if audio_probs is not None and video_probs is not None:
        combined_probs = alpha * audio_probs + (1 - alpha) * video_probs
        print_prediction_block("Combined Prediction", emotions, combined_probs)
    elif audio_probs is not None:
        combined_probs = audio_probs
        print("🗣️ Using audio only")
    elif video_probs is not None:
        combined_probs = video_probs
        print("📹 Using video only")
    else:
        raise HTTPException(status_code=500, detail="Both audio and video processing failed")

    predicted_emotion = emotions[np.argmax(combined_probs)]
    print(f"\n🎯 Final Predicted Emotion: {predicted_emotion.upper()}")

    return {
        "emotion": predicted_emotion,
        "emotion_probabilities": {
            emo: float(prob) for emo, prob in zip(emotions, combined_probs)
        }
    }
