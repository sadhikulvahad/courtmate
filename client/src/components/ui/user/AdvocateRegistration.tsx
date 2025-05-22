import React from 'react';
// import { Scale } from 'lucide-react';

const AdvocateRegistration: React.FC = () => {
  return (
    <section className="py-16 bg-white px-4 md:px-10 lg:px-28 mx-auto" id="register">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-6 p-8 text-center md:text-left md:flex-row">
          <div className="md:flex-1">
            <h2 className="mb-4 text-3xl font-bold">ARE YOU AN ADVOCATE?</h2>
            <p className="mb-6 text-gray-600">
              Join our platform to connect with clients, grow your practice, and increase your visibility in the legal community.
            </p>
          </div>
          
          <button className="px-8 py-3 text-white transition-colors bg-gray-900 rounded-md hover:bg-gray-800">
            REGISTER NOW
          </button>
        </div>
      </div>
    </section>
  );
};

export default AdvocateRegistration;