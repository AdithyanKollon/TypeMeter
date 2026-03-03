# TypeMeter - Typing Test Application

A full-stack typing speed test application built with `Node.js`, `Express`, `MongoDB`, and vanilla `HTML/CSS/JavaScript`.

Users can run timed typing tests, track `WPM`, `accuracy`, and `errors` in real time, and compete through a leaderboard backed by MongoDB.

## Features
- User authentication with signup, login, session-based auth, and logout
- Real-time typing engine with live WPM, error counting, and accuracy calculation
- Configurable test duration (preset values + custom seconds)
- Manual `End Test` support before timer completion
- Leaderboard with top users ranked by highest WPM
- Persistent dark/light theme preference
- Responsive UI for desktop and mobile

## Tech Stack
- Frontend: `HTML`, `CSS`, `JavaScript`
- Backend: `Node.js`, `Express`
- Database: `MongoDB` with `Mongoose`
- Authentication: `express-session`, `connect-mongo`, `bcryptjs`

## Project Structure
```text
typing-test-app/
  public/
    index.html
    leaderboard.html
    login.html
    signup.html
    style.css
    script.js
    theme.js
  routes/
    auth.js
  models/
    user.js
  server.js
  package.json
```

## Setup and Run
1. Clone the repository
```bash
git clone <your-repo-url>
cd typing-test-app
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
```

4. Start the server
```bash
npm start
```

5. Open in browser
```text
http://localhost:3000
```

## API Endpoints
All auth and score routes are mounted under `/auth`.

- `POST /auth/signup` - register a new user
- `POST /auth/login` - authenticate user
- `GET /auth/logout` - logout and clear session
- `GET /auth/me` - get current logged-in user profile
- `POST /auth/save-score` - save/update highest WPM for logged-in user
- `GET /auth/leaderboard` - fetch top users by highest WPM

## Screenshots
- [Home (Dark)](assets/screenshots/home1.png)
- [Home (Light)](assets/screenshots/home2.png)
- [Typing Test](assets/screenshots/test.png)
- [Login](assets/screenshots/login.png)
- [Results](assets/screenshots/result.png)
- [Leaderboard](assets/screenshots/leaderboard.png)

## Resume Highlights
- Built a full-stack typing test platform with secure authentication and persistent score tracking
- Implemented a real-time typing engine with live metrics and configurable duration
- Designed leaderboard ranking logic using MongoDB aggregation/sorting patterns
- Created a responsive, theme-enabled UI with session-aware user flows

## Security Note
If secrets or database credentials were committed during development, rotate them immediately and replace with new values.
