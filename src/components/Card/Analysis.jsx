import { ImHappy } from "react-icons/im";
import { useContext } from "react";
import { OutputContext } from "../../context/OutputContext";





const Analysis = () => {
    
  return (
    <div className="flex gap-2 flex-wrap justify-center md:justify-between">
      <Mood mood="neutral"  />
      <Mood mood="calm"  />
      <Mood mood="happy"  />
      <Mood mood="sad"  />
      <Mood mood="angry"  />
      <Mood mood="fearful"  />
      <Mood mood="disgust"  />
      <Mood mood="surprised" />
    </div>
  );
};


const Mood = ({ mood }) => {

  const prediction = useContext(OutputContext);
  const isActive = mood.toLowerCase() === prediction.emotion.toLowerCase();

  const probability = prediction.emotion_probabilities[mood.toLowerCase()] || 0;
  const emotion_probabilitie = (probability * 100).toFixed(2);

  console.log(prediction);

  return (
    <div
      className={`flex flex-col gap-2 w-[150px] border-2 p-5 
        transform transition duration-300 cursor-pointer
        ${isActive ? 'scale-105 border-blue-400 text-blue-400' : 'hover:scale-105 bg-[#F7FAFA] border-[#D1DBE5]'}`}
    >
      <ImHappy className={isActive ? "text-blue-600" : "text-black"} />
      <p className="font-bold capitalize">{mood}</p>
      <p>{emotion_probabilitie}%</p>
    </div>
  );
};

export default Analysis;