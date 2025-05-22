import React from "react";
import { serviceData } from "./datas/serviceData";
// import { Scale } from 'lucide-react';

const Services: React.FC = () => {
  return (
    <div className="py-16 bg-white px-4 md:px-10 lg:px-28 mx-auto">
      <div className="text-2xl font-poppins font-bold flex justify-center items-center text-gray-800" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.25)' }}>
        <span>OUR SERVICES</span>
      </div>
      <div className="flex justify-center items-center mt-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pt-6 ">
          {serviceData.map((service, index) => (
            <div key={index} className="card group w-full bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow duration-300 border border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="mb-2 text-xl font-bold">{service.title}</h3>
                  <p className="mb-4 text-md text-gray-600">
                    {service.description}
                  </p>
                </div>
              </div>
              {/* <button className="w-full py-1 mt-2 text-sm text-center transition-colors border border-gray-300 rounded hover:bg-gray-100">
                Details
              </button> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
