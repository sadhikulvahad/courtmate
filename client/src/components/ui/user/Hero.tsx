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
    <div className="relative h-[500px] overflow-hidden px-4 md:px-10 lg:px-28 mx-auto ">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 m-12 rounded rounded-2xl"
        style={{
          backgroundImage: `url(${heroData[currentIndex].image})`,
          opacity: 0.9,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60 rounded rounded-2xl"></div>
      </div>

      {/* Content */}
      <div className="container relative z-10 flex flex-col items-start justify-center h-full text-white m-8">
        <div
          className="max-w-xl transition-all duration-700 transform translate-x-0"
          key={currentIndex}
        >
          <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-5xl">
            {heroData[currentIndex].motto}
          </h1>
          <p className="mb-8 text-lg text-gray-200">
            {heroData[currentIndex].description}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <button className="bg-white px-6 py-2 rounded rounded-md hover:bg-gray-500 text-black font-poppins transition-all duration-300"
          onClick={() => navigate('/advocates')}>
            EXPLORE
          </button>
          <button className="text-white hover:bg-gray-900 bg-black px-6 py-2 rounded rounded-md font-poppinstransition-all duration-300">
            BOOKINGS
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center">
          <div className="absolute pt-6 pr-20 left-0 right-0 flex justify-center gap-2">
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
    </div>
  );
};

export default Hero;
