import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeField, setActiveField] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login({ email, password });

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Log in to discover amazing ideas</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-shake">
                {error}
              </div>
            )}

            {/* EMAIL */}
            <div className="relative mt-2">
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setActiveField('email')}
                onBlur={() => setActiveField('')}
                required
                className={`
                  peer w-full pl-12 pr-4 pt-5 pb-2 border-2 rounded-lg
                  text-gray-900 bg-white placeholder-transparent
                  border-gray-300 focus:border-red-500
                  transition-all focus:outline-none
                `}
                placeholder="Email address"
                autoComplete="email"
              />
              {/* floating labela */}
              <label
                htmlFor="email"
                className={`
                  absolute left-12 bg-white px-1 transition-all duration-200 pointer-events-none z-10
                  ${activeField === 'email' || email
                    ? '-top-2 text-xs text-red-500'
                    : 'top-1/2 -translate-y-1/2 text-gray-400'}
                `}
                style={{
                  lineHeight: '1.1',
                }}
              >
                Email address
              </label>
              {/* ikonica */}
              <svg className={`
                  absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors
                  ${activeField === 'email' || email ? 'text-red-500' : 'text-gray-400'}
                `}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>

            {/* PASSWORD */}
            <div className="relative mt-2">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setActiveField('password')}
                onBlur={() => setActiveField('')}
                required
                className={`
                  peer w-full pl-12 pr-12 pt-5 pb-2 border-2 rounded-lg
                  text-gray-900 bg-white placeholder-transparent
                  border-gray-300 focus:border-red-500
                  transition-all focus:outline-none
                `}
                placeholder="Password"
                autoComplete="current-password"
              />
              {/* floating labela */}
              <label
                htmlFor="password"
                className={`
                  absolute left-12 bg-white px-1 transition-all duration-200 pointer-events-none z-10
                  ${activeField === 'password' || password
                    ? '-top-2 text-xs text-red-500'
                    : 'top-1/2 -translate-y-1/2 text-gray-400'}
                `}
                style={{
                  lineHeight: '1.1',
                }}
              >
                Password
              </label>
              {/* ikonica */}
              <svg className={`
                  absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors
                  ${activeField === 'password' || password ? 'text-red-500' : 'text-gray-400'}
                `}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              {/* Show/hide password */}
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none z-20"
                aria-label={showPassword ? "Sakrij lozinku" : "Prikaži lozinku"}
              >
                {showPassword ? (
                  // Otvoreno oko
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  // Precrtano oko
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full relative overflow-hidden border-2 border-red-500 bg-transparent text-red-500 py-3 rounded-lg font-semibold
                transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group
                ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Animirani crveni background */}
              <span className="
                absolute left-0 top-0 w-0 h-full bg-red-500 transition-all duration-300 group-hover:w-full z-0
              "></span>
              <span className="
                relative z-10 transition-colors duration-300 group-hover:text-white w-full flex justify-center
              ">
                {loading ? <LoadingSpinner size="sm" /> : 'Log In'}
              </span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-red-500 hover:text-red-600 font-semibold">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
