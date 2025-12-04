# NoteShare - Technical Overview

## Executive Summary

NoteShare is a modern, full-stack web application built with React and Firebase that enables students to share course notes, collaborate, and compete on a leaderboard system. The application follows a serverless architecture using Firebase as the Backend-as-a-Service (BaaS), providing authentication, real-time database, file storage, and hosting capabilities.

---

## 1. System Architecture & Layers

### 1.1 Architecture Pattern
**Serverless Single Page Application (SPA)**
- **Frontend**: React 19.1.1 with React Router for client-side routing
- **Backend**: Firebase (Firestore, Authentication, Storage, Hosting)
- **Build Tool**: Vite 7.1.7 for fast development and optimized production builds
- **Styling**: Tailwind CSS 4.1.17 for utility-first styling

### 1.2 System Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                   │
│  React Components (Pages, Components, Navigation)      │
│  - JSX/TSX Components                                   │
│  - React Hooks (useState, useEffect, useMemo, etc.)    │
│  - React Router for navigation                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│  React Context API (State Management)                   │
│  - AuthContext: Authentication & user data               │
│  - SchoolsContext: School data management               │
│  - CoursesContext: Course data management               │
│  - NotesContext: Note/post data management              │
│  - VotingContext: Voting system logic                   │
│  - UsersContext: User data for leaderboard             │
│  - CourseContext: Currently selected course state       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    Service Layer                        │
│  Firebase SDK Integration                                │
│  - Firebase Auth: User authentication                  │
│  - Firestore: NoSQL database                            │
│  - Firebase Storage: File storage                       │
│  - Real-time listeners (onSnapshot)                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                 │
│  Firebase Cloud Services                                 │
│  - Firestore Database                                    │
│  - Firebase Authentication                               │
│  - Cloud Storage                                         │
│  - Firebase Hosting (CDN)                               │
└─────────────────────────────────────────────────────────┘
```

### 1.3 Context Provider Hierarchy
The application uses a nested context provider structure where order matters:

```
AuthProvider (root)
  └─ SchoolsProvider
      └─ CoursesProvider
          └─ NotesProvider
              └─ VotingProvider
                  └─ UsersProvider
                      └─ CourseProvider
```

**Dependency Flow:**
- `AuthProvider` provides authentication state to all other providers
- `SchoolsProvider` loads public school data (no auth dependency)
- `CoursesProvider` depends on user's `schoolId` from `AuthProvider`
- `NotesProvider` filters notes by user's `schoolId`
- `VotingProvider` requires notes and user authentication
- `UsersProvider` loads all users for leaderboard
- `CourseProvider` manages selected course state

---

## 2. Data Flow

### 2.1 Authentication Flow

```
User Action → AuthContext → Firebase Auth → Firestore (users collection)
     ↓              ↓              ↓                    ↓
  Login/Signup  State Update   Token Management    User Document
     ↓              ↓              ↓                    ↓
  ProtectedRoute → Navigation → Page Components → User Data Available
```

### 2.2 Real-Time Data Flow

**Notes Data Flow:**
```
Firestore (notes collection)
    ↓ (onSnapshot listener)
NotesContext (real-time updates)
    ↓ (context value)
BrowseNotes Component
    ↓ (filtering/sorting)
Displayed Notes List
```

**Voting Flow:**
```
User Clicks Vote → VotingContext.vote()
    ↓
Firestore Transaction (atomic operation)
    ↓
Update note.votes field
    ↓
Update author's totalPoints
    ↓
Real-time listeners update UI
```

### 2.3 File Upload Flow

```
User Selects File → PostNotes Component
    ↓
NotesContext.addNote()
    ↓
Firebase Storage Upload (notes/{userId}/{timestamp}_{filename})
    ↓
Get Download URL
    ↓
Create Firestore Document with fileUrl
    ↓
