import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AuthRepository } from '../api/repositories/AuthRepository';

export const Auth: React.FC = () => {
  const [isActive, setIsActive] = useState(false); // false = Sign In, true = Sign Up
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(''); // koristi se i za success poruku (green)
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState('');

  const { login } = useAuth();
  const authRepo = new AuthRepository();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    const result = await login({ email, password });

    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await authRepo.register({ username, email, password }); // bez auto-login
    setLoading(false);

    if (result.success) {
      // safety: očisti sve tragove potencijalnog auto-logina (ako API vrati token)
      localStorage.removeItem('pinterest_token');
      localStorage.removeItem('pinterest_user');

      // prebaci UI na Sign In panel i prikaži success poruku
      setIsActive(false);
      setPassword('');
      setConfirmPassword('');
      setError('Registration successful! Please login.');
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-[30px] shadow-[0_5px_15px_rgba(0,0,0,0.35)] overflow-hidden w-[768px] max-w-full min-h-[520px]">

        {/* Sign Up Form (desna polovina) */}
        <div
          className={`absolute top-0 right-0 h-full w-1/2 transition-all duration-[600ms] ease-in-out will-change-transform
            ${isActive
              ? 'translate-x-0 opacity-100 z-[5] visible'
              : 'translate-x-full opacity-0 z-0 invisible pointer-events-none'}
          `}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <form onSubmit={handleRegister} className="bg-white flex items-center justify-center flex-col px-10 h-full">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Account</h1>

            {error && isActive && (
              <div className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm mb-4 animate-shake">
                {error}
              </div>
            )}

            {/* Username Field */}
            <div className="relative w-full mb-4">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setActiveField('username')}
                onBlur={() => setActiveField('')}
                required={isActive}
                className="w-full pl-12 pr-4 pt-5 pb-2 border-2 border-gray-300 rounded-lg text-gray-900 bg-white placeholder-transparent focus:border-red-500 focus:outline-none transition-all"
                placeholder="Username"
              />
              <label className={`absolute left-12 bg-white px-1 transition-all duration-200 pointer-events-none ${
                activeField === 'username' || username
                  ? 'top-0 -translate-y-1/2 text-xs text-red-500'
                  : 'top-1/2 -translate-y-1/2 text-gray-400'
              }`}>
                Username
              </label>
            </div>

            {/* Email Field */}
            <div className="relative w-full mb-4">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setActiveField('email2')}
                onBlur={() => setActiveField('')}
                required={isActive}
                className="w-full pl-12 pr-4 pt-5 pb-2 border-2 border-gray-300 rounded-lg text-gray-900 bg-white placeholder-transparent focus:border-red-500 focus:outline-none transition-all"
                placeholder="Email"
              />
              <label className={`absolute left-12 bg-white px-1 transition-all duration-200 pointer-events-none ${
                activeField === 'email2' || email
                  ? 'top-0 -translate-y-1/2 text-xs text-red-500'
                  : 'top-1/2 -translate-y-1/2 text-gray-400'
              }`}>
                Email address
              </label>
            </div>

            {/* Password Field */}
            <div className="relative w-full mb-4">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setActiveField('password2')}
                onBlur={() => setActiveField('')}
                required={isActive}
                className="w-full pl-12 pr-12 pt-5 pb-2 border-2 border-gray-300 rounded-lg text-gray-900 bg-white placeholder-transparent focus:border-red-500 focus:outline-none transition-all"
                placeholder="Password"
              />
              <label className={`absolute left-12 bg-white px-1 transition-all duration-200 pointer-events-none ${
                activeField === 'password2' || password
                  ? 'top-0 -translate-y-1/2 text-xs text-red-500'
                  : 'top-1/2 -translate-y-1/2 text-gray-400'
              }`}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Confirm Password Field */}
            <div className="relative w-full mb-6">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setActiveField('confirmPassword')}
                onBlur={() => setActiveField('')}
                required={isActive}
                className="w-full pl-12 pr-4 pt-5 pb-2 border-2 border-gray-300 rounded-lg text-gray-900 bg-white placeholder-transparent focus:border-red-500 focus:outline-none transition-all"
                placeholder="Confirm Password"
              />
              <label className={`absolute left-12 bg-white px-1 transition-all duration-200 pointer-events-none ${
                activeField === 'confirmPassword' || confirmPassword
                  ? 'top-0 -translate-y-1/2 text-xs text-red-500'
                  : 'top-1/2 -translate-y-1/2 text-gray-400'
              }`}>
                Confirm Password
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* Sign In Form (leva polovina) */}
        <div
          className={`absolute top-0 left-0 h-full w-1/2 transition-all duration-[600ms] ease-in-out will-change-transform
            ${isActive
              ? 'translate-x-full opacity-0 z-0 invisible pointer-events-none'
              : 'translate-x-0 opacity-100 z-[5] visible'}
          `}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <form onSubmit={handleLogin} className="bg-white flex items-center justify-center flex-col px-10 h-full">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Sign In</h1>

            {error && !isActive && (
              <div className={`w-full ${error.includes('successful') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-2 rounded-lg text-sm mb-4 animate-fadeIn`}>
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="relative w-full mb-4">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setActiveField('email')}
                onBlur={() => setActiveField('')}
                required
                className="w-full pl-12 pr-4 pt-5 pb-2 border-2 border-gray-300 rounded-lg text-gray-900 bg-white placeholder-transparent focus:border-red-500 focus:outline-none transition-all"
                placeholder="Email"
              />
              <label className={`absolute left-12 bg-white px-1 transition-all duration-200 pointer-events-none ${
                activeField === 'email' || email
                  ? 'top-0 -translate-y-1/2 text-xs text-red-500'
                  : 'top-1/2 -translate-y-1/2 text-gray-400'
              }`}>
                Email address
              </label>
            </div>

            {/* Password Field */}
            <div className="relative w-full mb-6">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setActiveField('password')}
                onBlur={() => setActiveField('')}
                required
                className="w-full pl-12 pr-12 pt-5 pb-2 border-2 border-gray-300 rounded-lg text-gray-900 bg-white placeholder-transparent focus:border-red-500 focus:outline-none transition-all"
                placeholder="Password"
              />
              <label className={`absolute left-12 bg-white px-1 transition-all duration-200 pointer-events-none ${
                activeField === 'password' || password
                  ? 'top-0 -translate-y-1/2 text-xs text-red-500'
                  : 'top-1/2 -translate-y-1/2 text-gray-400'
              }`}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Toggle Container (overlay) */}
        <div
          className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-[600ms] ease-in-out z-[1000] ${
            isActive ? '-translate-x-full' : ''
          }`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div
            className={`bg-gradient-to-r from-red-500 to-red-600 text-white relative -left-full h-full w-[200%] transition-all duration-[600ms] ease-in-out ${
              isActive ? 'translate-x-1/2' : 'translate-x-0'
            }`}
          >
            {/* Red panel with custom shape */}
            <div className="absolute inset-0">
              <div
                className={`absolute w-1/2 h-full bg-red-500 ${
                  isActive
                    ? 'right-0 rounded-tr-[30px] rounded-tl-[150px] rounded-bl-[150px]'
                    : 'left-0 rounded-tl-[30px] rounded-tr-[150px] rounded-br-[150px]'
                }`}
              />
            </div>

            {/* Toggle Left Panel */}
            <div
              className={`absolute w-1/2 h-full flex items-center justify-center flex-col px-[30px] text-center top-0 transition-all duration-[600ms] ease-in-out ${
                isActive ? 'translate-x-0' : '-translate-x-[200%]'
              }`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <h1 className="text-3xl font-bold mb-4">Welcome to Pinspire!</h1>
              <p className="mb-8 text-sm opacity-90">
                Already have an account? Jump back in to discover and save amazing ideas
              </p>
              <button
                className="bg-transparent border-2 border-white text-white text-xs px-11 py-2.5 rounded-lg font-semibold tracking-wider uppercase mt-2.5 cursor-pointer transition-all duration-300 hover:bg-white hover:text-red-500"
                onClick={() => setIsActive(false)}
                type="button"
              >
                Sign In
              </button>
            </div>

            {/* Toggle Right Panel */}
            <div
              className={`absolute right-0 w-1/2 h-full flex items-center justify-center flex-col px-[30px] text-center top-0 transition-all duration-[600ms] ease-in-out ${
                isActive ? 'translate-x-[200%]' : 'translate-x-0'
              }`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <h1 className="text-3xl font-bold mb-4">New to Pinspire?</h1>
              <p className="mb-8 text-sm opacity-90">
                Join our community to discover, save and share creative ideas from around the world
              </p>
              <button
                className="bg-transparent border-2 border-white text-white text-xs px-11 py-2.5 rounded-lg font-semibold tracking-wider uppercase mt-2.5 cursor-pointer transition-all duration-300 hover:bg-white hover:text-red-500"
                onClick={() => setIsActive(true)}
                type="button"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
