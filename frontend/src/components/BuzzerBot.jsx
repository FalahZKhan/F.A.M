import React, { useState, useEffect } from 'react';
import robot from '../assets/robot.gif';

const BuzzerBot = ({ speechInput }) => {
  // Initial speech state
  const [speech, setSpeech] = useState(speechInput);

  useEffect(() => {
    setSpeech(speechInput);
  }, [speechInput]);

  return (
    <>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .float-animation {
            animation: float 2s ease-in-out infinite;
          }
        `}
      </style>

      <div className="fixed bottom-0 right-8 flex flex-col items-center z-20 cursor-pointer" style={{ fontFamily: "Poppins" }}>
        {/* Floating Speech Bubble */}
        <div
          className="bg-white text-black px-4 py-2 rounded-lg text-m relative max-w-xs text-center float-animation mb-[-14px]
                     before:content-[''] before:absolute before:bottom-[-6px] before:left-1/2 before:-translate-x-1/2
                     before:border-[6px] before:border-transparent before:border-t-white"
          style={{
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
          }}
        >
          {speech}
        </div>

        {/* Robot */}
        <img
          src={robot}
          alt="Robot"
          className="w-64 h-64"
          onMouseEnter={() => setSpeech("Eek! I’m buzzing with ideas—don’t distract me, I’m saving energy!")}
          onMouseLeave={() => setSpeech(speechInput)} 
          onMouseDown={() => setSpeech("Hey! I’m Buzzer, not a button! Wanna save some energy instead?")}
        />
      </div>
    </>
  );
};

export default BuzzerBot;
