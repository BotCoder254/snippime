import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiSave, HiCollection, HiLockClosed, HiGlobe } from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';

const CreateCollection = ({ isOpen, onClose, onSuccess, editCollection = null }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: editCollection?.title || '',
    description: editCollection?.description || '',
    visibility: editCollection?.visibility || 'public'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const collectionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        visibility: formData.visibility,
        ownerId: user.uid,
        ownerName: user.displayName || user.email,
        ownerAvatar: user.photoURL,
        itemCount: editCollection?.itemCount || 0,
        viewsCount: editCollection?.viewsCount || 0,
        updatedAt: serverTimestamp()
      };

      if (editCollection) {
        // Update existing collection
        await updateDoc(doc(db, 'collections', editCollection.id), collectionData);
        onSuccess({ id: editCollection.id, ...collectionData });
      } else {
        // Create new collection
        collectionData.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, 'collections'), collectionData);
        onSuccess({ id: docRef.id, ...collectionData });
      }

      onClose();
    } catch (error) {
      console.error('Error saving collection:', error);
      alert('Failed to save collection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <HiCollection className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editCollection ? 'Edit Collection' : 'Create Collection'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="My Awesome Collection"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe your collection..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              />
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Visibility
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={formData.visibility === 'public'}
                    onChange={(e) => handleChange('visibility', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <HiGlobe className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Public</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Anyone can view this collection</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={formData.visibility === 'private'}
                    onChange={(e) => handleChange('visibility', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <HiLockClosed className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Private</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Only you can view this collection</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || !formData.title.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiSave className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : editCollection ? 'Update' : 'Create'}</span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateCollection;