import React, { useState, useEffect, useMemo } from 'react';
import robot from '../assets/robot.gif';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import BuzzerBot from '../components/BuzzerBot';
import WeatherCard from '../components/WeatherCard';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, Filler, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, Filler, PointElement, LineElement, Title, Tooltip, Legend);

function Powercast() {
    const email = localStorage.getItem("userEmail")
    const navigate = useNavigate();
    const [consumption, setConsumption] = useState(new Array(24).fill(0));
    const [totalAddedConsumption, setTotalAddedConsumption] = useState(new Array(24).fill(0));
    const currentHour = new Date().getHours();
    const [speech, setSpeech] = useState(
        "Forecast Time! Let’s get a glimpse of your energy future. Together, we’ll plan smarter usage"
    );
    useEffect(() => {
        if (!email) {
            navigate("/login");
        }
    }, [email, navigate]);

    const applianceNames = [
        {
            name: "TV",
            energy: 0.3
        },
        {
            name: "AC",
            energy: 1.2
        },
        {
            name: "Fridge",
            energy: 0.6
        },
        {
            name: "Oven",
            energy: 1.0
        },
        {
            name: "Fan",
            energy: 0.1
        },
        {
            name: "Light",
            energy: 0.2
        }
    ];

    const [switchStates, setSwitchStates] = useState(() => {
        return applianceNames.map((appliance) => {
            const storedValue = localStorage.getItem(appliance.name);
            return storedValue === "1" ? 1 : 0; // Default to 0 if not set or not "1"
        });
    });
    // Standard 0-23 hour labels
    const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2)}`);

    const fetchPrediction = () => {
        const hourlyTemp = JSON.parse(localStorage.getItem('hourlyTemp'));
        const hourlyHumidity = JSON.parse(localStorage.getItem('hourlyHumidity'));
        const hourlyWind = JSON.parse(localStorage.getItem('hourlyWind'));
        const totalFromStorage = localStorage.getItem('Total');
        const total = totalFromStorage ? parseFloat(totalFromStorage) : 0;

        if (hourlyTemp && hourlyHumidity && hourlyWind) {
            const currentHour = new Date().getHours();

            const rotateArray = (arr) =>
                [...arr.slice(24 - currentHour), ...arr.slice(0, 24 - currentHour)];

            const rotatedTemp = rotateArray(hourlyTemp);
            console.log(rotatedTemp)
            const rotatedHumidity = rotateArray(hourlyHumidity);
            const rotatedWind = rotateArray(hourlyWind);
            console.log(rotatedTemp, rotatedHumidity, rotatedWind)

            axios
                .post('http://localhost:9000/predict_energy_consumption', {
                    temperatures: rotatedTemp,
                    humidities: rotatedHumidity,
                    winds: rotatedWind,
                })
                .then((res) => {
                    if (res.data.predictions) {
                        const parsedConsumption = res.data.predictions;
                        setConsumption(parsedConsumption);
                        setTotalAddedConsumption(parsedConsumption.map((value) => value + total));
                    }
                })
                .catch((err) => console.error('Prediction error:', err));

        } else if (totalFromStorage) {
            const totalValue = parseFloat(totalFromStorage);
            setTotalAddedConsumption(new Array(24).fill(totalValue));
        }
    };

    // Memoize chartData to optimize performance
    const chartData = useMemo(
        () => ({
            labels: hours,
            datasets: [
                {
                    label: 'Consumption based on Environment',
                    data: consumption,
                    borderColor: 'rgba(166, 166, 166, 0.8)',
                    backgroundColor: 'rgba(166, 166, 166, 0.2)',
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(255, 255, 255, 0.8)',
                    pointBorderColor: hours.map((_, i) =>
                        i === currentHour ? '#000000' : 'transparent'
                    ),
                    pointBorderWidth: 2,
                    pointRadius: hours.map((_, i) =>
                        i === currentHour ? 6 : 5
                    ),
                    pointHoverRadius: 7,
                },
                {
                    label: 'Consumption with Additional Appliances',
                    data: totalAddedConsumption,
                    borderColor: 'rgba(54, 162, 235, 0.8)', // Example color
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(255, 255, 255, 0.8)',
                    pointBorderColor: 'rgba(54, 162, 235, 1)',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
                },
            ],
        }),
        [consumption, totalAddedConsumption]
    );

    // Get unique consumption values for y-axis ticks (including the new dataset)
    const uniqueTicks = useMemo(() => {
        const allConsumptionValues = [...consumption, ...totalAddedConsumption];
        const uniqueValues = [...new Set(allConsumptionValues.map((v) => Number(v.toFixed(2))))].sort((a, b) => a - b);
        return uniqueValues;
    }, [consumption, totalAddedConsumption]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#e5e7eb',
                    font: {
                        family: 'Poppins',
                    },
                },
            },
            title: {
                display: true,
                text: 'Hourly Energy Consumption (kWh)',
                color: '#e5e7eb',
                font: {
                    family: 'Poppins',
                    size: 18,
                },
            },
            tooltip: {
                enabled: true,
                titleFont: {
                    family: 'PoppinsBold',
                    size: 14,
                },
                bodyFont: {
                    family: 'Poppins',
                    size: 12,
                },
                padding: 10,
                displayColors: false,
                backgroundColor: 'rgba(44, 0, 58, 0.8)',
                cornerRadius: 5,
                callbacks: {
                    title: function (tooltipItem) {
                        const hour = tooltipItem[0].label;
                        return `At ${hour == 0 || hour == 12 ? 12 : hour % 12} ${hour > 11 ? "pm" : "am"}`; // Custom heading (you can change this as per your needs)
                    },
                    label: function (tooltipItem) {
                        const datasetLabel = 'Consumption';
                        const value = tooltipItem.raw;
                        const hour = tooltipItem.label;

                        const appliancesOn = applianceNames
                            .filter((appliance, index) => switchStates[index] === 1)
                            .map((appliance) => appliance.name);

                        if (tooltipItem.datasetIndex === 0) {
                            setSpeech(
                                `At ${hour == 0 || hour == 12 ? 12 : hour % 12} ${hour > 11 ? "PM" : "AM"}, we’re looking at ${value.toFixed(2)} kWh of consumption. That's the baseline estimation`
                            );

                        } else if (tooltipItem.datasetIndex === 1) {
                            // Speech for the second dataset (e.g., Consumption with Additional Appliances)
                            if (appliancesOn.length > 0) {
                                setSpeech(
                                    `At ${hour == 0 || hour == 12 ? 12 : hour % 12} ${hour > 11 ? "PM" : "AM"}, with the ${appliancesOn.slice(0, -1).join(", ")} and ${appliancesOn[appliancesOn.length - 1]} running, consumption will hit ${value.toFixed(2)} kWh. Looks like we're using some power!`
                                );

                            } else {
                                setSpeech(
                                    `All additional appliances are off. At ${hour == 0 || hour == 12 ? 12 : hour % 12} ${hour > 11 ? "PM" : "AM"}, your consumption will be ${value.toFixed(2)} kWh`

                                );
                            }
                        }
                        return `${datasetLabel}: ${value.toFixed(2)} kWh`;
                    },
                },
            },
        },
        onHover: (event, chartElement) => {
            if (!chartElement.length) {
                setSpeech("Here’s your 24-hour energy forecast—with and without the devices you’ve got on right now!");
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time (Hours)',
                    color: '#e5e7eb',
                    font: {
                        family: 'Poppins',
                    },
                },
                ticks: {
                    color: '#e5e7eb',
                    maxTicksLimit: 24,
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Consumption (kWh)',
                    color: '#e5e7eb',
                    font: {
                        family: 'Poppins',
                    },
                },
                ticks: {
                    color: '#e5e7eb',
                    // Set ticks to unique consumption values
                    values: uniqueTicks,
                    // Optional: Format the tick labels
                    callback: (value) => value.toFixed(2),
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
        },
    };

    return (
        <div className="h-[100vh] bg-gradient-to-r from-[#1a063b] via-[#2e0a57] to-[#0a1a3c]">
            <Navbar />
            <div className="relative">
                <div className="absolute top-0 right-9">
                    <WeatherCard onWeatherUpdate={fetchPrediction} />
                </div>
                <div className='flex flex-col mt-8'>
                    <div className="relative inline-block">
                        {/* Shadow Text */}
                        <h1
                            className="absolute top-0 left-0 text-8xl font-Stormlight bg-black bg-clip-text text-transparent opacity-40 select-none"
                            style={{ fontFamily: 'Stormlight', transform: 'translate(6px, 6px)' }}
                        >
                            &nbsp;Powercast
                        </h1>

                        {/* Gradient Text */}
                        <h1
                            className="relative text-8xl font-Stormlight bg-gradient-to-r from-[#b0b0b0] via-[#d0d0d0] to-[#c0c0c0] bg-clip-text text-transparent"
                            style={{ fontFamily: 'Stormlight' }}
                        >
                            &nbsp;Powercast
                        </h1>
                    </div>
                </div>
                <div>
                    <div
                        className="w-3/5 rounded-2xl group bg-gradient-to-br from-[#290066] to-[#4b0082] shadow-xl backdrop-blur-md hover:scale-105 flex flex-col items-center justify-center text-center relative overflow-hidden pl-7 pr-7 pb-4 transition-transform duration-300"
                        style={{ minHeight: '350px', marginLeft: '7%', marginTop: '50px' }}
                        onMouseEnter={() =>
                            setSpeech(
                                "Here’s your 24-hour energy forecast—with and without the devices you’ve got on right now!"
                            )
                        }
                        onMouseLeave={() =>
                            setSpeech(
                                "Forecast Time! Let’s get a glimpse of your energy future. Together, we’ll plan smarter usage"
                            )
                        }
                    >
                        {/* Reflective shimmer */}
                        <div className="absolute inset-0 z-[-1] before:content-[''] before:absolute before:top-0 before:left-[-75%] before:w-[50%] before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:rotate-12 before:transition-all before:duration-500 group-hover:before:left=[130%]" />
                        {/* Chart */}
                        <div className="w-full h-64 mt-4">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </div>
            </div>
            {/* Robot Assistant */}
            <BuzzerBot speechInput={speech} />
        </div>
    );
}

export default Powercast;