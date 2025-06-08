import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { OutputContext } from "../context/OutputContext";
import Navbar from "../components/Navbar";
import OutputPage from "../components/Output/OutputPage";
import toast from "react-hot-toast";

export default function Output() {
  const location = useLocation();
  const navigate = useNavigate();

  const prediction = location.state?.prediction;

  useEffect(() => {
    if (
      !prediction ||
      prediction?.error ||
      !prediction.emotion ||
      !prediction.emotion_probabilities
    ) {
      toast.error("Invalid prediction. Redirecting to emotion page...");
      navigate("/emotion", { replace: true });
    }
  }, [prediction, navigate]);

  if (
    !prediction ||
    prediction?.error ||
    !prediction.emotion ||
    !prediction.emotion_probabilities
  ) {
    return null; // Show nothing or a loader while redirecting
  }

  
  return (
    <OutputContext.Provider value={prediction}>
      <Navbar />
      <OutputPage />
    </OutputContext.Provider>
  );
}
