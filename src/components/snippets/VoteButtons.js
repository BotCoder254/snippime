import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiChevronUp, HiChevronDown } from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../config/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, runTransaction } from 'firebase/firestore';

const VoteButtons = ({ snippetId, initialScore = 0, initialVoteCounts = { up: 0, down: 0 }, size = 'md' }) => {
  const { user } = useAuth();
  const [userVote, setUserVote] = useState(0); // -1, 0, or 1
  const [score, setScore] = useState(initialScore);
  const [voteCounts, setVoteCounts] = useState(initialVoteCounts);
  const [isLoading, setIsLoading] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  };

  // Load user's current vote
  useEffect(() => {
    if (user && snippetId) {
      loadUserVote();
    }
  }, [user, snippetId]);

  const loadUserVote = async () => {
    try {
      const voteDoc = await getDoc(doc(db, 'snippets', snippetId, 'votes', user.uid));
      if (voteDoc.exists()) {
        setUserVote(voteDoc.data().value || 0);
      }
    } catch (error) {
      console.error('Error loading user vote:', error);
    }
  };

  const handleVote = async (newVote) => {
    if (!user) {
      // Show sign-in prompt
      alert('Please sign in to vote');
      return;
    }

    if (isLoading) return;

    const oldVote = userVote;
    const delta = newVote - oldVote;

    // Optimistic update
    setUserVote(newVote);
    setScore(prev => prev + delta);
    
    if (delta > 0) {
      setVoteCounts(prev => ({ ...prev, up: prev.up + 1 }));
      if (oldVote === -1) {
        setVoteCounts(prev => ({ ...prev, down: prev.down - 1 }));
      }
    } else if (delta < 0) {
      setVoteCounts(prev => ({ ...prev, down: prev.down + 1 }));
      if (oldVote === 1) {
        setVoteCounts(prev => ({ ...prev, up: prev.up - 1 }));
      }
    } else {
      // Removing vote
      if (oldVote === 1) {
        setVoteCounts(prev => ({ ...prev, up: prev.up - 1 }));
      } else if (oldVote === -1) {
        setVoteCounts(prev => ({ ...prev, down: prev.down - 1 }));
      }
    }

    setIsLoading(true);

    try {
      await runTransaction(db, async (transaction) => {
        const voteRef = doc(db, 'snippets', snippetId, 'votes', user.uid);
        const topLevelVoteRef = doc(db, 'votes', `${user.uid}_${snippetId}`);
        const snippetRef = doc(db, 'snippets', snippetId);

        // Update vote document in subcollection
        if (newVote === 0) {
          transaction.delete(voteRef);
          transaction.delete(topLevelVoteRef);
        } else {
          transaction.set(voteRef, {
            value: newVote,
            updatedAt: new Date()
          });
          // Also maintain top-level votes collection for easier querying
          transaction.set(topLevelVoteRef, {
            userId: user.uid,
            snippetId: snippetId,
            type: newVote === 1 ? 'up' : 'down',
            value: newVote,
            updatedAt: new Date()
          });
        }

        // Update snippet counts and score
        const updates = {
          score: increment(delta)
        };

        if (delta > 0) {
          updates['voteCounts.up'] = increment(1);
          if (oldVote === -1) {
            updates['voteCounts.down'] = increment(-1);
          }
        } else if (delta < 0) {
          updates['voteCounts.down'] = increment(1);
          if (oldVote === 1) {
            updates['voteCounts.up'] = increment(-1);
          }
        } else {
          // Removing vote
          if (oldVote === 1) {
            updates['voteCounts.up'] = increment(-1);
          } else if (oldVote === -1) {
            updates['voteCounts.down'] = increment(-1);
          }
        }

        // Calculate hot score
        const newScore = score + delta;
        const createdAtSeconds = Date.now() / 1000; // Simplified - should use actual creation time
        const scoreHot = Math.log10(Math.max(newScore, 1)) + createdAtSeconds / 45000;
        updates.scoreHot = scoreHot;

        transaction.update(snippetRef, updates);
      });
    } catch (error) {
      console.error('Error updating vote:', error);
      // Rollback optimistic update
      setUserVote(oldVote);
      setScore(prev => prev - delta);
      // Rollback vote counts...
    } finally {
      setIsLoading(false);
    }
  };

  const formatScore = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      {/* Upvote */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleVote(userVote === 1 ? 0 : 1)}
        disabled={isLoading}
        className={`${buttonSizeClasses[size]} rounded-lg transition-colors ${
          userVote === 1
            ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
            : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <HiChevronUp className={sizeClasses[size]} />
      </motion.button>

      {/* Score */}
      <span className={`font-medium ${
        score > 0 ? 'text-green-600' : score < 0 ? 'text-red-600' : 'text-gray-500'
      } ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'}`}>
        {formatScore(score)}
      </span>

      {/* Downvote */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleVote(userVote === -1 ? 0 : -1)}
        disabled={isLoading}
        className={`${buttonSizeClasses[size]} rounded-lg transition-colors ${
          userVote === -1
            ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
            : 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <HiChevronDown className={sizeClasses[size]} />
      </motion.button>
    </div>
  );
};

export default VoteButtons;