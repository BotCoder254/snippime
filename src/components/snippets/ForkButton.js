import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiDuplicate, HiCheck } from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, increment } from 'firebase/firestore';

const ForkButton = ({ snippet, onFork, size = 'md', showLabel = true }) => {
  const { user } = useAuth();
  const [isForking, setIsForking] = useState(false);
  const [forked, setForked] = useState(false);

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

    if (isForking || forked) return;

    setIsForking(true);

    try {
      // Create forked snippet
      const forkedSnippet = {
        title: `${snippet.title || 'Untitled'} (Fork)`,
        description: snippet.description || '',
        code: snippet.code || '',
        language: snippet.language || 'text',
        tags: snippet.tags || [],
        isPublic: false, // Start as draft
        isDraft: true,
        forkOf: snippet.id,
        originalOwnerId: snippet.userId || snippet.author?.uid || snippet.ownerId || 'unknown',
        originalOwnerName: snippet.userName || snippet.author?.displayName || snippet.ownerName || 'Unknown',
        originalTitle: snippet.title || 'Untitled',
        userId: user.uid,
        userName: user.displayName || user.email || 'Anonymous',
        userAvatar: user.photoURL || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        score: 0,
        voteCounts: { up: 0, down: 0 },
        forkCount: 0,
        status: 'draft'
      };

      const docRef = await addDoc(collection(db, 'snippets'), forkedSnippet);

      // Update original snippet's fork count
      try {
        await updateDoc(doc(db, 'snippets', snippet.id), {
          forkCount: increment(1)
        });
      } catch (updateError) {
        console.warn('Could not update fork count:', updateError);
      }

      if (onFork) {
        onFork({
          id: docRef.id,
          ...forkedSnippet,
          createdAt: new Date()
        });
      }

      setForked(true);

      // Show success and navigate to editor
      setTimeout(() => {
        if (window.confirm('Snippet forked successfully! Would you like to edit it now?')) {
          window.location.href = `/create?fork=${docRef.id}`;
        }
      }, 500);

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
      disabled={isForking || forked}
      className={`${buttonSizeClasses[size]} flex items-center space-x-2 rounded-lg transition-colors ${
        forked 
          ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
          : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
      } ${
        isForking || forked ? 'opacity-75 cursor-not-allowed' : ''
      }`}
    >
      {forked ? (
        <HiCheck className={sizeClasses[size]} />
      ) : (
        <HiDuplicate className={sizeClasses[size]} />
      )}
      {showLabel && (
        <span className="font-medium">
          {forked ? 'Forked' : isForking ? 'Forking...' : 'Fork'}
        </span>
      )}
    </motion.button>
  );
};

export default ForkButton;