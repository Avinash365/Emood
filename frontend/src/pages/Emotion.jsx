import Navbar from "../components/Navbar.jsx"
import AudioRecorder from "../components/Emotion/AudioRecorder.jsx";
import VideoRecorder from "../components/Emotion/VideoRecorder.jsx";
import UploadVideo from "../components/Emotion/UploadVideo.jsx";

function Emotion() {
    return (
        <div>
            <Navbar />
            <MoodCapture />
            <div className="flex justify-center gap-2 ">
                <AudioRecorder />
                <UploadVideo />
            </div>
            <VideoRecorder />
        </div>
    )
}


function MoodCapture() {

    return (
        <div className="text-center pt-20">
            <h1 className="font-bold text-[32px]">Capture Your Mood</h1>
            <p className="font-regular text-[16px]">Record a short video or audio clip to analyze your current mood. Ensure your microphone and webcam permissions are granted before proceeding.</p>
        </div>
    )
}


export default Emotion; 