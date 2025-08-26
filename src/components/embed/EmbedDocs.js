import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiClipboard, HiCheck, HiCode } from 'react-icons/hi';

const EmbedDocs = () => {
  const [copied, setCopied] = useState('');

  const resizeScript = `<script>
  // Auto-resize Snippime embeds
  window.addEventListener('message', function(event) {
    // Verify origin for security (optional - replace with your domain)
    // if (event.origin !== 'https://your-snippime-domain.com') return;
    
    if (event.data.type === 'snippime-resize') {
      const iframe = document.querySelector('iframe[src*="embed/' + event.data.snippetId + '"]');
      if (iframe) {
        iframe.style.height = event.data.height + 'px';
      }
    }
  });
</script>`;

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <HiCode className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Embed Documentation
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Learn how to embed Snippime code snippets in your website or blog
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Embedding */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Basic Embedding
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              To embed a snippet, use the share button on any snippet and copy the embed code. 
              The basic iframe will look like this:
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm">
              <code className="text-gray-800 dark:text-gray-200">
                {`<iframe 
  src="https://your-domain.com/embed/SNIPPET_ID" 
  width="600" 
  height="400"
  frameborder="0"
  style="border-radius: 8px; overflow: hidden;"
  title="Code Snippet"
></iframe>`}
              </code>
            </div>
          </section>

          {/* Auto-resize */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Auto-resize Functionality
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              For better user experience, embeds can automatically adjust their height based on content. 
              Add this script to your page to enable auto-resizing:
            </p>
            
            <div className="relative">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {resizeScript}
                </pre>
              </div>
              <button
                onClick={() => copyToClipboard(resizeScript, 'script')}
                className="absolute top-2 right-2 flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
              >
                {copied === 'script' ? (
                  <HiCheck className="w-3 h-3" />
                ) : (
                  <HiClipboard className="w-3 h-3" />
                )}
                <span>{copied === 'script' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </section>

          {/* Best Practices */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Best Practices
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Responsive Design
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  Use percentage widths or CSS media queries to make embeds responsive:
                </p>
                <code className="block mt-2 text-xs bg-blue-100 dark:bg-blue-900/40 p-2 rounded">
                  width: 100%; max-width: 800px;
                </code>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  Loading Performance
                </h3>
                <p className="text-green-800 dark:text-green-200 text-sm">
                  Add <code className="bg-green-100 dark:bg-green-900/40 px-1 rounded">loading="lazy"</code> to 
                  iframes that are below the fold to improve page load times.
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                  Security
                </h3>
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  Uncomment and modify the origin check in the resize script to only allow 
                  messages from your Snippime domain for enhanced security.
                </p>
              </div>
            </div>
          </section>

          {/* Examples */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Complete Example
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Here's a complete HTML example with auto-resize functionality:
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-gray-800 dark:text-gray-200">
{`<!DOCTYPE html>
<html>
<head>
  <title>My Blog Post</title>
  <style>
    .snippet-embed {
      width: 100%;
      max-width: 800px;
      margin: 20px 0;
      border-radius: 8px;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <h1>Check out this code snippet:</h1>
  
  <iframe 
    class="snippet-embed"
    src="https://your-domain.com/embed/SNIPPET_ID" 
    height="400"
    frameborder="0"
    loading="lazy"
    title="Code Snippet"
  ></iframe>

  <script>
    window.addEventListener('message', function(event) {
      if (event.data.type === 'snippime-resize') {
        const iframe = document.querySelector('iframe[src*="embed/' + event.data.snippetId + '"]');
        if (iframe) {
          iframe.style.height = event.data.height + 'px';
        }
      }
    });
  </script>
</body>
</html>`}
              </pre>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EmbedDocs;