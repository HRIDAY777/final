import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../stores/authStore';
import { EnvelopeIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ForgotPassword: React.FC = () => {
  const { resetPassword, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validateEmail(email)) {
      return;
    }

    const success = await resetPassword(email);
    if (success) {
      setIsSubmitted(true);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError('');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left hero */}
        <div className="relative hidden lg:block">
          <img 
            src="https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1600&auto=format&fit=crop" 
            alt="Classroom" 
            className="absolute inset-0 w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/80 via-blue-700/50 to-transparent" />
          <div className="relative h-full p-12 text-white flex flex-col justify-center">
            <h1 className="text-5xl font-extrabold tracking-tight drop-shadow">EduCore Ultra</h1>
            <p className="mt-4 text-lg max-w-xl">The future of school management is here. Powered by AI, designed for excellence.</p>
          </div>
        </div>

        {/* Right success card */}
        <div className="flex items-center justify-center bg-gray-50 p-6">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-large p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              We&apos;ve sent a password reset link to <strong>{email}</strong>
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Didn&apos;t receive the email?</p>
                  <ul className="space-y-1 text-left">
                    <li>• Check your spam folder</li>
                    <li>• Make sure you entered the correct email address</li>
                    <li>• Wait a few minutes before requesting another link</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
                className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
              >
                Try another email
              </button>
              <Link
                to="/login"
                className="block w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-md hover:opacity-95 transition"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left hero */}
      <div className="relative hidden lg:block">
        <img 
          src="https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1600&auto=format&fit=crop" 
          alt="Classroom" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/80 via-blue-700/50 to-transparent" />
        <div className="relative h-full p-12 text-white flex flex-col justify-center">
          <h1 className="text-5xl font-extrabold tracking-tight drop-shadow">EduCore Ultra</h1>
          <p className="mt-4 text-lg max-w-xl">The future of school management is here. Powered by AI, designed for excellence.</p>
          <div className="mt-10 grid grid-cols-2 gap-4 max-w-xl">
            <div className="backdrop-blur-xs bg-white/10 rounded-xl p-4">
              <p className="text-2xl font-bold">Secure</p>
              <p className="text-sm text-white/80">Password Reset</p>
            </div>
            <div className="backdrop-blur-xs bg-white/10 rounded-xl p-4">
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-sm text-white/80">Support Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form card */}
      <div className="flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-large p-8">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-green-500 text-white grid place-items-center">🔐</div>
          <h2 className="mt-4 text-center text-2xl font-bold text-gray-900">Forgot Password?</h2>
          <p className="mt-1 text-center text-sm text-gray-500">
            No worries! Enter your email and we&apos;ll send you reset instructions.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="email" 
                  value={email} 
                  onChange={handleEmailChange}
                  placeholder="Enter your email address" 
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    emailError ? 'border-red-300' : 'border-gray-300'
                  }`} 
                />
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                {error}
              </div>
            )}

            <button 
              disabled={isLoading} 
              className="w-full py-2 rounded-md text-white bg-gradient-to-r from-blue-600 to-green-500 hover:opacity-95 transition disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending Reset Link...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              ← Back to Sign In
            </Link>
          </div>

          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-3">
              If you&apos;re having trouble accessing your account, contact our support team.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Email Support:</span>
                <a href="mailto:support@educore.com" className="text-blue-600 hover:text-blue-500">
                  support@educore.com
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Phone Support:</span>
                <a href="tel:+1-800-EDUCORE" className="text-blue-600 hover:text-blue-500">
                  1-800-EDUCORE
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
