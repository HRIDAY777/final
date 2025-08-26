import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../stores/authStore';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
    remember: true
  });
  const [validationErrors, setValidationErrors] = useState<Partial<LoginForm>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const validateForm = (): boolean => {
    const errors: Partial<LoginForm> = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage(null);
    
    if (!validateForm()) {
      return;
    }

    const ok = await login({ email: formData.email, password: formData.password });
    if (ok) navigate('/dashboard');
  };

  const handleInputChange = (field: keyof LoginForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const fillDemo = (type: 'admin' | 'teacher' | 'student') => {
    const demoCredentials = {
      admin: { email: 'admin@edu.com', password: 'password' },
      teacher: { email: 'teacher@edu.com', password: 'password' },
      student: { email: 'student@edu.com', password: 'password' }
    };
    
    const credentials = demoCredentials[type];
    setFormData(prev => ({
      ...prev,
      email: credentials.email,
      password: credentials.password
    }));
    
    // Clear any validation errors
    setValidationErrors({});
  };

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
              <p className="text-2xl font-bold">23+</p>
              <p className="text-sm text-white/80">Integrated Modules</p>
            </div>
            <div className="backdrop-blur-xs bg-white/10 rounded-xl p-4">
              <p className="text-2xl font-bold">AI-Powered</p>
              <p className="text-sm text-white/80">Smart Analytics</p>
            </div>
            <div className="backdrop-blur-xs bg-white/10 rounded-xl p-4">
              <p className="text-2xl font-bold">Multi-Role</p>
              <p className="text-sm text-white/80">Access Control</p>
            </div>
            <div className="backdrop-blur-xs bg-white/10 rounded-xl p-4">
              <p className="text-2xl font-bold">Real-time</p>
              <p className="text-sm text-white/80">Collaboration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right sign-in card */}
      <div className="flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-large p-8">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-green-500 text-white grid place-items-center">🎓</div>
          <h2 className="mt-4 text-center text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-1 text-center text-sm text-gray-500">Sign in to your EduCore Ultra account</p>

          {/* Success Message */}
          {successMessage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email" 
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.email ? 'border-red-300' : 'border-gray-300'
                  }`} 
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={formData.password} 
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password" 
                  className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.password ? 'border-red-300' : 'border-gray-300'
                  }`} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center text-sm text-gray-600">
                <input 
                  type="checkbox" 
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                  checked={formData.remember} 
                  onChange={(e) => handleInputChange('remember', e.target.checked)} 
                /> 
                Remember me
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                {error}
              </div>
            )}

            {/* Sign In Button */}
            <button 
              disabled={isLoading} 
              className="w-full py-2 rounded-md text-white bg-gradient-to-r from-indigo-600 to-green-500 hover:opacity-95 transition disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Social Login Options */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
                <span className="ml-2">Microsoft</span>
              </button>
            </div>
          </div>

          {/* Demo Users */}
          <div className="mt-6">
            <p className="text-xs text-center text-gray-500 mb-2">DEMO USERS</p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <button 
                onClick={() => fillDemo('admin')} 
                className="border rounded-md p-2 hover:bg-gray-50 text-left transition"
              >
                <div className="font-medium">Admin</div>
                <div className="text-gray-500 text-xs">admin@edu.com</div>
              </button>
              <button 
                onClick={() => fillDemo('teacher')} 
                className="border rounded-md p-2 hover:bg-gray-50 text-left transition"
              >
                <div className="font-medium">Teacher</div>
                <div className="text-gray-500 text-xs">teacher@edu.com</div>
              </button>
              <button 
                onClick={() => fillDemo('student')} 
                className="border rounded-md p-2 hover:bg-gray-50 text-left transition"
              >
                <div className="font-medium">Student</div>
                <div className="text-gray-500 text-xs">student@edu.com</div>
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-500 font-medium">
              Sign up
            </Link>
          </p>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-center space-x-6 text-xs text-gray-500">
              <a href="/terms" className="hover:text-gray-700">Terms of Service</a>
              <a href="/privacy" className="hover:text-gray-700">Privacy Policy</a>
              <a href="/support" className="hover:text-gray-700">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


