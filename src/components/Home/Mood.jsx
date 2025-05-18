import Picture1 from "../../assets/Picture1.png"; 

function Mood() {
    return (
        <div className="mx-auto w-fit px-6">
            <div className="ml-0 lg:ml-[90px]">
                <h1 className="font-bold text-[36px]">How MoodSense Works</h1>
                <p className="md:w-[80%]">Our advanced algorithms combine facial expression recognition with voice tone analysis to provide comprehensive and accurate mood assessments.</p>
            </div>
            <div className="flex gap-3 flex-wrap mt-2 justify-center">
                <Card title="Continuous Monitoring" dis="Track your mood throughout the day with real-time analysis."/>
                <Card title="Detailed Analytics" dis="View trends and patterns in your emotional states with clear visual representations."/>
                <Card title="Personalized Insights" dis="Receive tailored feedback and strategies for managing your emotional well-being."/>
            </div>
        </div>

    )
}

function Card(props) {
    return (
        <div className="p-2 w-[320px]">
            <img src={Picture1} alt="Logo" width={300} />
            <h1 className="font-bold mt-3 mb-2">{props.title}</h1>
            <p className="text-[#4F7396]">{props.dis}</p>
        </div>
    )
} 


export default Mood;