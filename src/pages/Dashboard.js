import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiPlus, 
  HiSearch, 
  HiViewGrid,
  HiViewList
} from 'react-icons/hi';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { LANGUAGES } from '../utils/constants';
import Sidebar from '../components/layout/Sidebar';
import SnippetCard from '../components/snippets/SnippetCard';
import SnippetDetail from '../components/snippets/SnippetDetail';
import CreateSnippet from '../components/snippets/CreateSnippet';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import ThemeToggle from '../components/common/ThemeToggle';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const { } = useAuth();

  const languages = [
    { value: 'all', label: 'All Languages' },
    ...LANGUAGES.slice(0, 15) // Show most popular languages in filter
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'liked', label: 'Most Liked' },
    { value: 'viewed', label: 'Most Viewed' }
  ];

  useEffect(() => {
    const unsubscribe = fetchSnippetsRealtime();
    return () => unsubscribe && unsubscribe();
  }, [selectedLanguage, sortBy]);

  const fetchSnippetsRealtime = () => {
    setLoading(true);
    try {
      let q = query(
        collection(db, 'snippets'),
        where('status', '==', 'public'),
        limit(50)
      );

      // Add language filter
      if (selectedLanguage !== 'all') {
        q = query(q, where('language', '==', selectedLanguage));
      }

      // Add sorting
      switch (sortBy) {
        case 'recent':
          q = query(q, orderBy('createdAt', 'desc'));
          break;
        case 'popular':
          q = query(q, orderBy('viewsCount', 'desc'));
          break;
        case 'liked':
          q = query(q, orderBy('likesCount', 'desc'));
          break;
        case 'viewed':
          q = query(q, orderBy('viewsCount', 'desc'));
          break;
        default:
          q = query(q, orderBy('createdAt', 'desc'));
      }

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const snippetsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSnippets(snippetsData);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching snippets:', error);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up real-time listener:', error);
      setLoading(false);
      return null;
    }
  };

  const filteredSnippets = snippets.filter(snippet =>
    snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    snippet.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSnippetClick = (snippet) => {
    setSelectedSnippet(snippet);
  };

  const handleCreateSuccess = () => {
    // Real-time listener will automatically update the snippets
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <HiViewGrid className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Explore Snippets
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
              >
                <HiPlus className="w-5 h-5" />
                <span className="hidden sm:inline">New Snippet</span>
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Filters and Search */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search snippets..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <HiViewGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <HiViewList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 flex">
          {/* Snippets Feed */}
          <div className="flex-1 p-6">
            {loading ? (
              <LoadingSkeleton type={viewMode === 'grid' ? 'card' : 'list'} count={6} />
            ) : filteredSnippets.length === 0 ? (
              <EmptyState
                type={searchTerm ? 'search' : 'snippets'}
                onAction={() => setCreateModalOpen(true)}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                <AnimatePresence>
                  {filteredSnippets.map((snippet, index) => (
                    <SnippetCard
                      key={snippet.id}
                      snippet={snippet}
                      onClick={handleSnippetClick}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button (Mobile) */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setCreateModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-40 flex items-center justify-center lg:hidden"
      >
        <HiPlus className="w-6 h-6" />
      </motion.button>

      {/* Modals */}
      <SnippetDetail
        snippet={selectedSnippet}
        isOpen={!!selectedSnippet}
        onClose={() => setSelectedSnippet(null)}
      />

      <CreateSnippet
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default Dashboard;