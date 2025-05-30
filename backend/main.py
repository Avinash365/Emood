from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import librosa
import numpy as np
import tensorflow as tf
import io

app = FastAPI()

# CORS to allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once
model = tf.keras.models.load_model("backend/my_model.keras")
emotions = ['neutral', 'calm', 'happy', 'sad', 'angry', 'fearful', 'disgust', 'surprised']


def extract_features(audio_bytes):
    # Load from bytes buffer, librosa expects a filename or file-like object
    X, sr = librosa.load(io.BytesIO(audio_bytes), sr=None, res_type='kaiser_fast')
    trimX, _ = librosa.effects.trim(X, top_db=20)
    mfccs = librosa.feature.mfcc(y=trimX, sr=sr, n_mfcc=40)
    mfccs_mean = np.mean(mfccs.T, axis=0)
    # reshape to (1, 40, 1) for model input
    return mfccs_mean.reshape(1, 40, 1)


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        features = extract_features(audio_bytes)
        prediction = model.predict(features)
        predicted_class = np.argmax(prediction, axis=1)[0]
        return {"emotion": emotions[predicted_class]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing the file: {str(e)}")
