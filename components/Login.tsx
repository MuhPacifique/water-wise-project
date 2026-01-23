import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, AlertCircle, Loader, ArrowLeft } from 'lucide-react';
import { useTranslation, TranslatableText } from '../contexts/TranslationContext';
import { LANGUAGES } from '../constants';

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const { language, isTranslating } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitInProgress, setSubmitInProgress] = useState(false);

  // Clear token when entering login page to force fresh login
  useEffect(() => {
    localStorage.removeItem('token');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (submitInProgress || isLoading) {
      return;
    }
    
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setSubmitInProgress(true);

    try {
      await login(email, password);
      // Redirect to admin after successful login
      setTimeout(() => {
        navigate('/admin');
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setSubmitInProgress(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-all"
        >
          <ArrowLeft size={18} />
          <TranslatableText text="Back to Home" />
        </Link>
      </div>

      <motion.div
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            <TranslatableText text="Admin Login" />
          </h2>
          <p className="text-slate-600">
            <TranslatableText text="Please sign in to access the admin panel" />
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle size={18} />
              <TranslatableText text={error} />
            </motion.div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              <TranslatableText text="Email Address" />
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="admin@waterwise.org"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              <TranslatableText text="Password" />
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your password"
              required
            />
          </div>

          <motion.button
            type="submit"
            disabled={isLoading || submitInProgress}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileHover={{ scale: submitInProgress || isLoading ? 1 : 1.02 }}
            whileTap={{ scale: submitInProgress || isLoading ? 1 : 0.98 }}
          >
            {isLoading || submitInProgress ? (
              <>
                <Loader className="animate-spin" size={18} />
                <TranslatableText text="Signing in..." />
              </>
            ) : (
              <>
                <LogIn size={18} />
                <TranslatableText text="Sign In" />
              </>
            )}
          </motion.button>
        </form>

      </motion.div>

      {/* Global Loading Spinner for Translations */}
      {isTranslating && (
        <motion.div
          className="fixed bottom-6 right-6 bg-white/90 backdrop-blur shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-3 border border-blue-100 z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </div>
          <span className="text-sm font-bold text-blue-700 tracking-tight">
            Translating to {LANGUAGES.find(l => l.code === language)?.nativeName}...
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default Login;
