import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import robot_logo from "../assets/robot_logo.gif";
import unknown from "../assets/unknown.jpg";
import male from "../assets/male.png";
import female from "../assets/female.png";

const Navbar = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userName, setUserName] = useState("Guest");
    const [userGender, setUserGender] = useState("unknown"); // Default gender is 'unknown'
    const [userProfileImage, setUserProfileImage] = useState(unknown); // Default profile image is 'unknown.jpg'

    useEffect(() => {
        const firstName = localStorage.getItem("userFirstName");
        const lastName = localStorage.getItem("userLastName");
        const gender = localStorage.getItem("userGender"); // Retrieve gender from localStorage

        if (firstName && lastName) {
            setUserName(`${firstName} ${lastName}`);
        }

        if (gender === "Male") {
            setUserGender("male");
            setUserProfileImage(male); // Set male profile image
        } else if (gender === "Female") {
            setUserGender("female");
            setUserProfileImage(female); // Set female profile image
        } else {
            setUserGender("unknown");
            setUserProfileImage(unknown); // Set unknown profile image
        }
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem("userFirstName");
        localStorage.removeItem("userLastName");
        localStorage.removeItem("userGender");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("TV");
        localStorage.removeItem("AC");
        localStorage.removeItem("Fridge");
        localStorage.removeItem("Oven");
        localStorage.removeItem("Fan");
        localStorage.removeItem("Light");
        setUserName("Guest");
        setUserGender("unknown");
        setUserProfileImage(unknown);
    };

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "Dashboard", path: "/dashboard" },
        { name: "Powercast", path: "/powercast" },
        { name: "Optimizer", path: "/optimizer" },
        {
            name: userName === "Guest" ? "Login" : "Logout", // Conditionally render Login/Logout
            path: userName === "Guest" ? "/login" : "/login", // This should lead to login/logout
            onClick: userName !== "Guest" ? handleLogout : null // Logout action
        },
    ];

    return (
        <nav className="bg-gradient-to-r from-[#7a7a7a] via-[#a6a6a6] to-[#8c8c8c] shadow-md sticky top-0 z-50 mb-9">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between h-16 items-center">

                    {/* Logo Section */}
                    <div className="flex items-center space-x-2">
                        <img
                            src={robot_logo}
                            alt="Robot Logo"
                            className="h-24 w-24"
                        />

                        <div className="relative" style={{ marginLeft: '-10%' }}>
                            {/* Shadow Text Behind */}
                            <h1
                                className="text-3xl font-Stormlight text-gray-600 select-none absolute z-0"
                                style={{
                                    fontFamily: 'Stormlight',
                                    transform: 'translate(3px, 3px)',
                                }}
                            >
                                &nbsp;F.A.M.
                            </h1>

                            {/* Gradient Text on Top */}
                            <h1
                                className="text-3xl font-Stormlight text-black relative z-10"
                                style={{ fontFamily: 'Stormlight' }}
                            >
                                &nbsp;F.A.M.
                            </h1>
                        </div>
                    </div>

                    {/* Navigation Links - Centered */}
                    <div className="flex-1 flex justify-center mr-9">
                        <div
                            className="hidden md:flex space-x-6 text-base text-black"
                            style={{ fontFamily: 'PoppinsBold' }}
                        >
                            {navLinks
                                .filter((link) => link.name !== "Logout") // Filter out logout link from the main navigation
                                .map((link) => (
                                    <a
                                        key={link.path}
                                        href={link.path}
                                        className={`transition duration-200 ${currentPath === link.path
                                            ? "underline underline-offset-4 text-[#290066]"
                                            : "hover:underline hover:underline-offset-4 hover:text-[#290066]"}`}
                                    >
                                        {link.name}
                                    </a>
                                ))}
                        </div>
                    </div>

                    {/* User Info and Sidebar Toggle */}
                    <div className="flex items-center space-x-4 text-black">
                        <p style={{ fontFamily: 'PoppinsBold' }}>
                            Welcome, {userName}
                        </p>
                        <div
                            className="w-9 h-9 rounded-full bg-center bg-cover cursor-pointer"
                            style={{
                                backgroundImage: `url(${userProfileImage})`, // Set the user's profile image here
                            }}
                            onClick={toggleSidebar}
                        />
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className={`fixed top-0 right-0 h-full w-64 bg-gradient-to-r from-[#7a7a7a] via-[#a6a6a6] to-[#8c8c8c] shadow-md transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
                } transition-transform duration-300 ease-in-out`}
                style={{ zIndex: 100, fontFamily: 'PoppinsBold' }}
            >
                <button
                    className="text-black text-4xl absolute top-4 right-5 cursor-pointer"
                    onClick={toggleSidebar}
                >
                    &times;
                </button>
                <div className="flex flex-col items-center mt-16">
                    <div
                        className="lg:w-32 lg:h-32 rounded-full bg-center bg-cover mb-4"
                        style={{
                            backgroundImage: `url(${userProfileImage})`, // Set the user's profile image here
                        }}
                    />
                    <p className="text-black text-lg">{userName}</p>
                    <hr className="w-4/5 my-4" style={{ border: '1px solid black' }} />
                </div>
                {/* Sidebar Links */}
                <ul className="text-black pl-9 space-y-2 text-base" style={{ fontFamily: 'PoppinsBold' }}>
                    {navLinks.map((link) => (
                        <li key={link.path}>
                            <a
                                href={link.path}
                                className={`transition duration-200 ${currentPath === link.path
                                    ? "underline underline-offset-4 text-[#290066]"
                                    : "hover:underline hover:underline-offset-4 hover:text-[#290066]"}`}
                                onClick={link.onClick}
                            >
                                {link.name}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* Footer */}
                <div className='flex flex-col justify-center items-center'>
                    <p className="text-black absolute bottom-4" style={{ fontFamily: 'PoppinsBold' }}>
                        © Team F.A.M.
                    </p>
                </div>
            </div>

        </nav>
    );
};

export default Navbar;
