import { useState } from 'react';

const useAudioPrediction = () => {
  const [prediction, setPrediction] = useState('');

  const predict = async (audioFile) => {
    if (!audioFile) return;


    const formData = new FormData();
    formData.append('file', audioFile, 'audioBlob.wav');

    try {
      const response = await fetch('http://127.0.0.1:8000/predict/audio', {
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
