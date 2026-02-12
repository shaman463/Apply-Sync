# ApplySync

ApplySync is a comprehensive job application management system that helps users track, organize, and manage job applications across multiple platforms in one centralized dashboard.

## Overview

ApplySync simplifies the entire job application process by allowing users to:
- Extract job details from job websites using a Chrome extension
- Track application statuses (saved, applied, rejected, offered)
- Monitor interview schedules and deadlines
- Manage profiles and application history
- Sync data across all platforms seamlessly

## Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client
- **MDB React UI Kit** - UI components
- **TailwindCSS** - Styling

### Backend
- **Node.js & Express** - Server framework
- **PostgreSQL** - Database (via Neon)
- **Prisma** - ORM
- **JWT** - Authentication
- **Google OAuth** - Social login

### Browser Extension
- **Chrome Extension API** - Job extraction and token management

## Features

✅ User authentication (Email/Password & Google OAuth)  
✅ Job Application Tracking with status management  
✅ Chrome Extension for one-click job saving  
✅ Dashboard with application overview & statistics  
✅ Interview schedule management  
✅ User profile management  
✅ Protected routes and JWT-based authentication  

## Getting Started

### Prerequisites
- Node.js 16+
- PostgreSQL database (or Neon)
- Google OAuth Client ID

### Installation

#### Frontend & Backend Setup
```bash
# Install dependencies
npm install
cd backend && npm install && cd ..

#### Run Development Servers
```bash
# Terminal 1: Frontend (port 5173)
npm run dev

# Terminal 2: Backend (port 5000)
cd backend && npm start
```

#### Install Chrome Extension
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `Extension/` folder


## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the repository
4. Open a pull request

## License

ISC
