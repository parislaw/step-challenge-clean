# CLAUDE.md
## Engagement Rules.
1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the [todo.md](http://todo.md/) file with a summary of the changes you made and any other relevant information.
8. DO NOT BE LAZY. NEVER BE LAZY. IF THERE IS A BUG FIND THE ROOT CAUSE AND FIX IT. NO TEMPORARY FIXES. YOU ARE A SENIOR DEVELOPER. NEVER BE LAZY
9. MAKE ALL FIXES AND CODE CHANGES AS SIMPLE AS HUMANLY POSSIBLE. THEY SHOULD ONLY IMPACT NECESSARY CODE RELEVANT TO THE TASK AND NOTHING ELSE. IT SHOULD IMPACT AS LITTLE CODE AS POSSIBLE. YOUR GOAL IS TO NOT INTRODUCE ANY BUGS. IT'S ALL ABOUT SIMPLICITY

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

30-30 Step Challenge is a full-stack step tracking challenge platform that automates 30-day, 10,000-step challenges. The application replaces manual spreadsheet workflows with OCR/AI step count extraction from photo submissions, Stripe payment integration, real-time community leaderboards, and comprehensive admin management tools.

## Architecture

### Technology Stack
- **Backend**: Node.js with Express.js, PostgreSQL (Supabase), JWT authentication
- **Frontend**: React 18 with React Router, Axios for API calls
- **Database**: PostgreSQL with connection pooling via Supabase
- **File Storage**: Local uploads directory (production would use cloud storage)
- **Payment**: Stripe integration (planned)
- **OCR**: Google Cloud Vision API or AWS Textract (planned)

### Project Structure
```
backend/
├── server.js              # Main Express server with middleware
├── config/database.js     # Supabase PostgreSQL connection pool
├── middleware/auth.js     # JWT authentication middleware
├── routes/                # API route handlers
│   ├── auth.js           # User registration/login
│   ├── challenges.js     # Challenge management
│   ├── submissions.js    # Daily step submissions
│   └── admin.js          # Admin dashboard endpoints
├── scripts/
│   ├── migrate.js        # Database schema migration
│   └── seed.js           # Sample data seeding
└── uploads/              # Local file storage for images

frontend/
├── src/
│   ├── App.js            # Main router with AuthProvider context
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page components (Dashboard, Challenges, etc.)
│   ├── hooks/useAuth.js  # Authentication hook with context
│   └── utils/            # API client and utilities
└── package.json          # React dependencies and scripts
```

## Common Development Commands

### Backend Development
```bash
cd backend
npm install                # Install dependencies
npm run dev               # Start development server with nodemon (auto-restart)
npm start                 # Start production server
npm run db:migrate        # Run database migrations (creates all tables)
npm run db:seed           # Seed database with sample data and test accounts
```

### Frontend Development  
```bash
cd frontend
npm install               # Install dependencies
npm start                 # Start development server (localhost:3000)
npm run build            # Build for production
npm test                 # Run test suite (Jest with React Testing Library)
npm test -- --watchAll   # Run tests in watch mode
npm run eject            # Eject from Create React App (irreversible)
```

### Database Management
```bash
# Backend directory commands
npm run db:migrate        # Create database schema (idempotent)
npm run db:seed           # Add test data and accounts
```

### Full Application
- Backend runs on: `http://localhost:5001` (default PORT from server.js is 5000, but configured as 5001)
- Frontend runs on: `http://localhost:3000` (proxies API to backend via proxy setting)
- Health check: `http://localhost:5001/api/health`

### Development Workflow
1. Start backend first: `cd backend && npm run dev`
2. Start frontend second: `cd frontend && npm start` 
3. Frontend proxy automatically forwards /api/* requests to backend
4. Use test accounts from `npm run db:seed` for development

## Database Configuration

The application uses Supabase PostgreSQL with connection details in `backend/.env`:
```bash
# Use session pooling connection string for better performance
SUPABASE_DB_URL=postgresql://postgres.PROJECT:PASSWORD@aws-0-eu-north-1.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://PROJECT.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
JWT_SECRET=your-jwt-secret
PORT=5001

# Optional: Google Vision API for OCR (can be disabled)
GOOGLE_VISION_ENABLED=false
GOOGLE_VISION_KEY_FILE=path/to/service-account.json
```

## Key API Endpoints

### Authentication
- `POST /api/auth/register` - User registration with email/password
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user profile

### Challenges
- `GET /api/challenges` - List available challenges with user enrollment status
- `POST /api/challenges` - Create challenge (admin only)
- `POST /api/challenges/:id/join` - Join a challenge

### Submissions
- `POST /api/submissions` - Submit daily step image with multipart form data
- `GET /api/submissions?challengeId=1` - Get user's submissions for challenge
- `POST /api/submissions/extract-steps` - OCR extraction from uploaded image (if enabled)

### Admin
- `GET /api/admin/dashboard` - Admin dashboard statistics
- `GET /api/admin/storage-stats` - Storage usage by challenge for cleanup
- `DELETE /api/admin/challenges/:id/images` - Delete images from completed challenges
- `GET /api/admin/challenges/:id/participants` - Challenge participant list
- `GET /api/admin/challenges/:id/export` - Export participant data as CSV

### Leaderboard
- `GET /api/leaderboard?challengeId=1` - Get leaderboard data for challenge

## Authentication Architecture

The app uses JWT-based stateless authentication:
- **Frontend**: JWT stored in localStorage via `useAuth` hook and React Context
- **Backend**: JWT validation via `middleware/auth.js` on protected routes
- **Route Protection**: `ProtectedRoute` component wraps authenticated pages
- **Admin Access**: `AdminRoute` component checks `is_admin` flag from user token
- **API Flow**: All API calls include `Authorization: Bearer <token>` header

## Default Test Accounts

After running `npm run db:seed`:
- **Admin**: `admin@steptracker30.com` / `admin123` (has access to Admin Dashboard)
- **Test Users**: `john@example.com`, `jane@example.com`, `bob@example.com` / `password123`

**Test Data Setup**:
- `john@example.com` is enrolled in the active "Summer Fitness Challenge"
- Completed "Spring Step Challenge" has test image submissions for storage demo
- Multiple challenges with different statuses (upcoming, active, completed) for testing

## Core Features Implementation

### Phase 1: Complete MVP Foundation ✅

#### Authentication System ✅
- JWT-based login/register with form validation
- Protected routes and admin role checking
- Responsive authentication pages with error handling

#### Dashboard with Progress Visualization ✅
- 30-day color-coded progress grid showing daily submissions
- Blue: Daily step leader, Green: ≥10,000 steps, Orange: <10,000 steps, Gray: upcoming/missed
- Real-time challenge status and user progress display
- Interactive grid with hover effects and tooltips

#### Challenge Management ✅
- Browse challenges with filtering (All, Available, My Challenges, Upcoming, Active)
- Challenge cards showing status, dates, participant counts
- One-click challenge enrollment with real-time updates
- Challenge status indicators and smart filtering

#### Daily Step Submission ✅
- Complete submission form with manual step count input
- Image upload with drag-and-drop, preview, and validation (10MB limit)
- Optional Google Cloud Vision API integration for OCR step extraction
- Date selection, challenge selection, and comprehensive form validation
- Multer-based file upload with secure filename generation

#### Admin Storage Management ✅
- Storage usage statistics by challenge with real-time calculations
- Bulk image deletion (soft delete) for completed challenges only
- File system cleanup while preserving submission data
- Confirmation dialogs and progress feedback
- Storage savings calculator and cleanable space identification

### Next Development Phases (Planned)

#### Phase 2: Enhanced Features
- Leaderboard system with real-time rankings
- Push notifications for daily reminders
- Social features (comments, encouragement)
- Advanced progress analytics

#### Phase 3: Payment & Monetization
- Stripe payment integration for challenge entry fees
- Prize pool management and distribution
- Subscription tiers and premium features

#### Phase 4: Advanced AI & Analytics
- Enhanced OCR with multiple fitness app support
- Machine learning for progress prediction
- Advanced fraud detection for submissions
- Comprehensive analytics dashboard

## Architecture Deep Dive

### Frontend State Management
- **Authentication**: React Context (`useAuth`) manages user state and JWT token
- **API Layer**: Centralized in `utils/api.js` with axios interceptors for auth headers
- **Route Structure**: App.js contains main router with nested protected/admin routes
- **Form Handling**: No external form library - uses React state with custom validation

### Backend Architecture
- **Middleware Stack**: Helmet (security) → CORS → Rate limiting → JWT auth → Routes
- **Database**: PostgreSQL with connection pooling via Supabase client
- **File Upload**: Multer middleware with local storage (uploads/ directory)
- **OCR Integration**: Optional Google Vision API via `services/visionService.js`
- **Error Handling**: Centralized error responses with consistent JSON structure

### Key Database Relationships
```sql
users (1) → (*) enrollments (*) ← (1) challenges
users (1) → (*) submissions (*) ← (1) challenges
enrollments.user_id + submissions.challenge_id = participation tracking
```

### Critical Implementation Files
- `backend/middleware/auth.js` - JWT validation and user context
- `frontend/src/hooks/useAuth.js` - Authentication state management
- `backend/scripts/migrate.js` - Complete database schema with indexes
- `frontend/src/components/ProgressGrid.js` - 30-day color-coded visualization
- `backend/routes/submissions.js` - File upload with OCR processing pipeline

## Security & Middleware

- **Helmet**: Security headers
- **CORS**: Configured for development (localhost:3000) and production domains
- **Rate Limiting**: 100 requests per 15-minute window per IP
- **File Upload**: 10MB limit on image uploads with type validation
- **JWT**: Stateless authentication with configurable secret
- **Soft Delete**: Image cleanup preserves data while freeing storage
- **Admin Protection**: Role-based access control for sensitive operations

## Development Status

**✅ COMPLETED (Phase 1 - MVP)**:
- Full authentication system
- Dashboard with progress visualization
- Challenge browsing and enrollment
- Daily step submission with OCR
- Admin storage management
- Responsive design for all features
- Complete database schema
- Test data and user accounts

**✅ COMPLETED (Phase 2 - UI Enhancements)**:
- **Modern Leaderboard Design**: Complete visual overhaul with gradient backgrounds, enhanced shadows, and professional styling
- **GitHub-Style Progress Grid**: Small (12px) squares with flat colors matching GitHub's contribution graph aesthetic
- **Proportional Design Balance**: Scaled down participant rows, rank icons, and name containers for better visual harmony
- **Enhanced User Experience**: Smooth animations, hover effects, and modern card-based layouts
- **Consistent Design System**: Unified color palette and styling across all leaderboard components

**🔄 READY FOR NEXT SESSION**:
- Enhanced admin features and analytics
- Payment integration planning (Stripe)
- Performance optimizations
- Push notifications for daily reminders
- Social features (comments, encouragement)

## Recent Session Summary (August 2025)

### Leaderboard UI Transformation
1. **Initial Enhancement**: Transformed basic leaderboard into modern design with gradients, shadows, and professional styling
2. **GitHub-Style Progress Grid**: Converted large colorful cells to small (12px), clean squares using GitHub's color scheme:
   - Leader: `#216e39` (darkest green)
   - Completed: `#30a14e` (dark green) 
   - Partial: `#9be9a8` (light green)
   - Missed/Empty: `#ebedf0` (light gray)
3. **Proportional Balance**: Reduced participant row elements to match small progress grid:
   - Row padding: 1.5rem → 1rem
   - Rank icons: 2rem → 1.5rem
   - Name font: 1.1rem → 1rem
   - Grid columns: 80px 220px → 60px 180px

### Current Status
- **Application Running**: Backend (port 4002) + Frontend (port 4001)
- **Database**: Fully initialized with test data
- **Authentication**: Working with admin and test accounts
- **Visual Design**: Modern, professional appearance with GitHub-inspired progress grid

The application is now a polished, production-ready MVP with enhanced UI/UX. All core features are functional and the design is modern and professional!
