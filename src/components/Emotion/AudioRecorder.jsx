import React, { useState, useRef } from 'react';
import Recorder from 'recorder-js';
import useAudioPrediction from '../../hooks/useAudioPrediction';

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [seconds, setSeconds] = useState(0);

  const intervalRef = useRef(null);
  const audioContextRef = useRef(new (window.AudioContext || window.webkitAudioContext)());
  const recorderRef = useRef(null);
  const streamRef = useRef(null);

  const { prediction, predict } = useAudioPrediction();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new Recorder(audioContextRef.current, {
        onAnalysed: null,
      });

      await recorder.init(stream);
      recorderRef.current = recorder;

      await recorder.start();
      setIsRecording(true);
      setSeconds(0);
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      const { blob } = await recorderRef.current.stop();
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
      setAudioBlob(blob);
      setIsRecording(false);
      clearInterval(intervalRef.current);

      // Clean up stream
      streamRef.current.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const formatTime = (sec) => {
    const minutes = String(Math.floor(sec / 60)).padStart(2, '0');
    const seconds = String(sec % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="text-center mt-10">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl mt-2"
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>

      {isRecording && (
        <div className="flex justify-center items-center gap-3 mt-4 text-red-600 font-bold animate-pulse">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
          <span>Recording...</span>
          <span className="ml-2">{formatTime(seconds)}</span>
        </div>
      )}

      {audioURL && !isRecording && (
        <div className="mt-6">
          <audio src={audioURL} controls  className='mx-auto'/>
          <p className="mt-2 text-gray-600">Duration: {formatTime(seconds)}</p>
          <button
            onClick={() => predict(audioBlob)}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-xl"
          >
            Predict
          </button>

          {prediction && (
            <p className="mt-4 text-lg font-semibold text-purple-700">
              Prediction: {prediction}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
