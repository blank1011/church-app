# Project Notes

## Summary
This project is a Next.js application connected to MongoDB Atlas. The local environment was updated so it can read production data and display legacy records that were missing church association metadata.

## Changes made
- Connected the local app to the Atlas database by using the existing `.env.local` connection string.
- Added `scripts/migrate-legacy-records.mjs` to migrate legacy documents that lack `churchId`.
- Updated API routes for `history`, `givers`, `report`, and `settings` to handle legacy data and migrate it when needed.
- Added a `migrate:legacy` npm script for running the migration helper.
- Updated local settings defaults so `Fellowship` allocation is included and preserved.

## Problems found and resolved
- Legacy records in production did not have `churchId`, so local pages showed no church-specific data.
- The initial migration script failed because it required `dotenv` and was not configured properly for ES modules.
- Local settings were missing the `fellowship` allocation key, causing production and local defaults to mismatch.
- Some settings documents existed without `churchId`, so the settings API had to migrate those on GET and PUT.
- **Data isolation vulnerability**: `/api/history/route.js` and `/api/report/route.js` had fallback queries that didn't filter by churchId, allowing users to see other churches' data when switching between churches. Fixed by adding churchId filter to all fallback queries.

## What to use now
- Run `npm run migrate:legacy` after updating `.env.local`.
- The migration helper will attach missing `churchId` values to:
  - `Service`
  - `Giving`
  - `Settings`
- The settings API now merges saved allocations with default values so `Fellowship` appears by default.

## Purpose
This note is written so an AI or developer can understand the current fix state, the legacy data issue, and how to rerun the migration in the local project.

## UI/UX Features Added

### Empty State Illustrations (New)
- Created `app/components/EmptyState.js` component
- Replaces plain text "No data" messages with illustrated empty states
- Features: Lucide icons (Inbox, Calendar, BarChart3, Settings), soft background circles, customizable titles/descriptions
- Used in: HomePage, HistoryPage, RecordPage, ReportPage
- Improves visual experience when no data is available

### Swipe-to-Delete on Mobile (New)
- Implemented in `app/components/pages/HistoryPage.js`
- Users can swipe left on giving entries to delete them
- Swipe > 50px triggers delete confirmation modal
- Visual feedback: Shows "Swipe to delete" / "Release" text during swipe
- Smooth animations: Items slide left with opacity fade as you swipe
- Desktop fallback: Hover-revealed ✕ button still available
- Created hook `app/hooks/useSwipeToDelete.js` (for reference/future use)

### Caching & Pull-to-Refresh (Existing)
- `app/context/CacheContext.js`: API response caching with 5-minute TTL
- `app/hooks/usePullToRefresh.js`: Touch-based pull-to-refresh gesture
- Integrated in HomePage for instant tab switching and manual refresh
- Can be extended to other pages following the same pattern

### Toast Notifications (Verified Working)
- `app/components/Toast.js`: Success/error messages with auto-dismiss (3 sec)
- Positioned above mobile nav bar, styled with icons and proper z-index
- Used throughout all pages for user feedback

### Haptic Feedback on Mobile (New)
- Created `lib/haptic.js` utility with multiple vibration patterns
- Patterns available: `tap` (30ms), `success` (50-30-50ms), `error` (100-50-100ms), `swipe` (40-20-60ms), `delete` (150-80-150ms), `warning` (triple tap)
- Uses Web Vibration API (works on iOS/Android with vibration support)
- Integrated in:
  - **HistoryPage**: Swipe threshold feedback at 50px, strong delete confirmation vibration
  - **RecordPage**: Success buzz on giving recorded, error buzz on validation failure or save error, delete buzz on entry/service deletion
  - **Toast notifications**: Success pattern for success toasts, error pattern for error toasts
- Enhances UX with tactile feedback for key actions (delete, record, errors)
- Gracefully degrades on devices without vibration support

## Data Isolation Security Fix (2026-06-21)

### Issue
When creating a new church and switching between churches, the History and Report pages showed data from other churches instead of only the current church's data.

### Root Cause
The `/api/history/route.js` and `/api/report/route.js` routes had "fallback" queries designed to handle legacy untagged records, but these fallbacks did not include the `churchId` filter. This allowed users to access any church's data when the primary query returned empty results.

### Solution
Updated both routes to include `churchId` in all fallback queries:
- **`/api/history/route.js`**: Fallback givings query now includes `churchId` filter
- **`/api/report/route.js`**: Both service and givings fallback queries now include `churchId` filter

### Result
- Each church now only sees its own data on dashboard, history, and reports
- Data is properly isolated per church
- Fallback queries still work for legacy untagged records, but only within the authenticated user's church

## Home + Settings Isolation Fix (2026-06-21)

### Issue
- After creating/switching to a new church, Home page could still show cached values from the previous church.
- Settings allocations could appear shared across churches.

### Root Cause
- Cache keys were not scoped by church, so Home reused stale data from another church session.
- Settings endpoint behavior was updated to be strict per-church and never return another church's document.

### Solution
- Reworked `app/context/CacheContext.js` to namespace every cache key with active `churchId` from local storage.
- `clearCache()` now clears only the current church namespace.
- Replaced `app/api/settings/route.js` with strict `churchId`-scoped GET/PUT and per-church upsert defaults.

### Result
- Home cache is isolated per church account/session.
- Settings allocations are isolated per church and default safely for new churches.

## Tanauan Settings Data Leak Fix (2026-06-21)

### Issue
- In Tanauan church, Settings still displayed data (allocations/givers) from another church.

### Root Cause
- `app/api/givers/route.js` had a fallback that returned all churches' givers when current church had none.
- `app/context/CacheContext.js` read the wrong local storage key (`churchId`), so all churches shared one cache scope.
- Browser GET caching could reuse prior responses even after church switch.

### Solution
- Removed all-church fallback in `app/api/givers/route.js`; it now always filters by `churchId`.
- Fixed cache scope source in `app/context/CacheContext.js` to use `church-finance-active-church` and `_id`.
- Updated `app/context/ChurchContext.js` so church-scoped GET requests default to `cache: 'no-store'`.
- Updated `app/components/pages/SettingsPage.js` to reset allocations/givers immediately on church switch before refetch.

### Result
- Tanauan Settings now resolves data strictly per selected church.
- Manage Givers list no longer leaks names from other churches.
