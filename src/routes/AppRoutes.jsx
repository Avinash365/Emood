
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from "../pages/Home.jsx";
import Emotion from "../pages/Emotion.jsx";
import Output from '../pages/Output.jsx';


function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/emotion" element={<Emotion />} />
                <Route path="/output" element={<Output />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
