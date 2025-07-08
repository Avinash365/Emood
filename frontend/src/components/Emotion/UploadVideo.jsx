import React, { useState } from 'react';
import ProgressBar from './ProgressBar';

const UploadVideo = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [videoURL, setVideoURL] = useState('');
    const [videoBlob, setVideoBlob] = useState(null);
    const [seconds, setSeconds] = useState(0);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
  

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    } else {
      alert('Please select a valid video file');
    }
  };

  const handleUpload = () => {
    if (!videoFile) {
      alert('No video file selected');
      return;
    }

    const formData = new FormData();
    formData.append('video', videoFile);

    // Example upload endpoint
    setIsRecording(true)
    
    fetch('/upload', {
      method: 'POST',
      body: formData,
    })
      .then((res) => {
        if (res.ok) {
          alert('Video uploaded successfully!');
        } else {
          alert('Failed to upload video.');
        }
      })
      .catch((err) => {
        console.error(err);
        alert('Error uploading video.');
      });
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

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Upload a Video</h2>

      <input
        type="file"
        accept="video/*"
        onChange={handleVideoChange}
        className="mb-4 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
                   file:rounded-md file:border-0 file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
     

      {videoPreview && (
        <div className="mb-4">
          <video className="w-full rounded" controls>
            <source src={videoPreview} type={videoFile.type} />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

<div className='flex justify-center item-center gap-4'>
  <div>

      <button
        onClick={handleUpload}
        className="bg-blue-600  text-white px-2 py-3 text-sm rounded hover:bg-blue-700 transition"
      >
        Upload
      </button>
  </div>

       {isRecording && (
        <div className=" flex-1">
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
</div>

    </div>
  );
};

export default UploadVideo;
