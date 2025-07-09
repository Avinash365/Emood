import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import navigate
import ProgressBar from './ProgressBar';
import useVideoPrediction from '../../hooks/useVideoPrediction';

const UploadVideo = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const { prediction, predict } = useVideoPrediction();
  const navigate = useNavigate(); // ✅ Hook to navigate

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    } else {
      alert('Please select a valid video file');
    }
  };

  const handlePrediction = async () => {
    if (!videoFile) {
      alert('No video selected');
      return;
    }

    setLoading(true);
    setProgress(10);

    await new Promise((res) => setTimeout(res, 300));
    setProgress(30);
    await new Promise((res) => setTimeout(res, 400));
    setProgress(60);
    await new Promise((res) => setTimeout(res, 300));
    setProgress(75);

    await predict(videoFile);

    setProgress(100);
    await new Promise((res) => setTimeout(res, 500));
    setLoading(false);
  };

  // ✅ Navigate after prediction is available
  useEffect(() => {
    if (prediction && !loading) {
      navigate('/output', { state: { prediction } });
    }
  }, [prediction, loading, navigate]);

  return (
    <div className="p-6 mt-10 max-w-[500px]">
      <input
        type="file"
        accept="video/*"
        onChange={handleVideoChange}
        className="mb-4 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
                   file:rounded-md file:border-0 file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      {videoPreview && (
        <div className="mb-6 flex justify-center">
          <video
            className="min-[400px] max-w-[400px] aspect-video rounded shadow-md"
            controls
          >
            <source src={videoPreview} type={videoFile.type} />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {videoFile && (
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handlePrediction}
            className="bg-blue-600 px-6 py-2 text-white rounded-2xl hover:bg-green-500"
            disabled={loading}
          >
            {loading ? 'Predicting...' : 'Predict'}
          </button>
        </div>
      )}

      {loading && (
        <div className="w-[350px] flex justify-center mt-10">
          <ProgressBar progress={progress} />
        </div>
      )}
    </div>
  );
};

export default UploadVideo;
