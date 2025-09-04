# Hesarak Bus Booking System 🚌

Modern bus ticket booking platform for Afghanistan with Persian/Dari support, real-time seat selection, and comprehensive admin management.

[![Deploy Status](https://github.com/Fahm-Gah/hesarak-backend/actions/workflows/deploy.yml/badge.svg)](https://github.com/Fahm-Gah/hesarak-backend/actions)
[![PayloadCMS](https://img.shields.io/badge/Payload-3.x-blue)](https://payloadcms.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)

## Features

- **🌐 Multi-language**: Persian/Dari primary with English support
- **📱 Phone Auth**: Afghan phone number authentication (+93)
- **💺 Visual Seat Selection**: Interactive seat maps with real-time availability
- **👤 Role-Based Access**: Customer, Agent, Driver, Admin roles
- **📍 Location Tracking**: Geolocation with privacy controls
- **💳 Payment Support**: Multiple payment methods
- **📊 Admin Dashboard**: Complete trip and booking management
- **📱 Mobile Responsive**: RTL support with Jalali calendar

## Tech Stack

- **Framework**: Next.js 15 + React 19
- **CMS**: PayloadCMS 3.x
- **Database**: MongoDB Atlas
- **Storage**: UploadThing
- **Styling**: TailwindCSS 4.x
- **Deployment**: DigitalOcean VPS + GitHub Actions
- **Package Manager**: PNPM

## Quick Start

### Prerequisites

- Node.js 20+
- PNPM (`npm install -g pnpm`)
- MongoDB (local or Atlas)
- UploadThing account

### Installation

```bash
# Clone repository
git clone https://github.com/Fahm-Gah/hesarak-backend.git
cd hesarak-backend

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Generate types
pnpm generate:types

# Start development
pnpm dev
```

Visit:

- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin

### Environment Variables

```env
# MongoDB
DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/hesarak

# PayloadCMS
PAYLOAD_SECRET=your-64-character-secret
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# UploadThing
UPLOADTHING_TOKEN=your-token

# CORS (production)
ALLOWED_ORIGINS=https://yourdomain.com

# Environment
NODE_ENV=development
```

## Development

### Commands

```bash
pnpm dev              # Development server
pnpm build            # Production build
pnpm start            # Production server
pnpm lint             # Run ESLint
pnpm generate:types   # Generate TypeScript types
pnpm test             # Run all tests
```

### Project Structure

```
src/
├── app/
│   ├── (frontend)/       # Public application
│   │   ├── (main)/      # Main pages
│   │   └── auth/        # Authentication
│   └── (payload)/       # Admin panel
├── collections/         # Data models
│   ├── Users.ts
│   ├── Tickets.ts
│   ├── TripSchedules.ts
│   └── Buses.ts
├── components/          # Custom components
├── endpoints/           # API endpoints
└── access/             # Access control
```

## Features Guide

### Authentication

- Phone-based login with Afghan format validation
- JWT tokens with 7-day expiration
- Role hierarchy: Customer → Agent → Driver → Admin → SuperAdmin

### Booking System

- Search trips by date and route
- Visual seat selection
- Real-time availability
- Booking validation and conflict prevention

### Admin Panel

- Trip schedule management
- Bus fleet configuration
- Seat layout designer
- Booking management
- User administration

## Deployment

### Production Setup

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed VPS deployment guide.

### Quick Deploy

```bash
# GitHub Actions auto-deployment on push to main
git push origin main

# Manual deployment
ssh root@your-server
cd /var/www/hesarak-backend
git pull && pnpm install && pnpm build && pm2 restart hesarak-backend
```

### GitHub Actions

Configure secrets in GitHub → Settings → Secrets:

- `DROPLET_HOST`: Server IP
- `DROPLET_USERNAME`: SSH user
- `DROPLET_PORT`: SSH port (22)
- `DROPLET_SSH_KEY`: Private SSH key

## Testing

```bash
# Unit & Integration tests
pnpm test:int

# E2E tests
pnpm test:e2e

# All tests
pnpm test
```

## API Documentation

### Public Endpoints

- `POST /api/search-trips` - Search available trips
- `POST /api/book-ticket` - Create booking
- `GET /api/get-user-tickets` - User bookings
- `POST /api/register-user` - User registration
- `GET /api/provinces` - Province list

### Authentication

```javascript
// Headers
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

## Performance

- Optimized for 1GB RAM VPS
- Build time: ~2-3 minutes
- Memory usage: ~700MB
- Concurrent users: 100+

## Security

- E.164 phone validation
- Role-based access control
- Environment variable protection
- CORS configuration
- Rate limiting on APIs
- SQL injection prevention via Mongoose

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push branch (`git push origin feature/amazing`)
5. Open Pull Request

### Code Style

- ESLint configuration included
- Prettier formatting
- TypeScript strict mode
- Component naming: PascalCase
- File naming: kebab-case

## Troubleshooting

### Common Issues

**Build fails on VPS:**

```bash
# Add swap memory
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

**Port 3000 in use:**

```bash
lsof -i :3000
kill -9 <PID>
```

**MongoDB connection fails:**

- Check Atlas network access
- Verify connection string
- Ensure IP whitelisting

## Support

- [PayloadCMS Docs](https://payloadcms.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Project Issues](https://github.com/Fahm-Gah/hesarak-backend/issues)

## License

MIT License - See [LICENSE](./LICENSE) for details

---

Built with ❤️ for safe travel across Afghanistan
