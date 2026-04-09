import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Mail, Lock, User, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const passwordRequirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Contains a number', test: (p: string) => /\d/.test(p) },
  { label: 'Contains uppercase', test: (p: string) => /[A-Z]/.test(p) },
];

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const allRequirementsMet = passwordRequirements.every(req => req.test(password));
    if (!allRequirementsMet) {
      setError('Please meet all password requirements');
      return;
    }

    setIsLoading(true);

    try {
      await signup(email, name, password);
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Left Panel - Decoration */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-dark-900/50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-accent-green/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-accent-purple/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 max-w-lg px-8"
        >
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Start Building Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-accent-blue">
              Financial Future
            </span>
          </h2>
          <p className="text-dark-400 text-lg mb-10">
            Join thousands of users who track their wealth with WealthTrack. 
            Get started in under a minute.
          </p>

          <div className="space-y-4">
            {[
              { icon: '📊', text: 'Track unlimited assets & liabilities' },
              { icon: '📈', text: 'Visualize your wealth growth' },
              { icon: '🎯', text: 'Set and achieve financial goals' },
              { icon: '🔒', text: 'Your data stays private & secure' },
            ].map((item, index) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3 text-dark-200"
              >
                <span className="text-2xl">{item.icon}</span>
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 relative">
        {/* Back button */}
        <Link
          to="/"
          className="absolute top-8 left-8 p-2 rounded-xl hover:bg-dark-800/50 transition-colors flex items-center gap-2 text-dark-400 hover:text-dark-200"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Back</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-green to-accent-blue flex items-center justify-center">
              <TrendingUp size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold">WealthTrack</span>
          </div>

          <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-dark-400 mb-8">
            Start tracking your wealth for free
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-accent-red/10 border border-accent-red/20 rounded-xl text-accent-red text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Full name
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-dark-800/50 border border-dark-700 rounded-xl focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/25 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-dark-800/50 border border-dark-700 rounded-xl focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/25 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-dark-800/50 border border-dark-700 rounded-xl focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/25 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password requirements */}
              <div className="mt-3 space-y-1.5">
                {passwordRequirements.map(req => (
                  <div
                    key={req.label}
                    className={`flex items-center gap-2 text-xs ${
                      req.test(password) ? 'text-accent-green' : 'text-dark-500'
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    {req.label}
                  </div>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-accent-green to-emerald-500 text-dark-950 font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent-green/25"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </motion.button>

            <p className="text-xs text-dark-500 text-center">
              By signing up, you agree to our{' '}
              <button type="button" className="text-accent-green hover:underline">
                Terms of Service
              </button>{' '}
              and{' '}
              <button type="button" className="text-accent-green hover:underline">
                Privacy Policy
              </button>
            </p>
          </form>

          <p className="mt-8 text-center text-dark-400">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-green hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
