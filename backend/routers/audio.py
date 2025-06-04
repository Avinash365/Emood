from fastapi import APIRouter, File, UploadFile, HTTPException
from utils.audio_utils import extract_audio_features
from models.loader import audio_model, emotions
import numpy as np
import tensorflow as tf

router = APIRouter(prefix="/predict")


@router.post("/audio")
async def predict(file: UploadFile = File(...)):
    try:
        # Read uploaded audio file
        audio_bytes = await file.read()

        # Extract features from the audio
        features = extract_audio_features(audio_bytes)
        # print("Extracted features:", features)
        # print("Feature vector shape:", features.shape)
        # print("Feature checksum:", np.sum(features))


        # Reshape and convert to tensor for model
        features = np.expand_dims(features, axis=0)  # shape: (1, 40)
        features = tf.convert_to_tensor(features, dtype=tf.float32)

        # Predict emotion
        prediction = audio_model(features)
        prediction = tf.nn.softmax(prediction)  # ensure probabilities

        # Convert to numpy
        probs = prediction.numpy().flatten()

        # Get top prediction
        predicted_class = int(np.argmax(probs))
        predicted_emotion = emotions[predicted_class]

        # Create a dict of emotion: probability
        emotion_probabilities = {
            emotions[i]: float(f"{prob:.4f}")
            for i, prob in enumerate(probs)
        }

        return {
            "emotion": predicted_emotion,
            "emotion_probabilities": emotion_probabilities
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing the file: {str(e)}")
