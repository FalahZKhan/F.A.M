import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    FaSyncAlt,
    FaMapMarkerAlt,
    FaClock,
    FaTemperatureHigh,
    FaTint,
    FaWind
} from 'react-icons/fa';

const WeatherCard = ({ onWeatherUpdate }) => {
    const [weather, setWeather] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [location, setLocation] = useState("Detecting...");
    const [currentTime, setCurrentTime] = useState(new Date());

    const saveHourlyDataToLocalStorage = (hourly) => {
        if (hourly == false) {
            localStorage.setItem('hourlyTemp', false);
            localStorage.setItem('hourlyHumidity', false);
            localStorage.setItem('hourlyWind', false);
        } else {
            localStorage.setItem('hourlyTemp', JSON.stringify(hourly.temperature_2m));
            localStorage.setItem('hourlyHumidity', JSON.stringify(hourly.relative_humidity_2m));
            localStorage.setItem('hourlyWind', JSON.stringify(hourly.wind_speed_10m.map(w => (w * 3.6).toFixed(1))));
            if (onWeatherUpdate) {
                onWeatherUpdate(); 
            }
        }
    };

    const fetchWeather = async (latitude, longitude) => {
        saveHourlyDataToLocalStorage(false);
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&forecast_hours=24&timezone=auto`
            );
            const data = res.data;

            saveHourlyDataToLocalStorage(data.hourly);

            setWeather({
                temperature: data.hourly.temperature_2m[0],
                humidity: data.hourly.relative_humidity_2m[0],
                wind: (data.hourly.wind_speed_10m[0] * 3.6).toFixed(1),
            });
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Error fetching weather:", error);
            setError("Failed to fetch weather data. Please try again.");
        }
        setLoading(false);
    };

    const handleGeolocationAndWeather = () => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                try {
                    const geoRes = await axios.get(
                        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
                    );
                    const address = geoRes.data.address;
                    let city = address.city || address.town || address.village || address.suburb || "Unknown";
                    if (city.includes("Karachi Division")) city = "Karachi";
                    const country = address.country || "Unknown";
                    setLocation(`${city}, ${country}`);
                } catch (geoError) {
                    console.error("Reverse geocoding failed:", geoError);
                    setLocation("Unknown Location");
                }

                fetchWeather(lat, lon);
            },
            () => {
                console.error("Geolocation error, using fallback");
                setLocation("Karachi, Pakistan");
                fetchWeather(24.8607, 67.0011);
            }
        );
    };

    useEffect(() => {
        handleGeolocationAndWeather();
        const weatherInterval = setInterval(handleGeolocationAndWeather, 15 * 60 * 1000);
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => {
            clearInterval(weatherInterval);
            clearInterval(timer);
        };
    }, []);

    return (
        <div className="w-[28rem] text-end">
            <div className="flex items-center justify-end gap-2 relative">
                <button
                    onClick={handleGeolocationAndWeather}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-gray-300 transition cursor-pointer z-10"
                    title="Refresh"
                >
                    <FaSyncAlt size={16} />
                </button>
                <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-1" style={{ fontFamily: "PoppinsBold" }}>
                    <FaMapMarkerAlt size={18} /> {location}
                </h2>
            </div>

            <p className="text-sm text-gray-300 flex justify-end items-center gap-1 mt-1" style={{ fontFamily: "Poppins" }}>
                <FaClock size={14} /> {currentTime.toLocaleTimeString()}
            </p>

            {loading ? (
                <p className="text-gray-200 mt-2" style={{ fontFamily: 'Poppins' }} >Loading weather...</p>
            ) : error ? (
                <p className="text-red-500 mt-2" style={{ fontFamily: 'Poppins' }}>Error syncing. Please check<br />your internet connection</p>
            ) : weather ? (
                <div className="space-y-2 text-gray-200 mt-2">
                    <p style={{ fontFamily: 'PoppinsBold' }} className="flex items-center gap-1 justify-end">
                        <FaTemperatureHigh size={16} /> Temperature: <span style={{ fontFamily: "Poppins" }}>{weather.temperature}°C</span>
                    </p>
                    <p style={{ fontFamily: 'PoppinsBold' }} className="flex items-center gap-1 justify-end">
                        <FaTint size={16} /> Humidity: <span style={{ fontFamily: "Poppins" }}>{weather.humidity}%</span>
                    </p>
                    <p style={{ fontFamily: 'PoppinsBold' }} className="flex items-center gap-1 justify-end">
                        <FaWind size={16} /> Wind Speed: <span style={{ fontFamily: "Poppins" }}>{weather.wind} km/h</span>
                    </p>
                    <p className="text-xs text-gray-300 text-end" style={{ fontFamily: 'PoppinsBold' }}>
                        Last Synced: {
                            lastUpdated ?
                                lastUpdated.toLocaleString('en-GB', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: false
                                }).replace(",", "") : 'N/A'
                        }
                    </p>
                </div>
            ) : (
                <p className="text-red-500 mt-2">No data found.</p>
            )}
        </div>
    );
};

export default WeatherCard;
