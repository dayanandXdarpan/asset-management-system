# 🏢 Asset Management System

A modern, full-stack web application for managing organizational assets, maintenance schedules, locations, and vendors. Built with React, TypeScript, Hono.js, and Prisma.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6?logo=typescript)
![Hono](https://img.shields.io/badge/Hono-4.11.3-orange?logo=hono)

## 📋 Features

### Core Functionality
- **Asset Management**: Track and manage organizational assets with detailed information
- **Maintenance Scheduling**: Schedule and track maintenance activities with priority levels
- **Location Tracking**: Organize assets by sites and regions
- **Vendor Management**: Maintain vendor information and relationships
- **User Management**: Role-based access control (Admin, Technician, Viewer)
- **Audit Logging**: Track all system activities and changes
- **Dashboard Analytics**: Real-time statistics and insights

### Technical Features
- 🔐 JWT-based authentication
- 🎨 Dark/Light theme support
- 📱 Responsive design
- 🔍 Advanced search and filtering
- 📊 Data export (CSV)
- 📥 Bulk import functionality
- 📷 Image upload for assets
- 🏷️ QR code generation for assets
- 📈 Interactive charts and reports

## 🛠️ Tech Stack

### Frontend
- **React 19.2** - UI framework
- **TypeScript** - Type safety
- **React Router** - Navigation
- **TanStack Query** - Data fetching & caching
- **Recharts** - Data visualization
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **Vite** - Build tool

### Backend
- **Hono.js** - Web framework
- **Prisma** - ORM
- **SQLite** - Database (development)
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Zod** - Schema validation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd internship_asset_management
```

2. **Install Server Dependencies**
```bash
cd server
npm install
```

3. **Setup Database**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with sample data
npx tsx prisma/seed.ts
```

4. **Install Client Dependencies**
```bash
cd ../client
npm install
```

### Running the Application

#### Development Mode

**Terminal 1 - Start Server:**
```bash
cd server
npm run dev
```
Server runs on: `http://localhost:3000`

**Terminal 2 - Start Client:**
```bash
cd client
npm run dev
```
Client runs on: `http://localhost:5173`

### Default Credentials

After seeding the database, use these credentials to login:

**Admin Account:**
- Email: `admin@test.com`
- Password: `password123`

**Technician Account:**
- Email: `tech@test.com`
- Password: `password123`

## 📁 Project Structure

```
internship_asset_management/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json
│
├── server/                # Hono.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── index.ts       # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Database seeder
│   ├── uploads/           # File uploads directory
│   └── package.json
│
├── docker-compose.yml     # Docker configuration
└── README.md
```

## 🎯 User Roles & Permissions

### Admin
- Full system access
- Manage users
- Create/Edit/Delete all entities
- View audit logs

### Technician
- Create/Edit maintenance records
- Update asset status
- View all assets and locations

### Viewer
- Read-only access
- View assets, locations, vendors
- Access reports

## 🔌 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile
- `PUT /auth/password` - Change password

### Assets
- `GET /api/assets` - List assets (with pagination)
- `GET /api/assets/:id` - Get asset details
- `POST /api/assets` - Create asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset

### Locations
- `GET /api/locations` - List locations
- `POST /api/locations` - Create location
- `PUT /api/locations/:id` - Update location
- `DELETE /api/locations/:id` - Delete location

### Maintenance
- `GET /api/maintenance` - List maintenance records
- `POST /api/maintenance` - Log maintenance
- `PUT /api/maintenance/:id` - Update record
- `DELETE /api/maintenance/:id` - Delete record

### Vendors
- `GET /api/vendors` - List vendors
- `POST /api/vendors` - Create vendor
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor

### Users
- `GET /api/users` - List users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Stats & Logs
- `GET /api/stats` - Dashboard statistics
- `GET /api/audit-logs` - Audit logs (Admin only)

## 🐳 Docker Deployment

```bash
# Build and start containers
docker-compose up -d

# Stop containers
docker-compose down
```

## 🌐 Deployment

### Netlify (Frontend)
1. Build the client:
```bash
cd client
npm run build
```

2. Deploy the `client/dist` folder to Netlify

3. Configure environment variables in Netlify:
```
VITE_API_URL=<your-backend-url>
```

### Backend Deployment Options
- **Railway**: Easy deployment with automatic HTTPS
- **Render**: Free tier available
- **Fly.io**: Global deployment
- **Heroku**: Classic PaaS
- **VPS**: Full control with services like DigitalOcean, AWS, or Azure

**Important**: Update API URLs in `client/src/services/api.ts` to match your production backend URL.

## 🔧 Environment Variables

### Server (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
PORT=3000
```

### Client (.env)
```env
VITE_API_URL=http://localhost:3000
```

## 📝 Scripts

### Server
- `npm run dev` - Start development server with hot reload
- `npx prisma studio` - Open Prisma Studio GUI
- `npx prisma migrate dev` - Run database migrations
- `node create_admin.js` - Create admin user

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

Developed during internship project at [Organization Name]

## 🙏 Acknowledgments

- React and TypeScript communities
- Hono.js framework
- Prisma ORM
- All open-source contributors

## 📞 Support

For support, email: your-email@example.com

---

**Note**: This is a development/testing version. For production deployment, ensure proper security measures, environment variables, and database migrations are in place.
