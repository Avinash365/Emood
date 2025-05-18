import React, { useState, useRef, useEffect } from 'react';

function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
    setSeconds(0);

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    clearInterval(intervalRef.current);
  };

  const formatTime = (sec) => {
    const minutes = String(Math.floor(sec / 60)).padStart(2, '0');
    const seconds = String(sec % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current); // Cleanup on unmount
  }, []);

  return (
    <div className="text-center mt-10">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl mt-2"
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>

      {/* Visual indicator + timer */}
      {isRecording && (
        <div className="flex justify-center items-center gap-3 mt-4 text-red-600 font-bold animate-pulse">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
          <span>Recording...</span>
          <span className="ml-2">{formatTime(seconds)}</span>
        </div>
      )}

      {/* Playback after recording */}
      {audioURL && !isRecording && (
        <div className="mt-6">
          <audio src={audioURL} controls />
          <p className="mt-2 text-gray-600">Duration: {formatTime(seconds)}</p>
        </div>
      )}
    </div>
  );
}

export default AudioRecorder;
