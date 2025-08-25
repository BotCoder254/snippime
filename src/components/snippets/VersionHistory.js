import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiClock, 
  HiUser, 
  HiCode, 
  HiArrowLeft,
  HiChevronDown,
  HiChevronRight,
  HiRefresh,
  HiEye
} from 'react-icons/hi';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/helpers';
import CodeEditor from '../editor/CodeEditor';

const VersionHistory = ({ snippet, isOpen, onClose, onRevert }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [expandedVersions, setExpandedVersions] = useState(new Set());
  const [comparing, setComparing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!isOpen || !snippet?.id) return;

    const versionsRef = collection(db, 'snippets', snippet.id, 'versions');
    const q = query(versionsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const versionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVersions(versionsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching versions:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, snippet?.id]);

  const toggleVersionExpansion = (versionId) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId);
    } else {
      newExpanded.add(versionId);
    }
    setExpandedVersions(newExpanded);
  };

  const handleRevert = async (version) => {
    if (!user || user.uid !== snippet.ownerId) return;

    try {
      // Update main snippet with version code
      const snippetRef = doc(db, 'snippets', snippet.id);
      await updateDoc(snippetRef, {
        code: version.code,
        language: version.language,
        updatedAt: serverTimestamp()
      });

      // Create a new version entry for the revert
      const versionsRef = collection(db, 'snippets', snippet.id, 'versions');
      await addDoc(versionsRef, {
        code: version.code,
        language: version.language,
        summary: `Reverted to version from ${formatDate(version.createdAt)}`,
        createdAt: serverTimestamp(),
        author: {
          uid: user.uid,
          displayName: user.displayName || user.email,
          photoURL: user.photoURL || null
        },
        isRevert: true,
        revertedFrom: version.id
      });

      if (onRevert) {
        onRevert(version);
      }
    } catch (error) {
      console.error('Error reverting to version:', error);
    }
  };

  const getDiffPreview = (currentCode, versionCode) => {
    const currentLines = currentCode.split('\n');
    const versionLines = versionCode.split('\n');
    const maxLines = Math.max(currentLines.length, versionLines.length);
    
    let diffCount = 0;
    for (let i = 0; i < maxLines && diffCount < 3; i++) {
      if (currentLines[i] !== versionLines[i]) {
        diffCount++;
      }
    }
    
    return diffCount;
  };

  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const contentVariants = {
    hidden: { x: '100%' },
    visible: { x: 0 },
    exit: { x: '100%' }
  };

  if (!isOpen) return null;

  const isOwner = user && user.uid === snippet.ownerId;

  return (
    <AnimatePresence>
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex"
      >
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="ml-auto w-full max-w-4xl h-full bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <HiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Version History
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {snippet.title}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {versions.length} version{versions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {selectedVersion ? (
              /* Version Detail View */
              <div className="h-full flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setSelectedVersion(null)}
                      className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      <HiArrowLeft className="w-4 h-4" />
                      <span>Back to timeline</span>
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setComparing(!comparing)}
                        className="flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <HiEye className="w-4 h-4" />
                        <span className="text-sm">{comparing ? 'Hide' : 'Compare'}</span>
                      </button>
                      
                      {isOwner && (
                        <button
                          onClick={() => handleRevert(selectedVersion)}
                          className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <HiRefresh className="w-4 h-4" />
                          <span className="text-sm">Revert</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <HiClock className="w-4 h-4" />
                      <span>{formatDate(selectedVersion.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <HiUser className="w-4 h-4" />
                      <span>{selectedVersion.author?.displayName}</span>
                    </div>
                  </div>
                  
                  {selectedVersion.summary && (
                    <p className="mt-2 text-gray-700 dark:text-gray-300">
                      {selectedVersion.summary}
                    </p>
                  )}
                </div>
                
                <div className="flex-1 p-6">
                  {comparing ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Version
                        </h3>
                        <CodeEditor
                          value={snippet.code}
                          language={snippet.language}
                          readOnly={true}
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Selected Version
                        </h3>
                        <CodeEditor
                          value={selectedVersion.code}
                          language={selectedVersion.language}
                          readOnly={true}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Code
                      </h3>
                      <CodeEditor
                        value={selectedVersion.code}
                        language={selectedVersion.language}
                        readOnly={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Timeline View */
              <div className="p-6 overflow-y-auto">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : versions.length === 0 ? (
                  <div className="text-center py-12">
                    <HiClock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Version History
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Versions will appear here when you save changes to this snippet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Current Version */}
                    <div className="relative">
                      <div className="flex items-center space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <HiCode className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              Current Version
                            </h3>
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400 text-xs font-medium rounded-full">
                              Latest
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Last updated {formatDate(snippet.updatedAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedVersion({ 
                            id: 'current', 
                            code: snippet.code, 
                            language: snippet.language,
                            createdAt: snippet.updatedAt,
                            author: snippet.author,
                            summary: 'Current version'
                          })}
                          className="px-3 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                        >
                          <HiEye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Version Timeline */}
                    <div className="relative">
                      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                      
                      {versions.map((version, index) => (
                        <motion.div
                          key={version.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative"
                        >
                          <div className="flex items-start space-x-4 pb-6">
                            <div className="relative z-10 w-10 h-10 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center">
                              <img
                                src={version.author?.photoURL || `https://ui-avatars.com/api/?name=${version.author?.displayName}&background=6366f1&color=fff`}
                                alt={version.author?.displayName}
                                className="w-6 h-6 rounded-full"
                              />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                      {version.author?.displayName}
                                    </h3>
                                    {version.isRevert && (
                                      <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 text-xs font-medium rounded-full">
                                        Revert
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                      {formatDate(version.createdAt)}
                                    </span>
                                    <button
                                      onClick={() => toggleVersionExpansion(version.id)}
                                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors lg:hidden"
                                    >
                                      {expandedVersions.has(version.id) ? (
                                        <HiChevronDown className="w-4 h-4" />
                                      ) : (
                                        <HiChevronRight className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                                
                                {version.summary && (
                                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                                    {version.summary}
                                  </p>
                                )}
                                
                                <div className={`${expandedVersions.has(version.id) || window.innerWidth >= 1024 ? 'block' : 'hidden'} lg:block`}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                      <span>{getDiffPreview(snippet.code, version.code)} changes</span>
                                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                        {version.language}
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => setSelectedVersion(version)}
                                        className="px-3 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                      >
                                        View
                                      </button>
                                      {isOwner && (
                                        <button
                                          onClick={() => handleRevert(version)}
                                          className="px-3 py-1 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-colors"
                                        >
                                          Revert
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VersionHistory;