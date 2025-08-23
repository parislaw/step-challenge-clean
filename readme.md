# StepTracker30 - 30-Day Step Challenge Platform

**Automated step tracking with OCR, payments, and community leaderboards**

## Table of Contents
1. [Project Overview](#project-overview)
2. [Target Users & Success Metrics](#target-users--success-metrics)
3. [Core Features](#core-features)
4. [Technical Architecture](#technical-architecture)
5. [API Specifications](#api-specifications)
6. [Data Model](#data-model)  
7. [User Stories & Acceptance Criteria](#user-stories--acceptance-criteria)
8. [Development Roadmap](#development-roadmap)
9. [Getting Started](#getting-started)

---

## Project Overview

### Business Goals
StepTracker30 automates 30-day, 10,000-step challenges by replacing manual spreadsheet workflows with:
- **OCR/AI step count extraction** from participant photo submissions
- **Stripe payment integration** with coupon support  
- **GitHub-style progress visualization** with color-coded achievement grids
- **Real-time community leaderboards** for participant engagement
- **Admin dashboard** for complete challenge management

### Success Metrics
- **95% OCR accuracy** rate for step count extraction  
- **90% daily submission** rate from active participants
- **80% time savings** for admins vs manual processes
- **98% payment completion** rate for enrolled challenges
- **<3 seconds** average image processing time

---

## Target Users & Success Metrics

### Primary Personas

**Participant: "Busy Professional"**
- Wants accountability to hit 10K steps/day
- Prefers quick daily upload with minimal friction
- Motivated by community comparison and progress visualization
- Age range: 25-55, tech-comfortable but not tech-savvy

**Admin: "Challenge Organizer"**
- Creates and manages monthly fitness challenges  
- Reviews OCR failures and handles payment disputes
- Exports enrollment and performance data for reporting
- Needs efficient tools that scale with participant growth

---

## Core Features

### 1. Authentication & Registration
- Email/password signup with email verification
- Password reset via email workflow
- GDPR-compliant data collection consent
- Account lockout after 5 failed login attempts

### 2. Challenge Management
- **Admin**: Create 30-day challenges with pricing and coupon support
- **Participant**: Browse and enroll in upcoming challenges
- **Payment**: Stripe integration with automatic invoice generation
- **States**: Upcoming → Active → Completed → Cancelled (with refunds)

### 3. Daily Step Submission & OCR Processing
- Upload JPG/PNG/WEBP images (10MB max) once per day
- OCR/AI extracts step counts with confidence scoring
- User can confirm or manually override OCR results
- Processing target: <3 seconds per image  
- Admin queue for low-confidence OCR results

### 4. Progress Visualization
**Personal Dashboard:**
- 30-day grid numbered 1-30 with color coding:
  - **Blue**: Daily step leader
  - **Green**: ≥10,000 steps achieved
  - **Orange**: <10,000 steps
- Current streak counter and goal achievement percentage

**Community Leaderboard:**
- Real-time participant grids (first name + last initial)
- Sortable by total steps, streak length, or completion rate
- Anonymous participation option available

### 5. Admin Dashboard
- Challenge creation and enrollment monitoring
- OCR failure queue with manual override interface
- Payment tracking and refund processing
- CSV export for participant data and performance metrics
- Coupon code management (percentage discounts, usage limits)

---

## Technical Architecture

### Technology Stack
- **Frontend**: React.js with responsive CSS framework
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Redis caching
- **OCR/AI**: Google Cloud Vision API or AWS Textract
- **Payment**: Stripe API with PCI DSS compliance
- **Storage**: AWS S3 or Google Cloud Storage for images
- **Hosting**: AWS/GCP with auto-scaling capabilities

### Non-Functional Requirements
- **Performance**: <2s page loads, 99.5% uptime during challenges
- **Security**: HTTPS, data encryption at rest/transit, regular audits
- **Scalability**: Support 1,000 concurrent users, horizontal scaling
- **Compliance**: GDPR for EU users, PCI DSS for payments

---

## API Specifications

### Authentication Endpoints
```
POST /auth/register      # User registration with email verification
POST /auth/login         # User authentication
POST /auth/logout        # Session termination  
POST /auth/password-reset # Password reset workflow
```

### Challenge Management
```
GET  /challenges                    # Public challenges listing
POST /challenges                    # Create challenge (admin)
PUT  /challenges/:id                # Update challenge (admin)
DELETE /challenges/:id              # Delete challenge (admin)
POST /challenges/:id/enroll         # Enroll with payment
```

### Step Submissions
```
POST /submissions                   # Upload daily step image
GET  /submissions?user=&date=       # Retrieve submissions
PUT  /submissions/:id/override      # Manual count override (admin)
```

### Admin & Reporting  
```
GET  /admin/challenges/:id/participants  # Enrollment list
GET  /admin/ocr-failures                 # Review queue
GET  /admin/challenges/:id/export.csv    # Data export
POST /coupons                            # Coupon management
GET  /coupons/validate?code=XXX          # Coupon validation
```

### Leaderboard
```
GET /leaderboard?challenge_id=      # Community rankings and grids
```

---

## Data Model

### Core Entities
```sql
User {
  id, first_name, last_name, email, password_hash,
  registered_at, gdpr_consent
}

Challenge {
  id, title, start_date, end_date, price_cents,
  currency, created_by_admin_id, status
}

Enrollment {
  id, user_id, challenge_id, payment_id, coupon_id,
  enrolled_at, status
}

Submission {
  id, user_id, challenge_id, date, image_url,
  ocr_count, final_count, status_color, manual_override
}

Payment {
  id, enrollment_id, stripe_charge_id, amount_cents,
  status, paid_at
}

Coupon {
  id, code, discount_type, discount_value, max_uses,
  expires_at, usage_count
}
```

---

## User Stories & Acceptance Criteria

### MVP User Stories

**US-001: User Registration**
*As a new user, I want to create an account so I can participate in step challenges.*

Acceptance Criteria:
- ✅ User registers with first/last name, email, password
- ✅ Email verification required before account activation
- ✅ GDPR consent checkbox for EU users
- ✅ Welcome email sent after successful registration

**US-002: Challenge Enrollment**
*As a registered user, I want to enroll in upcoming challenges with payment.*

Acceptance Criteria:
- ✅ View available challenges with details (dates, price, description)
- ✅ Stripe checkout integration with coupon code support
- ✅ Enrollment confirmation email upon payment success
- ✅ Enrollment cutoff 24 hours before challenge start

**US-003: Daily Step Submission**
*As a participant, I want to submit daily step photos for automated tracking.*

Acceptance Criteria:
- ✅ Upload one image per day during active challenges
- ✅ OCR extracts step count with user confirmation/override option
- ✅ Submission deadline enforced (11:59 PM local time)
- ✅ Cannot submit for past dates or non-enrolled challenges

**US-004: Progress Dashboard**
*As a participant, I want visual progress tracking to stay motivated.*

Acceptance Criteria:
- ✅ 30-day color-coded grid shows daily achievement status
- ✅ Current streak and goal percentage prominently displayed
- ✅ Real-time updates after successful submissions
- ✅ Legend explains color coding system

**US-005: Community Leaderboard**
*As a participant, I want to compare my progress with others.*

Acceptance Criteria:
- ✅ View all participants' color-coded grids in real-time
- ✅ Privacy maintained (first name + last initial only)
- ✅ Sortable by total steps, streak length, completion rate
- ✅ Anonymous participation option available

**US-006: Admin Challenge Management**
*As an admin, I want to efficiently manage challenges and participants.*

Acceptance Criteria:
- ✅ Create/edit 30-day challenges with pricing and coupons
- ✅ Monitor enrollment statistics and payment status
- ✅ Review OCR failures and manually override step counts
- ✅ Export participant data and performance reports to CSV

---

## Development Roadmap

### Phase 1: Core MVP (0-4 weeks)
- ✅ User authentication and registration system
- ✅ Challenge creation and enrollment with Stripe payment
- ✅ Daily image upload with basic OCR integration
- ✅ Personal progress dashboard with 30-day grid
- ✅ Community leaderboard with real-time updates
- ✅ Basic admin panel for challenge and participant management

### Phase 2: Enhancement & Polish (4-8 weeks)
- ✅ Advanced OCR accuracy improvements and retry logic
- ✅ Comprehensive admin reporting and CSV export
- ✅ Coupon system with usage tracking
- ✅ Manual override interface for OCR failures
- ✅ Performance optimizations and caching
- ✅ GDPR compliance tools and data export/deletion

### Phase 3: Advanced Features (Post-MVP)
- 📱 Mobile app development (iOS/Android)
- 🔗 Health API integrations (Apple Health, Google Fit)
- 📧 Email reminder and notification system
- 👥 Team challenges and corporate wellness features
- 📊 Advanced analytics and business intelligence
- 🌐 Social features and community engagement tools

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL 14+
- Redis for session management
- AWS/GCP account for storage and OCR services
- Stripe account for payment processing

### Development Setup
```bash
# Clone repository and install dependencies
git clone <repository-url>
cd step-challenge
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys and database credentials

# Initialize database
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/steptracker
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
OCR_API_KEY=your_ocr_service_key
AWS_S3_BUCKET=your-image-storage-bucket
```

### UI References
The included mockup images show:
- Clean registration form with account creation flow  
- Dashboard with daily upload and 30-day progress grid
- Community leaderboard with participant comparison
- Challenge management interface

This README serves as both product requirements and technical documentation for building StepTracker30's automated step challenge platform.  

