# ApplySync

ApplySync is a job application management system that helps users track, organize, and manage applications across multiple platforms from a single dashboard.

## Live Demo

[Click here](https://apply-sync-snowy.vercel.app/)

## What It Does

- Collects job details from job boards via a Chrome extension
- Tracks application status (saved, applied, rejected, offered)
- Organizes interviews, deadlines, and notes
- Provides a dashboard with quick insights
- Keeps data in sync across the web app and extension

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | React, Vite, React Router, Axios, MDB React UI Kit, TailwindCSS |
| Backend | Node.js, Express, PostgreSQL, Prisma, JWT, Google OAuth |
| Extension | Chrome Extension API |

## Quick Start

### Prerequisites

- Node.js 16+
- PostgreSQL database
- Google OAuth Client ID

### Install

```bash
npm install
cd backend && npm install && cd ..
```

### Run Locally

```bash
# Terminal 1: Frontend (port 5173)
npm run dev

# Terminal 2: Backend (port 5000)
cd backend && npm start
```

### Install Chrome Extension

1. Download or clone the repo and unzip it if needed.
2. Open `chrome://extensions/`
3. Enable Developer mode
4. Click Load unpacked
5. Select the `Extension/` folder from the project root

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the repository
4. Open a pull request

## License

ISC
