import { ImHappy } from "react-icons/im";



const Analysis = ({ prediction }) => {

    
  return (
    <div className="flex gap-2 flex-wrap justify-center md:justify-between">
      <Mood mood="neutral" prediction={prediction} />
      <Mood mood="calm" prediction={prediction} />
      <Mood mood="happy" prediction={prediction} />
      <Mood mood="sad" prediction={prediction} />
      <Mood mood="angry" prediction={prediction} />
      <Mood mood="fearful" prediction={prediction} />
      <Mood mood="disgust" prediction={prediction} />
      <Mood mood="surprised" prediction={prediction}/>
    </div>
  );
};


const Mood = ({ mood, prediction }) => {
  const isActive = mood.toLowerCase() === prediction?.toLowerCase();

  return (
    <div
      className={`flex flex-col gap-2 w-[150px] border-2 p-5 
        transform transition duration-300 cursor-pointer
        ${isActive ? 'scale-105 border-blue-400 text-blue-400' : 'hover:scale-105 bg-[#F7FAFA] border-[#D1DBE5]'}`}
    >
      <ImHappy className={isActive ? "text-blue-600" : "text-black"} />
      <p className="font-bold">{mood}</p>
      <p>20%</p>
    </div>
  );
};


export default Analysis; 