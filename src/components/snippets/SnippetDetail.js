import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiX, 
  HiHeart, 
  HiBookmark, 
  HiEye, 
  HiTag,
  HiClipboard,
  HiCheck,
  HiShare,
  HiPencil,
  HiTrash,
  HiClock,
  HiDuplicate,
  HiCollection
} from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import VersionHistory from './VersionHistory';
import VoteButtons from './VoteButtons';
import ForkButton from './ForkButton';
import ShareModal from './ShareModal';
import SaveToCollection from '../collections/SaveToCollection';
const SnippetDetail = ({ snippet, isOpen, onClose, embedded = false }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSaveToCollection, setShowSaveToCollection] = useState(false);
  const { user } = useAuth();

  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.2
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  const contentVariants = {
    hidden: { x: '100%' },
    visible: { 
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      x: '100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  const getLanguageColor = (language) => {
    const colors = {
      javascript: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      typescript: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      python: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      java: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      css: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      html: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      react: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
      vue: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
      angular: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      node: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    };
    return colors[language?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  const formatDate = (date) => {
    return new Date(date?.seconds * 1000 || date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleSaveToCollection = () => {
    setShowSaveToCollection(true);
  };

  if (!isOpen || !snippet) return null;

  const isOwner = user && user.uid === snippet.ownerId;

  if (embedded) {
    return (
      <div className="h-full bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <img
              src={snippet.author?.photoURL || `https://ui-avatars.com/api/?name=${snippet.author?.displayName}&background=6366f1&color=fff`}
              alt={snippet.author?.displayName}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {snippet.author?.displayName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(snippet.createdAt)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowVersionHistory(true)}
              className="p-2 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Version History"
            >
              <HiClock className="w-5 h-5" />
            </motion.button>

            {isOwner && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <HiPencil className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <HiTrash className="w-5 h-5" />
                </motion.button>
              </>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <HiX className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Title and Description */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {snippet.title}
              </h1>
              
              {/* Fork Attribution */}
              {snippet.forkOf && (
                <div className="flex items-center space-x-2 mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <HiDuplicate className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Forked from <span className="font-medium">@{snippet.originalOwnerName}/{snippet.originalTitle}</span>
                  </span>
                </div>
              )}
              
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {snippet.description}
              </p>
            </div>

            {/* Tags */}
            {snippet.tags && snippet.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {snippet.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  >
                    <HiTag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Code Block */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLanguageColor(snippet.language)}`}>
                    {snippet.language}
                  </span>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="flex items-center space-x-2 px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <HiCheck className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <HiClipboard className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Copy</span>
                    </>
                  )}
                </motion.button>
              </div>
              
              <div className="p-4">
                <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono overflow-x-auto">
                  <code>{snippet.code}</code>
                </pre>
              </div>
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <HiEye className="w-4 h-4" />
                  <span>{snippet.viewsCount || 0} views</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <HiHeart className="w-4 h-4" />
                  <span>{snippet.likesCount || 0} likes</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Voting */}
                <VoteButtons 
                  snippetId={snippet.id}
                  initialScore={snippet.score || 0}
                  initialVoteCounts={snippet.voteCounts || { up: 0, down: 0 }}
                  size="md"
                />

                {/* Fork Button */}
                <ForkButton 
                  snippet={snippet}
                  size="md"
                  showLabel={true}
                />

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <HiShare className="w-4 h-4" />
                  <span className="text-sm">Share</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveToCollection}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <HiCollection className="w-4 h-4" />
                  <span className="text-sm">Save to Collection</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiked 
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <HiHeart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{isLiked ? 'Liked' : 'Like'}</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Version History Modal */}
        <VersionHistory
          snippet={snippet}
          isOpen={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          onRevert={() => {
            setShowVersionHistory(false);
            // Optionally refresh the snippet data
          }}
        />
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex lg:hidden"
      >
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="ml-auto w-full max-w-2xl h-full bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10">
            <div className="flex items-center space-x-3">
              <img
                src={snippet.author?.photoURL || `https://ui-avatars.com/api/?name=${snippet.author?.displayName}&background=6366f1&color=fff`}
                alt={snippet.author?.displayName}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {snippet.author?.displayName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(snippet.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowVersionHistory(true)}
                className="p-2 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Version History"
              >
                <HiClock className="w-5 h-5" />
              </motion.button>

              {isOwner && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <HiPencil className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <HiTrash className="w-5 h-5" />
                  </motion.button>
                </>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <HiX className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Title and Description */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {snippet.title}
                </h1>
                
                {/* Fork Attribution - Mobile */}
                {snippet.forkOf && (
                  <div className="flex items-center space-x-2 mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <HiDuplicate className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      Forked from <span className="font-medium">@{snippet.originalOwnerName}/{snippet.originalTitle}</span>
                    </span>
                  </div>
                )}
                
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {snippet.description}
                </p>
              </div>

              {/* Tags */}
              {snippet.tags && snippet.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {snippet.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    >
                      <HiTag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Code Block */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLanguageColor(snippet.language)}`}>
                      {snippet.language}
                    </span>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopy}
                    className="flex items-center space-x-2 px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <HiCheck className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <HiClipboard className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Copy</span>
                      </>
                    )}
                  </motion.button>
                </div>
                
                <div className="p-4">
                  <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono overflow-x-auto">
                    <code>{snippet.code}</code>
                  </pre>
                </div>
              </div>

              {/* Stats and Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <HiEye className="w-4 h-4" />
                    <span>{snippet.viewsCount || 0} views</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <HiHeart className="w-4 h-4" />
                    <span>{snippet.likesCount || 0} likes</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Mobile Voting */}
                  <VoteButtons 
                    snippetId={snippet.id}
                    initialScore={snippet.score || 0}
                    initialVoteCounts={snippet.voteCounts || { up: 0, down: 0 }}
                    size="sm"
                  />

                  {/* Mobile Fork Button */}
                  <ForkButton 
                    snippet={snippet}
                    size="sm"
                    showLabel={false}
                  />

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <HiShare className="w-4 h-4" />
                    <span className="text-sm">Share</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveToCollection}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <HiCollection className="w-4 h-4" />
                    <span className="text-sm">Save</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isLiked 
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <HiHeart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm">{isLiked ? 'Liked' : 'Like'}</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mobile Sticky Action Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-50">
          <div className="flex items-center justify-between max-w-sm mx-auto">
            <VoteButtons 
              snippetId={snippet.id}
              initialScore={snippet.score || 0}
              initialVoteCounts={snippet.voteCounts || { up: 0, down: 0 }}
              size="lg"
            />
            
            <div className="flex items-center space-x-3">
              <ForkButton 
                snippet={snippet}
                size="lg"
                showLabel={false}
              />
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="p-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <HiShare className="w-6 h-6" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveToCollection}
                className="p-3 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <HiCollection className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Version History Modal */}
        <VersionHistory
          snippet={snippet}
          isOpen={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          onRevert={() => {
            setShowVersionHistory(false);
            // Optionally refresh the snippet data
          }}
        />

        {/* Share Modal */}
        <ShareModal
          snippet={snippet}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />

        {/* Save to Collection Modal */}
        <SaveToCollection
          snippet={snippet}
          isOpen={showSaveToCollection}
          onClose={() => setShowSaveToCollection(false)}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default SnippetDetail;