import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const result = isLogin
      ? await login({ email, password })
      : await register({ username, email, password });

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Authentication failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md mx-auto px-4">
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full -mr-20 -mt-20 opacity-50" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-gray-100 to-gray-200 rounded-full -ml-16 -mb-16 opacity-50" />
          
          {/* Sliding container */}
          <div className="relative flex transition-transform duration-700 ease-in-out" style={{ transform: isLogin ? 'translateX(0)' : 'translateX(-100%)' }}>
            {/* Login Form */}
            <div className="w-full flex-shrink-0 p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
              <p className="text-gray-600 mb-8">Log in to discover amazing ideas</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && isLogin && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-shake">
                    {error}
                  </div>
                )}

                {/* Email Field */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-gray-800 focus:outline-none transition-all"
                    placeholder="Email address"
                  />
                </div>

                {/* Password Field */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-gray-800 focus:outline-none transition-all"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isLogin}
                  className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50"
                >
                  {loading && isLogin ? <LoadingSpinner size="sm" /> : 'Log In'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-gray-900 hover:text-gray-700 font-semibold"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </div>

            {/* Register Form */}
            <div className="w-full flex-shrink-0 p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Join Us</h2>
              <p className="text-gray-600 mb-8">Create an account to get started</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && !isLogin && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-shake">
                    {error}
                  </div>
                )}

                {/* Username Field */}
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={!isLogin}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-gray-800 focus:outline-none transition-all"
                    placeholder="Username"
                  />
                </div>

                {/* Email Field */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-gray-800 focus:outline-none transition-all"
                    placeholder="Email address"
                  />
                </div>

                {/* Password Field */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-gray-800 focus:outline-none transition-all"
                    placeholder="Password"
                  />
                </div>

                {/* Confirm Password Field */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isLogin}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-gray-800 focus:outline-none transition-all"
                    placeholder="Confirm Password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || isLogin}
                  className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50"
                >
                  {loading && !isLogin ? <LoadingSpinner size="sm" /> : 'Sign Up'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-gray-900 hover:text-gray-700 font-semibold"
                  >
                    Log In
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};