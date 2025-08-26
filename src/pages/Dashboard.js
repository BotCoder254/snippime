import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiPlus,
  HiSearch,
  HiViewGrid,
  HiViewList,
  HiFilter,
  HiX,
  HiCalendar,
  HiTrendingUp,
  HiStar,
  HiClock,
  HiAdjustments,
  HiChevronDown,
  HiTag
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
import FilterDrawer from '../components/common/FilterDrawer';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [timeFilter, setTimeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [highlightedResults, setHighlightedResults] = useState([]);
  const { user } = useAuth();

  const languages = [
    { value: 'all', label: 'All Languages' },
    ...LANGUAGES.slice(0, 15) // Show most popular languages in filter
  ];

  const timeFilters = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest', icon: HiClock },
    { value: 'trending', label: 'Trending', icon: HiTrendingUp },
    { value: 'top', label: 'Top Rated', icon: HiStar },
    { value: 'popular', label: 'Most Popular', icon: HiViewGrid }
  ];

  // Common tags for quick filtering
  const popularTags = [
    'react', 'javascript', 'typescript', 'python', 'css', 'html',
    'node', 'api', 'database', 'authentication', 'utility', 'component'
  ];

  useEffect(() => {
    const unsubscribe = fetchSnippetsRealtime();
    return () => unsubscribe && unsubscribe();
  }, [selectedLanguage, selectedTags, timeFilter, sortBy]);

  const fetchSnippetsRealtime = () => {
    setLoading(true);
    try {
      // Simple query without complex indexes - filter and sort on client side
      let q = query(
        collection(db, 'snippets'),
        limit(200) // Get more docs to filter client-side
      );

      // Only add orderBy if no other filters are applied to avoid index requirements
      if (selectedLanguage === 'all' && selectedTags.length === 0 && timeFilter === 'all') {
        switch (sortBy) {
          case 'newest':
            q = query(q, orderBy('createdAt', 'desc'));
            break;
          case 'top':
            q = query(q, orderBy('score', 'desc'));
            break;
          case 'trending':
            q = query(q, orderBy('scoreHot', 'desc'));
            break;
          case 'popular':
            q = query(q, orderBy('viewsCount', 'desc'));
            break;
          default:
            q = query(q, orderBy('createdAt', 'desc'));
        }
      } else {
        // Use default ordering when filters are applied
        q = query(q, orderBy('createdAt', 'desc'));
      }

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        let snippetsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Client-side filtering
        snippetsData = snippetsData.filter(snippet => {
          // Filter by status (public only)
          if (snippet.status !== 'public' && !snippet.isPublic) return false;
          
          // Filter by language
          if (selectedLanguage !== 'all' && snippet.language !== selectedLanguage) return false;
          
          // Filter by tags
          if (selectedTags.length > 0) {
            const hasTag = selectedTags.some(tag => 
              snippet.tags && snippet.tags.includes(tag)
            );
            if (!hasTag) return false;
          }
          
          // Filter by time
          if (timeFilter !== 'all' && snippet.createdAt) {
            const now = new Date();
            const createdAt = snippet.createdAt.toDate ? snippet.createdAt.toDate() : new Date(snippet.createdAt);
            let startDate;

            switch (timeFilter) {
              case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
              case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
              case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            }

            if (startDate && createdAt < startDate) return false;
          }
          
          return true;
        });

        // Client-side sorting (if filters were applied)
        if (selectedLanguage !== 'all' || selectedTags.length > 0 || timeFilter !== 'all') {
          switch (sortBy) {
            case 'newest':
              snippetsData.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                return dateB - dateA;
              });
              break;
            case 'top':
              snippetsData.sort((a, b) => (b.score || 0) - (a.score || 0));
              break;
            case 'trending':
              snippetsData.sort((a, b) => (b.scoreHot || 0) - (a.scoreHot || 0));
              break;
            case 'popular':
              snippetsData.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
              break;
          }
        }

        // Client-side filtering for multiple tags
        if (selectedTags.length > 1) {
          snippetsData = snippetsData.filter(snippet =>
            selectedTags.every(tag => snippet.tags?.includes(tag))
          );
        }

        // Client-side sorting for trending if no scoreHot field
        if (sortBy === 'trending' && snippetsData.length > 0 && !snippetsData[0].scoreHot) {
          snippetsData = snippetsData.sort((a, b) => {
            const scoreA = calculateHotScore(a);
            const scoreB = calculateHotScore(b);
            return scoreB - scoreA;
          });
        }

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

  // Calculate hot score (Reddit-style algorithm)
  const calculateHotScore = (snippet) => {
    const score = (snippet.likesCount || 0) - (snippet.dislikesCount || 0);
    const order = Math.log10(Math.max(Math.abs(score), 1));
    const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
    const seconds = (snippet.createdAt?.seconds || Date.now() / 1000) - 1134028003; // Epoch
    return sign * order + seconds / 45000;
  };

  // Enhanced search with highlighting
  const filteredSnippets = useMemo(() => {
    if (!searchTerm.trim()) {
      setHighlightedResults([]);
      return snippets;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = snippets.filter(snippet => {
      const titleMatch = snippet.title.toLowerCase().includes(searchLower);
      const descMatch = snippet.description?.toLowerCase().includes(searchLower);
      const tagMatch = snippet.tags?.some(tag => tag.toLowerCase().includes(searchLower));

      return titleMatch || descMatch || tagMatch;
    });

    // Create highlighted results for UI
    const highlighted = filtered.map(snippet => ({
      ...snippet,
      highlightedTitle: highlightText(snippet.title, searchTerm),
      highlightedDescription: highlightText(snippet.description || '', searchTerm),
      highlightedTags: snippet.tags?.map(tag => highlightText(tag, searchTerm))
    }));

    setHighlightedResults(highlighted);
    return filtered;
  }, [snippets, searchTerm]);

  const highlightText = (text, search) => {
    if (!search.trim()) return text;

    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>');
  };

  const handleSnippetClick = (snippet) => {
    setSelectedSnippet(snippet);
  };

  const handleCreateSuccess = () => {
    // Real-time listener will automatically update the snippets
  };

  const handleTagFilter = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    setSelectedLanguage('all');
    setSelectedTags([]);
    setTimeFilter('all');
    setSearchTerm('');
  };

  const hasActiveFilters = selectedLanguage !== 'all' || selectedTags.length > 0 || timeFilter !== 'all' || searchTerm.trim();

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

        {/* Search and Filters Bar */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4"
        >
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search snippets by title, description, or tags..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Left Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="lg:hidden flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <HiFilter className="w-4 h-4" />
                  <span className="text-sm">Filters</span>
                  <HiChevronDown className={`w-4 h-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Desktop Filters */}
                <div className={`${filtersOpen ? 'flex' : 'hidden'} lg:flex flex-wrap items-center gap-3`}>
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
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {timeFilters.map((filter) => (
                      <option key={filter.value} value={filter.value}>
                        {filter.label}
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

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center space-x-1 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <HiX className="w-4 h-4" />
                      <span className="text-sm">Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${viewMode === 'grid'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    <HiViewGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${viewMode === 'list'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    <HiViewList className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredSnippets.length} snippet{filteredSnippets.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Popular Tags */}
            {!searchTerm && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Popular:</span>
                {popularTags.slice(0, 8).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagFilter(tag)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedTags.includes(tag)
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                  >
                    <HiTag className="w-3 h-3 mr-1" />
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Three-Column Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Already handled by main Sidebar component */}

          {/* Center - Snippets Feed */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
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
                      ? 'masonry-grid columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6'
                      : 'space-y-4'
                  }
                >
                  <AnimatePresence>
                    {filteredSnippets.map((snippet, index) => (
                      <motion.div
                        key={snippet.id}
                        className={viewMode === 'grid' ? 'break-inside-avoid mb-6' : ''}
                        layout
                      >
                        <SnippetCard
                          snippet={snippet}
                          onClick={handleSnippetClick}
                          index={index}
                          highlighted={highlightedResults.find(h => h.id === snippet.id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Panel - Snippet Detail (when selected) */}
          <AnimatePresence>
            {selectedSnippet && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full max-w-2xl border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hidden lg:block"
              >
                <SnippetDetail
                  snippet={selectedSnippet}
                  isOpen={true}
                  onClose={() => setSelectedSnippet(null)}
                  embedded={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
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

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        languages={languages}
        timeFilters={timeFilters}
        sortOptions={sortOptions}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedTags={selectedTags}
        handleTagFilter={handleTagFilter}
        popularTags={popularTags}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Mobile Snippet Detail Modal */}
      <SnippetDetail
        snippet={selectedSnippet}
        isOpen={!!selectedSnippet}
        onClose={() => setSelectedSnippet(null)}
        embedded={false}
      />
    </div>
  );
};

export default Dashboard;