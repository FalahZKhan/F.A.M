import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import BuzzerBot from '../components/BuzzerBot';
import WeatherCard from '../components/WeatherCard';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import tree_AC from '../assets/trees/decision_tree_AC.png';
import tree_Fan from '../assets/trees/decision_tree_Fan.png';
import tree_Fridge from '../assets/trees/decision_tree_Fridge.png';
import tree_Light from '../assets/trees/decision_tree_Light.png';
import tree_Oven from '../assets/trees/decision_tree_Oven.png';
import tree_TV from '../assets/trees/decision_tree_TV.png';

const applianceNames = [
    { name: 'TV', energy: 0.3 },
    { name: 'AC', energy: 1.2 },
    { name: 'Fridge', energy: 0.6 },
    { name: 'Oven', energy: 1.0 },
    { name: 'Fan', energy: 0.1 },
    { name: 'Light', energy: 0.2 },
];

// Map appliance names to their decision tree images
const decisionTrees = [
    { name: 'TV', image: tree_TV },
    { name: 'AC', image: tree_AC },
    { name: 'Fridge', image: tree_Fridge },
    { name: 'Oven', image: tree_Oven },
    { name: 'Fan', image: tree_Fan },
    { name: 'Light', image: tree_Light },
];

function Optimizer() {
    const [buttonText, setButtonText] = useState('Run Optimizer');
    const email = localStorage.getItem("userEmail")
    const navigate = useNavigate();
    const [totalConsumption, setTotalConsumption] = useState(0);
    const [optimize, setOptimize] = useState('Run the optimizer to find the best appliance settings for maximum savings');
    const [saveText, setSaveText] = useState('Apply Changes');
    const { enqueueSnackbar } = useSnackbar();
    const [speech, setSpeech] = useState('Crunching numbers, saving watts. Here I’ll tell you what you should switch on—or off!');
    const [switchStates, setSwitchStates] = useState(() => {
        return applianceNames.map((appliance) => {
            const storedValue = localStorage.getItem(appliance.name);
            return storedValue === '1' ? 1 : 0; // Default to 0 if not set or not '1'
        });
    });
    const [currentTreeIndex, setCurrentTreeIndex] = useState(0);

    useEffect(() => {
        if (!email) {
            navigate("/login");
        }
    })

    // Calculate initial totalConsumption on component mount
    useEffect(() => {
        const initialConsumption = switchStates.reduce((total, state, index) => {
            return total + (state === 1 ? applianceNames[index].energy : 0);
        }, 0);
        setTotalConsumption(initialConsumption);
    }, [switchStates]);

    // Carousel auto-slide effect
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTreeIndex((prevIndex) => (prevIndex + 1) % decisionTrees.length);
        }, 5000); // Change image every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const handlePrevTree = () => {
        setCurrentTreeIndex((prevIndex) =>
            prevIndex === 0 ? decisionTrees.length - 1 : prevIndex - 1
        );
    };

    const handleNextTree = () => {
        setCurrentTreeIndex((prevIndex) =>
            (prevIndex + 1) % decisionTrees.length
        );
    };

    const handleSaveChanges = () => {
        setSaveText('Saving Changes');
        switchStates.forEach((state, index) => {
            localStorage.setItem(applianceNames[index].name, state.toString());
        });

        localStorage.setItem('Total', totalConsumption.toString());

        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
            axios
                .post('http://localhost:9000/update', {
                    email: userEmail,
                    appliances: switchStates,
                    total: totalConsumption,
                })
                .then((response) => {
                    console.log('Update successful:', response.data);
                    enqueueSnackbar('Settings saved successfully!', { variant: 'success', autoHideDuration: 1000 });
                    setSaveText('Apply Changes');
                })
                .catch((error) => {
                    console.error('Error updating backend:', error);
                    enqueueSnackbar('Failed to save settings. Please try again.', { variant: 'error', autoHideDuration: 1000 });
                    setSaveText('Apply Changes');
                });
        } else {
            enqueueSnackbar('User email not found. Please log in.', { variant: 'error', autoHideDuration: 1000 });
            setSaveText('Apply Changes');
        }
    };

    const handleOptimize = () => {
        try {
            const now = new Date();
            const day = now.getDate();
            const month = now.getMonth() + 1;
            const hour = now.getHours();

            let hourlyTemp, hourlyHumidity, hourlyWind;
            try {
                hourlyTemp = JSON.parse(localStorage.getItem('hourlyTemp'));
                hourlyHumidity = JSON.parse(localStorage.getItem('hourlyHumidity'));
                hourlyWind = JSON.parse(localStorage.getItem('hourlyWind'));
            } catch (error) {
                console.error('Error parsing localStorage data:', error);
                enqueueSnackbar('Invalid weather data format in storage.', { variant: 'error', autoHideDuration: 2000 });
                setButtonText('Run Optimizer');
                return;
            }

            setTimeout(() => {
                if (
                    !hourlyTemp ||
                    !hourlyHumidity ||
                    !hourlyWind ||
                    !Array.isArray(hourlyTemp) ||
                    !Array.isArray(hourlyHumidity) ||
                    !Array.isArray(hourlyWind)
                ) {
                    console.error('Error: Invalid or missing data in localStorage');
                    enqueueSnackbar('Weather data is missing or invalid.', { variant: 'error', autoHideDuration: 2000 });
                    setButtonText('Run Optimizer');
                    return;
                }

                const temp = hourlyTemp[0];
                const humid = hourlyHumidity[0];
                const wind = hourlyWind[0];

                if (isNaN(temp) || isNaN(humid) || isNaN(wind)) {
                    console.error('Error: Temperature, Humidity, or WindSpeed is not a valid number');
                    enqueueSnackbar('Invalid weather data values.', { variant: 'error', autoHideDuration: 2000 });
                    setButtonText('Run Optimizer');
                    return;
                }

                setButtonText('Running Optimizer');
                setSpeech('Gears are turning, savings are loading. Hang tight, this will take a moment');

                setTimeout(() => {
                    const payload = {
                        Day: day,
                        Month: month,
                        Hour: hour,
                        Temperature: temp,
                        Humidity: humid,
                        WindSpeed: wind,
                        current_states: applianceNames.reduce((acc, appliance, index) => {
                            acc[appliance.name] = switchStates[index];
                            return acc;
                        }, {}),
                    };

                    console.log(payload);

                    axios
                        .post('http://localhost:9000/optimize', payload)
                        .then((response) => {
                            const suggestions = response.data.suggestions || [];

                            const turnOn = suggestions
                                .filter((suggestion) => suggestion.startsWith('Turn ON'))
                                .map((suggestion) => suggestion.split(' ')[2]);
                            const turnOff = suggestions
                                .filter((suggestion) => suggestion.startsWith('Turn OFF'))
                                .map((suggestion) => suggestion.split(' ')[2]);

                            setSwitchStates((prevState) => {
                                const newStates = [...prevState];
                                applianceNames.forEach((appliance, index) => {
                                    if (turnOn.includes(appliance.name)) {
                                        newStates[index] = 1; // Turn ON
                                    } else if (turnOff.includes(appliance.name)) {
                                        newStates[index] = 0; // Turn OFF
                                    }
                                });
                                const updatedConsumption = newStates.reduce((total, state, index) => {
                                    return total + (state === 1 ? applianceNames[index].energy : 0);
                                }, 0);
                                setTotalConsumption(updatedConsumption);
                                return newStates;
                            });

                            const turnOnFormatted =
                                turnOn.length > 0
                                    ? turnOn.length > 1
                                        ? turnOn.slice(0, -1).map((appliance) => `the ${appliance}`).join(', ') +
                                        ' and ' +
                                        `the ${turnOn[turnOn.length - 1]}`
                                        : `the ${turnOn[0]}`
                                    : '';

                            const turnOffFormatted =
                                turnOff.length > 0
                                    ? turnOff.length > 1
                                        ? turnOff.slice(0, -1).map((appliance) => `the ${appliance}`).join(', ') +
                                        ' and ' +
                                        `the ${turnOff[turnOff.length - 1]}`
                                        : `the ${turnOff[0]}`
                                    : '';

                            let formattedSuggestions = '';

                            if (!turnOffFormatted && !turnOnFormatted) {
                                formattedSuggestions = "No changes needed. You're good to go!";
                            } else if (turnOnFormatted && turnOffFormatted) {
                                formattedSuggestions = `You can turn on ${turnOnFormatted}. Make sure to turn off ${turnOffFormatted}.`;
                            } else if (turnOnFormatted) {
                                formattedSuggestions = `You can turn on ${turnOnFormatted}.`;
                            } else if (turnOffFormatted) {
                                formattedSuggestions = `Load is too much, consider closing ${turnOffFormatted}.`;
                            }

                            setOptimize(formattedSuggestions);
                            if (!turnOffFormatted && !turnOnFormatted) {
                                setButtonText('Run Optimizer');
                            } else {
                                setButtonText('Re-Optimize?');
                            }
                            setSpeech('Done saving some watts! Curious to see if we can do even better?');
                        })
                        .catch((error) => {
                            console.error('Error calling /optimize:', error);
                            setButtonText('Optimization Failed');
                            enqueueSnackbar('Optimization failed. Please try again.', { variant: 'error', autoHideDuration: 2000 });
                        });
                }, 1000);
            }, 1000);
        } catch (error) {
            console.error('Error in handleOptimize:', error.message);
            setButtonText('Optimization Failed');
            enqueueSnackbar('An error occurred during optimization.', { variant: 'error', autoHideDuration: 2000 });
        }
    };

    return (
        <div className="h-[100vh] bg-gradient-to-r from-[#1a063b] via-[#2e0a57] to-[#0a1a3c]">
            <Navbar />
            <div className="relative">
                <div className="absolute top-0 right-9">
                    <WeatherCard />
                </div>
                <div className="flex flex-col">
                    <div className="relative inline-block">
                        {/* Shadow Text Behind */}
                        <h1
                            className="absolute top-0 left-0 text-8xl font-Stormlight bg-black bg-clip-text text-transparent opacity-40 select-none"
                            style={{ fontFamily: 'Stormlight', transform: 'translate(6px, 6px)' }}
                        >
                            &nbsp;Optimizer
                        </h1>
                        {/* Gradient Text on Top */}
                        <h1
                            className="relative text-8xl font-Stormlight bg-gradient-to-r from-[#b0b0b0] via-[#d0d0d0] to-[#c0c0c0] bg-clip-text text-transparent"
                            style={{ fontFamily: 'Stormlight' }}
                        >
                            &nbsp;Optimizer
                        </h1>
                    </div>
                    <div className="flex flex-row space-x-9 ml-12">
                        <div
                            className="rounded-2xl group bg-gradient-to-br from-[#290066] to-[#4b0082] shadow-xl backdrop-blur-md hover:scale-105 flex flex-col items-center text-center relative overflow-hidden pt-5 transition-transform duration-300"
                            style={{
                                width: '35%',
                                height: '56.3vh',
                                border: '2px dashed #000',
                                marginTop: '35px',
                            }}
                        >
                            <div className="flex-grow flex flex-col items-center justify-center w-full h-full relative">
                                {/* Caption and Buttons Container */}
                                <div className="absolute top-0 w-full flex items-center justify-between px-4">
                                    {/* Previous Arrow */}
                                    <button
                                        onClick={handlePrevTree}
                                        className="pointer-events-auto bg-gradient-to-r from-[#b0b0b0] via-[#d0d0d0] to-[#c0c0c0] text-[#290066] p-2 rounded-full shadow-md hover:from-[#8c8c8c] hover:via-[#a6a6a6] hover:to-[#8c8c8c] transition duration-300 z-20 w-[30px] h-[30px] flex items-center justify-center"
                                        style={{ fontFamily: 'PoppinsBold' }}
                                    >
                                        ←
                                    </button>
                                    {/* Caption */}
                                    <div
                                        className="text-center bg-gradient-to-r from-[#b0b0b0] via-[#d0d0d0] to-[#c0c0c0] bg-clip-text text-transparent"
                                        style={{ fontFamily: 'StormLight' }}
                                    >
                                        {decisionTrees[currentTreeIndex].name} Decision Tree
                                    </div>
                                    {/* Next Arrow */}
                                    <button
                                        onClick={handleNextTree}
                                        className="pointer-events-auto bg-gradient-to-r from-[#b0b0b0] via-[#d0d0d0] to-[#c0c0c0] text-[#290066] p-2 rounded-full shadow-md hover:from-[#8c8c8c] hover:via-[#a6a6a6] hover:to-[#8c8c8c] transition duration-300 z-20 w-[30px] h-[30px] flex items-center justify-center"
                                        style={{ fontFamily: 'PoppinsBold' }}
                                    >
                                        →
                                    </button>
                                </div>
                                {/* Carousel */}
                                <div className="relative w-full h-full flex items-center justify-center pt-4">
                                    {/* Image */}
                                    <img
                                        src={decisionTrees[currentTreeIndex].image}
                                        alt={`Decision Tree for ${decisionTrees[currentTreeIndex].name}`}
                                        className="max-w-full p-7 max-h-full object-contain z-10"
                                    />
                                </div>
                            </div>
                            {/* Reflective shimmer */}
                            <div className="absolute inset-0 z-[-1] before:content-[''] before:absolute before:top-0 before:left-[-75%] before:w-[50%] before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:rotate-12 before:transition-all before:duration-500 group-hover:before:left[130%]" />
                        </div>
                        <div
                            className="rounded-2xl group bg-gradient-to-br from-[#290066] to-[#4b0082] shadow-xl backdrop-blur-md hover:scale-105 flex flex-col justify-between items-center text-center relative overflow-hidden p-9 transition-transform duration-300"
                            style={{
                                width: '30%',
                                height: '56.3vh',
                                border: '2px dashed #000',
                                marginTop: '35px',
                            }}
                        >
                            {/* Top part */}
                            <div className="flex-grow flex flex-col items-center">
                                <h2
                                    className="text-2xl mb-2 bg-gradient-to-r from-[#b0b0b0] via-[#d0d0d0] to-[#c0c0c0] bg-clip-text text-transparent"
                                    style={{ fontFamily: 'StormLight' }}
                                >
                                    Recommended Actions
                                </h2>
                            </div>
                            {/* Centered Text */}
                            <div className="flex justify-center items-center h-full flex-grow">
                                <p
                                    className="text-lg text-center bg-gradient-to-r from-[#b0b0b0] via-[#d0d0d0] to-[#c0c0c0] bg-clip-text text-transparent"
                                    style={{ fontFamily: 'Poppins' }}
                                >
                                    {optimize}
                                </p>
                            </div>
                            {/* Bottom part (Buttons) */}
                            <div className="flex space-x-4">
                                <button
                                    className="cursor-pointer h-[70px] w-[150px] bg-gradient-to-r from-[#b0b0b0] via-[#d0d0d0] to-[#c0c0c0] text-[#290066] px-4 py-2 rounded-lg shadow-md transition duration-300 hover:from-[#8c8c8c] hover:via-[#a6a6a6] hover:to-[#8c8c8c] hover:shadow-lg"
                                    onMouseEnter={() => {
                                        if (buttonText === 'Run Optimizer') {
                                            setSpeech('Are you ready to figure out which combination gives you the best savings?');
                                        } else if (buttonText === 'Running Optimizer') {
                                            setSpeech('Gears are turning, savings are loading. Hang tight, this will take a moment');
                                        } else if (buttonText === 'Re-Optimize?') {
                                            setSpeech('Done saving some watts! Curious to see if we can do even better?');
                                        }
                                    }}
                                    onMouseLeave={() =>
                                        setSpeech('Crunching numbers, saving watts. Here I’ll tell you what you should switch on—or off!')
                                    }
                                    onMouseDown={handleOptimize}
                                    style={{ fontFamily: 'PoppinsBold', cursor: 'pointer' }}
                                >
                                    {buttonText}
                                </button>
                                <button
                                    className={`h-[70px] w-[150px] bg-gradient-to-r from-[#b0b0b0] via-[#d0d0d0] to-[#c0c0c0] text-[#290066] px-4 py-2 rounded-lg shadow-md transition duration-300 
                                    ${buttonText !== 'Re-Optimize?'
                                            ? 'cursor-not-allowed opacity-50'
                                            : 'cursor-pointer hover:from-[#8c8c8c] hover:via-[#a6a6a6] hover:to-[#8c8c8c] hover:shadow-lg'
                                        }`}
                                    onMouseEnter={() => {
                                        setSpeech(
                                            'Trust me, this combination is your best shot at saving energy while keeping you comfortable. Ready to save it?'
                                        );
                                    }}
                                    onMouseLeave={() =>
                                        setSpeech('Crunching numbers, saving watts. Here I’ll tell you what you should switch on—or off!')
                                    }
                                    onMouseDown={handleSaveChanges}
                                    style={{ fontFamily: 'PoppinsBold' }}
                                    disabled={buttonText !== 'Re-Optimize?'}
                                >
                                    {saveText}
                                </button>
                            </div>
                            {/* Reflective shimmer */}
                            <div className="absolute inset-0 z-[-1] before:content-[''] before:absolute before:top-0 before:left-[-75%] before:w-[50%] before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:rotate-12 before:transition-all before:duration-500 group-hover:before:left[130%]" />
                        </div>
                    </div>
                </div>
            </div>
            {/* Robot Assistant */}
            <BuzzerBot speechInput={speech} />
        </div>
    );
}

export default Optimizer;