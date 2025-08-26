import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiX,
    HiEye,
    HiCode,
    HiSave,
    HiUpload,
    HiArrowsExpand,
    HiMinusSm,
    HiDuplicate,
    HiPencil
} from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { LANGUAGES } from '../../utils/constants';
import CodeEditor from '../editor/CodeEditor';
import TagInput from '../common/TagInput';

const CreateSnippet = ({ isOpen, onClose, onSuccess, forkId = null, editId = null }) => {
    const [activeTab, setActiveTab] = useState('editor');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editorExpanded, setEditorExpanded] = useState(false);
    const [isFork, setIsFork] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [originalSnippet, setOriginalSnippet] = useState(null);
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

    // Load fork or edit data
    useEffect(() => {
        const loadData = async () => {
            if (forkId) {
                try {
                    const forkDoc = await getDoc(doc(db, 'snippets', forkId));
                    if (forkDoc.exists()) {
                        const forkData = forkDoc.data();
                        setIsFork(true);
                        setOriginalSnippet(forkData);
                        setFormData({
                            title: forkData.title || '',
                            description: forkData.description || '',
                            code: forkData.code || '',
                            language: forkData.language || 'javascript',
                            tags: forkData.tags || [],
                            status: 'draft',
                            summary: forkData.summary || ''
                        });
                    }
                } catch (error) {
                    console.error('Error loading fork data:', error);
                }
            } else if (editId) {
                try {
                    const editDoc = await getDoc(doc(db, 'snippets', editId));
                    if (editDoc.exists()) {
                        const editData = editDoc.data();
                        setIsEdit(true);
                        setOriginalSnippet(editData);
                        setFormData({
                            title: editData.title || '',
                            description: editData.description || '',
                            code: editData.code || '',
                            language: editData.language || 'javascript',
                            tags: editData.tags || [],
                            status: editData.status || 'draft',
                            summary: editData.summary || ''
                        });
                    }
                } catch (error) {
                    console.error('Error loading edit data:', error);
                }
            }
        };

        if (isOpen && (forkId || editId)) {
            loadData();
        }
    }, [isOpen, forkId, editId]);

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
            if ((isFork && forkId) || (isEdit && editId)) {
                // Update existing snippet (fork or edit)
                const updateData = {
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    code: formData.code,
                    language: formData.language,
                    tags: formData.tags,
                    primaryTag: formData.tags[0] || null,
                    status,
                    updatedAt: serverTimestamp(),
                    isDraft: status === 'draft',
                    isPublic: status === 'public'
                };

                const docId = forkId || editId;
                await updateDoc(doc(db, 'snippets', docId), updateData);

                if (onSuccess) {
                    onSuccess();
                }
                onClose();
                return;
            }

            // Create new snippet
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
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {isFork ? 'Edit Fork' : isEdit ? 'Edit Snippet' : 'Create New Snippet'}
                            </h2>
                            {isFork && originalSnippet && (
                                <div className="flex items-center space-x-2 mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <HiDuplicate className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm text-blue-700 dark:text-blue-300">
                                        Forked from <span className="font-medium">@{originalSnippet.originalOwnerName}/{originalSnippet.originalTitle}</span>
                                    </span>
                                </div>
                            )}
                            {isEdit && originalSnippet && (
                                <div className="flex items-center space-x-2 mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <HiPencil className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    <span className="text-sm text-green-700 dark:text-green-300">
                                        Editing <span className="font-medium">{originalSnippet.title}</span>
                                    </span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <HiX className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Left Panel - Form Fields */}
                        <div className={`${editorExpanded ? 'hidden' : 'w-full lg:w-1/3'} border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden`}>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                                    >
                                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                    </motion.div>
                                )}

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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
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
                        </div>

                        {/* Right Panel - Editor/Preview */}
                        <div className={`${editorExpanded ? 'w-full' : 'hidden lg:flex lg:w-2/3'} flex flex-col overflow-hidden`}>
                            {/* Editor Tabs */}
                            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                                <div className="flex">
                                    <button
                                        onClick={() => setActiveTab('editor')}
                                        className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors ${activeTab === 'editor'
                                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        <HiCode className="w-4 h-4" />
                                        <span>Editor</span>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('preview')}
                                        className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors ${activeTab === 'preview'
                                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        <HiEye className="w-4 h-4" />
                                        <span>Preview</span>
                                    </button>
                                </div>

                                {/* Expand/Contract Button */}
                                <div className="flex items-center space-x-2 px-4">
                                    <button
                                        onClick={() => setEditorExpanded(!editorExpanded)}
                                        className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                        title={editorExpanded ? 'Show form' : 'Expand editor'}
                                    >
                                        {editorExpanded ? (
                                            <HiMinusSm className="w-4 h-4" />
                                        ) : (
                                            <HiArrowsExpand className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Editor Content */}
                            <div className="flex-1 overflow-hidden">
                                {activeTab === 'editor' ? (
                                    <div className="h-full p-4">
                                        <CodeEditor
                                            value={formData.code}
                                            onChange={(code) => setFormData({ ...formData, code })}
                                            language={formData.language}
                                            placeholder="Enter your code here..."
                                        />
                                    </div>
                                ) : (
                                    <div className="h-full p-4">
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
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Editor Toggle */}
                        <div className="lg:hidden fixed bottom-20 right-6 z-10">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setEditorExpanded(!editorExpanded)}
                                className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                            >
                                {editorExpanded ? (
                                    <HiMinusSm className="w-5 h-5" />
                                ) : (
                                    <HiCode className="w-5 h-5" />
                                )}
                            </motion.button>
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