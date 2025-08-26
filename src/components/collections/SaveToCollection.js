import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiX, 
  HiCollection, 
  HiPlus, 
  HiCheck,
  HiLockClosed,
  HiGlobe
} from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../config/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  increment,
  writeBatch
} from 'firebase/firestore';
import CreateCollection from './CreateCollection';

const SaveToCollection = ({ snippet, isOpen, onClose }) => {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [savedCollections, setSavedCollections] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showCreateCollection, setShowCreateCollection] = useState(false);

  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const contentVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: { scale: 0.95, opacity: 0 }
  };

  useEffect(() => {
    if (!user || !isOpen) return;

    const unsubscribe = onSnapshot(
      query(collection(db, 'collections'), where('ownerId', '==', user.uid)),
      (querySnapshot) => {
        const collectionsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCollections(collectionsData);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, isOpen]);

  useEffect(() => {
    if (!user || !snippet || !isOpen) return;

    // Check which collections already contain this snippet
    const checkSavedCollections = async () => {
      const saved = new Set();
      
      for (const coll of collections) {
        try {
          const itemRef = doc(db, 'collections', coll.id, 'items', snippet.id);
          const unsubscribe = onSnapshot(itemRef, (doc) => {
            if (doc.exists()) {
              saved.add(coll.id);
            } else {
              saved.delete(coll.id);
            }
            setSavedCollections(new Set(saved));
          });
          
          // Store unsubscribe function for cleanup
          return unsubscribe;
        } catch (error) {
          console.error('Error checking collection:', error);
        }
      }
    };

    if (collections.length > 0) {
      checkSavedCollections();
    }
  }, [collections, snippet, user, isOpen]);

  const handleToggleCollection = async (collectionId) => {
    if (!user || !snippet) return;

    const batch = writeBatch(db);
    const itemRef = doc(db, 'collections', collectionId, 'items', snippet.id);
    const collectionRef = doc(db, 'collections', collectionId);

    try {
      if (savedCollections.has(collectionId)) {
        // Remove from collection
        batch.delete(itemRef);
        batch.update(collectionRef, {
          itemCount: increment(-1),
          updatedAt: new Date()
        });
        
        setSavedCollections(prev => {
          const newSet = new Set(prev);
          newSet.delete(collectionId);
          return newSet;
        });
      } else {
        // Add to collection
        batch.set(itemRef, {
          snippetId: snippet.id,
          addedAt: new Date(),
          addedBy: user.uid
        });
        batch.update(collectionRef, {
          itemCount: increment(1),
          updatedAt: new Date()
        });
        
        setSavedCollections(prev => new Set([...prev, collectionId]));
      }

      await batch.commit();
    } catch (error) {
      console.error('Error toggling collection:', error);
      alert('Failed to update collection. Please try again.');
    }
  };

  const handleCreateCollection = (newCollection) => {
    setCollections(prev => [...prev, newCollection]);
    setShowCreateCollection(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          variants={contentVariants}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <HiCollection className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Save to Collection
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Create New Collection */}
                <button
                  onClick={() => setShowCreateCollection(true)}
                  className="w-full flex items-center space-x-3 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                >
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 rounded-lg flex items-center justify-center transition-colors">
                    <HiPlus className="w-5 h-5 text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium">
                    Create New Collection
                  </span>
                </button>

                {/* Existing Collections */}
                {collections.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <HiCollection className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No collections yet</p>
                    <p className="text-sm">Create your first collection to organize snippets</p>
                  </div>
                ) : (
                  collections.map((coll) => (
                    <motion.button
                      key={coll.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleToggleCollection(coll.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                        savedCollections.has(coll.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        savedCollections.has(coll.id)
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        {savedCollections.has(coll.id) ? (
                          <HiCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <HiCollection className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 text-left">
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${
                            savedCollections.has(coll.id)
                              ? 'text-blue-700 dark:text-blue-300'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {coll.title}
                          </span>
                          {coll.visibility === 'private' ? (
                            <HiLockClosed className="w-3 h-3 text-gray-400" />
                          ) : (
                            <HiGlobe className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {coll.itemCount || 0} snippets
                        </p>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Create Collection Modal */}
      <CreateCollection
        isOpen={showCreateCollection}
        onClose={() => setShowCreateCollection(false)}
        onSuccess={handleCreateCollection}
      />
    </AnimatePresence>
  );
};

export default SaveToCollection;