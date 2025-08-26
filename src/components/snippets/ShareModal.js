import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiX, 
  HiShare, 
  HiClipboard, 
  HiCheck,
  HiCode,
  HiGlobe,
  HiExternalLink
} from 'react-icons/hi';

const ShareModal = ({ snippet, isOpen, onClose }) => {
  const [copied, setCopied] = useState('');
  const [embedSize, setEmbedSize] = useState('medium');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

  const snippetUrl = snippet?.id ? `${window.location.origin}/snippet/${snippet.id}` : window.location.href;
  const embedUrl = snippet?.id ? `${window.location.origin}/embed/${snippet.id}` : '';
  
  const embedSizes = {
    small: { width: 400, height: 300 },
    medium: { width: 600, height: 400 },
    large: { width: 800, height: 500 }
  };

  const embedCode = `<iframe 
  src="${embedUrl}" 
  width="${embedSizes[embedSize].width}" 
  height="${embedSizes[embedSize].height}"
  frameborder="0"
  style="border-radius: 8px; overflow: hidden;"
  title="${snippet?.title || 'Code Snippet'}"
></iframe>`;

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    }
  };

  const shareOnSocial = (platform) => {
    try {
      const text = `Check out this ${snippet?.language || 'code'} snippet: ${snippet?.title || 'Untitled'}`;
      const url = snippetUrl;
      const hashtags = snippet?.tags && snippet.tags.length > 0 ? snippet.tags.slice(0, 3).join(',') : 'coding,programming';
      
      let shareUrl = '';
      
      switch (platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
          break;
        case 'reddit':
          shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
          break;
        case 'hackernews':
          shareUrl = `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(url)}&t=${encodeURIComponent(text)}`;
          break;
        case 'dev':
          shareUrl = `https://dev.to/new?prefill=---%0Atitle: ${encodeURIComponent(snippet?.title || 'Code Snippet')}%0Apublished: false%0Atags: ${encodeURIComponent(hashtags)}%0A---%0A%0ACheck out this code snippet: ${encodeURIComponent(url)}`;
          break;
        default:
          console.warn('Unknown platform:', platform);
          return;
      }
      
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    } catch (error) {
      console.error('Error sharing to social platform:', error);
    }
  };

  if (!isOpen || !snippet) return null;

  return (
    <AnimatePresence mode="wait">
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
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <HiShare className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Share Snippet
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Direct Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Direct Link
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={snippetUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <button
                  onClick={() => copyToClipboard(snippetUrl, 'url')}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {copied === 'url' ? (
                    <HiCheck className="w-4 h-4" />
                  ) : (
                    <HiClipboard className="w-4 h-4" />
                  )}
                  <span className="text-sm">{copied === 'url' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Embed Code */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Embed Code
                </label>
                <select
                  value={embedSize}
                  onChange={(e) => setEmbedSize(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="small">Small (400x300)</option>
                  <option value="medium">Medium (600x400)</option>
                  <option value="large">Large (800x500)</option>
                </select>
              </div>
              
              <div className="relative">
                <textarea
                  value={embedCode}
                  readOnly
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono resize-none"
                />
                <button
                  onClick={() => copyToClipboard(embedCode, 'embed')}
                  className="absolute top-2 right-2 flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  {copied === 'embed' ? (
                    <HiCheck className="w-3 h-3" />
                  ) : (
                    <HiClipboard className="w-3 h-3" />
                  )}
                  <span>{copied === 'embed' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Paste this HTML code into your blog or website to embed the snippet
                </p>
                <a
                  href="/embed-docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Docs
                </a>
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Embed Preview
              </label>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {embedSizes[embedSize].width} × {embedSizes[embedSize].height}
                  </span>
                  <a
                    href={embedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <HiExternalLink className="w-3 h-3" />
                    <span>Preview</span>
                  </a>
                </div>
                <div 
                  className="bg-white border border-gray-200 rounded overflow-hidden"
                  style={{ 
                    width: Math.min(embedSizes[embedSize].width, 400), 
                    height: Math.min(embedSizes[embedSize].height, 200) 
                  }}
                >
                  <iframe
                    src={embedUrl}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    title="Embed Preview"
                    className="pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Social Sharing */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Share on Social Media
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => shareOnSocial('twitter')}
                  className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <span className="text-sm font-medium">Twitter</span>
                </button>
                
                <button
                  onClick={() => shareOnSocial('linkedin')}
                  className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <span className="text-sm font-medium">LinkedIn</span>
                </button>
                
                <button
                  onClick={() => shareOnSocial('facebook')}
                  className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span className="text-sm font-medium">Facebook</span>
                </button>
                
                <button
                  onClick={() => shareOnSocial('reddit')}
                  className="flex items-center justify-center space-x-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <span className="text-sm font-medium">Reddit</span>
                </button>

                <button
                  onClick={() => shareOnSocial('hackernews')}
                  className="flex items-center justify-center space-x-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <span className="text-sm font-medium">Hacker News</span>
                </button>

                <button
                  onClick={() => shareOnSocial('dev')}
                  className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <span className="text-sm font-medium">DEV.to</span>
                </button>
              </div>
            </div>

            {/* Native Share (Mobile) */}
            {navigator.share && (
              <div>
                <button
                  onClick={() => {
                    navigator.share({
                      title: snippet.title,
                      text: snippet.description,
                      url: snippetUrl
                    });
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <HiShare className="w-4 h-4" />
                  <span>Share via Device</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareModal;