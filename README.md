# Snippime - Modern Code Snippets Platform

A modern, open-source React code snippets platform powered by Firebase with beautiful UI/UX, dark mode support, and professional animations.

## ✨ Features

- **Modern UI/UX**: Built with Tailwind CSS and Framer Motion animations
- **Dark Mode**: Full dark mode support with system preference detection
- **Authentication**: Email/password, Google, and GitHub sign-in
- **Code Editor**: Syntax highlighting with CodeMirror
- **Real-time**: Firebase Firestore for real-time data
- **Responsive**: Mobile-first responsive design
- **Professional**: Clean, modern interface that doesn't look "vibe coded"

## 🚀 Tech Stack

- **Frontend**: React 19.1.1, Tailwind CSS 3.4.17
- **Backend**: Firebase (Auth, Firestore, Storage, Hosting)
- **State Management**: TanStack Query
- **Animations**: Framer Motion
- **Code Editor**: CodeMirror
- **Icons**: React Icons
- **Build Tool**: Create React App 5.0.1

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd snippime
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password, Google, and GitHub providers
3. Create a Firestore database
4. Enable Storage
5. Copy your Firebase config and update `src/config/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 4. Firestore Security Rules

Add these security rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone can read public snippets
    match /snippets/{snippetId} {
      allow read: if resource.data.status == 'public';
      allow create: if request.auth != null && 
                   request.auth.uid == request.resource.data.ownerId;
      allow update, delete: if request.auth != null && 
                           request.auth.uid == resource.data.ownerId;
    }
    
    // Users can manage their own likes and bookmarks
    match /likes/{likeId} {
      allow read, write: if request.auth != null && 
                        request.auth.uid == resource.data.userId;
    }
    
    match /bookmarks/{bookmarkId} {
      allow read, write: if request.auth != null && 
                        request.auth.uid == resource.data.userId;
    }
  }
}
```

### 5. Start Development Server
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── common/         # Reusable components
│   ├── editor/         # Code editor components
│   ├── layout/         # Layout components
│   └── snippets/       # Snippet-related components
├── config/             # Configuration files
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── utils/              # Utility functions
└── index.js           # App entry point
```

## 🎨 Design System

- **Colors**: Tailwind default palette with blue-purple gradient accents
- **Spacing**: 8pt spacing scale
- **Typography**: Inter font family
- **Shadows**: Soft shadows for elevation
- **Animations**: Subtle, professional animations with reduced-motion support

## 🚀 Deployment

### Deploy to Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init hosting
```

4. Build and deploy:
```bash
npm run build
firebase deploy
```

## 📱 Features Overview

### Landing Page
- Hero section with call-to-action
- Live demo carousel
- Feature highlights
- Community stats
- Responsive design

### Authentication
- Email/password sign-up and sign-in
- Google and GitHub OAuth
- Password reset functionality
- Profile management

### Dashboard
- Collapsible sidebar navigation
- Snippet feed with grid/list view
- Search and filtering
- Language and sort options
- Create new snippets

### Code Editor
- Syntax highlighting
- Multiple language support
- Live preview
- Auto-save drafts
- Copy to clipboard

### Snippet Management
- Create, edit, delete snippets
- Version control
- Tags and categories
- Like and bookmark system
- Share functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with Create React App
- UI components inspired by modern design systems
- Icons from React Icons
- Animations powered by Framer Motion

---

**Snippime** - Share Code, Build Together 🚀

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
