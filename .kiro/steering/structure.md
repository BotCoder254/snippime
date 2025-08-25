# Project Structure

## Root Directory
```
snippime/
├── public/          # Static assets and HTML template
├── src/             # Source code
├── node_modules/    # Dependencies (auto-generated)
├── .git/            # Git repository
├── .kiro/           # Kiro configuration and steering
├── package.json     # Project configuration and dependencies
├── tailwind.config.js # Tailwind CSS configuration
└── README.md        # Project documentation
```

## Public Directory
- `index.html` - Main HTML template
- `favicon.ico` - Site favicon
- `logo192.png`, `logo512.png` - PWA icons
- `manifest.json` - PWA manifest
- `robots.txt` - Search engine directives

## Source Directory (`src/`)
- `index.js` - Application entry point
- `App.js` - Main application component
- `index.css` - Global styles
- `App.test.js` - App component tests
- `setupTests.js` - Test configuration
- `reportWebVitals.js` - Performance monitoring
- `logo.svg` - React logo asset

## Conventions
- Components should be placed in `src/` directory
- Test files use `.test.js` suffix
- CSS files use `.css` extension
- Global styles in `index.css`
- Component-specific styles can be co-located or use Tailwind classes
- Follow React functional component patterns with hooks