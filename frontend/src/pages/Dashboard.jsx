import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import BuzzerBot from '../components/BuzzerBot';
import { useSnackbar } from 'notistack';
import WeatherCard from '../components/WeatherCard';
import axios from 'axios';
import {
    FaTv,
    FaSnowflake,
    FaIceCream,
    FaFireAlt,
    FaFan,
    FaLightbulb
} from 'react-icons/fa';

const icons = [FaTv, FaSnowflake, FaIceCream, FaFireAlt, FaFan, FaLightbulb];
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

function Dashboard() {
    const email = localStorage.getItem("userEmail")
    const navigate = useNavigate();
    const defaultSpeech = "Welcome to the Appliance Dashboard! Ready to control your devices?";
    const { enqueueSnackbar } = useSnackbar();
    const [speech, setSpeech] = useState(defaultSpeech);
    const [totalConsumption, setTotalConsumption] = useState(0)
    const [buttonText, setButtonText] = useState("Save Changes")

    useEffect(() => {
        if (!email) {
            navigate("/login");
        }
    }, [email, navigate]);

    // Initialize switch states from localStorage (1 for on, 0 for off)
    const [switchStates, setSwitchStates] = useState(() => {
        return applianceNames.map((appliance) => {
            const storedValue = localStorage.getItem(appliance.name);
            return storedValue === "1" ? 1 : 0; // Default to 0 if not set or not "1"
        });
    });

    useEffect(() => {
        // Calculate total consumption whenever switchStates change
        const updatedConsumption = switchStates.reduce((total, state, index) => {
            return total + (state === 1 ? applianceNames[index].energy : 0);
        }, 0);
        setTotalConsumption(updatedConsumption);
    }, [switchStates]); // Add switchStates as a dependency
    

    useEffect(() => {
        // Calculate initial consumption based on loaded switch states
        const initialConsumption = switchStates.reduce((total, state, index) => {
            return total + (state === 1 ? applianceNames[index].energy : 0);
        }, 0);
        setTotalConsumption(initialConsumption);
    }, []);

    const toggleSwitch = (index) => {
        const updated = [...switchStates];
        updated[index] = updated[index] === 1 ? 0 : 1; // Toggle between 1 and 0
        setSwitchStates(updated);
        if (updated[index] == 1) {
            setSpeech(`Want to give the ${applianceNames[index].name} a little break? Let’s switch it off!`);
        } else if (updated[index] == 0) {
            setSpeech(`Getting ready to turn on the ${applianceNames[index].name}? Heads up—it consumes ${applianceNames[index].energy} kWh of energy.`);
        }
    };

    const handleHover = (index) => {
        if (switchStates[index] == 0) {
            setSpeech(`Getting ready to turn on the ${applianceNames[index].name}? Heads up—it consumes ${applianceNames[index].energy} kWh of energy.`);
        } else {
            setSpeech(`Want to give the ${applianceNames[index].name} a little break? Let’s switch it off!`);
        }
    };

    const handleHoverOut = () => {
        setSpeech(defaultSpeech);
    };

    const handleSaveChanges = () => {
        setButtonText("Saving Changes");
        // Save states to localStorage only on save
        switchStates.forEach((state, index) => {
            localStorage.setItem(applianceNames[index].name, state.toString());
        });

        localStorage.setItem("Total", totalConsumption)
    
        const updatedConsumption = switchStates.reduce((total, state, index) => {
            return total + (state === 1 ? applianceNames[index].energy : 0);
        }, 0);
        setTotalConsumption(updatedConsumption);
    
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
            axios.post('http://localhost:9000/update', {
                email: userEmail,
                appliances: switchStates,
                total: totalConsumption
            })
            .then(response => {
                console.log('Update successful:', response.data);
                enqueueSnackbar('Settings saved successfully!', { variant: 'success',  autoHideDuration: 1000 });
                setButtonText("Save Changes");
            })
            .catch(error => {
                console.error('Error updating backend:', error);
                enqueueSnackbar('Failed to save settings. Please try again.', { variant: 'error',  autoHideDuration: 1000 });
            });
        }
    };

    const panelStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 100px)',
        gridGap: '20px',
        marginTop: '35px',
        padding: '20px',
        background: 'linear-gradient(to right, #bbb, #888, #ddd)',

        borderRadius: '8px',
        boxShadow: '0 1px 8px rgba(0, 0, 0, 0.6)',
        width: 'fit-content',
    };

    const wrapperStyle = {
        position: 'relative',
        width: '100px',
        height: '120px',
        background: 'rgb(51, 51, 51)',
        borderRadius: '4px',
        padding: '2px',
    };

    const beforeStyle = {
        content: '""',
        position: 'absolute',
        left: '-25px',
        top: '-35px',
        width: '150px',
        height: '190px',
        zIndex: -10,
        padding: '35px 25px',
        background: 'linear-gradient(to bottom, rgb(233, 226, 223), rgb(31, 140, 145), rgb(116, 145, 177))',
        boxShadow: '0 1px 3px 5px rgba(0,0,0,.5), inset 0 1px 0 white',
        borderRadius: '2px',
    };

    const switchBaseStyle = {
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to top, rgb(233, 226, 223), rgb(162, 153, 148), rgb(180, 166, 159))',
        boxShadow: 'inset 0 10px rgba(255,255,255,.7), inset 0 11px 1px rgba(250,250,250,.2), inset 0 -2px 1px rgba(0,0,0,.2)',
        borderRadius: '2px',
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
    };

    const switchOnStyle = {
        boxShadow: 'inset 0 -10px 1px 1px rgba(0, 0, 0, 0.5)',
    };

    const beforeBarStyle = (isOn) => ({
        background: isOn ? 'rgb(0, 104, 9)' : 'rgb(109, 0, 0)',
        width: '36%',
        position: 'absolute',
        height: '4px',
        top: !isOn ? '70%' : '77%',
        left: '32%',
        borderRadius: '12px',
        boxShadow: 'inset 0 0 1px rgba(0,0,0,.2)',
        border: '1px solid rgba(0,0,0,.1)',
    });

    const afterBarStyle = (isOn) => ({
        position: 'absolute',
        top: !isOn ? '90%' : '100%',
        left: '0',
        width: '100%',
        height: !isOn ? '50%' : '20%',
        background: !isOn
            ? 'linear-gradient(to bottom, rgba(65,50,0,0.3), rgba(65,50,0,0.3), rgba(65,50,0,0), rgba(65,50,0,0))'
            : 'linear-gradient(to bottom, rgba(65,50,0,0.25), rgba(65,50,0,0.25), rgba(65,50,0,0), rgba(65,50,0,0))',
        borderRadius: '2px',
    });

    const iconStyle = {
        position: 'absolute',
        top: '28%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1,
        opacity: 0.8,
    };

    return (
        <div className="h-[100vh] bg-gradient-to-r from-[#1a063b] via-[#2e0a57] to-[#0a1a3c]">
            <Navbar />
            <div className="relative">
                <div className="absolute top-0 right-9">
                    <WeatherCard />
                </div>
                <div className='flex flex-col'>
                    <div className="relative inline-block">
                        {/* Shadow Text Behind */}
                        <h1
                            className="absolute top-0 left-0 text-8xl font-Stormlight bg-black bg-clip-text text-transparent opacity-40 select-none"
                            style={{ fontFamily: 'Stormlight', transform: 'translate(6px, 6px)' }}
                        >
                            &nbsp;Dashboard
                        </h1>

                        {/* Gradient Text on Top */}
                        <h1
                            className="relative text-8xl font-Stormlight bg-gradient-to-r from-[#b0b0b0] via-[#d0d0d0] to-[#c0c0c0] bg-clip-text text-transparent"
                            style={{ fontFamily: 'Stormlight' }}
                        >
                            &nbsp;Dashboard
                        </h1>
                    </div>
                </div>
            </div>
            <div className='flex flex-col space-y-6'>
                <div className="flex flex-row justify-start space-x-9" style={{ marginLeft: '8%' }}>
                    {/* Integrated Switch Panel */}
                    <div style={{ position: 'relative' }} onMouseLeave={handleHoverOut}>
                        <div style={panelStyle}>
                            {switchStates.map((state, index) => {
                                const Icon = icons[index];
                                return (
                                    <div key={index} style={wrapperStyle}>
                                        <div style={beforeStyle} />
                                        <div
                                            style={{
                                                ...switchBaseStyle,
                                                ...(state === 0 ? switchOnStyle : {}),
                                            }}
                                            onClick={() => toggleSwitch(index)}
                                            onMouseEnter={() => handleHover(index)}
                                        >
                                            <Icon className="mt-5 text-gray-900" size={32} style={iconStyle} />
                                            <div style={beforeBarStyle(state)} />
                                            <div style={afterBarStyle(state)} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div
                        className="rounded-2xl group bg-gradient-to-br from-[#290066] to-[#4b0082] shadow-xl backdrop-blur-md hover:scale-105 flex flex-col items-center text-center relative overflow-hidden p-9 transition-transform duration-300"
                        style={{
                            width: '30%',
                            height: '46.3vh',
                            border: '2px dashed #000',
                            marginTop: '35px',
                        }}
                    >
                        <h2 className="text-2xl mb-2 bg-gradient-to-r from-[#b0b0b0] via-[#d0d0d0] to-[#c0c0c0] bg-clip-text text-transparent" style={{ fontFamily: "StormLight" }}>
                            INSTRUCTIONS
                        </h2>
                        <div className="flex-grow flex items-center">
                            <p className="text-lg text-center bg-gradient-to-r from-[#b0b0b0] via-[#d0d0d0] to-[#c0c0c0] bg-clip-text text-transparent" style={{ fontFamily: "Poppins" }}>
                                Use the Switch Panel to toggle appliances on or off in real-time. Buzzer’s got your back, making sure you never mix up which button controls what!
                            </p>
                        </div>
                        {/* Reflective shimmer */}
                        <div className="absolute inset-0 z-[-1] before:content-[''] before:absolute before:top-0 before:left-[-75%] before:w-[50%] before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:rotate-12 before:transition-all before:duration-500 group-hover:before:left-[130%]" />
                    </div>
                </div>
                <div className="flex flex-row justify-between" style={{ marginRight: '34%', marginLeft: "8%" }}>
                    <div
                        className="rounded-2xl group bg-gradient-to-br from-[#1a1a1a] to-[#333333] shadow-xl backdrop-blur-md hover:scale-105 flex items-center justify-end text-right text-3xl font-mono text-green-400 px-6 relative overflow-hidden transition-transform duration-300"
                        style={{
                            width: '48%',
                            height: '10vh',
                            border: '2px dashed #000',
                        }}
                        onMouseEnter={() => setSpeech("This is where your total consumption will be estimated based on your appliance status")}
                        onMouseLeave={() => setSpeech("Welcome to the Appliance Dashboard! Ready to control your devices?")}
                    >
                        {/* Display Text */}
                        <span>Total: {totalConsumption.toFixed(1)} kWh</span>

                        {/* Reflective shimmer */}
                        <div className="absolute inset-0 z-[-1] before:content-[''] before:absolute before:top-0 before:left-[-75%] before:w-[50%] before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:rotate-12 before:transition-all before:duration-500 group-hover:before:left-[130%]" />
                    </div>

                    <button
                        className="cursor-pointer h-[40px] bg-gradient-to-r from-[#b0b0b0] via-[#d0d0d0] to-[#c0c0c0] text-[#290066] px-4 py-2 rounded-lg shadow-md transition duration-300 hover:from-[#8c8c8c] hover:via-[#a6a6a6] hover:to-[#8c8c8c] hover:shadow-lg"
                        onMouseEnter={() => setSpeech("Save changes? You can always come back and edit if you change your mind")}
                        onMouseLeave={() => setSpeech("Welcome to the Appliance Dashboard! Ready to control your devices?")}
                        onMouseDown={handleSaveChanges}
                        style={{ fontFamily: 'PoppinsBold', cursor: 'pointer' }}
                    >
                        {buttonText}
                    </button>
                </div>
            </div>

            {/* Robot Assistant */}
            <BuzzerBot speechInput={speech} />
        </div>
    );
}

export default Dashboard;