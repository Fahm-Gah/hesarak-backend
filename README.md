# حصارک پنجشیر (Hesarakbus) 🚌

A comprehensive bus ticket booking system built for Afghanistan, featuring Persian/Dari language support, modern web technologies, and a complete admin panel for managing bus schedules, bookings, and user profiles.

## 🌟 Features

- **Multi-language Support**: Primary Persian/Dari with English support
- **Complete Booking System**: Search trips, select seats, and book tickets
- **Admin Panel**: Comprehensive management interface powered by PayloadCMS
- **User Management**: Phone-based authentication with role-based access control
- **Real-time Seat Selection**: Visual seat maps with real-time availability
- **Payment Integration**: Multiple payment method support
- **Location Tracking**: Browser and IP-based geolocation
- **Responsive Design**: Mobile-first design with RTL support

## 🛠️ Technology Stack

- **Backend**: PayloadCMS 3.x with MongoDB
- **Frontend**: Next.js 15 with React 19
- **Database**: MongoDB with Mongoose
- **File Storage**: UploadThing integration
- **Styling**: TailwindCSS 4.x
- **Authentication**: Phone-based auth with JWT
- **Testing**: Vitest (integration) + Playwright (e2e)
- **Package Manager**: PNPM

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PNPM package manager
- MongoDB instance (local or cloud)
- UploadThing account for file storage

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd hesarak-backend
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Update your `.env` file with the following required variables:

```bash
# Database
DATABASE_URI=mongodb://127.0.0.1/hesarakbus

# PayloadCMS Secret (generate a secure random string)
PAYLOAD_SECRET=your-super-secret-key-here

# UploadThing (get from https://uploadthing.com)
UPLOADTHING_TOKEN=your-uploadthing-token

# Environment
NODE_ENV=development
```

### 4. Database Setup

If using MongoDB locally, make sure MongoDB is running:

```bash
# On macOS with Homebrew
brew services start mongodb/brew/mongodb-community

# On Windows, start MongoDB service
# On Linux, start with systemctl
sudo systemctl start mongod
```

### 5. Generate TypeScript Types

Generate types from PayloadCMS collections:

```bash
pnpm generate:types
```

### 6. Start Development Server

```bash
pnpm dev
```

The application will be available at:

- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

### 7. Create Admin User

1. Navigate to http://localhost:3000/admin
2. Follow the on-screen instructions to create your first admin user
3. Use an Afghan phone number format (e.g., +93 70 123 4567)

## 🐳 Docker Setup (Alternative)

If you prefer using Docker for local development:

### 1. Update Environment

Modify your `.env` file:

```bash
DATABASE_URI=mongodb://127.0.0.1/hesarakbus
```

### 2. Start with Docker Compose

```bash
docker-compose up -d
```

This will start:

- MongoDB container
- The application in development mode

## 📁 Project Structure

```
src/
├── app/
│   ├── (frontend)/        # Public-facing application
│   │   ├── (main)/       # Main app pages
│   │   ├── auth/         # Authentication pages
│   │   └── components/   # Shared UI components
│   └── (payload)/        # Admin panel routes
├── collections/          # PayloadCMS data models
│   ├── Users.ts         # User authentication
│   ├── Tickets.ts       # Booking system
│   ├── TripSchedules.ts # Trip management
│   └── ...
├── components/          # Custom PayloadCMS components
├── endpoints/           # Custom API endpoints
├── access/             # Access control functions
└── utils/              # Utility functions
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm devsafe      # Clean start (removes .next folder)

# Building
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
pnpm generate:types  # Generate TypeScript types

# Testing
pnpm test         # Run all tests
pnpm test:int     # Run integration tests
pnpm test:e2e     # Run end-to-end tests

# PayloadCMS
pnpm payload      # Access PayloadCMS CLI
```

## 🌐 Key Features Setup

### Phone Authentication

- Uses Afghan phone number format (+93 XX XXX XXXX)
- Automatic phone number normalization to E.164 format
- Role-based access control (customer, agent, driver, admin, etc.)

### Seat Selection System

- Visual seat maps with drag-and-drop designer
- Real-time seat availability checking
- Booking conflict prevention

### Persian/Dari Support

- RTL layout support
- Jalali calendar integration with moment-jalaali
- Persian number formatting
- Custom date picker components

### Location Services

- Browser geolocation API
- IP-based location fallback
- Privacy-compliant location tracking

## 🔒 Access Control

The application implements role-based access control:

- **Customer**: Book tickets, manage profile
- **Agent**: Help customers with bookings
- **Driver**: Access trip information
- **Editor**: Manage content
- **Admin**: Full system access
- **SuperAdmin**: Complete administrative control
- **Dev**: Development and debugging access

## 📱 API Endpoints

Key custom endpoints:

- `/api/search-trips` - Search available trips
- `/api/book-ticket` - Create new bookings
- `/api/get-user-tickets` - Retrieve user bookings
- `/api/register-user` - User registration
- `/api/provinces` - Geographic data

## 🧪 Testing

Run tests to ensure everything works:

```bash
# Run all tests
pnpm test

# Integration tests only
pnpm test:int

# End-to-end tests only
pnpm test:e2e
```

## 🚀 Production Deployment

1. **Build the application**:

   ```bash
   pnpm build
   ```

2. **Set production environment variables**
3. **Deploy to your hosting platform** (Vercel, Railway, etc.)
4. **Configure production MongoDB instance**
5. **Set up UploadThing for file storage**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes following the existing code patterns
4. Run tests: `pnpm test`
5. Commit changes: `git commit -m "Add feature"`
6. Push to branch: `git push origin feature-name`
7. Open a pull request

## 📞 Support

If you encounter any issues or have questions:

- Check the [PayloadCMS Documentation](https://payloadcms.com/docs)
- Review the project's CLAUDE.md file for development guidelines
- Contact the development team

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for safe and comfortable bus travel across Afghanistan.
