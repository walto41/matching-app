# Matching App

A full-stack dating/matching web app where users can register, swipe on other users, match, and chat with their matches.

**Live App:** https://waltermatchingapp.netlify.app

**GitHub:** https://github.com/walto41/matching-app

---

## Setup Instructions

### Prerequisites
- Python 3.12+
- Node.js 18+
- npm

### 1. Clone the repository
```bash
git clone https://github.com/walto41/matching-app
cd matching-app
```

### 2. Set up the backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Set up the frontend
```bash
cd ../frontend
npm install
```

---

## How to Run

### Run the backend
```bash
cd backend
source venv/bin/activate        # Windows: venv\Scripts\activate
python app.py
```
The API will be running at `http://localhost:5000`

### Run the frontend
```bash
cd frontend
npm start
```
The app will open at `http://localhost:3000`

The frontend proxies API requests to `http://localhost:5000` automatically in development.

---

## Example Usage

1. Go to `http://localhost:3000` (or the live app at https://waltermatchingapp.netlify.app)
2. Click **Register** and create an account with a username and password
3. Upload a profile photo and write a bio on your profile page
4. Go to the **Discover** tab — swipe right or click the heart to like someone, swipe left or click X to pass
5. When two users like each other it becomes a **Match**
6. Go to the **Matches** tab to see your matches and click **Message** to open a chat

---

## Features

- User registration and login
- Profile photo upload and bio editing
- Swipe cards (drag or button) to like or pass on other users
- Mutual likes automatically create a match
- Real-time chat between matched users

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Python / Flask |
| Database | SQLite (via SQLAlchemy) |
| Frontend Hosting | Netlify |
| Backend Hosting | PythonAnywhere |

---

## Project Structure

```
matching-app/
├── frontend/               # React app
│   └── src/
│       └── components/
│           ├── Login.js
│           ├── Register.js
│           ├── Users.js    # swipe cards
│           ├── Matches.js
│           ├── Chat.js
│           └── Profile.js
└── backend/                # Flask REST API
    ├── app.py              # all routes
    ├── models.py           # User, Like, Match, Message
    ├── config.py
    ├── extensions.py
    └── wsgi.py             # PythonAnywhere entry point
```

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | /register | Create account |
| POST | /login | Log in |
| GET | /users | Get all users |
| POST | /like | Like a user |
| GET | /matches/:id | Get matches for a user |
| POST | /message | Send a message |
| GET | /messages/:id1/:id2 | Get conversation |
| GET | /profile/:id | Get profile |
| POST | /profile/:id/bio | Update bio |
| POST | /upload/:id | Upload profile photo |
