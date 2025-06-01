import Analysis from "../Card/Analysis";
import { useNavigate } from "react-router-dom";


const OutputPage = ({prediction}) => {

   const navigate = useNavigate();

  const handleClick = () => {
    navigate("/emotion"); // Replace with your route path
  };

    return (
        <div className="text-center w-fit mx-auto  items-center p-2">
            <h1 className="font-bold text-[28px] mt-10 mb-10">Mood Detection Results</h1>
            <p className="font-bold mb-3 md:text-start">Analysis</p>
            <Analysis prediction={prediction}/>
            <div className="bg-[#F0F2F5] text-start px-5 py-4  mt-10 rounded-2xl">
                <p>Overall Detected Mood</p>
                <h1 className="font-bold">{prediction}</h1>
                <p className="text-[#088738] mt-1">+10%</p>
            </div> 
            <h1 className="font-bold text-[32px] md:text-start">Mood Score: 6.8/10</h1>
            <button 
                onClick={handleClick}
            className="p-2 bg-[#1A80E5] font-bold text-white px-4 rounded-2xl">Analyze again</button>
        </div>
    )
}
export default OutputPage; 