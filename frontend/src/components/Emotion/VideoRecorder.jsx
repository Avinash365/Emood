import React, { useState, useRef, useEffect } from 'react';
import useVideoPrediction from '../../hooks/useVideoPrediction';
import ProgressBar from './ProgressBar';
import { useNavigate } from 'react-router-dom';

import { MdOutlineVideoLibrary } from "react-icons/md";

const VideoRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoURL, setVideoURL] = useState('');
  const [videoBlob, setVideoBlob] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const videoPreviewRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const intervalRef = useRef(null);

  const { prediction, predict } = useVideoPrediction();
  const navigate = useNavigate();

  const startRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      videoPreviewRef.current.srcObject = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
        setVideoBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setSeconds(0);

      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Could not access camera or microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    setIsRecording(false);
    clearInterval(intervalRef.current);
  };

  const handlePrediction = async () => {
    setLoading(true);
    setProgress(10);

    await new Promise((res) => setTimeout(res, 300));
    setProgress(30);

    await new Promise((res) => setTimeout(res, 400));
    setProgress(60);

    await new Promise((res) => setTimeout(res, 300));
    setProgress(75);

    await predict(videoBlob);
    setProgress(90);

    await new Promise((res) => setTimeout(res, 300));
    setProgress(100);

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
      if (videoURL) URL.revokeObjectURL(videoURL);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    };
  }, [videoURL]);

  return (
    <div className="text-center mt-8 text-white">
      <h1 className="text-xl font-bold mb-4">Video Recorder</h1>

      {/* Start / Stop Button */}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`px-4 py-2 rounded-xl text-white ${isRecording ? 'bg-red-600' : 'bg-green-600'}`}
      >
        <MdOutlineVideoLibrary className='mx-auto'/>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>

      {/* Error */}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Predict Button AFTER Stop */}
      {!isRecording && videoBlob && (
        <div className="mt-4">
          <button
            onClick={handlePrediction}
            className="bg-blue-600 px-4 py-2 rounded-xl"
            disabled={loading}
          >
            {loading ? 'Predicting...' : 'Predict'}
          </button>

          {loading && (
            <div className="mt-4 flex justify-center">
              <ProgressBar progress={progress} />
            </div>
          )}
        </div>
      )}

      {/* Live Preview */}
      <div className="mt-6">
        <video
          ref={videoPreviewRef}
          autoPlay
          muted={isRecording}
          controls={!isRecording}
          className="mx-auto w-full max-w-lg border rounded-lg"
        />
      </div>

      {/* Timer */}
      {isRecording && (
        <div className="mt-4 text-red-600 font-bold flex justify-center items-center gap-2">
          <span className="w-3 h-3 bg-red-600 rounded-full animate-ping" />
          <span>Recording... {formatTime(seconds)}</span>
        </div>
      )}

      {/* Playback Video + Duration */}
      {!isRecording && videoURL && (
        <div className="mt-6">
          <video src={videoURL} controls className="mx-auto w-full max-w-lg rounded-lg border" />
          <p className="text-gray-300 mt-2">Duration: {formatTime(seconds)}</p>
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;
