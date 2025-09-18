import React from "react";
import { serviceData } from "./datas/serviceData";
import NavBar from "../NavBar";
import { useLocation, useNavigate } from "react-router-dom";

const Services: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate()
  return (
    <>
      {location.pathname === "/services" && <NavBar />}
      <div className="py-16 bg-white px-4 md:px-10 lg:px-28 mx-auto">
        {/* Title Section */}
        <div className="text-2xl font-bold text-center text-gray-800 mb-8">
          OUR LEGAL SERVICES
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {serviceData.map((service, index) => (
            <div
              key={index}
              className="bg-white border rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{service.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{service.description}</p>
                  <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                    {service.bullets?.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-4 text-right">
                <button className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                onClick={() => navigate('/advocates')}>
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 bg-blue-50 py-12 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Need Legal Help?
          </h2>
          <p className="text-gray-600 mb-6">
            Get in touch with us today for professional and confidential legal
            support.
          </p>
          <a
            href="/contactUs"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Contact Us
          </a>
        </div>
      </div>
    </>
  );
};

export default Services;
