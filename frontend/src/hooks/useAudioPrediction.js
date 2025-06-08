import { useState } from 'react';

const useAudioPrediction = () => {
  const [prediction, setPrediction] = useState('');

  const predict = async (audioFile) => {
    if (!audioFile) return;


    const formData = new FormData();
    formData.append('file', audioFile, 'audioBlob.wav');

    try {
      const response = await fetch('https://backend-atke.onrender.com/predict/audio', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setPrediction(result);
    } catch (err) {
      // console.error('Prediction error:', err);
      setPrediction({ error: 'Error while predicting.' });
    }
  };

  return { prediction, predict };
};

export default useAudioPrediction;
