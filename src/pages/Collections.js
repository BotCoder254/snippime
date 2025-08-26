import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiCollection, 
  HiPlus, 
  HiSearch,
  HiFilter,
  HiSortAscending
} from 'react-icons/hi';
import { useAuth } from '../hooks/useAuth';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import CollectionCard from '../components/collections/CollectionCard';
import CreateCollection from '../components/collections/CreateCollection';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import Sidebar from '../components/layout/Sidebar';

const Collections = () => {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'items', label: 'Most Items' }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Collections' },
    { value: 'public', label: 'Public Only' },
    { value: 'private', label: 'Private Only' }
  ];

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      query(
        collection(db, 'collections'),
        where('ownerId', '==', user.uid)
      ),
      (querySnapshot) => {
        let collectionsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Client-side sorting to avoid index requirement
        collectionsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        
        setCollections(collectionsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching collections:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const filteredAndSortedCollections = collections
    .filter(collection => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          collection.title.toLowerCase().includes(query) ||
          (collection.description && collection.description.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .filter(collection => {
      // Visibility filter
      if (filterBy === 'all') return true;
      return collection.visibility === filterBy;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt?.toDate?.() || b.createdAt) - new Date(a.createdAt?.toDate?.() || a.createdAt);
        case 'oldest':
          return new Date(a.createdAt?.toDate?.() || a.createdAt) - new Date(b.createdAt?.toDate?.() || b.createdAt);
        case 'name':
          return a.title.localeCompare(b.title);
        case 'items':
          return (b.itemCount || 0) - (a.itemCount || 0);
        default:
          return 0;
      }
    });

  const handleCreateCollection = (newCollection) => {
    setCollections(prev => [newCollection, ...prev]);
    setShowCreateModal(false);
  };

  const handleEditCollection = (collection) => {
    setEditingCollection(collection);
    setShowCreateModal(true);
  };

  const handleUpdateCollection = (updatedCollection) => {
    setCollections(prev => 
      prev.map(c => c.id === updatedCollection.id ? updatedCollection : c)
    );
    setEditingCollection(null);
    setShowCreateModal(false);
  };

  const handleDeleteCollection = async (collection) => {
    if (!window.confirm(`Are you sure you want to delete "${collection.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'collections', collection.id));
      setCollections(prev => prev.filter(c => c.id !== collection.id));
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Failed to delete collection. Please try again.');
    }
  };

  const handleCollectionClick = (collection) => {
    // Navigate to collection detail page
    window.location.href = `/collections/${collection.id}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Sign in to view your collections
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create and organize your code snippets into collections
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
                My Collections
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Organize your snippets into collections
              </p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="mt-4 sm:mt-0 flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
          >
            <HiPlus className="w-5 h-5" />
            <span>New Collection</span>
          </motion.button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search collections..."
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

        {/* Collections Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <LoadingSkeleton key={i} className="h-64" />
            ))}
          </div>
        ) : filteredAndSortedCollections.length === 0 ? (
          <EmptyState
            icon={HiCollection}
            title={searchQuery || filterBy !== 'all' ? 'No collections found' : 'No collections yet'}
            description={
              searchQuery || filterBy !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first collection to organize your snippets'
            }
            action={
              !searchQuery && filterBy === 'all' ? {
                label: 'Create Collection',
                onClick: () => setShowCreateModal(true)
              } : null
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedCollections.map((collection, index) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onClick={handleCollectionClick}
                onEdit={handleEditCollection}
                onDelete={handleDeleteCollection}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Mobile horizontal scroll for small screens */}
        <div className="sm:hidden mt-8">
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {filteredAndSortedCollections.map((collection, index) => (
              <div key={collection.id} className="flex-shrink-0 w-64">
                <CollectionCard
                  collection={collection}
                  onClick={handleCollectionClick}
                  onEdit={handleEditCollection}
                  onDelete={handleDeleteCollection}
                  index={index}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create/Edit Collection Modal */}
      <CreateCollection
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingCollection(null);
        }}
        onSuccess={editingCollection ? handleUpdateCollection : handleCreateCollection}
        editCollection={editingCollection}
      />
      </div>
    </div>
  );
};

export default Collections;