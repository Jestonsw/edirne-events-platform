# Changelog - Edirne Events Platform

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.1.0] - 2025-08-21

### Added
- **Version Control System**: Comprehensive Git setup with workflows and documentation
- **Code Cleanup Tools**: Automated checks for console.logs, large files, and sensitive data
- **Change Management**: Proper CHANGELOG.md and version tracking
- **.gitattributes**: Proper handling of binary files and line endings
- **GitHub Workflows**: Automated cleanup checks for pull requests

### Removed
- **Major Cleanup**: Removed 133+ screenshot files from attached_assets
- **Backup Files**: Deleted edirne-events-reels-backup folder and .tar.gz archives
- **Marketing Docs**: Removed DIGITAL_MARKETING_STRATEGY.md and related documentation
- **Debug Code**: Cleaned console.log statements from InteractiveMap.tsx, VenueSubmissionModal.tsx
- **Unused Functions**: Removed autoDeactivateExpiredEvents and handleExpiredEventsCheck

### Fixed
- **LSP Errors**: Added missing venue property to Event interface
- **Type Safety**: Fixed TypeError issues with media file parsing
- **Performance**: Reduced project file count by 200+ files

## [2.0.0] - 2025-08-19

### Added
- **Auto-Save System**: Real-time form updates with 1-second debounce
- **Media Rotation**: Manual 90-degree rotation controls for uploaded media
- **Admin Modal State**: Persistent state management with modal key system
- **Smart Sync**: Timestamp-based change detection for real-time updates

### Changed
- **Form Simplification**: Removed participantType, capacity, and organizer fields
- **Media Gallery**: Optimized layout with first image highlighting
- **Event Edit System**: Fixed database schema and API endpoint selection

### Fixed
- **Modal Persistence**: Resolved admin edit modal resetting to original state
- **Cross-Form Compatibility**: Rotations preserved between user submission and admin review
- **Database Updates**: Added mediaFiles field to events table

## [1.5.0] - 2025-08-18

### Added
- **Unlimited Media Upload**: Removed 3-file limitation across entire platform
- **Video Display**: Enhanced admin review form with proper video preview
- **Media File Management**: Dynamic mediaFiles array with proper preview

### Changed
- **Admin Interface**: Removed "Maksimum 3 medya dosyası" restrictions
- **Backward Compatibility**: Support for both old and new media field formats

### Fixed
- **Video Display Bug**: Fixed critical video display issue in admin review form
- **Database Schema**: Added media_files column to pending_events table
- **Drizzle ORM**: Fixed field mapping between database and TypeScript

## [1.4.0] - 2025-01-15

### Added
- **SEO Optimization**: Comprehensive targeting for Edirne search terms
- **GitHub Integration**: Successfully uploaded to https://github.com/Jestonsw/edirne-events-platform
- **Meta Tags**: Enhanced title, description, keywords, Open Graph, Twitter Cards
- **Structured Data**: Schema.org LocalBusiness markup with expanded keywords

### Changed
- **Feed System**: Reverted from Instagram Reels to traditional event list view
- **Navigation**: Added "Etkinlik Arkadaşı Ekle" button to bottom navigation

### Technical
- **Content Strategy**: Added hidden SEO content with sr-only class
- **Technical SEO**: Created robots.txt, optimized sitemap.xml
- **Separate Pages**: Meta tags for /events and /venues pages

## [1.3.0] - 2024-12-20

### Added
- **Event Management**: Discovery by category/location with admin approval
- **Venue Management**: Comprehensive directory with interactive maps
- **Multi-language Support**: Turkish, English, Bulgarian via React Context API
- **Offline Capabilities**: Service worker for background sync and caching

### Technical Details
- **Frontend**: Next.js 14 (App Router) & React 18
- **Backend**: Next.js API routes with PostgreSQL and Drizzle ORM
- **Styling**: Tailwind CSS with Edirne-themed color palette
- **Maps**: Leaflet for interactive location features

## [1.0.0] - 2024-11-01

### Added
- **Initial Release**: Basic event discovery platform for Edirne, Turkey
- **Core Features**: Event listing, categorization, user authentication
- **Admin Panel**: Event approval and management system
- **Database**: PostgreSQL with events, categories, venues, users tables

---

## Version Control Information

**Repository**: GitHub - https://github.com/Jestonsw/edirne-events-platform  
**Main Branch**: main  
**Development Branch**: replit-agent  
**Last Major Cleanup**: 2025-08-21  
**Files Tracked**: ~800 (after cleanup from 1000+)  
**Project Size**: 698MB (optimized)  

## Deployment

The application is configured for deployment on Replit with automatic builds from the main branch.

**Environment**: Next.js 14 with PostgreSQL  
**Dependencies**: See package.json for complete list  
**Build Command**: `npm run build`  
**Start Command**: `npm run dev`  