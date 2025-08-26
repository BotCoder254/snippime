import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HiCollection, 
  HiEye, 
  HiLockClosed, 
  HiGlobe,
  HiDotsVertical,
  HiPencil,
  HiTrash
} from 'react-icons/hi';
import { formatDate } from '../../utils/helpers';

const CollectionCard = ({ collection, onClick, onEdit, onDelete, index = 0 }) => {
  const [showMenu, setShowMenu] = useState(false);

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

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(collection);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(collection);
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
      onClick={() => onClick(collection)}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg dark:hover:shadow-2xl transition-all duration-200 group relative overflow-hidden"
    >
      {/* Cover Image or Placeholder */}
      <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
        {collection.coverSnippet ? (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <pre className="text-white text-xs font-mono p-4 overflow-hidden">
              <code className="line-clamp-6">
                {collection.coverSnippet.code}
              </code>
            </pre>
          </div>
        ) : (
          <HiCollection className="w-12 h-12 text-white" />
        )}
        
        {/* Privacy indicator */}
        <div className="absolute top-2 right-2">
          {collection.visibility === 'private' ? (
            <HiLockClosed className="w-4 h-4 text-white" />
          ) : (
            <HiGlobe className="w-4 h-4 text-white" />
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {collection.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
            {collection.description || 'No description'}
          </p>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={handleMenuClick}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <HiDotsVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 min-w-[120px]">
                <button
                  onClick={handleEdit}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                >
                  <HiPencil className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                >
                  <HiTrash className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <HiCollection className="w-4 h-4" />
            <span>{collection.itemCount || 0}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <HiEye className="w-4 h-4" />
            <span>{collection.viewsCount || 0}</span>
          </div>
        </div>

        <span>{formatDate(collection.createdAt)}</span>
      </div>
    </motion.div>
  );
};

export default CollectionCard;