Real-time listener updates notes list
```

### 2.4 Data Synchronization Strategy

- **Real-time Listeners**: All major collections (users, schools, courses, notes) use Firestore `onSnapshot` listeners for real-time updates
- **Optimistic Updates**: UI updates immediately, then syncs with server
- **Transaction-based Operations**: Voting uses Firestore transactions to ensure data consistency
- **Error Handling**: Failed operations roll back and show error messages

---

## 3. Backend Design

### 3.1 Firebase Services Used

#### 3.1.1 Firebase Authentication
- **Method**: Email/Password authentication
- **Features**:
  - User registration with email verification
  - Password reset functionality
  - Session persistence (browserLocalPersistence)
  - Email verification requirement for protected routes

#### 3.1.2 Cloud Firestore
- **Database Type**: NoSQL document database
- **Collections**:
  - `users`: User profiles and metadata
  - `schools`: School information
  - `courses`: Course information (scoped by school)
  - `notes`: User-posted notes (scoped by school)

#### 3.1.3 Firebase Storage
- **Purpose**: File storage for note attachments and profile pictures
- **Structure**:
  - `notes/{userId}/{timestamp}_{filename}` - Note attachments
  - `profile-pictures/{userId}/{filename}` - User profile pictures
- **File Types Supported**: PDF, DOC, DOCX, TXT, JPG, PNG

#### 3.1.4 Firebase Hosting
- **Static Site Hosting**: Serves the built React application
- **SPA Routing**: All routes rewrite to `/index.html` for client-side routing
- **CDN**: Global content delivery network for fast loading

### 3.2 Security Rules

#### 3.2.1 Firestore Security Rules
- **Users Collection**:
  - Users can read/write their own document
  - Users can read other users' `displayName` and `totalPoints` (for leaderboard)
  - Other users can only update `totalPoints` field (for voting system)
  
- **Schools Collection**:
  - Authenticated users can read all schools
  - Authenticated users can create schools
  - Authenticated users can update/delete schools
  
- **Courses Collection**:
  - Authenticated users can read all courses
  - Authenticated users can create courses
  - Authenticated users can update/delete courses
  
- **Notes Collection**:
  - Authenticated users can read all notes
  - Authenticated users can create notes
  - Authors can update/delete their own notes
  - Admins can delete any note
  - Authenticated users can update `votes` field on any note

#### 3.2.2 Storage Security Rules
- **Notes Files**: Authenticated users can read, users can only write to their own folder
- **Profile Pictures**: Authenticated users can read, users can only manage their own pictures

---

## 4. Data Models

### 4.1 User Document (`users` collection)

```javascript
{
  uid: string,                    // Firebase Auth UID (document ID)
  email: string,                   // User email
  displayName: string,            // User's display name/username
  bio: string,                     // User biography (optional)
  totalPoints: number,             // Calculated from votes (default: 0)
  schoolId: string,                // Selected school ID (empty if not selected)
  favoritedPosts: string[],        // Array of favorited note IDs
  favoritedCourses: string[],      // Array of favorited course IDs
  postsCreated: string[],          // Array of created note IDs
  profilePictureUrl: string,       // URL to profile picture
  profilePictureStoragePath: string, // Storage path for deletion
  admin: boolean                   // Admin status (default: false)
}
```

### 4.2 School Document (`schools` collection)

```javascript
{
  id: string,                      // Document ID
  name: string,                    // School name (required, unique)
  location: string,                // School location (optional)
  createdAt: string,               // ISO timestamp
  createdBy: string                // User ID who created the school
}
```

### 4.3 Course Document (`courses` collection)

```javascript
{
  id: string,                      // Document ID
  code: string,                    // Course code (e.g., "CS101")
  name: string,                    // Course name
  department: string,              // Department (optional)
  professor: string,               // Professor name (optional)
  schoolId: string,                // Required - links to school
  createdAt: string,               // ISO timestamp
  createdBy: string                // User ID who created the course
}
```

### 4.4 Note Document (`notes` collection)

```javascript
{
  id: string,                      // Document ID
  title: string,                   // Note title
  content: string,                 // Note content/description
  tags: string[],                  // Array of tags
  courseId: string,                // Course ID this note belongs to
  schoolId: string,               // School ID (for filtering)
  authorId: string,                // User ID of author
  author: string,                  // Author display name
  createdAt: string,               // ISO timestamp
  date: string,                    // Date string (YYYY-MM-DD)
  fileName: string | null,         // Original filename (if file attached)
  fileUrl: string | null,          // Download URL (if file attached)
  storagePath: string | null,      // Storage path for deletion
  votes: {                         // Voting object
    [userId]: 'upvote' | 'downvote' // User's vote type
  }
}
```

### 4.5 Relationships

```
User (1) ──→ (N) Notes (authorId)
User (1) ──→ (1) School (schoolId)
School (1) ──→ (N) Courses (schoolId)
Course (1) ──→ (N) Notes (courseId)
User (N) ──→ (N) Notes (favoritedPosts)
User (N) ──→ (N) Courses (favoritedCourses)
```

---

## 5. Pages & Routing

### 5.1 Public Routes (No Authentication Required)

#### `/login`
- **Purpose**: User authentication
- **Features**: Email/password login, redirect to signup
- **Redirects**: Authenticated users → `/browse-notes`

#### `/signup`
- **Purpose**: New user registration
- **Features**: 
  - Email, password, display name input
  - Username uniqueness validation
  - Password confirmation
  - Creates user document in Firestore
  - Sends verification email
- **Redirects**: Success → `/verify-email`

#### `/verify-email`
- **Purpose**: Email verification
- **Features**:
  - Resend verification email (with cooldown)
  - Check verification status
  - Cancel verification (signs out, returns to signup)
- **Redirects**: Verified → `/profile`

#### `/forgot-password`
- **Purpose**: Password reset
- **Features**: Send password reset email

### 5.2 Protected Routes (Authentication + Email Verification Required)

#### `/` (Root)
- **Redirects**: → `/browse-notes`

#### `/browse-notes` (Home Page)
- **Purpose**: Main content browsing page
- **Features**:
  - Display all notes from user's school
  - Search by title, content, or author
  - Filter by course
  - Filter by tags
  - Sort by: recent, oldest, title (A-Z), author (A-Z)
  - Vote on notes (upvote/downvote)
  - Favorite notes
  - Delete own notes
  - Click to view note details
- **Components Used**: `VoteButtons`, `FavoriteButton`
- **Data Sources**: `NotesContext`, `CoursesContext`, `UsersContext`

#### `/post-notes`
- **Purpose**: Create and post new notes
- **Features**:
  - Course selection (with favorite filter)
  - Title input (required)
  - Description/content textarea (required)
  - Tags input (comma-separated, optional)
  - File upload (PDF, DOC, DOCX, TXT, JPG, PNG - optional)
  - Form validation
- **Requirements**: User must have selected a school
- **Redirects**: Success → `/browse-notes`

#### `/profile`
- **Purpose**: User profile management
- **Features**: Tabbed interface with 5 tabs:
  1. **School Selection** (`#school`): Select or add schools
  2. **Course Selection** (`#courses`): Select, add, or favorite courses
  3. **Total Points** (`#points`): View points breakdown and ranking
  4. **My Posts** (`#posts`): View and manage user's posted notes
  5. **Favorited Notes** (`#favorited`): View favorited notes
