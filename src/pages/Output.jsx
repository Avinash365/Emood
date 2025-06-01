import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import OutputPage from "../components/Output/OutputPage";
import toast from 'react-hot-toast';


export default function Output() {
    const location = useLocation();
    const prediction = location.state?.prediction || "Error while predicting.";

    // Show alert if prediction failed
    useEffect(() => {
        if (
            prediction.toLowerCase().includes("error") ||
            prediction === "Error while predicting."
        ) {
            toast.error("Prediction failed. Please try again.", { duration: 10000});
        }
    }, [prediction]);

    return (
        <div>
            <Navbar />
            <OutputPage prediction={prediction} />
        </div>
    );
}
