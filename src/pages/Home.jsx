import Navbar from "../components/Navbar.jsx"
import WelcomeSection from "../components/Home/WelcomeSection.jsx";
import Mood from "../components/Home/Mood.jsx";


function Home() {
    return (
        <div>
            <Navbar />
            <WelcomeSection />
            <Mood />
        </div>
    )
}

export default Home; 