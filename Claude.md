# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hesaarak is a bus ticket booking system built with PayloadCMS 3.x, Next.js 15, and MongoDB. The application supports Persian (Farsi) as the primary language with English support, featuring a comprehensive admin panel for managing bus schedules, bookings, and user profiles.

## Common Commands

### Development

- `pnpm dev` - Start development server at http://localhost:3000
- `pnpm devsafe` - Clean start (removes .next folder before starting)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm generate:types` - Generate TypeScript types from Payload collections
- `pnpm generate:importmap` - Generate import map for Payload

### Testing

- `pnpm test` - Run all tests (integration + e2e)
- `pnpm test:int` - Run integration tests with Vitest
- `pnpm test:e2e` - Run end-to-end tests with Playwright

## Architecture

### Core Technology Stack

- **Backend**: PayloadCMS 3.x with MongoDB (via Mongoose)
- **Frontend**: Next.js 15 with React 19
- **Database**: MongoDB with role-based access control
- **File Storage**: UploadThing integration
- **Styling**: TailwindCSS 4.x
- **Testing**: Vitest (integration) + Playwright (e2e)
- **Package Manager**: PNPM with strict engine requirements

### Directory Structure

#### Collections (`src/collections/`)

PayloadCMS collections define the data models:

- **Users**: Authentication with phone-based login, location tracking, role-based access
- **Profiles**: User profile information separate from auth
- **Tickets**: Booking system with seat selection, pricing, validation hooks
- **TripSchedules**: Bus trip management with routes and scheduling
- **Buses/BusTypes**: Fleet management with seat layout designer
- **Terminals**: Terminal/station management
- **TripRecords**: Historical trip data
- **Drivers**: Driver profiles and management

#### Frontend (`src/app/(frontend)/`)

Next.js App Router structure with grouped routes:

- `(main)/` - Main application pages (trip search, booking, profile)
- `auth/` - Authentication pages (login, register, logout)
- `components/` - Shared UI components

#### Admin Panel (`src/app/(payload)/`)

PayloadCMS admin interface for content management

#### Custom Components (`src/components/`)

- **SeatLayoutDesigner**: Complex component for designing bus seat layouts
- **SeatSelector**: Frontend seat selection for bookings
- **PersianDatePickerField**: Custom Jalali date picker integration
- **UserLocation**: Location tracking component with map integration

#### API Endpoints (`src/endpoints/`)

Custom PayloadCMS endpoints for business logic:

- `searchTrips` - Trip search with filtering
- `getTripDetails` - Trip information retrieval
- `bookTicket` - Ticket booking workflow
- `getUserTickets` - User booking history
- `registerUser` - User registration
- `updateLocation` - Location tracking updates
- `provinces` - Geographic data

### Key Features

#### Internationalization

- Primary language: Persian (Farsi) with Jalali calendar support
- Secondary language: English
- Moment.js with moment-jalaali for date handling
- Custom Persian date picker components

#### Authentication & Authorization

- Phone number-based authentication (Afghan format)
- Role-based access control (customer, editor, agent, driver, admin, superadmin, dev)
- Location tracking (browser geolocation + IP geolocation)
- Session management with 7-day token expiration

#### Booking System

- Complex seat selection with visual seat maps
- Real-time seat availability checking
- Pricing calculation with overrides
- Trip validation and business rules
- Multiple payment method support

#### Data Validation

- Phone number normalization to E.164 format
- Seat booking validation with conflict prevention
- Date validation for trip scheduling
- Access control with field-level permissions

### Development Patterns

#### Hooks System

PayloadCMS hooks are extensively used for business logic:

- `beforeChange` hooks for data validation and transformation
- `afterLogin` hooks for user tracking
- Custom validation functions for complex business rules

#### State Management

- Zustand for complex component state (seat designer)
- SWR for data fetching and caching
- React context for authentication

#### Component Architecture

- Server components for data fetching
- Client components (`.client.tsx`) for interactivity
- Separation of concerns between UI and business logic

### Configuration Files

#### TypeScript

- Path aliases: `@/*` maps to `src/*`, `@payload-config` to payload config
- Strict mode enabled with ES2022 target
- Next.js plugin integration

#### Testing

- Vitest for unit/integration tests in `tests/int/`
- Playwright for e2e tests in `tests/e2e/`
- JSDOM environment for React component testing

#### Build & Deployment

- Cross-platform compatibility with cross-env
- Node.js memory optimization flags
- Docker support with MongoDB
- Vercel deployment configuration

### Database Design

#### Key Relationships

- Users ↔ Profiles (one-to-one)
- Users ↔ Tickets (one-to-many via bookedBy)
- Tickets ↔ TripSchedules (many-to-one)
- TripSchedules ↔ Terminals (many-to-one for from/to)
- TripSchedules ↔ Buses (many-to-one)

#### Data Denormalization

- Terminal names stored in tickets for efficient searching
- Location data with history tracking
- Seat layout data stored as JSON for flexibility

### Access Control Patterns

- Collection-level access control functions in `src/access/accessControls.ts`
- Field-level access restrictions (e.g., admin-only fields)
- User role validation throughout the application
- Location data restricted to superadmins for privacy

### Important Notes

- Always run `pnpm generate:types` after modifying PayloadCMS collections
- Use proper phone number validation for Afghan numbers
- Follow Persian/English dual language patterns in new features
- Respect role-based access control when adding new functionality
- Location tracking requires user permission and privacy considerations

### UI Design

- for Icons always use lucide react
