import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  HelpCircle,
  User,
  FileText,
  // Calendar,
  Shield,
  CheckCircle,
} from "lucide-react";
import NavBar from "@/components/ui/NavBar";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "general",
    message: "",
    urgency: "normal",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone Support",
      primary: "+91 1800-123-4567",
      secondary: "+91 98765-43210",
      description: "Available 24/7 for urgent legal matters",
      color: "bg-[#1B263B]",
    },
    {
      icon: Mail,
      title: "Email Support",
      primary: "support@courtmate.com",
      secondary: "info@courtmate.com",
      description: "We respond within 2 hours",
      color: "bg-[#415A77]",
    },
    {
      icon: MapPin,
      title: "Head Office",
      primary: "123 Legal Plaza, Connaught Place",
      secondary: "New Delhi - 110001, India",
      description: "Visit us for in-person consultations",
      color: "bg-[#415A]",
    },
    {
      icon: Clock,
      title: "Business Hours",
      primary: "Mon - Fri: 9:00 AM - 8:00 PM",
      secondary: "Sat - Sun: 10:00 AM - 6:00 PM",
      description: "Emergency support available 24/7",
      color: "bg-[#778DA9]",
    },
  ];

  const departments = [
    {
      icon: HelpCircle,
      name: "General Inquiry",
      email: "info@courtmate.com",
      description: "General questions about our services",
    },
    {
      icon: User,
      name: "Client Support",
      email: "support@courtmate.com",
      description: "Help with bookings and account issues",
    },
    {
      icon: Shield,
      name: "Legal Team",
      email: "legal@courtmate.com",
      description: "Legal compliance and verification queries",
    },
    {
      icon: FileText,
      name: "Business Partnerships",
      email: "partners@courtmate.com",
      description: "Advocate registration and partnerships",
    },
  ];

  const faqCategories = [
    {
      category: "Booking Process",
      questions: [
        "How do I book an appointment with an advocate?",
        "Can I cancel or reschedule my booking?",
        "What payment methods do you accept?",
      ],
    },
    {
      category: "Advocate Verification",
      questions: [
        "How do you verify advocate credentials?",
        "Can I see advocate reviews and ratings?",
        "What if I'm not satisfied with the service?",
      ],
    },
    {
      category: "Technical Support",
      questions: [
        "I'm having trouble with the website/app",
        "How do I reset my password?",
        "Is my personal information secure?",
      ],
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        category: "general",
        message: "",
        urgency: "normal",
      });
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Message Sent Successfully!
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for contacting us. We'll get back to you within 2 hours.
          </p>
          <div className="text-sm text-gray-500">
            Redirecting you back to the contact form...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#0D1B2A] via-[#1B263B] to-[#0D1B2A]">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Get In <span className="text-[#FFD54F]">Touch</span>
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                Need help finding the right legal expert? Have questions about
                our services? We're here to assist you every step of the way.
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#ECEFF1] to-transparent"></div>
        </section>

        {/* Contact Information Cards */}
        <section className="py-16 -mt-10 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                  >
                    <div className={`${info.color} p-4`}>
                      <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-lg mx-auto">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {info.title}
                      </h3>
                      <p className="text-gray-800 font-semibold text-sm mb-1">
                        {info.primary}
                      </p>
                      <p className="text-gray-600 text-sm mb-3">
                        {info.secondary}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {info.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Main Content Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <div>
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Send Us a Message
                    </h2>
                    <p className="text-gray-600">
                      Fill out the form below and we'll get back to you as soon
                      as possible.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        >
                          <option value="general">General Inquiry</option>
                          <option value="booking">Booking Support</option>
                          <option value="technical">Technical Issue</option>
                          <option value="partnership">Partnership</option>
                          <option value="complaint">Complaint</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Urgency
                        </label>
                        <select
                          name="urgency"
                          value={formData.urgency}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Brief description of your inquiry"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                        placeholder="Please provide detailed information about your inquiry..."
                      ></textarea>
                    </div>

                    <button
                      onClick={handleSubmit}
                      className="w-full bg-gray-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-900 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Departments & FAQ */}
              <div className="space-y-8">
                {/* Departments */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Contact Departments
                  </h3>
                  <div className="space-y-4">
                    {departments.map((dept, index) => {
                      const IconComponent = dept.icon;
                      return (
                        <div
                          key={index}
                          className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg flex-shrink-0">
                            <IconComponent className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {dept.name}
                            </h4>
                            <p className="text-sm text-blue-600 font-medium">
                              {dept.email}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {dept.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick FAQ */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                    <h3 className="text-2xl font-bold text-gray-900">
                      Common Questions
                    </h3>
                  </div>
                  <div className="space-y-6">
                    {faqCategories.map((category, index) => (
                      <div key={index}>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          {category.category}
                        </h4>
                        <ul className="space-y-2">
                          {category.questions.map((question, qIndex) => (
                            <li
                              key={qIndex}
                              className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer transition-colors"
                            >
                              • {question}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Need more help?</strong> Visit our comprehensive
                      FAQ section or schedule a call with our support team.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Contact Section */}
        <section className="py-16 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Phone className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Emergency Legal Support
                </h3>
                <p className="text-gray-600 mb-6">
                  For urgent legal matters that require immediate attention,
                  contact our emergency helpline
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      +91 1800-911-HELP
                    </div>
                    <div className="text-sm text-gray-500">
                      24/7 Emergency Hotline
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      emergency@courtmate.com
                    </div>
                    <div className="text-sm text-gray-500">
                      Priority Email Support
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactPage;
