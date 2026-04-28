# EduVault

EduVault is a full-stack learning management web application for managing courses, assignments, submissions, notifications, chat, and plagiarism or AI-content checks. It is split into a React frontend and an Express/MongoDB backend, with role-based workflows for teachers and students.

## Overview

The application supports:

- Teacher course and assignment management
- Student enrollment and assignment submission
- Submission analytics and detection tools
- In-app chat between teachers and students
- Notification delivery and notification history
- Authentication, profile management, password reset, and Google login

## Project Structure

```text
capstoneProject_final/
├── backend/
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   └── utils/
└── frontend/
    ├── src/
    ├── public/
    └── build/
```

## Tech Stack

- Frontend: React, React Router, Axios, Framer Motion, React Toastify, Recharts
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Authentication: JWT, Google sign-in
- File handling: Multer, Mammoth, pdf-parse
- Email and notifications: Nodemailer

## Main Features

### Authentication and Profiles

- Student and teacher signup/login
- Google authentication
- Password reset flow
- Profile photo upload
- Account settings and password updates

### Courses and Enrollment

- Teacher course creation and management
- Student course browsing and enrollment requests
- Enrollment approval and rejection
- Course analytics and enrolled-student views

### Assignments and Submissions

- Teacher assignment creation, update, and deletion
- Student assignment submission with file upload support
- Submission history and analytics
- Teacher review workflows

### Detection Tools

- Text analysis
- AI-content analysis
- Plagiarism checking

### Chat and Notifications

- Teacher and student chat threads
- Message history
- Notification sending and read status tracking

## Backend API Areas

The backend exposes API groups under `/api`:

- `/api/auth`
- `/api/courses`
- `/api/assignments`
- `/api/submissions`
- `/api/notifications`
- `/api/enrollment`
- `/api/detection`
- `/api/chat`

There is also a health check at `/api/health`.

## Prerequisites

- Node.js 18 or later
- npm
- MongoDB database

## Environment Variables

Create a `.env` file in the backend folder with the values required by the server.

Example:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
HUGGINGFACE_API_KEY=your_huggingface_api_key
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
FROM_EMAIL=your_sender_email
EMAIL_USE_TEACHER_FROM=false
```

## Setup and Installation

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Running the Project

### Start the backend

```bash
cd backend
npm run dev
```

By default the backend runs on port 5000.

### Start the frontend

```bash
cd frontend
npm start
```

The frontend runs on port 3000.

## Production Build

Build the frontend for production:

```bash
cd frontend
npm run build
```

## Notes for GitHub Upload

- Do not commit local environment files.
- Do not commit installed dependencies.
- Do not commit generated frontend builds unless you intentionally want to publish them.
- Do not commit uploaded user files from the backend uploads folder.

## License

No license has been specified yet. Add one if you want the project to be public or reusable.