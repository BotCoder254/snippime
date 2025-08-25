import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiDuplicate } from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

const ForkButton = ({ snippet, onFork, size = 'md', showLabel = true }) => {
  const { user } = useAuth();
  const [isForking, setIsForking] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const handleFork = async () => {
    if (!user) {
      alert('Please sign in to fork snippets');
      return;
    }

    if (isForking) return;

    setIsForking(true);

    try {
      // Create forked snippet
      const forkedSnippet = {
        title: `${snippet.title} (Fork)`,
        description: snippet.description,
        code: snippet.code,
        language: snippet.language,
        tags: snippet.tags || [],
        isPublic: false, // Start as draft
        isDraft: true,
        forkOf: snippet.id,
        originalOwnerId: snippet.userId,
        originalOwnerName: snippet.userName || 'Unknown',
        originalTitle: snippet.title,
        userId: user.uid,
        userName: user.displayName || user.email,
        userAvatar: user.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        score: 0,
        voteCounts: { up: 0, down: 0 },
        forkCount: 0
      };

      const docRef = await addDoc(collection(db, 'snippets'), forkedSnippet);

      // Update original snippet's fork count
      // Note: In a real app, you'd want to use a transaction or cloud function
      // to ensure consistency

      if (onFork) {
        onFork({
          id: docRef.id,
          ...forkedSnippet,
          createdAt: new Date()
        });
      }

      // Show success message or navigate to editor
      alert('Snippet forked! You can now edit it before publishing.');

    } catch (error) {
      console.error('Error forking snippet:', error);
      alert('Failed to fork snippet. Please try again.');
    } finally {
      setIsForking(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleFork}
      disabled={isForking}
      className={`${buttonSizeClasses[size]} flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors ${
        isForking ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <HiDuplicate className={sizeClasses[size]} />
      {showLabel && (
        <span className="font-medium">
          {isForking ? 'Forking...' : 'Fork'}
        </span>
      )}
    </motion.button>
  );
};

export default ForkButton;