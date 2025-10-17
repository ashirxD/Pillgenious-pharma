import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { toast } from 'react-toastify';
import Header from '../layout/header'

// Real API function for register
const registerUser = async ({ email, password, name }) => {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    console.error('Failed to parse JSON from /api/auth/register:', text);
    throw new Error('Invalid JSON response from server');
  }

  if (!res.ok) throw new Error(data.error || res.statusText || 'Registration failed');
  return data; // { user, token }
};

// Custom hook to mimic React Query's useMutation behavior (same as Login.jsx)
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

// Signup Page Component (moved)
export default function SignupPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      try {
        useAuthStore.getState().setAuth({ token: data.token, user: data.user });
      } catch (e) {
        console.warn('Unable to update auth store', e);
      }
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      navigate('/dashboard');
      setTimeout(() => toast.success(`Registration successful! Welcome ${data.user.name}`), 0);
    },
    onError: (err) => {
      toast.error(err?.message || 'Registration failed')
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    registerMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="signup" onNavigate={onNavigate} />
      
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Account</h2>
          
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>

            {registerMutation.isError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {registerMutation.error.message}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={registerMutation.isPending}
              className="w-full bg-teal-700 text-white py-3 rounded-md font-semibold hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registerMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : 'Create Account'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-teal-700 font-semibold hover:text-teal-800 transition-colors"
              >
                Login
              </button>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          Try: taken@test.com to see registration error
        </div>
      </div>
    </div>
  );
}
