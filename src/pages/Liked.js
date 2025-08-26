import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiHeart, 
  HiSearch,
  HiFilter,
  HiSortAscending
} from 'react-icons/hi';
import { useAuth } from '../hooks/useAuth';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import SnippetCard from '../components/snippets/SnippetCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import Sidebar from '../components/layout/Sidebar';
import SnippetDetail from '../components/snippets/SnippetDetail';

const Liked = () => {
  const { user } = useAuth();
  const [likedSnippets, setLikedSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState(null);

  const sortOptions = [
    { value: 'newest', label: 'Recently Liked' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'language', label: 'Language' },
    { value: 'score', label: 'Highest Score' }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Languages' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'react', label: 'React' },
    { value: 'css', label: 'CSS' },
    { value: 'html', label: 'HTML' }
  ];

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      query(
        collection(db, 'votes'),
        where('userId', '==', user.uid),
        where('type', '==', 'up')
      ),
      async (querySnapshot) => {
        const likedIds = querySnapshot.docs.map(doc => doc.data().snippetId);
        
        if (likedIds.length === 0) {
          setLikedSnippets([]);
          setLoading(false);
          return;
        }

        // Fetch snippets in batches due to Firestore 'in' query limit of 10
        const batchSize = 10;
        const allSnippets = [];
        
        for (let i = 0; i < likedIds.length; i += batchSize) {
          const batch = likedIds.slice(i, i + batchSize);
          try {
            const snippetsQuery = query(
              collection(db, 'snippets'),
              where('__name__', 'in', batch)
            );
            
            const snapshot = await new Promise((resolve) => {
              const unsubscribeSnippets = onSnapshot(snippetsQuery, resolve);
              return unsubscribeSnippets;
            });
            
            const batchSnippets = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            allSnippets.push(...batchSnippets);
          } catch (error) {
            console.error('Error fetching batch:', error);
          }
        }
        
        // Client-side sorting
        allSnippets.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateB - dateA;
        });

        setLikedSnippets(allSnippets);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching liked snippets:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const filteredAndSortedSnippets = likedSnippets
    .filter(snippet => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          snippet.title.toLowerCase().includes(query) ||
          (snippet.description && snippet.description.toLowerCase().includes(query)) ||
          (snippet.tags && snippet.tags.some(tag => tag.toLowerCase().includes(query)))
        );
      }
      return true;
    })
    .filter(snippet => {
      // Language filter
      if (filterBy === 'all') return true;
      return snippet.language?.toLowerCase() === filterBy;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt?.toDate?.() || b.createdAt) - new Date(a.createdAt?.toDate?.() || a.createdAt);
        case 'oldest':
          return new Date(a.createdAt?.toDate?.() || a.createdAt) - new Date(b.createdAt?.toDate?.() || b.createdAt);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'language':
          return (a.language || '').localeCompare(b.language || '');
        case 'score':
          return (b.score || 0) - (a.score || 0);
        default:
          return 0;
      }
    });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Sign in to view your liked snippets
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Like snippets to see them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Liked Snippets
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Code snippets you've upvoted
                </p>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search liked snippets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <HiFilter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <HiSortAscending className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {/* Snippets Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <LoadingSkeleton key={i} className="h-full" />
              ))}
            </div>
          ) : filteredAndSortedSnippets.length === 0 ? (
            <EmptyState
              icon={HiHeart}
              title={searchQuery || filterBy !== 'all' ? 'No liked snippets found' : 'No liked snippets yet'}
              description={
                searchQuery || filterBy !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start liking snippets to see them here'
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedSnippets.map((snippet, index) => (
                <SnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  onClick={(snippet) => setSelectedSnippet(snippet)}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Snippet Detail Modal */}
      <SnippetDetail
        snippet={selectedSnippet}
        isOpen={!!selectedSnippet}
        onClose={() => setSelectedSnippet(null)}
      />
    </div>
  );
};

export default Liked;