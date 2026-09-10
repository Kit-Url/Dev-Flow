# Dev-Flow

A web-based database access platform for company employees. Like QNE but integrated with password protection and online access - eliminating the need for RDP to access server databases.

## Features

- 🔐 Secure password-protected authentication
- 📊 Online database file access (no RDP needed)
- 👥 User role management
- 📁 Database file browser and download
- 🔒 Encrypted file transfer (HTTPS)
- 📝 Access logging and audit trail

## Tech Stack

- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js/Express (or Python/Flask)
- Database: SQLite/MySQL for user management
- Security: JWT authentication, password hashing

## Project Structure

```
Dev-Flow/
├── index.html           # Login page
├── dashboard.html       # Main database access dashboard
├── css/
│   └── style.css        # Styling
├── js/
│   ├── auth.js          # Authentication logic
│   └── fileManager.js   # File management
├── backend/
│   ├── server.js        # Express server
│   ├── auth.js          # Authentication endpoints
│   └── database.js      # Database file handler
└── docs/
    └── SETUP.md         # Setup instructions
```

## Getting Started

(Setup instructions coming soon)

## Usage

1. Login with company credentials
2. Browse available database files
3. Download or preview files
4. All actions are logged for audit purposes
