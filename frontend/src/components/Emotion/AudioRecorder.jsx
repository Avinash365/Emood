import React, { useState, useRef, useEffect } from 'react';
import Recorder from 'recorder-js';
import useAudioPrediction from '../../hooks/useAudioPrediction';
import ProgressBar from './ProgressBar';
import { useNavigate } from 'react-router-dom'; // 🚀 import this

import { AiFillAudio } from "react-icons/ai";

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);

  const { prediction, predict } = useAudioPrediction();
  const navigate = useNavigate(); // 🚀 for routing

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const recorder = new Recorder(audioContext, {
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

      if (audioURL) URL.revokeObjectURL(audioURL);

      const url = URL.createObjectURL(blob);
      setAudioURL(url);
      setAudioBlob(blob);
      setIsRecording(false);
      clearInterval(intervalRef.current);

      streamRef.current.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const handlePrediction = async () => {
    setLoading(true);
    setProgress(10);

    await new Promise((res) => setTimeout(res, 300));
    setProgress(30);

    await new Promise((res) => setTimeout(res, 400));
    setProgress(60);

    // Simulate processing time before the API call
    await new Promise((res) => setTimeout(res, 300));
    setProgress(75);

    await predict(audioBlob); // This does the actual prediction call
    setProgress(90);

    // Simulate finalization
    await new Promise((res) => setTimeout(res, 300));
    setProgress(100);

    // Give user a moment to see 100% before removing the bar
    await new Promise((res) => setTimeout(res, 500));
    setLoading(false); 
  };

  const formatTime = (sec) => {
    const minutes = String(Math.floor(sec / 60)).padStart(2, '0');
    const seconds = String(sec % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    if (prediction && !loading) {
      const timer = setTimeout(() => {
        navigate('/output', { state: { prediction } }); 
      }, 1000); 
      return () => clearTimeout(timer);
    }
  }, [prediction, loading, navigate]);

  useEffect(() => {
    return () => {
      if (audioURL) URL.revokeObjectURL(audioURL);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    };
  }, [audioURL]);

  return (
    <div className="text-center mt-10 text-white">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl mt-2 "
      >
        <AiFillAudio className='mx-auto'/>
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
          <audio src={audioURL} controls className="mx-auto" />
          <p className="mt-2 text-gray-300">Duration: {formatTime(seconds)}</p>
          <button
            onClick={handlePrediction}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-xl"
            disabled={loading}
          >
            {loading ? 'Predicting...' : 'Predict'}
          </button>
          <div className=" mt-4 flex justify-center">
            {loading && <ProgressBar progress={progress} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
