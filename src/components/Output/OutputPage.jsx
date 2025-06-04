import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { OutputContext } from "../../context/OutputContext";
import Analysis from "../Card/Analysis";

const moodWeights = {
  happy: 10,
  calm: 8,
  surprised: 7,
  neutral: 5,
  fearful: 3,
  sad: 2,
  angry: 1,
  disgust: 1
};

const OutputPage = () => {

  const navigate = useNavigate();
  const prediction = useContext(OutputContext);

  // Defensive check if prediction or emotion is undefined
  const emotion = prediction?.emotion?.toLowerCase() || "";
  const probability = prediction?.emotion_probabilities?.[emotion] || 0;
  const emotion_probabilitie = (probability * 100).toFixed(2);

  // Get weight for mood, default to 5 if not found
  const weight = moodWeights[emotion] || 5;

  // Calculate mood score scaled 0-10, rounded to 1 decimal place
  const moodScore = (weight * probability).toFixed(1);

  const handleClick = () => {
    navigate("/emotion");
  };

  return (
    <div className="text-center w-fit mx-auto items-center p-2">
      <h1 className="font-bold text-[28px] mt-10 mb-10">Mood Detection Results</h1>

      <p className="font-bold mb-3 md:text-start">Analysis</p>
      <Analysis />

      <div className="bg-[#F0F2F5] text-start px-5 py-4 mt-10 rounded-2xl">
        <p>Overall Detected Mood</p>
        <h1 className="font-bold">{prediction.emotion}</h1>
        <p className="text-[#088738] mt-1">{emotion_probabilitie}%</p>
      </div>

      <h1 className="font-bold text-[32px] md:text-start">
        Mood Score: {moodScore}/10
      </h1>

      <button
        onClick={handleClick}
        className="p-2 bg-[#1A80E5] font-bold text-white px-4 rounded-2xl"
      >
        Analyze again
      </button>
    </div>
  );
};

export default OutputPage;
