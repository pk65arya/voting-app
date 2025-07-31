# Voting Platform Frontend

A modern, secure React-based frontend for the online voting platform. Built with TypeScript, Tailwind CSS, and real-time Socket.io integration.

## Features

### 🔐 Authentication & Security
- User registration with email verification
- Secure login with Multi-Factor Authentication (MFA)
- JWT token-based authentication
- Protected routes and session management

### 🗳️ Voting Interface
- Intuitive candidate selection interface
- Multi-step voting process with verification
- Face and location verification (simulated)
- Secure vote submission with confirmation

### 📊 Dashboard & Management
- Real-time election status updates
- Vote history and statistics
- Profile verification status
- Responsive design for all devices

### 🔄 Real-time Updates
- Socket.io integration for live updates
- Election status notifications
- Vote count updates
- System notifications

## Tech Stack

- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API communication
- **Socket.io Client** for real-time features
- **React Hot Toast** for notifications
- **Lucide React** for icons

## Prerequisites

- Node.js 16+ and npm
- Backend voting API running on port 5000 (see ../voting-app-master)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   # .env file is already configured for local development
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Make sure the backend API is running on http://localhost:5000

## Available Scripts

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

## Application Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   │   ├── Login.tsx      # Login form with MFA
│   │   └── Register.tsx   # Registration form
│   ├── dashboard/         # Dashboard components
│   │   └── Dashboard.tsx  # Main dashboard
│   └── voting/            # Voting interface
│       └── VotingInterface.tsx
├── contexts/
│   └── AuthContext.tsx    # Authentication state management
├── hooks/
│   └── useSocket.ts       # Socket.io custom hook
├── services/
│   └── api.ts            # API service layer
└── App.tsx               # Main app component with routing
```

## Key Features Explained

### Authentication Flow
1. **Registration:** Multi-step form with validation
2. **Email Verification:** Users must verify email before login
3. **MFA Setup:** Optional two-factor authentication
4. **Login:** Email/password with optional MFA token

### Voting Process
1. **Candidate Selection:** Browse and select from available candidates
2. **Identity Verification:** Face and location verification steps
3. **Vote Confirmation:** Review and confirm vote before submission
4. **Secure Submission:** Encrypted vote transmission with audit trail

### Real-time Features
- Election status updates (active, ended, upcoming)
- Live vote count updates during elections
- System notifications and alerts
- Connection status indicators

## Security Features

- **Token-based Authentication:** Secure JWT tokens
- **Protected Routes:** Authentication required for sensitive pages
- **Input Validation:** Client and server-side validation
- **Secure Communication:** HTTPS ready with proper headers
- **Session Management:** Automatic token refresh and logout

## Responsive Design

The application is fully responsive and works on:
- Desktop computers (1024px+)
- Tablets (768px - 1023px)
- Mobile phones (320px - 767px)

## Integration with Backend

This frontend integrates with the Node.js backend API:

### API Endpoints Used
- `/api/auth/*` - Authentication endpoints
- `/api/profile/*` - User profile management
- `/api/elections/*` - Election and candidate data
- `/api/voting/*` - Voting functionality
- `/api/audit/*` - Audit logs and statistics

### Socket Events
- `voteUpdate` - Real-time vote count updates
- `electionUpdate` - Election status changes
- `notification` - System notifications
- `electionStart/End` - Election lifecycle events

## Development Notes

### Environment Variables
All environment variables are prefixed with `REACT_APP_` for Create React App compatibility.

### Styling
- Uses Tailwind CSS utility classes
- Custom component classes defined in `index.css`
- Consistent color scheme with primary blue theme

### State Management
- React Context for global authentication state
- Local component state for UI interactions
- Custom hooks for reusable logic

## Production Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy the build folder** to your static hosting service (Netlify, Vercel, AWS S3, etc.)

3. **Update environment variables** for production API endpoints

4. **Configure routing** for single-page application (SPA) on your hosting platform

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new components
3. Add proper error handling and loading states
4. Test components thoroughly before submitting

## License

This project is part of the Online Voting Platform system.
