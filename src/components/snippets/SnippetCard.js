import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiHeart,
  HiBookmark,
  HiEye,
  HiCode,
  HiCalendar,
  HiTag,
  HiDuplicate,
  HiCollection,
  HiTrash,
  HiPencil
} from 'react-icons/hi';
import { getLanguageColor, formatDate } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../config/firebase';
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import VoteButtons from './VoteButtons';
import ForkButton from './ForkButton';
import SaveToCollection from '../collections/SaveToCollection';

const SnippetCard = ({ snippet, onClick, index = 0, highlighted, showActions = true }) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveToCollection, setShowSaveToCollection] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [likesCount, setLikesCount] = useState(snippet.score || 0);
  const [isOwner, setIsOwner] = useState(false);

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

  // Check if user is owner
  useEffect(() => {
    if (user && snippet) {
      setIsOwner(user.uid === snippet.ownerId || user.uid === snippet.author?.uid);
    }
  }, [user, snippet]);



  // Check save status
  useEffect(() => {
    if (!user || !snippet?.id) return;

    const unsubscribe = onSnapshot(
      doc(db, 'savedSnippets', `${user.uid}_${snippet.id}`),
      (doc) => {
        setIsSaved(doc.exists());
      }
    );

    return unsubscribe;
  }, [user, snippet?.id]);

  // Listen to likes count changes
  useEffect(() => {
    if (!snippet?.id) return;

    const unsubscribe = onSnapshot(
      doc(db, 'snippets', snippet.id),
      (doc) => {
        if (doc.exists()) {
          setLikesCount(doc.data().score || 0);
        }
      }
    );

    return unsubscribe;
  }, [snippet?.id]);





  const handleSave = async (e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please sign in to save snippets');
      return;
    }

    try {
      const saveId = `${user.uid}_${snippet.id}`;
      
      if (isSaved) {
        // Remove save
        await deleteDoc(doc(db, 'savedSnippets', saveId));
      } else {
        // Add save
        await setDoc(doc(db, 'savedSnippets', saveId), {
          userId: user.uid,
          snippetId: snippet.id,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating save:', error);
    }
  };

  const handleDelete = async () => {
    if (!user || !isOwner) return;

    try {
      await deleteDoc(doc(db, 'snippets', snippet.id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting snippet:', error);
      alert('Failed to delete snippet. Please try again.');
    }
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
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg dark:hover:shadow-2xl transition-all duration-200 group overflow-hidden h-full flex flex-col min-h-[400px]"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-shrink-0">
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
                <div className="flex items-center space-x-2 mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <HiDuplicate className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                    Forked from <span className="font-semibold">@{snippet.originalOwnerName}/{snippet.originalTitle}</span>
                  </span>
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

        {showActions && (
          <div className="flex items-center space-x-2 ml-4">
            {/* Save Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSave}
              className={`p-2 rounded-lg transition-colors ${isSaved
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              title={isSaved ? 'Saved' : 'Save Snippet'}
            >
              <HiBookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </motion.button>



            {/* Owner Actions */}
            {isOwner && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate to edit
                    window.location.href = `/create?edit=${snippet.id}`;
                  }}
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                  title="Edit Snippet"
                >
                  <HiPencil className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteModal(true);
                  }}
                  className="p-2 rounded-lg transition-colors hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  title="Delete Snippet"
                >
                  <HiTrash className="w-4 h-4" />
                </motion.button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Code Preview */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700 flex-1 flex flex-col min-h-[120px]">
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

        <pre className="text-sm text-gray-700 dark:text-gray-300 font-mono overflow-hidden flex-1 max-h-24">
          <code className="line-clamp-4 block">
            {snippet.code}
          </code>
        </pre>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
        {snippet.tags && snippet.tags.length > 0 && (
          <>
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
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 mt-auto">
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
            <HiHeart className="w-4 h-4 text-red-500" />
            <span>{likesCount}</span>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <HiTrash className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Snippet
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete "<span className="font-medium">{snippet.title}</span>"? 
              This will permanently remove the snippet and all its data.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default SnippetCard;