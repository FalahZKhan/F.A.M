import React, { useState } from 'react'
import robot from '../assets/robot.gif'
import Navbar from "../components/Navbar";
import BuzzerBot from '../components/BuzzerBot';
import WeatherCard from '../components/WeatherCard';
import { Link } from 'react-router-dom';

function Home() {
    const [speech, setSpeech] = useState("Hello there! I'm Buzzer, your energy optimization assistant. Let’s make power smart and sustainable!");

    const cardSpeeches = [
        "Need help toggling appliances? I got you!",
        "Predict power usage like a pro with me!",
        "Struggling with energy savings? Let me help you!"
    ];

    const cards = [
        {
            title: "Dashboard",
            content: "View appliance statuses, consumption, and control them in real-time",
            buttonText: "Let’s Control!"
        },
        {
            title: "Powercast",
            content: "Get power usage forecasts to better optimize your energy behavior",
            buttonText: "See the Future!"
        },
        {
            title: "Optimizer",
            content: "Get suggestions for optimal settings for your appliances and minimize consumption",
            buttonText: "Save Energy!"
        }
    ];

    return (
        <div className="h-[100vh] bg-gradient-to-r from-[#1a063b] via-[#2e0a57] to-[#0a1a3c] text-white">
            <Navbar />
            <div className="relative">
                <div className="absolute top-0 right-9">
                    <WeatherCard />
                </div>

                {/* Home heading */}
                <div className='flex flex-col mt-8'>
                    <div className="relative inline-block">
                        {/* Shadow Text */}
                        <h1
                            className="absolute top-0 left-0 text-8xl font-Stormlight bg-black bg-clip-text text-transparent opacity-40 select-none"
                            style={{ fontFamily: 'Stormlight', transform: 'translate(6px, 6px)' }}
                        >
                            &nbsp;Home
                        </h1>

                        {/* Gradient Text */}
                        <h1
                            className="relative text-8xl font-Stormlight bg-gradient-to-r from-[#b0b0b0] via-[#d0d0d0] to-[#c0c0c0] bg-clip-text text-transparent"
                            style={{ fontFamily: 'Stormlight' }}
                        >
                            &nbsp;Home
                        </h1>
                    </div>
                </div>

                {/* Robot Assistant */}
                <BuzzerBot speechInput={speech} />

                {/* Cards */}
                <div className="flex gap-6 px-12 flex-wrap" style={{ marginTop: '5%' }}>
                    {cards.map((card, i) => (
                        <div
                            key={i}
                            onMouseEnter={() => setSpeech(cardSpeeches[i])}
                            onMouseLeave={() =>
                                setSpeech("Hello there! I'm Buzzer, your energy optimization assistant. Let’s make power smart and sustainable!")
                            }
                            className="group w-72 h-72 rounded-2xl bg-gradient-to-br from-[#290066] to-[#4b0082] shadow-xl backdrop-blur-md hover:scale-105 transition-transform duration-300 flex flex-col items-center text-center relative overflow-hidden p-9"
                        >
                            <h2 className="text-2xl mb-2 bg-gradient-to-r from-[#b0b0b0] via-[#d0d0d0] to-[#c0c0c0] bg-clip-text text-transparent" style={{ fontFamily: "StormLight" }}>
                                {card.title === "Powercast" ? (
                                    <>
                                        &nbsp;
                                        {card.title}
                                        &nbsp;
                                    </>
                                ) : (
                                    card.title
                                )}
                            </h2>
                            <div className="flex flex-col justify-end flex-grow">
                                <div className="flex flex-col items-center gap-4">
                                    <p className="text-lg text-center" style={{ fontFamily: "Poppins" }}>
                                        {card.content}
                                    </p>
                                    <Link to={`/${card.title.toLowerCase()}`}>
                                        <button
                                            className="cursor-pointer bg-gradient-to-r from-[#b0b0b0] via-[#d0d0d0] to-[#c0c0c0] text-[#290066] px-4 py-2 rounded-lg shadow-md transition duration-300 hover:from-[#8c8c8c] hover:via-[#a6a6a6] hover:to-[#8c8c8c] hover:shadow-lg"

                                            style={{ fontFamily: 'PoppinsBold', cursor: 'pointer' }}
                                        >
                                            {card.buttonText}
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            {/* Reflective shimmer */}
                            <div className="absolute inset-0 z-[-1] before:content-[''] before:absolute before:top-0 before:left-[-75%] before:w-[50%] before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:rotate-12 before:transition-all before:duration-500 group-hover:before:left-[130%]"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Home;
