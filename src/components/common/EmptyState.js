import { motion } from 'framer-motion';
import { HiCode, HiPlus, HiSearch, HiBookmark, HiHeart } from 'react-icons/hi';

const EmptyState = ({ 
  type = 'snippets', 
  title, 
  description, 
  actionText, 
  onAction,
  showAction = true 
}) => {
  const getEmptyStateConfig = () => {
    switch (type) {
      case 'snippets':
        return {
          icon: HiCode,
          title: title || 'No snippets found',
          description: description || 'Start by creating your first code snippet to share with the community.',
          actionText: actionText || 'Create your first snippet',
          illustration: (
            <svg className="w-32 h-32 text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
            </svg>
          )
        };
      case 'search':
        return {
          icon: HiSearch,
          title: title || 'No results found',
          description: description || 'Try adjusting your search terms or browse all snippets.',
          actionText: actionText || 'Browse all snippets',
          illustration: (
            <svg className="w-32 h-32 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )
        };
      case 'saved':
        return {
          icon: HiBookmark,
          title: title || 'No saved snippets',
          description: description || 'Save snippets you find useful to access them quickly later.',
          actionText: actionText || 'Explore snippets',
          illustration: (
            <svg className="w-32 h-32 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          )
        };
      case 'liked':
        return {
          icon: HiHeart,
          title: title || 'No liked snippets',
          description: description || 'Like snippets you find helpful to keep track of them.',
          actionText: actionText || 'Discover snippets',
          illustration: (
            <svg className="w-32 h-32 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )
        };
      default:
        return {
          icon: HiCode,
          title: title || 'Nothing here yet',
          description: description || 'This section is empty.',
          actionText: actionText || 'Get started',
          illustration: (
            <svg className="w-32 h-32 text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
            </svg>
          )
        };
    }
  };

  const config = getEmptyStateConfig();
  const IconComponent = config.icon;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Illustration */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="mb-8"
      >
        {config.illustration}
      </motion.div>

      {/* Content */}
      <motion.div variants={itemVariants} className="max-w-md">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {config.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          {config.description}
        </p>
      </motion.div>

      {/* Action Button */}
      {showAction && onAction && (
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          <IconComponent className="w-5 h-5" />
          <span>{config.actionText}</span>
        </motion.button>
      )}

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-20"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-1/3 right-1/3 w-3 h-3 bg-purple-400 rounded-full opacity-20"
        />
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-indigo-400 rounded-full opacity-30"
        />
      </div>
    </motion.div>
  );
};

export default EmptyState;