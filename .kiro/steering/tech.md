# Technology Stack

## Core Framework
- **React 19.1.1** - Latest React with modern features
- **Create React App 5.0.1** - Build toolchain and development server
- **React DOM 19.1.1** - DOM rendering

## Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **CSS** - Standard CSS for custom styles

## Testing
- **@testing-library/react 16.3.0** - React component testing
- **@testing-library/jest-dom 6.8.0** - Custom Jest matchers
- **@testing-library/user-event 13.5.0** - User interaction simulation
- **Jest** - Test runner (included with CRA)

## Development Tools
- **ESLint** - Code linting with react-app configuration
- **Web Vitals 2.1.4** - Performance monitoring

## Common Commands

### Development
```bash
npm start          # Start development server (localhost:3000)
npm test           # Run tests in watch mode
npm run build      # Create production build
```

### Package Management
```bash
npm install        # Install dependencies
npm install <pkg>  # Add new dependency
```

## Build System
- Uses Create React App's built-in Webpack configuration
- No ejection - relies on CRA's curated toolchain
- Production builds are optimized and minified automatically