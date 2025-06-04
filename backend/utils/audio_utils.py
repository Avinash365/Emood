import librosa
import numpy as np
import io
from moviepy import VideoFileClip
import tempfile
import os


def extract_audio_features(audio_bytes):
    try:
        # Load from bytes buffer
        y, sr = librosa.load(io.BytesIO(audio_bytes), sr=22050, res_type='kaiser_fast')

        # Trim silence from the beginning and end
        y_trimmed, _ = librosa.effects.trim(y, top_db=20)

        # Extract MFCCs
        mfccs = librosa.feature.mfcc(y=y_trimmed, sr=sr, n_mfcc=40)

        # Take mean across time axis to get a fixed-length feature vector
        mfccs_mean = np.mean(mfccs.T, axis=0)

        # Return as-is or reshape depending on your model
        return mfccs_mean  # shape: (40,)

        # Optional: If your model expects (1, 40, 1), then:
        # return mfccs_mean.reshape(1, 40, 1)

    except Exception as e:
        print(f"Error in extract_audio_features: {e}")
        return None





def extract_audio_bytes_from_video(video_path):
    clip = VideoFileClip(video_path)
    try:
        audio = clip.audio
        if audio is None:
            return None
        temp_audio_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        temp_audio_path = temp_audio_file.name
        temp_audio_file.close()
        audio.write_audiofile(temp_audio_path, fps=22050, codec='pcm_s16le', verbose=False, logger=None)
        with open(temp_audio_path, 'rb') as f:
            audio_bytes = f.read()
        os.remove(temp_audio_path)
        return audio_bytes
    finally:
        clip.close()
