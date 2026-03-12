# ClubHub Admin Reconstruction Specification

## 1. Project Overview
ClubHub Admin is a management platform for sports clubs. It allows club administrators to manage their clubs, trainers, classes (courses), parents, children, subscriptions, and bookings.

## 2. Tech Stack
- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **UI Library**: Material UI (MUI) v6+ (v7 beta)
- **Icons**: MUI Icons
- **State Management**: React Context (for Auth)
- **Backend/Database**: Supabase (Auth, Database, Storage)
- **Routing**: React Router DOM v6
- **Date Handling**: date-fns
- **Image Processing**: browser-image-compression

## 3. Directory Structure
```
/
├── public/              # Static assets
├── specs/               # Documentation and specs
├── src/
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # Reusable UI components
│   ├── context/         # React Contexts (AuthContext.tsx)
│   ├── hooks/           # Custom React hooks (useAuth.ts)
│   ├── layout/          # Application layout (AppLayout.tsx)
│   ├── pages/           # Feature pages (Clubs, Classes, etc.)
│   ├── routes/          # Routing config (AppRoutes.tsx, ProtectedRoute.tsx)
│   ├── services/        # API and Supabase client
│   │   └── api/         # Individual table services
│   ├── theme/           # MUI theme configuration
│   ├── types/           # TypeScript interfaces/types
│   ├── App.tsx          # Main App component
│   └── main.tsx         # Entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 4. Data Model (Supabase Schema)

### Tables:
- **profiles**: `id (uuid), email (text), name (text), spots_available (int), total_spots (int), category (text)`
- **clubs**: `id (uuid), name (text), description (text), address (text), phone (text), email (text), website (text), contact_person (text), contact_email (text), contact_phone (text), status (text), created_at (timestamp), updated_at (timestamp)`
- **club_members**: `id (uuid), club_id (uuid), profile_id (uuid), role (text), inserted_at (timestamp)`
- **trainers**: `id (uuid), club_id (uuid), name (text), bio (text), avatar (text), experience (text), created_at (timestamp)`
- **courses**: `id (uuid), club_id (uuid), name (text), description (text), trainer_id (uuid), schedule (jsonb), pricing (jsonb), age_range (text), skill_level (text), spots_available (int), total_spots (int), category (text)`
- **parents**: `id (uuid), name (text), email (text), phone (text), status (text), created_at (timestamp)`
- **parent_clubs**: `id (uuid), parent_id (uuid), club_id (uuid), created_at (timestamp)`
- **children**: `id (uuid), parent_id (uuid), name (text), date_of_birth (date), created_at (timestamp)`
- **subscriptions**: `id (uuid), child_id (uuid), course_id (uuid), status (text)`
- **bookings**: `id (uuid), subscription_id (uuid), date (timestamp), status (text)`
- **notifications**: `id (uuid), user_id (uuid), message (text)`
- **payment_methods**: `id (uuid), user_id (uuid), type (text)`

### Storage Buckets:
- **trainers-avatars**: Public bucket for trainer photos.

## 5. Core Functionalities

### Authentication
- Email/Password login and signup via Supabase Auth.
- Protected routes requiring authenticated session.
- `AuthContext` providing user state and auth methods.

### Club Management
- List clubs managed by the user (via `club_members` table).
- Create, Read, Update, and Delete (CRUD) operations for clubs.
- "Edit Club" page specifically for the primary club.

### Trainer Management
- CRUD for trainers associated with the managed clubs.
- Profile photo upload with client-side compression (to 256px WebP).

### Class (Course) Management
- CRUD for classes.
- Assignment of trainers to classes.
- Complex fields: `schedule` (days/times) and `pricing` (drop-in, monthly, quarterly).

### Parent & Child Management
- Manage parent profiles and their association with clubs.
- Add children to parents.

### Subscription & Booking Management
- Enroll children in courses (Subscriptions).
- Create specific attendance records (Bookings) linked to subscriptions.
- Status tracking (pending, active, cancelled, etc.).

## 6. Key UI/UX Patterns
- **Sidebar Navigation**: Persistent navigation with icons.
- **Data Tables**: MUI Tables with sorting, searching, and filtering.
- **Dialog Forms**: CRUD operations performed in modal dialogs for better context.
- **Feedback**: Loading spinners and error/success alerts.
- **Responsive Design**: Standard MUI responsive behavior.

## 7. Business Logic Implementation Notes
- **Authorization**: Access is generally restricted based on the `club_members` link. Services often fetch the `club_ids` managed by the user first before querying related data.
- **Image Upload**: `ImageUploadService` handles bucket initialization, file validation, compression, and deletion of old assets when updated.
- **API Services**: Located in `src/services/api/`, these abstract Supabase calls and handle data transformation/joins.
