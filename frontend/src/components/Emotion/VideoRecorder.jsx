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

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });

      streamRef.current = stream;
      setIsRecording(true); // Ensure video element is rendered

      // Give a moment to render <video>, then assign stream
      setTimeout(() => {
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
          videoPreviewRef.current.muted = true;
          videoPreviewRef.current.playsInline = true;
          videoPreviewRef.current
            .play()
            .catch((err) => console.warn('Autoplay error:', err));
        }
      }, 100);

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
        setVideoBlob(blob);
        setVideoURL(url);
      };

      mediaRecorder.start();
      setSeconds(0);

      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);

      if (err.name === 'NotAllowedError') {
        setError('Permission denied. Please allow access to camera and microphone.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera/microphone found.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera or microphone is already in use.');
      } else {
        setError('Could not access camera or microphone.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    clearInterval(intervalRef.current);
    setIsRecording(false);
  };

  const handlePrediction = async () => {
    if (!videoBlob) return;

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
    <div className="text-center mt-8 text-white px-4">
      <h1 className="text-xl font-bold mb-4">🎥 Video Emotion Recorder</h1>

      {/* Start/Stop Button */}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`px-6 py-3 rounded-xl text-white font-semibold shadow-md ${
          isRecording ? 'bg-red-600' : 'bg-green-600'
        }`}
      >
        <MdOutlineVideoLibrary className="inline-block mr-2 text-xl" />
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>

      {/* Error */}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Predict Button */}
      {!isRecording && videoBlob && (
        <div className="mt-6">
          <button
            onClick={handlePrediction}
            disabled={loading}
            className="bg-blue-600 px-6 py-3 rounded-xl text-white font-medium hover:bg-blue-700 transition"
          >
            {loading ? 'Predicting...' : 'Predict Emotion'}
          </button>

          {loading && (
            <div className="mt-4 flex justify-center">
              <ProgressBar progress={progress} />
            </div>
          )}
        </div>
      )}

      {/* Live Preview */}
      {isRecording && (
        <div className="mt-6">
          <video
            ref={videoPreviewRef}
            autoPlay
            playsInline
            muted
            className="mx-auto w-full max-w-lg aspect-video border rounded-lg shadow"
          />
        </div>
      )}

      {/* Timer */}
      {isRecording && (
        <div className="mt-4 text-red-500 font-bold flex justify-center items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
          <span>Recording... {formatTime(seconds)}</span>
        </div>
      )}

      {/* Playback */}
      {!isRecording && videoURL && (
        <div className="mt-6">
          <video
            src={videoURL}
            controls
            className="mx-auto w-full max-w-lg aspect-video rounded-lg border shadow"
          />
          <p className="text-gray-300 mt-2">Duration: {formatTime(seconds)}</p>
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;
