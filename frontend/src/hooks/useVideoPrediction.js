import { useState } from 'react';

const useVideoPrediction = () => {
  const [prediction, setPrediction] = useState('');

  const predict = async (videoFile) => {
    if (!videoFile) return;

    const formData = new FormData();
    formData.append('file', videoFile, 'videoBlob.webm'); // ✅ correct file type & name

    try {
      const response = await fetch('http://127.0.0.1:8000/predict/video', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setPrediction(result);
    } catch (err) {
      console.error('Video prediction error:', err);
      setPrediction({ error: 'Error while predicting video.' });
    }
  };

  return { prediction, predict };
};

export default useVideoPrediction;
