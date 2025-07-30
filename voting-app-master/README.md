# Online Voting Platform Backend

## Overview

This backend powers a secure, real-time online voting platform. It supports user registration, authentication (with MFA), voter profile management, election info, secure vote casting (with face/location verification), audit logging, feedback, and real-time support.

## Project Structure

```
controllers/         # Business logic for each feature
models/              # Mongoose models (User, Profile, Election, Vote, etc.)
routes/              # Express route definitions
middleware/          # Auth, error handling, rate limiting, etc.
services/            # Email, face recognition, Redis, notifications
utils/               # Validators, token generators, audit logger
config/              # DB and app config
server.js            # Main entry point
.env                 # Environment variables
```

## Key Features

- User registration with email verification and MFA
- Voter profile creation and ID document upload
- Election and candidate info endpoints
- Secure voting with expiring links, face & location verification
- Real-time vote tracking (Socket.io)
- Audit trail and reporting
- Feedback and real-time support endpoints

## Setup

1. Clone the repo and install dependencies:
   ```sh
   npm install
   ```
2. Create a `.env` file (see example in previous messages).
3. Start the server:
   ```sh
   npm run dev
   ```

## API Endpoints

See the documentation in each controller and route file for details on request/response formats.

## Next Steps

- Implement each controller and model in detail.
- Add frontend and connect via API.
- Expand features as needed (blockchain, analytics, etc.).

---

For help with any specific feature, see the code comments or ask for a step-by-step guide!
