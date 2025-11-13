import React, { useState } from 'react';
import { Pill, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useLogin } from '../../hooks/api/useAuth';

// Login Page Component
export default function LoginPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData, {
      onSuccess: () => {
        setFormData({ email: '', password: '' });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl shadow-lg mb-4">
            <Pill className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pillgenious Pharma</h1>
          <p className="text-gray-600">Welcome back! Please sign in</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email or Username"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>
              <button className="text-teal-700 hover:text-teal-800 font-medium transition-colors">
                Forgot Password?
              </button>
            </div>

            {loginMutation.isError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                {loginMutation.error?.message || 'Login failed'}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loginMutation.isPending}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3.5 rounded-xl font-semibold hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg shadow-teal-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing In...
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-gray-600 text-sm text-center mb-4">
              Don't have an account yet?
            </p>
            <button
              onClick={() => onNavigate('signup')}
              className="w-full bg-teal-50 text-teal-700 border-2 border-teal-200 py-3 rounded-xl font-semibold hover:bg-teal-100 hover:border-teal-300 transition-all"
            >
              Create New Account
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}