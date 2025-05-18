
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from "../pages/Home.jsx";
import Emotion from "../pages/Emotion.jsx";

function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/emotion" element={<Emotion />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
