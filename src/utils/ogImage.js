// Simple OG image generation utility
// In a production app, you might want to use a service like Vercel OG or generate images server-side

export const generateOGImageUrl = (snippet) => {
  // For now, we'll use a generic OG image
  // In production, you could:
  // 1. Generate images server-side with Canvas/Puppeteer
  // 2. Use a service like Vercel OG, Bannerbear, or Placid
  // 3. Pre-generate images when snippets are created
  
  const baseUrl = window.location.origin;
  
  // Generic OG image with snippet info
  const params = new URLSearchParams({
    title: snippet.title || 'Code Snippet',
    language: snippet.language || 'text',
    author: snippet.userName || 'Anonymous',
    lines: snippet.code ? snippet.code.split('\n').length : 0
  });
  
  // This would point to your OG image generation endpoint
  // For now, return a placeholder or static image
  return `${baseUrl}/api/og?${params.toString()}`;
};

export const getStaticOGImage = (snippet) => {
  // Return a static OG image for now
  const baseUrl = window.location.origin;
  return `${baseUrl}/logo512.png`;
};

// Canvas-based client-side OG image generation (optional)
export const generateClientOGImage = async (snippet) => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size (OG image standard)
    canvas.width = 1200;
    canvas.height = 630;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(snippet.title || 'Code Snippet', canvas.width / 2, 200);
    
    // Language badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(canvas.width / 2 - 100, 250, 200, 50);
    ctx.fillStyle = 'white';
    ctx.font = '24px system-ui, -apple-system, sans-serif';
    ctx.fillText(snippet.language || 'text', canvas.width / 2, 280);
    
    // Author
    ctx.font = '32px system-ui, -apple-system, sans-serif';
    ctx.fillText(`by ${snippet.userName || 'Anonymous'}`, canvas.width / 2, 400);
    
    // Snippime branding
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    ctx.fillText('Snippime', canvas.width / 2, 550);
    
    // Convert to blob
    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png', 0.9);
    });
  } catch (error) {
    console.error('Error generating OG image:', error);
    return null;
  }
};

// Update meta tags with snippet-specific OG image
export const updateOGTags = (snippet) => {
  const ogImage = getStaticOGImage(snippet);
  const title = `${snippet.title} - Snippime`;
  const description = snippet.description || `A ${snippet.language} code snippet by ${snippet.userName || 'Anonymous'}`;
  const url = `${window.location.origin}/snippet/${snippet.id}`;
  
  // Update meta tags
  const updateMetaTag = (property, content) => {
    let element = document.querySelector(`meta[property="${property}"]`) || 
                 document.querySelector(`meta[name="${property}"]`);
    
    if (!element) {
      element = document.createElement('meta');
      if (property.startsWith('og:') || property.startsWith('twitter:')) {
        element.setAttribute('property', property);
      } else {
        element.setAttribute('name', property);
      }
      document.head.appendChild(element);
    }
    
    element.setAttribute('content', content);
  };
  
  // Update document title
  document.title = title;
  
  // Update meta tags
  updateMetaTag('description', description);
  updateMetaTag('og:title', title);
  updateMetaTag('og:description', description);
  updateMetaTag('og:image', ogImage);
  updateMetaTag('og:url', url);
  updateMetaTag('twitter:title', title);
  updateMetaTag('twitter:description', description);
  updateMetaTag('twitter:image', ogImage);
};