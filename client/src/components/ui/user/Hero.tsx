import React, { useState, useEffect } from "react";
import { heroData } from "./datas/heroData";
import { useNavigate } from "react-router-dom";

const Hero: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden px-4 md:px-10 lg:px-28 mx-auto">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${heroData[currentIndex].image})`,
          opacity: 0.9,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60 "></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center md:items-start justify-center h-full text-white text-center md:text-left px-2 sm:px-6">
        <div
          className="max-w-lg transition-all duration-700 transform"
          key={currentIndex}
        >
          <h1 className="mb-6 text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">
            {heroData[currentIndex].motto}
          </h1>
          <p className="mb-8 text-sm sm:text-base md:text-lg text-gray-200">
            {heroData[currentIndex].description}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center md:justify-start gap-4">
          <button
            className="bg-white px-6 py-2 rounded-md hover:bg-gray-500 text-black font-poppins transition-all duration-300"
            onClick={() => navigate("/advocates")}
          >
            EXPLORE
          </button>
          <button
            className="text-white hover:bg-gray-900 bg-black px-6 py-2 rounded-md font-poppins transition-all duration-300"
            onClick={() => navigate("/bookings")}
          >
            BOOKINGS
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
          {heroData.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentIndex === index ? "bg-white w-4" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
