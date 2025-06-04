import tensorflow as tf

audio_model = tf.keras.models.load_model("my_model.keras")
video_model = tf.keras.models.load_model("video_model.h5")

emotions=['neutral','calm','happy','sad','angry','fearful', 'disgust','surprised']