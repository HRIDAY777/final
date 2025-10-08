import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container-responsive">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">EU</span>
              </div>
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">EduCore Ultra</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-primary-responsive"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-responsive">
        <div className="container-responsive text-center">
          <h1 className="hero-title-responsive">
            Welcome to EduCore Ultra
          </h1>
          <p className="hero-subtitle-responsive">
            The most comprehensive school management system designed to streamline educational operations and enhance learning outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="btn-primary-responsive text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
            >
              Access Dashboard
            </Link>
            <Link
              to="/register"
              className="btn-secondary-responsive text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-responsive bg-white">
        <div className="container-responsive">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Comprehensive School Management
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600">
              Everything you need to manage your educational institution efficiently
            </p>
          </div>
          
          <div className="feature-grid-responsive">
            <div className="feature-card-responsive">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl sm:text-2xl">👥</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Student Management</h3>
              <p className="text-sm sm:text-base text-gray-600">Complete student lifecycle management with enrollment, attendance, and academic tracking.</p>
            </div>
            
            <div className="feature-card-responsive">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl sm:text-2xl">👨‍🏫</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Teacher Management</h3>
              <p className="text-sm sm:text-base text-gray-600">Comprehensive teacher profiles, assignments, schedules, and performance tracking.</p>
            </div>
            
            <div className="feature-card-responsive">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl sm:text-2xl">📊</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Analytics & Reports</h3>
              <p className="text-sm sm:text-base text-gray-600">Comprehensive analytics dashboard with real-time insights and reporting.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Institution?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of educational institutions already using EduCore Ultra to streamline their operations.
          </p>
          <Link
            to="/dashboard"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block"
          >
            Access Dashboard Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EU</span>
            </div>
            <span className="text-xl font-bold">EduCore Ultra</span>
          </div>
          <p className="text-gray-400">
            Empowering education through technology with comprehensive school management solutions.
          </p>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EduCore Ultra. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
