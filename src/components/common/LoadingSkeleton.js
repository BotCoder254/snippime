import { motion } from 'framer-motion';

const LoadingSkeleton = ({ type = 'card', count = 6 }) => {
  const shimmerVariants = {
    initial: { x: '-100%' },
    animate: { 
      x: '100%',
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: 'linear'
      }
    }
  };

  const SkeletonCard = ({ index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="relative overflow-hidden bg-gray-200 dark:bg-gray-700 h-6 rounded mb-2">
            <motion.div
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </div>
          <div className="relative overflow-hidden bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4">
            <motion.div
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>

      {/* Code Preview */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
        </div>
        
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="relative overflow-hidden bg-gray-200 dark:bg-gray-700 h-4 rounded">
              <motion.div
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="flex space-x-2 mb-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </motion.div>
  );

  const SkeletonList = ({ index }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="relative overflow-hidden bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4">
          <motion.div
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        </div>
        <div className="relative overflow-hidden bg-gray-200 dark:bg-gray-700 h-3 rounded w-1/2">
          <motion.div
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        </div>
      </div>
      <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </motion.div>
  );

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {[...Array(count)].map((_, index) => (
          <SkeletonList key={index} index={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, index) => (
        <SkeletonCard key={index} index={index} />
      ))}
    </div>
  );
};

export default LoadingSkeleton;