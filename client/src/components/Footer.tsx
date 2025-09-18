import React from 'react';
import { Scale, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

import playStore from '../assets/playstore.png'
import Apple from '../assets/apple white.jpeg'

const Footer: React.FC = () => {
  return (
    <footer className="py-12 text-white bg-darkbluegray px-4 md:px-10 lg:px-28 mx-auto">
      <div className="container">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1">
            <div className="flex items-center mb-4 space-x-2">
              <Scale className="w-6 h-6" />
              <h2 className="text-xl font-bold">COURTMATE</h2>
            </div>
            <p className="mb-6 text-sm text-gray-400">
              Expert Legal Guidance, Ready When You Need It.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="transition-colors hover:text-gray-300">
                <Facebook size={20} />
              </a>
              <a href="#" className="transition-colors hover:text-gray-300">
                <Twitter size={20} />
              </a>
              <a href="#" className="transition-colors hover:text-gray-300">
                <Instagram size={20} />
              </a>
              <a href="#" className="transition-colors hover:text-gray-300">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* Links Section */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">HOME</a></li>
              <li><a href="#services" className="text-gray-400 hover:text-white">SERVICES</a></li>
              <li><a href="#advocates" className="text-gray-400 hover:text-white">ADVOCATES</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">CATEGORY</a></li>
            </ul>
          </div>
          
          {/* Support Section */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">ABOUT US</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">CONTACT US</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">PAYMENT & SUPPORT</a></li>
            </ul>
          </div>
          
          {/* App Download Section */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Download App</h3>
            <div className="flex flex-col space-y-2">
              <a href="#" className="flex items-center p-2 space-x-2 transition-colors bg-black border border-gray-700 rounded hover:bg-gray-800">
                <div className="w-8 h-8 flex-shrink-0">
                  <img src={playStore} alt="" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Get it on</div>
                  <div className="text-sm font-medium">Google Play</div>
                </div>
              </a>
              
              <a href="#" className="flex items-center p-2 space-x-2 transition-colors bg-black border border-gray-700 rounded hover:bg-gray-800">
                <div className="w-8 h-8 flex-shrink-0">
                  <img src={Apple} alt="" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Download on the</div>
                  <div className="text-sm font-medium">App Store</div>
                </div>
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 mt-12 text-sm text-center text-gray-500 border-t border-gray-800">
          <p>© 2025 CourtMate Network Ltd. | Terms of Use | Privacy Policy | Disclaimer</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;