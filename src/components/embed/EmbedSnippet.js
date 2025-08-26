import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getLanguageColor } from '../../utils/helpers';
import { updateOGTags } from '../../utils/ogImage';
import { HiCode, HiEye, HiExternalLink } from 'react-icons/hi';

const EmbedSnippet = () => {
  const { snippetId } = useParams();
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        const docRef = doc(db, 'snippets', snippetId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const snippetData = { id: docSnap.id, ...docSnap.data() };
          
          // Check if snippet is public
          if (snippetData.status !== 'public' && !snippetData.isPublic) {
            setError('This snippet is not publicly available');
            return;
          }
          
          setSnippet(snippetData);
          
          // Update OG tags for better social sharing
          updateOGTags(snippetData);
        } else {
          setError('Snippet not found');
        }
      } catch (err) {
        console.error('Error fetching snippet:', err);
        setError('Failed to load snippet');
      } finally {
        setLoading(false);
      }
    };

    if (snippetId) {
      fetchSnippet();
    }
  }, [snippetId]);

  // Auto-resize iframe
  useEffect(() => {
    const resizeIframe = () => {
      const height = Math.max(
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight,
        document.body.scrollHeight,
        document.body.offsetHeight
      );
      
      if (window.parent && window.parent.postMessage) {
        window.parent.postMessage({
          type: 'snippime-resize',
          height: height,
          snippetId: snippetId
        }, '*');
      }
    };

    // Initial resize with delay to ensure content is loaded
    const timeouts = [
      setTimeout(resizeIframe, 100),
      setTimeout(resizeIframe, 500),
      setTimeout(resizeIframe, 1000)
    ];
    
    // Resize on window resize and content changes
    window.addEventListener('resize', resizeIframe);
    
    // Create a ResizeObserver to watch for content changes
    const resizeObserver = new ResizeObserver(resizeIframe);
    resizeObserver.observe(document.body);
    
    return () => {
      timeouts.forEach(clearTimeout);
      window.removeEventListener('resize', resizeIframe);
      resizeObserver.disconnect();
    };
  }, [snippet, snippetId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">{error}</div>
          <div className="text-gray-500 text-sm">This snippet may be private or deleted</div>
        </div>
      </div>
    );
  }

  if (!snippet) {
    return null;
  }

  const openInNewTab = () => {
    window.open(`${window.location.origin}/snippet/${snippet.id}`, '_blank');
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <HiCode className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {snippet.title}
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>by {snippet.userName || 'Anonymous'}</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <HiEye className="w-3 h-3" />
                  <span>{snippet.viewsCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={openInNewTab}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            title="Open in new tab"
          >
            <HiExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">View</span>
          </button>
        </div>
      </div>

      {/* Code */}
      <div className="p-4">
        <div className="bg-gray-50 rounded-lg border border-gray-200">
          {/* Code header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-100 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLanguageColor(snippet.language)}`}>
                {snippet.language}
              </span>
            </div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          </div>

          {/* Code content */}
          <div className="p-4 overflow-x-auto">
            <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap">
              <code>{snippet.code}</code>
            </pre>
          </div>
        </div>

        {/* Description */}
        {snippet.description && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-700 text-sm leading-relaxed">
              {snippet.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {snippet.tags && snippet.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {snippet.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 text-center">
        <div className="text-xs text-gray-500">
          Powered by{' '}
          <a 
            href={window.location.origin} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Snippime
          </a>
        </div>
      </div>
    </div>
  );
};

export default EmbedSnippet;