- **URL Hash Navigation**: Supports hash-based tab navigation
- **Additional Features**: Profile header, settings button, logout button

#### `/note/:noteId`
- **Purpose**: Individual note detail page
- **Features**:
  - Full note content display
  - File download (if attached)
  - Voting buttons
  - Favorite button
  - Author information
  - Tags display
  - Delete button (author/admin only)
- **Components Used**: `VoteButtons`, `FavoriteButton`

#### `/settings`
- **Purpose**: User account settings
- **Features**:
  - Profile picture upload/update/delete
  - Display name/username update
  - Bio update
  - Password change (requires re-authentication)
  - Admin controls (if user is admin)

#### `/leaderboard`
- **Purpose**: User rankings by points
- **Features**:
  - Global leaderboard (all schools)
  - School-specific filtering
  - Top 3 highlighting with medals
  - Current user highlighting
  - Points calculation explanation
- **Data Sources**: `UsersContext`, `SchoolsContext`

#### `/course-selection` (Legacy)
- **Redirects**: → `/profile#courses`

---

## 6. Styling

### 6.1 Styling Framework
**Tailwind CSS 4.1.17** - Utility-first CSS framework

### 6.2 Styling Approach
- **Utility Classes**: Extensive use of Tailwind utility classes
- **Responsive Design**: Mobile-first approach with breakpoints:
  - `sm:` - 640px and up
  - `md:` - 768px and up
  - `lg:` - 1024px and up
