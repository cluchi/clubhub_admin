# ClubHub Admin Implementation Guide

This guide provides a step-by-step approach to recreating the ClubHub Admin project.

## Phase 1: Foundation & Project Setup
1. **Initialize Vite Project**: Create a new Vite project with React and TypeScript.
2. **Install Dependencies**:
   - `npm install @mui/material @emotion/react @emotion/styled @mui/icons-material @mui/lab @mui/x-date-pickers`
   - `npm install @supabase/supabase-js react-router-dom date-fns browser-image-compression`
3. **Configure Global CSS**: Setup `index.css` for global styles.
4. **Setup MUI Theme**: Create `src/theme/theme.ts` with custom primary/secondary colors and border radius.
5. **Supabase Client**:
   - Create `src/services/supabase.ts`.
   - Initialize the client with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## Phase 2: Authentication & Layout
1. **Types Definition**: Create `src/types/supabase.ts` (ideally generated) and `src/types/index.ts` for common types.
2. **Auth Context**:
   - Create `src/context/AuthContext.tsx` using `supabase.auth.onAuthStateChange`.
   - Create `src/hooks/useAuth.ts` for easy access.
3. **Protected Routes**:
   - Create `src/routes/ProtectedRoute.tsx` to wrap authenticated pages.
4. **App Layout**:
   - Create `src/layout/AppLayout.tsx` with a persistent MUI Drawer and AppBar.
   - Define navigation items (Dashboard, Classes, Clubs, Trainers, etc.).
5. **Base Routing**:
   - Setup `src/routes/AppRoutes.tsx` with all initial routes and lazy loading if desired.
6. **Auth Page**:
   - Implement `src/pages/Auth/AuthPage.tsx` with Login and Sign Up forms.

## Phase 3: Club & Trainer Management
1. **API Services**:
   - Create `src/services/api/clubs.ts` and `src/services/api/trainers.ts`.
2. **Clubs Page**:
   - Implement `src/pages/Clubs/ClubsPage.tsx` with a table and CRUD dialogs.
   - Implement filter logic to show only clubs managed by the profile.
3. **Image Upload Service**:
   - Create `src/services/imageUpload.ts` with compression logic using `browser-image-compression`.
   - Create reusable `src/components/ImageUpload.tsx` component.
4. **Trainers Page**:
   - Implement `src/pages/Trainers/TrainersPage.tsx` with avatar upload support.
   - Link trainers to clubs.

## Phase 4: Course Management (Classes)
1. **API Service**: Create `src/services/api/courses.ts`.
2. **Classes Page**:
   - Implement `src/pages/Classes/ClassesPage.tsx`.
   - Handle complex JSON fields for `schedule` and `pricing`.
   - Add club and trainer associations.

## Phase 5: Parents & Children
1. **API Services**: Create `src/services/api/parents.ts` and `src/services/api/children.ts`.
2. **Parents Page**:
   - Implement `src/pages/Parents/ParentsPage.tsx`.
   - Handle many-to-many relationship between parents and clubs via `parent_clubs`.
3. **Add Parent/Child Pages**:
   - Implement forms for adding new parents and linking children to them.

## Phase 6: Subscriptions & Bookings
1. **API Services**: Create `src/services/api/subscriptions.ts` and `src/services/api/bookings.ts`.
2. **Subscriptions Page**:
   - Implement `src/pages/Subscriptions/SubscriptionsPage.tsx`.
   - Allow enrolling children in courses.
3. **Bookings Page**:
   - Implement `src/pages/Bookings/BookingsPage.tsx`.
   - Use MUI DatePickers for scheduling sessions.
   - Filter bookings by course, child, and date.

## Phase 7: Polish & Refinement
1. **Dashboard**: Implement a simple landing page `src/pages/Dashboard/DashboardPage.tsx`.
2. **Settings & Profile**: Implement `src/pages/Settings/SettingsPage.tsx` for account management.
3. **Error Handling**: Ensure all API calls have proper `try/catch` and user-facing error messages.
4. **Linting**: Run `npm run lint` and fix all warnings.
5. **Verification**: Verify all CRUD operations work across all modules.
