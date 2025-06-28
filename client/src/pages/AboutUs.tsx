// import React from 'react';
import NavBar from "@/components/ui/NavBar";
import {
  Shield,
  Users,
  Clock,
  Heart,
  Scale,
  CheckCircle,
  ArrowRight,
  Star,
  Globe,
  Phone,
  Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AboutPage = () => {
  const navigate = useNavigate();
  const stats = [
    { icon: Users, label: "Registered Advocates", value: "1,500+" },
    { icon: CheckCircle, label: "Cases Resolved", value: "10,000+" },
    { icon: Star, label: "Client Satisfaction", value: "4.8/5" },
    { icon: Globe, label: "Cities Covered", value: "50+" },
  ];

  const features = [
    {
      icon: Shield,
      title: "Verified Professionals",
      description:
        "All advocates are thoroughly verified with proper credentials and bar council registration",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description:
        "Round-the-clock customer support to help you with your legal queries and bookings",
    },
    {
      icon: Scale,
      title: "Expert Legal Advice",
      description:
        "Get consultation from experienced lawyers across various specializations",
    },
    {
      icon: Heart,
      title: "Client-Centric Approach",
      description:
        "We prioritize your needs and ensure personalized legal solutions",
    },
  ];

  const team = [
    {
      name: "Rajesh Mehta",
      role: "Founder & CEO",
      experience: "15+ years in Legal Tech",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      description:
        "Former practicing advocate turned entrepreneur, passionate about making legal services accessible.",
    },
    {
      name: "Priya Sharma",
      role: "Chief Legal Officer",
      experience: "12+ years Legal Practice",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616c6c1c2eb?w=300&h=300&fit=crop&crop=face",
      description:
        "Senior advocate specializing in corporate law, ensuring quality and compliance.",
    },
    {
      name: "Amit Kumar",
      role: "Head of Technology",
      experience: "10+ years in Tech",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      description:
        "Technology expert focused on creating seamless user experiences and secure platforms.",
    },
  ];

  const milestones = [
    {
      year: "2020",
      event: "Company Founded",
      description: "Started with a vision to digitize legal services",
    },
    {
      year: "2021",
      event: "First 100 Advocates",
      description:
        "Reached our first milestone of registered legal professionals",
    },
    {
      year: "2022",
      event: "Mobile App Launch",
      description: "Launched mobile application for better accessibility",
    },
    {
      year: "2023",
      event: "10,000+ Cases",
      description: "Successfully facilitated over 10,000 legal consultations",
    },
    {
      year: "2024",
      event: "Pan-India Expansion",
      description: "Extended services to 50+ cities across India",
    },
  ];

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#0D1B2A] via-[#1B263B] to-[#0D1B2A]">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                About <span className="text-yellow-300">CourtMate</span>
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Bridging the gap between clients and legal experts through
                technology, making quality legal services accessible to
                everyone.
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-50 to-transparent"></div>
        </section>

        {/* Stats Section */}
        <section className="py-16 -mt-10 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow border border-gray-100"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-8">
                  Our Mission
                </h2>
                <div className="space-y-6">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    At CourtMate, we believe that everyone deserves access to
                    quality legal representation. Our platform connects clients
                    with verified, experienced advocates across India, making
                    legal services more transparent, accessible, and efficient.
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    We're committed to revolutionizing the legal industry by
                    leveraging technology to create meaningful connections
                    between legal professionals and those who need their
                    expertise.
                  </p>
                  <div className="flex items-center space-x-4 bg-blue-50 p-4 rounded-lg">
                    <Scale className="w-8 h-8 text-blue-600 flex-shrink-0" />
                    <p className="text-blue-800 font-medium">
                      "Justice delayed is justice denied. We're here to ensure
                      swift access to legal help."
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Our Vision
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">
                        Democratize access to legal services across India
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">
                        Create a transparent legal ecosystem
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">
                        Empower advocates with digital tools
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">
                        Build trust through verified credentials
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose CourtMate?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're more than just a booking platform - we're your trusted
                partner in legal services
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    className="text-center group hover:scale-105 transition-transform"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-600 rounded-full mb-6 group-hover:shadow-lg hover:bg-gray-700 transition-shadow">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our Journey
              </h2>
              <p className="text-xl text-gray-600">
                Key milestones in our mission to transform legal services
              </p>
            </div>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className={`flex items-center ${
                      index % 2 === 0 ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`w-5/12 ${
                        index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"
                      }`}
                    >
                      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          {milestone.year}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {milestone.event}
                        </h3>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    </div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Meet Our Team
              </h2>
              <p className="text-xl text-gray-600">
                The passionate people behind CourtMate
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100"
                >
                  <div className="relative">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 font-semibold mb-2">
                      {member.role}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      {member.experience}
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      {member.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA Section */}
        <section className="py-20 bg-gradient-to-b from-[#0D1B2A] via-[#1B263B] to-[#0D1B2A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied clients who have found their perfect
              legal match through CourtMate
            </p>

            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                className="bg-white text-[#1B263B] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
                onClick={() => navigate("/advocates")}
              >
                Find an Advocate
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#1B263B] transition-colors flex items-center justify-center"
                onClick={() => navigate("/contactUs")}
              >
                <Phone className="mr-2 w-5 h-5" />
                Contact Us
              </button>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <Phone className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-gray-200">+91 1800-123-4567</p>
              </div>
              <div>
                <Mail className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-gray-200">info@courtmate.com</p>
              </div>
              <div>
                <Globe className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-gray-200">Available 24/7</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;
