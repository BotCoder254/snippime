import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HiCode, 
  HiPlay,
  HiArrowRight,
  HiStar
} from 'react-icons/hi';
import { FaGithub, FaTwitter, FaDiscord } from 'react-icons/fa';
import AuthModal from '../components/auth/AuthModal';
import ThemeToggle from '../components/common/ThemeToggle';

const LandingPage = () => {
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'signin' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  // Modern Logo Component
  const ModernLogo = () => (
    <div className="flex items-center space-x-3">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-0.5">
          <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
            {/* Inner code symbol */}
            <div className="text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.7 15.9L4.8 12l3.9-3.9c.39-.39.39-1.01 0-1.4-.39-.39-1.01-.39-1.4 0l-4.59 4.59c-.39.39-.39 1.02 0 1.41L7.3 17.3c.39.39 1.02.39 1.41 0 .38-.39.38-1.01-.01-1.4zm6.6 0l3.9-3.9-3.9-3.9c-.39-.39-.39-1.01 0-1.4.39-.39 1.01-.39 1.4 0l4.59 4.59c.39.39.39 1.02 0 1.41L16.7 17.3c-.39.39-1.02.39-1.41 0-.38-.39-.38-1.01.01-1.4z"/>
              </svg>
            </div>
          </div>
        </div>
        {/* Animated pulse ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 animate-pulse"></div>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Snippime
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
          Code • Share • Build
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative">
      {/* Background Image Overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('data:image/svg+xml,${encodeURIComponent(`
            <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(59, 130, 246, 0.05)" stroke-width="1"/>
                </pattern>
                <radialGradient id="fade" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" style="stop-color:rgba(59, 130, 246, 0.1);stop-opacity:1" />
                  <stop offset="100%" style="stop-color:rgba(59, 130, 246, 0);stop-opacity:0" />
                </radialGradient>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
              <rect width="100" height="100" fill="url(#fade)" />
            </svg>
          `)})`,
          backgroundSize: '100px 100px'
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/50 via-white/80 to-purple-50/50 dark:from-gray-900/90 dark:via-gray-900/95 dark:to-purple-900/90 z-0" />
      
      {/* Content */}
      <div className="relative z-10 bg-transparent">
        {/* Navigation */}
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 z-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <ModernLogo />
              
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <button
                  onClick={() => setAuthModal({ isOpen: true, mode: 'signin' })}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all shadow-lg"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center"
        >
          <div className="max-w-7xl mx-auto text-center w-full">
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Share Code,{' '}
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Build Together
              </span>
            </motion.h1>
            
            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Discover, share, and collaborate on code snippets with developers worldwide. 
              Build your coding knowledge base and connect with the community.
            </motion.p>
            
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-2xl"
              >
                <HiCode className="w-6 h-6" />
                <span>Create a Snippet</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 dark:hover:border-gray-500 transition-all backdrop-blur-sm bg-white/10 dark:bg-gray-800/10"
              >
                <HiPlay className="w-6 h-6" />
                <span>Explore</span>
              </motion.button>
            </motion.div>

            {/* Stats floating cards */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-4xl mx-auto"
            >
              {[
                { label: 'Active Users', value: '12.5K+' },
                { label: 'Code Snippets', value: '45.2K+' },
                { label: 'Languages', value: '25+' },
                { label: 'GitHub Stars', value: '8.9K+' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.05 }}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="mb-4">
                  <ModernLogo />
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  The modern platform for sharing and discovering code snippets. 
                  Built with ❤️ by the developer community.
                </p>
                <div className="flex space-x-4">
                  <motion.a 
                    href="#" 
                    whileHover={{ scale: 1.1 }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <FaGithub className="w-6 h-6" />
                  </motion.a>
                  <motion.a 
                    href="#" 
                    whileHover={{ scale: 1.1 }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <FaTwitter className="w-6 h-6" />
                  </motion.a>
                  <motion.a 
                    href="#" 
                    whileHover={{ scale: 1.1 }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <FaDiscord className="w-6 h-6" />
                  </motion.a>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  Product
                </h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">API</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  Resources
                </h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Support</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-200/50 dark:border-gray-700/50 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                © 2024 Snippime. Open source under MIT License.
              </p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                  <HiStar className="w-4 h-4 text-yellow-400" />
                  <span>8.9k stars on GitHub</span>
                </div>
                <a 
                  href="#" 
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                >
                  Deploy on Firebase
                </a>
              </div>
            </div>
          </div>
        </footer>

        {/* Auth Modal */}
        <AuthModal
          isOpen={authModal.isOpen}
          onClose={() => setAuthModal({ ...authModal, isOpen: false })}
          initialMode={authModal.mode}
        />
      </div>
    </div>
  );
};

export default LandingPage;