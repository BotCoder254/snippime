import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiEye, HiEyeOff } from 'react-icons/hi';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const AuthModal = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: ''
  });

  const { signIn, signUp, signInWithGoogle, signInWithGithub, resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signin') {
        await signIn(formData.email, formData.password);
      } else if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await signUp(formData.email, formData.password, formData.displayName);
      } else if (mode === 'reset') {
        await resetPassword(formData.email);
        setError('Password reset email sent! Check your inbox.');
        return;
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    setLoading(true);
    setError('');

    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else if (provider === 'github') {
        await signInWithGithub();
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  const slideVariants = {
    hidden: { x: mode === 'signin' ? -20 : 20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl h-full max-h-[600px] overflow-hidden"
        >
          <div className="flex h-full">
            {/* Left Side - Image/Illustration */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-black bg-opacity-20" />
              <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-8 mx-auto backdrop-blur-sm cover">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Welcome to Snippime</h2>
                  <p className="text-lg opacity-90 leading-relaxed">
                    Share, discover, and collaborate on code snippets with developers worldwide. 
                    Build your coding knowledge base and connect with the community.
                  </p>
                </motion.div>
              </div>
              
              {/* Animated Background Elements */}
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute top-10 right-10 w-32 h-32 border border-white border-opacity-20 rounded-full"
              />
              <motion.div
                animate={{ 
                  rotate: -360,
                  y: [0, -20, 0]
                }}
                transition={{ 
                  rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                  y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute bottom-20 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm"
              />
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <motion.h3 
                  key={mode}
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                >
                  {mode === 'signin' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'reset' && 'Reset Password'}
                </motion.h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <HiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Form Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <motion.form
                  key={mode}
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </motion.div>
                  )}

                  {mode === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                        placeholder="Enter your display name"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>

                  {mode !== 'reset' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {mode === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                        placeholder="Confirm your password"
                      />
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? 'Loading...' : (
                      mode === 'signin' ? 'Sign In' : 
                      mode === 'signup' ? 'Create Account' : 
                      'Send Reset Email'
                    )}
                  </motion.button>

                  {mode !== 'reset' && (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <motion.button
                          type="button"
                          onClick={() => handleSocialAuth('google')}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <FaGoogle className="w-5 h-5 text-red-500 mr-2" />
                          <span className="text-gray-700 dark:text-gray-300">Google</span>
                        </motion.button>

                        <motion.button
                          type="button"
                          onClick={() => handleSocialAuth('github')}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <FaGithub className="w-5 h-5 text-gray-700 dark:text-gray-300 mr-2" />
                          <span className="text-gray-700 dark:text-gray-300">GitHub</span>
                        </motion.button>
                      </div>
                    </>
                  )}
                </motion.form>

                {/* Footer Links */}
                <div className="mt-6 text-center space-y-2">
                  {mode === 'signin' && (
                    <>
                      <button
                        onClick={() => setMode('reset')}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Forgot your password?
                      </button>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account?{' '}
                        <button
                          onClick={() => setMode('signup')}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          Sign up
                        </button>
                      </p>
                    </>
                  )}

                  {mode === 'signup' && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Already have an account?{' '}
                      <button
                        onClick={() => setMode('signin')}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Sign in
                      </button>
                    </p>
                  )}

                  {mode === 'reset' && (
                    <button
                      onClick={() => setMode('signin')}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Back to sign in
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;