- **Custom Colors**: Purple and pink gradient themes for profile/settings
- **Component Styling**: Inline Tailwind classes, no separate CSS files

### 6.3 Design Patterns

#### Color Scheme
- **Primary**: Purple (`purple-500`, `purple-600`) - Main actions, links
- **Secondary**: Blue (`blue-500`, `blue-600`) - Navigation, info
- **Success**: Green (`green-500`, `green-600`) - Success states
- **Warning**: Yellow (`yellow-500`, `yellow-600`) - Verification pages
- **Error**: Red (`red-500`, `red-600`) - Errors, destructive actions
- **Gradients**: Purple-to-pink gradients for profile page

#### Component Styling Examples
- **Cards**: White background, rounded corners, shadow
- **Buttons**: Rounded, hover effects, disabled states
- **Forms**: Border focus rings, validation states
- **Navigation**: Sticky top bar, mobile hamburger menu

### 6.4 Responsive Features
- **Mobile Menu**: Hamburger menu on mobile devices
- **Grid Layouts**: Responsive grid (1 column mobile, 2+ columns desktop)
- **Text Sizing**: Responsive text sizes (`text-sm sm:text-base`)
- **Spacing**: Responsive padding and margins
- **Image Sizing**: Responsive profile pictures and avatars

---

## 7. Languages & Technologies

### 7.1 Core Technologies

#### Frontend
- **React 19.1.1**: UI library
- **React DOM 19.1.1**: DOM rendering
- **React Router DOM 7.9.6**: Client-side routing
- **JavaScript (ES6+)**: Programming language

#### Build Tools
- **Vite 7.1.7**: Build tool and dev server
- **@vitejs/plugin-react 5.0.4**: React plugin for Vite
- **ESLint 9.36.0**: Code linting

#### Styling
- **Tailwind CSS 4.1.17**: Utility-first CSS framework
- **@tailwindcss/vite 4.1.17**: Tailwind Vite plugin

#### Backend Services
- **Firebase 12.6.0**: Backend-as-a-Service
  - Firebase Auth
  - Cloud Firestore
  - Firebase Storage
  - Firebase Hosting

### 7.2 Development Tools
- **ESLint**: Code quality and linting
- **Git**: Version control
- **GitHub Actions**: CI/CD pipeline

### 7.3 Code Organization

```
src/
├── components/          # Reusable React components
│   ├── profile/        # Profile-specific components
│   └── ...
├── contexts/           # React Context providers
├── pages/              # Page components (routes)
├── firebase.js         # Firebase configuration
├── main.jsx           # Application entry point
├── App.jsx            # Root component with routing
└── index.css          # Global styles (Tailwind import)
```

---

## 8. Deployment

### 8.1 Deployment Platform
**Firebase Hosting** - Static site hosting with CDN

### 8.2 Build Process
1. **Development**: `npm run dev` - Vite dev server with HMR
2. **Production Build**: `npm run build` - Creates optimized `dist/` folder
3. **Preview**: `npm run preview` - Preview production build locally

### 8.3 CI/CD Pipeline

#### GitHub Actions Workflows

**1. Pull Request Deployment** (`.github/workflows/firebase-hosting-pull-request.yml`)
- Triggers on pull requests
- Builds application
- Deploys to Firebase preview channel
- Provides preview URL for review

