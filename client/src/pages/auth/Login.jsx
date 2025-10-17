import React, { useState } from 'react';
import SignupPage from './SignUp';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { toast } from 'react-toastify';
import Header from '../layout/header'

// Real API function for login
  const loginUser = async ({ email, password }) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (err) {
      console.error('Failed to parse JSON from /api/auth/login:', text);
      throw new Error('Invalid JSON response from server');
    }

    if (!res.ok) throw new Error(data.error || res.statusText || 'Login failed');
    return data; // { user, token }
  };

// Custom hook to mimic React Query's useMutation behavior
function useMutation({ mutationFn, onSuccess, onError }) {
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (variables) => {
    setIsPending(true);
    setIsError(false);
    setError(null);
    
    try {
      const data = await mutationFn(variables);
      setIsPending(false);
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err) {
      setIsPending(false);
      setIsError(true);
      setError(err);
      if (onError) onError(err);
    }
  };

  return { mutate, isPending, isError, error };
}

// Header is now a shared component at ../layout/header

// Login Page Component
export function LoginPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // persist auth to zustand store (which itself persists to localStorage)
      try {
        useAuthStore.getState().setAuth({ token: data.token, user: data.user });
      } catch (e) {
        console.warn('Unable to update auth store', e);
      }
      // navigate to dashboard first, then show toast so it displays on the dashboard page
      setFormData({ email: '', password: '' });
      navigate('/dashboard');
      // small timeout ensures navigation happens before toast; keeps toast visible on dashboard
      setTimeout(() => toast.success(`Login successful! Welcome ${data.user.name}`), 0);
    }
    ,
    onError: (err) => {
      toast.error(err?.message || 'Login failed')
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="login" onNavigate={onNavigate} />
      
      <div className="max-w-md mx-auto px-4 py-16">
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