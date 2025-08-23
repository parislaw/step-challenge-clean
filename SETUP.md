# StepTracker30 Setup Guide

## Backend Setup

### 1. Supabase Database Setup

1. **Create a Supabase project:**
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Get your database connection string:**
   - In your Supabase dashboard, go to Settings → Database
   - Find your connection string (it looks like): 
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
     ```

3. **Configure environment variables:**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `.env` with your Supabase credentials:
   ```bash
   SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

### 2. Install Dependencies & Setup Database

```bash
cd backend
npm install

# Create database tables
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### 3. Start Backend Server

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### 4. Test the API

You can test the setup by visiting:
- Health check: `http://localhost:5000/api/health`
- Login with: `admin@steptracker30.com` / `admin123`

## Frontend Setup (Coming Next)

We'll create the React frontend next!

## Default Accounts Created

After running `npm run db:seed`:

**Admin Account:**
- Email: `admin@steptracker30.com`
- Password: `admin123`

**Test Users:**
- Email: `john@example.com` / Password: `password123`
- Email: `jane@example.com` / Password: `password123`
- Email: `bob@example.com` / Password: `password123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Challenges  
- `GET /api/challenges` - List all challenges
- `POST /api/challenges` - Create challenge (admin only)
- `POST /api/challenges/:id/join` - Join a challenge

### Submissions
- `POST /api/submissions` - Submit daily steps (with image upload)
- `GET /api/submissions?challengeId=1` - Get user's submissions

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/challenges/:id/participants` - Challenge participants
- `GET /api/admin/challenges/:id/export` - Export CSV

## Troubleshooting

**Database connection issues:**
- Verify your Supabase connection string is correct
- Make sure your Supabase project is active
- Check that you've set the correct password

**Migration fails:**
- Ensure your database connection is working
- Try running the migration commands individually

**File upload issues:**
- Make sure the `uploads/` directory exists in backend root
- Check file permissions