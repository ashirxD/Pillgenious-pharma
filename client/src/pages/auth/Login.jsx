import React, { useState } from 'react';
import SignupPage from './SignUp';
import { toast } from 'react-toastify';
import { useLogin } from '../../hooks/api/useAuth';

// Login Page Component
export function LoginPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Use React Query login mutation
  const loginMutation = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData, {
      onSuccess: () => {
        setFormData({ email: '', password: '' });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Login</h2>
          
          <div className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Enter Email or Username"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>

            {loginMutation.isError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {loginMutation.error?.message || 'Login failed'}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loginMutation.isPending}
              className="w-full bg-teal-700 text-white py-3 rounded-md font-semibold hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : 'Login'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm mb-4">
              Don't have an account? Create one below 👇
            </p>
            <button
              onClick={() => onNavigate('signup')}
              className="w-full bg-white text-teal-700 border-2 border-teal-700 py-3 rounded-md font-semibold hover:bg-teal-50 transition-colors"
            >
              Register
            </button>
          </div>

          <div className="mt-4 text-center">
            <button className="text-teal-700 hover:text-teal-800 text-sm transition-colors">
              Forgot Password?
            </button>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          Try: error@test.com to see error handling
        </div>
      </div>
    </div>
  );
}

export default null