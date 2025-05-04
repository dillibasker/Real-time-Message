import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();

    // Validate form
    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      navigate('/chat');
    } catch (err) {
      // Error is handled by the auth context
      console.error('Login error', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-primary-dark)] to-[var(--color-primary)] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center mb-4">
            <MessageSquare size={32} color="white" />
          </div>
          <h1 className="text-2xl font-bold text-center">Welcome Back</h1>
          <p className="text-[var(--color-text-secondary)] text-center mt-1">
            Sign in to continue to WhatsApp Clone
          </p>
        </div>

        {(error || formError) && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
            <AlertCircle size={16} />
            <p className="text-sm">{error || formError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-[var(--color-text)] mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-[var(--color-text)] mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="app-button w-full mb-4"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-[var(--color-text-secondary)]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[var(--color-primary-dark)] hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;