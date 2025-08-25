import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiX, 
  HiEye, 
  HiCode,
  HiSave,
  HiUpload
} from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { LANGUAGES } from '../../utils/constants';
import CodeEditor from '../editor/CodeEditor';
import TagInput from '../common/TagInput';

const CreateSnippet = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('editor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    language: 'javascript',
    tags: [],
    status: 'draft',
    summary: ''
  });

  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const contentVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      scale: 0.8, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const handleTagsChange = (newTags) => {
    setFormData({
      ...formData,
      tags: newTags
    });
  };

  const handleSave = async (status = 'draft') => {
    if (!user) {
      setError('You must be logged in to create snippets');
      return;
    }

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.code.trim()) {
      setError('Code is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const snippetData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        code: formData.code,
        language: formData.language,
        tags: formData.tags,
        primaryTag: formData.tags[0] || null, // For faster queries
        status,
        ownerId: user.uid,
        author: {
          uid: user.uid,
          displayName: user.displayName || user.email,
          photoURL: user.photoURL || null
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likesCount: 0,
        viewsCount: 0,
        commentsCount: 0,
        versionCount: 1
      };

      const docRef = await addDoc(collection(db, 'snippets'), snippetData);
      
      // Create initial version if publishing
      if (status === 'public') {
        await addDoc(collection(db, 'snippets', docRef.id, 'versions'), {
          code: formData.code,
          language: formData.language,
          summary: formData.summary || 'Initial version',
          createdAt: serverTimestamp(),
          author: {
            uid: user.uid,
            displayName: user.displayName || user.email,
            photoURL: user.photoURL || null
          },
          isInitial: true
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        code: '',
        language: 'javascript',
        tags: [],
        status: 'draft',
        summary: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
      >
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl h-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Snippet
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <HiX className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Form Fields */}
            <div className="p-6 space-y-4 border-b border-gray-200 dark:border-gray-700">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter snippet title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  placeholder="Describe what this snippet does"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <TagInput
                  tags={formData.tags}
                  onChange={handleTagsChange}
                  placeholder="Add tags to help others find your snippet"
                  maxTags={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Version Summary (Optional)
                </label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Brief description of this version (e.g., 'Added error handling')"
                />
              </div>
            </div>

            {/* Editor/Preview Tabs */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors ${
                    activeTab === 'editor'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <HiCode className="w-4 h-4" />
                  <span>Editor</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors ${
                    activeTab === 'preview'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <HiEye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
              </div>

              <div className="flex-1 p-6 overflow-hidden">
                {activeTab === 'editor' ? (
                  <CodeEditor
                    value={formData.code}
                    onChange={(code) => setFormData({ ...formData, code })}
                    language={formData.language}
                    placeholder="Enter your code here..."
                  />
                ) : (
                  <div className="h-full border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 border-b border-gray-300 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-1">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formData.language}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 h-full overflow-auto bg-white dark:bg-gray-900">
                      <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono">
                        <code>{formData.code || 'No code to preview'}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formData.status === 'draft' ? 'Saving as draft' : 'Publishing snippet'}
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSave('draft')}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <HiSave className="w-4 h-4" />
                <span>Save Draft</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSave('public')}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                <HiUpload className="w-4 h-4" />
                <span>{loading ? 'Publishing...' : 'Publish'}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateSnippet;