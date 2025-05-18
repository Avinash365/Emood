import React, { useState, useRef, useEffect } from 'react';

function VideoRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [videoURL, setVideoURL] = useState('');
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const videoPreviewRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      streamRef.current = stream;
      videoPreviewRef.current.srcObject = stream;

      mediaRecorderRef.current = new MediaRecorder(stream);
      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: 'video/webm'
        });
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTimer(0);

      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Could not access camera/microphone. Please check your browser settings.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    clearInterval(timerRef.current);
    setIsRecording(false);
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="text-center mt-8">
      <h1 className="text-xl font-bold mb-4">Video Recorder</h1>

      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`px-4 py-2 rounded-xl text-white ${isRecording ? 'bg-red-600' : 'bg-green-600'}`}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Live or Recorded Video */}
      <div className="mt-6">
        <video
          ref={videoPreviewRef}
          autoPlay
          muted={isRecording}
          controls={!isRecording}
          className="mx-auto w-full max-w-lg border rounded-lg"
        />
      </div>

      {/* Timer and Indicator */}
      {isRecording && (
        <div className="mt-4 text-red-600 font-bold flex justify-center items-center gap-2">
          <span className="w-3 h-3 bg-red-600 rounded-full animate-ping" />
          <span>Recording... {formatTime(timer)}</span>
        </div>
      )}

      {/* Recorded Playback */}
      {!isRecording && videoURL && (
        <div className="mt-6">
          <video src={videoURL} controls className="mx-auto w-full max-w-lg rounded-lg border" />
          <p className="text-gray-600 mt-2">Duration: {formatTime(timer)}</p>
        </div>
      )}
    </div>
  );
}

export default VideoRecorder;
