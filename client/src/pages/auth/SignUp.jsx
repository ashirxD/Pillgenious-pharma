import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
function useMutation({ mutationFn, onSuccess }) {
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
    }
  };

  return { mutate, isPending, isError, error };
}

// Simple Header component used in Login.jsx as well
function Header({ currentPage, onNavigate }) {
  return (
    <header className="bg-teal-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span className="text-xl font-bold">Pillgenious</span>
        </div>
        <nav className="hidden md:flex space-x-6">
          <button className="hover:text-teal-200 transition-colors">Home</button>
          <button className="hover:text-teal-200 transition-colors">Products</button>
          <button className="hover:text-teal-200 transition-colors">Brands</button>
          <button className="hover:text-teal-200 transition-colors">Features</button>
          <button className="hover:text-teal-200 transition-colors">Alerts</button>
          <button className="hover:text-teal-200 transition-colors">Blogs</button>
          <button className="hover:text-teal-200 transition-colors">Consultation</button>
          <button 
            onClick={() => onNavigate('login')}
            className={currentPage === 'login' ? 'text-teal-200 font-semibold' : 'hover:text-teal-200 transition-colors'}
          >
            Login
          </button>
        </nav>
      </div>
    </header>
  );
}

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
        localStorage.setItem('authToken', data.token);
      } catch (e) {
        console.warn('Unable to access localStorage', e);
      }
      alert(`Registration successful! Welcome ${data.user.name}`);
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      navigate('/dashboard');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
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
