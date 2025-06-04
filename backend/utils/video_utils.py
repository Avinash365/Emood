import cv2
import numpy as np

def extract_face_features(video_path):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Failed to open video file: {video_path}")
        return None

    frames = []
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame_count += 1
        resized = cv2.resize(frame, (128, 128))
        normalized = resized / 255.0
        frames.append(normalized)

    cap.release()

    print(f"Total frames read: {frame_count}")

    if not frames:
        return None

    mean_frame = np.mean(frames, axis=0)
    return np.expand_dims(mean_frame, axis=0)