**2. Production Deployment** (`.github/workflows/firebase-hosting-merge.yml`)
- Triggers on push to `main` branch
- Builds application (`npm ci && npm run build`)
- Deploys to Firebase Hosting live channel
- Uses Firebase service account for authentication

### 8.4 Deployment Configuration

**Firebase Configuration** (`firebase.json`):
```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

**SPA Routing**: All routes rewrite to `/index.html` for client-side routing

### 8.5 Environment Variables
Required environment variables (`.env` file):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

---

## 9. Key Features & Functionality

### 9.1 Authentication System
- Email/password authentication
- Email verification requirement
- Password reset functionality
- Session persistence
- Protected route system

### 9.2 Note Sharing System
- Create notes with title, content, tags
- File attachments (PDF, DOC, DOCX, TXT, JPG, PNG)
- Course-based organization
- School-based filtering
- Real-time updates

### 9.3 Voting System
- Upvote/downvote notes
- Real-time vote counts
- Point calculation system:
  - Upvote = +1 point to author
  - Downvote = -1 point to author
  - Vote changes handled with transactions
- Users cannot vote on their own posts

### 9.4 Leaderboard System
- Global leaderboard (all schools)
- School-specific leaderboards
- Top 3 highlighting
- Current user highlighting
- Real-time point updates

### 9.5 Favoriting System
- Favorite notes
- Favorite courses
- Filter by favorites
- Persistent favorites list

### 9.6 Search & Filter
- Search notes by title, content, author
- Filter by course
- Filter by tags
- Sort by multiple criteria
- Real-time filtering

---

## 10. Performance Considerations

### 10.1 Optimization Strategies
- **Code Splitting**: React Router lazy loading (potential)
- **Memoization**: `useMemo` for expensive calculations
- **Real-time Efficiency**: Firestore listeners with proper cleanup
- **Image Optimization**: Responsive image sizing
- **Build Optimization**: Vite production builds with tree-shaking

### 10.2 Data Loading
- **Lazy Loading**: Context providers load data on mount
- **Real-time Sync**: Firestore listeners for live updates
- **Error Handling**: Fallback UI for failed loads
- **Loading States**: Spinner components during data fetch

### 10.3 Caching
- **Firebase Auth**: Browser local persistence
- **Firestore**: Client-side caching
- **CDN**: Firebase Hosting CDN for static assets

---

## 11. Security Features

### 11.1 Authentication Security
- Email verification required
- Password strength requirements (minimum 6 characters)
- Secure password reset flow
- Session management

### 11.2 Data Security
- Firestore security rules enforce access control
- Storage security rules prevent unauthorized access
- User data isolation (users can only modify their own data)
- Admin role system for privileged operations

### 11.3 Input Validation
- Client-side form validation
- Server-side security rules
- File type validation
- File size limits

---

## 12. Future Enhancement Opportunities

### 12.1 Potential Improvements
- **Code Splitting**: Implement React.lazy for route-based code splitting
- **Offline Support**: Service workers for offline functionality
- **Notifications**: Push notifications for new notes/votes
- **Comments**: Comment system on notes
- **Advanced Search**: Full-text search with Algolia or similar
- **Analytics**: Firebase Analytics integration
- **Testing**: Unit and integration tests
- **TypeScript**: Migrate to TypeScript for type safety
- **PWA**: Progressive Web App features

---

## 13. Project Statistics

- **Total Pages**: 9 (4 public, 5 protected)
- **Context Providers**: 7
- **Firestore Collections**: 4 (users, schools, courses, notes)
- **Storage Buckets**: 2 (notes, profile-pictures)
- **Main Components**: ~30+
- **Lines of Code**: ~5,000+ (estimated)

---

## 14. Conclusion

NoteShare is a modern, scalable web application leveraging React and Firebase to provide a seamless note-sharing experience for students. The serverless architecture eliminates backend maintenance while providing real-time capabilities, secure authentication, and reliable file storage. The application follows React best practices with context-based state management and component-based architecture, making it maintainable and extensible.


