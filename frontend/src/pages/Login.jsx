import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import login_bg from '../assets/login_bg.jpg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState(''); // New state for first name
    const [lastName, setLastName] = useState('');   // New state for last name
    const [gender, setGender] = useState('');       // New state for gender
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSignup, setIsSignup] = useState(false); // Track if the user is on SignUp or Login form
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate hook

    // Handle input change for email, password, firstName, lastName, and gender
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "email") {
            setEmail(value);
        } else if (name === "password") {
            setPassword(value);
        } else if (name === "firstName") {
            setFirstName(value);
        } else if (name === "lastName") {
            setLastName(value);
        } else if (name === "gender") {
            setGender(value);
        }
    };

    // Handle form submission for login or signup
    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isSignup ? '/signup' : '/login'; // Toggle between login and signup API endpoints
    
        // Send POST request to the API
        try {
            const response = await fetch(`http://localhost:9000/api${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, firstName, lastName, gender }), // Send gender in the request
            });
    
            const result = await response.json();
    
            if (response.ok) {
                if (isSignup) {
                    setSuccess('User created successfully!');
                    setSnackbarMessage('Account created successfully!');
                    setTimeout(() => {
                        setSnackbarMessage('');
                        setIsSignup(false); // Toggle to login after signup
                    }, 3000);
                } else {
                    // Assuming the backend sends user data (firstName, lastName, gender)
                    const { firstName, lastName, gender, TV, AC, Fridge, Oven, Fan, Light, Total } = result; // Destructure the response
    
                    // Store firstName, lastName, gender, and email in localStorage after login
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('userFirstName', firstName); // Store first name
                    localStorage.setItem('userLastName', lastName);  
                    localStorage.setItem('userGender', gender);       
                    localStorage.setItem('userGender', gender);      
                    localStorage.setItem('TV', TV);  
                    localStorage.setItem('AC', AC);  
                    localStorage.setItem('Fridge', Fridge);  
                    localStorage.setItem('Oven', Oven);  
                    localStorage.setItem('Fan', Fan);  
                    localStorage.setItem('Light', Light); 
                    localStorage.setItem('Total', Total);  
                    console.log('Login successful:', result.message);
                    navigate('/'); // Redirect to home page after login
                }
                setError(''); // Reset error message on success
            } else {
                setError(result.message); // Display error message
                setSnackbarMessage('');
            }
        } catch (error) {
            console.error('Error during authentication:', error);
            setError('An error occurred. Please try again later.');
            setSnackbarMessage('');
        }
    };
    
    // Toggle between Login and Sign Up forms
    const toggleForm = () => {
        setIsSignup((prev) => !prev);
        setError(''); // Reset error message when toggling
        setSuccess(''); // Reset success message
    };

    return (
        <div className="w-screen h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#07070f] via-[#141230] to-[#3c2d50] overflow-hidden">
            {/* Left Side - Electric Image */}
            <div
                className="md:w-1/2 w-full h-1/3 md:h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${login_bg})` }}
            />

            {/* Right Side - Form Card */}
            <div className="md:w-1/2 w-full h-2/3 md:h-full flex items-center justify-center bg-black/60 backdrop-blur-lg">
                <div className="w-full max-w-md bg-[#1e1b2e]/80 border border-purple-500 rounded-2xl shadow-[0_0_20px_rgba(124,58,237,0.5)] p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(147,51,234,0.7)]">
                    <h1 className="text-6xl mb-6 text-center text-purple-400 tracking-wider drop-shadow-md" style={{ fontFamily: 'StormLight' }}>
                        F.A.M.
                    </h1>
                    <h2 className="text-4xl mb-6 text-center text-purple-400 tracking-wider drop-shadow-md">
                        {isSignup ? 'Sign Up' : 'Login'}
                    </h2>

                    {snackbarMessage && (
                        <div className="bg-green-600 text-white p-2 rounded-md text-center mb-4">
                            {snackbarMessage}
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {isSignup && (
                            <>
                                <div>
                                    <label className="block text-purple-300 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={firstName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-black/50 border border-blue-500 rounded-md text-white placeholder:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                        placeholder="John"
                                    />
                                </div>

                                <div>
                                    <label className="block text-purple-300 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={lastName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-black/50 border border-blue-500 rounded-md text-white placeholder:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                        placeholder="Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-purple-300 mb-1">Gender</label>
                                    <select
                                        name="gender"
                                        value={gender}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-black/50 border border-blue-500 rounded-md text-white placeholder:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-purple-300 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-black/50 border border-blue-500 rounded-md text-white placeholder:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                placeholder="you@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-purple-300 mb-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-black/50 border border-blue-500 rounded-md text-white placeholder:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-md font-semibold tracking-wide shadow-md hover:shadow-purple-500/50 transition"
                        >
                            {isSignup ? 'Sign Up' : 'Sign In'}
                        </button>

                        <p className="text-purple-300 text-sm text-center mt-4">
                            {isSignup ? (
                                <>
                                    Already have an account?{" "}
                                    <a onClick={toggleForm} className="text-blue-400 underline hover:text-purple-200">Login</a>
                                </>
                            ) : (
                                <>
                                    Don’t have an account?{" "}
                                    <a onClick={toggleForm} className="text-blue-400 underline hover:text-purple-200">Sign Up</a>
                                </>
                            )}
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
