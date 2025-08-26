import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiHeart,
  HiBookmark,
  HiEye,
  HiCode,
  HiCalendar,
  HiTag,
  HiDuplicate,
  HiCollection
} from 'react-icons/hi';
import { getLanguageColor, formatDate } from '../../utils/helpers';
import VoteButtons from './VoteButtons';
import ForkButton from './ForkButton';
import SaveToCollection from '../collections/SaveToCollection';

const SnippetCard = ({ snippet, onClick, index = 0, highlighted }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveToCollection, setShowSaveToCollection] = useState(false);

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: index * 0.1
      }
    }
  };



  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleSave = (e) => {
    e.stopPropagation();
    setShowSaveToCollection(true);
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{
        y: -4,
        transition: { type: 'spring', stiffness: 300, damping: 30 }
      }}
      onClick={() => onClick(snippet)}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg dark:hover:shadow-2xl transition-all duration-200 group overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              <h3 
                className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                dangerouslySetInnerHTML={{ 
                  __html: highlighted?.highlightedTitle || snippet.title 
                }}
              />
              {snippet.forkOf && (
                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <HiDuplicate className="w-3 h-3" />
                  <span>Forked from @{snippet.originalOwnerName}/{snippet.originalTitle}</span>
                </div>
              )}
              <p 
                className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: highlighted?.highlightedDescription || snippet.description 
                }}
              />
            </div>
            
            {/* Voting */}
            <div onClick={(e) => e.stopPropagation()}>
              <VoteButtons 
                snippetId={snippet.id}
                initialScore={snippet.score || 0}
                initialVoteCounts={snippet.voteCounts || { up: 0, down: 0 }}
                size="sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSave}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            title="Save to Collection"
          >
            <HiCollection className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className={`p-2 rounded-lg transition-colors ${isLiked
              ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
          >
            <HiHeart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Code Preview */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <HiCode className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLanguageColor(snippet.language)}`}>
              {snippet.language}
            </span>
          </div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
        </div>

        <pre className="text-sm text-gray-700 dark:text-gray-300 font-mono overflow-hidden">
          <code className="line-clamp-4">
            {snippet.code}
          </code>
        </pre>
      </div>

      {/* Tags */}
      {snippet.tags && snippet.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {snippet.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            >
              <HiTag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
          {snippet.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              +{snippet.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <img
              src={snippet.author?.photoURL || `https://ui-avatars.com/api/?name=${snippet.author?.displayName}&background=6366f1&color=fff`}
              alt={snippet.author?.displayName}
              className="w-5 h-5 rounded-full"
            />
            <span className="font-medium">{snippet.author?.displayName}</span>
          </div>

          <div className="flex items-center space-x-1">
            <HiCalendar className="w-4 h-4" />
            <span>{formatDate(snippet.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div onClick={(e) => e.stopPropagation()}>
            <ForkButton 
              snippet={snippet} 
              size="sm" 
              showLabel={false}
            />
          </div>

          <div className="flex items-center space-x-1">
            <HiEye className="w-4 h-4" />
            <span>{snippet.viewsCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Save to Collection Modal */}
      <SaveToCollection
        snippet={snippet}
        isOpen={showSaveToCollection}
        onClose={() => setShowSaveToCollection(false)}
      />
    </motion.div>
  );
};

export default SnippetCard;