
import { useNavigate } from 'react-router-dom';


function WelcomeSection() {

    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/emotion');
    };

    return (
        <div className="text-center py-15 lg:py-30">
            <h1 className="font-bold text-[32px]">Welcome to MoodSense</h1>
            <p className="font-regular text-[16px]">Analyze emotions in real-time using both facial and vocal cues. Get personalized insights into your emotional state throughout the day.</p>
            <button
                onClick={handleClick}
                className="px-4 py-2 rounded-xl bg-[hsla(210,80%,50%,1)] hover:bg-[hsla(210,80%,50%,0.5)] text-white mt-6 cursor-pointer"

            >Start Mood Detection</button>
        </div>
    )
}
export default WelcomeSection; 